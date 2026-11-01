# ============================================
# HORIZON EQUITY - COMPREHENSIVE EMAIL SERVICE
# Brevo REST API + SMTP Relay with Operational Logging
# ============================================

import uuid
import logging
import smtplib
import socket
import asyncio
from datetime import datetime
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Dict, Any, Optional, Tuple

from app.core.config import settings
from app.services.email_translations import build_localized_email

logger = logging.getLogger("horizon.email")


def _classify_brevo_api_error(status_code: int, response_text: str, sender_email: str, to_email: str) -> str:
    """Classify Brevo REST API error responses into diagnostic messages."""
    text_lower = response_text.lower()
    if status_code == 401 or "unauthorized" in text_lower or "key not found" in text_lower:
        return "Brevo Authentication Failure: The configured Brevo API key is invalid or unauthorized."
    elif status_code == 400:
        if "sender" in text_lower:
            return f"Brevo Configuration Error: Sender address '{sender_email}' is invalid or not verified in Brevo."
        elif "recipient" in text_lower or "to" in text_lower:
            return f"Invalid Recipient: The destination address '{to_email}' format was rejected by Brevo."
        elif "htmlcontent" in text_lower or "subject" in text_lower:
            return f"Invalid Request Payload: {response_text}"
        return f"Brevo Validation Error (400): {response_text}"
    elif status_code == 402 or "payment_required" in text_lower or "credits" in text_lower:
        return "Brevo Quota Exceeded: Your Brevo account credits or daily sending quota are exhausted."
    elif status_code == 403:
        return "Brevo Access Denied (403): Account suspended, IP restricted, or unverified sender domain."
    elif status_code == 429 or "rate_limit" in text_lower:
        return "Brevo Rate Limit Exceeded: Too many requests sent to Brevo API. Please wait a moment."
    elif status_code >= 500:
        return f"Brevo Service Unavailable ({status_code}): Brevo servers are temporarily unreachable."
    return f"Brevo API error ({status_code}): {response_text}"


def _classify_smtp_error(exc: Exception, sender_email: str, to_email: str, host: str, port: int) -> str:
    """Classify SMTP protocol and network errors into actionable diagnostics."""
    if isinstance(exc, smtplib.SMTPAuthenticationError):
        return f"Brevo SMTP Authentication Failure: The SMTP credentials were rejected by {host}."
    elif isinstance(exc, smtplib.SMTPSenderRefused):
        return f"Brevo Sender Refused: The sender address '{sender_email}' is not authorized or verified in your Brevo account."
    elif isinstance(exc, smtplib.SMTPRecipientsRefused):
        return f"Brevo Recipient Refused: Destination email '{to_email}' was rejected by Brevo."
    elif isinstance(exc, smtplib.SMTPDataError):
        return f"Brevo Data Rejected: Message data was rejected by Brevo SMTP ({exc})."
    elif isinstance(exc, (TimeoutError, socket.timeout)) or "timed out" in str(exc).lower():
        return f"Brevo SMTP Network Timeout: Connection to {host}:{port} timed out (latency or host port restriction)."
    elif isinstance(exc, ConnectionRefusedError):
        return f"Brevo SMTP Connection Refused: Unable to connect to {host}:{port}."
    elif isinstance(exc, smtplib.SMTPConnectError):
        return f"Brevo SMTP Connection Error on {host}:{port}: {exc}"
    elif isinstance(exc, smtplib.SMTPResponseException):
        code = getattr(exc, "smtp_code", None)
        msg = getattr(exc, "smtp_error", str(exc))
        return f"Brevo SMTP Server Error ({code}): {msg}"
    return f"Brevo SMTP Error on {host}:{port}: {exc}"


class EmailService:
    """Enterprise-grade Brevo transactional email client with template rendering and audit logging."""

    @staticmethod
    def _get_frontend_url() -> str:
        """Resolve secure frontend base URL for verification and action links."""
        custom_domain = (getattr(settings, "CUSTOM_DOMAIN", "") or "").strip().lower().replace("https://", "").replace("http://", "").rstrip("/")
        if custom_domain:
            return f"https://{custom_domain}"
        url = (getattr(settings, "VERCEL_FRONTEND_URL", "") or "").strip()
        if not url:
            return "http://localhost:3000" if settings.DEBUG else "https://horizon-equity.net"
        url = url.rstrip("/")
        if url.startswith("http://") and "localhost" not in url and "127.0.0.1" not in url:
            url = "https://" + url[7:]
        elif not url.startswith("http://") and not url.startswith("https://"):
            url = f"https://{url}"
        return url

    @staticmethod
    def _send_email_sync(
        to_email: str,
        subject: str,
        html_content: str,
        text_content: str,
        template_key: Optional[str] = None,
    ) -> Tuple[bool, Optional[str], Optional[str]]:
        """
        Synchronously dispatch an email using Brevo REST API or Brevo SMTP Relay.
        Returns: (success: bool, provider_message_id: Optional[str], error_message: Optional[str])
        """
        sender_name = getattr(settings, "SMTP_FROM_NAME", "Horizon Equity")
        sender_email = getattr(settings, "SMTP_FROM", "noreply@horizonequity.net")

        # 1. Attempt Brevo REST API (HTTPS - bypasses any outbound SMTP port restrictions)
        brevo_key = (getattr(settings, "BREVO_API_KEY", "") or "").strip()
        api_err_msg = None
        if brevo_key and brevo_key != "stub-brevo-key":
            try:
                import httpx
                payload = {
                    "sender": {"name": sender_name, "email": sender_email},
                    "to": [{"email": to_email}],
                    "subject": subject,
                    "htmlContent": html_content,
                    "textContent": text_content,
                }
                headers = {
                    "accept": "application/json",
                    "api-key": brevo_key,
                    "content-type": "application/json",
                }
                with httpx.Client(timeout=15.0) as client:
                    resp = client.post("https://api.brevo.com/v3/smtp/email", json=payload, headers=headers)
                if resp.status_code in (200, 201, 202):
                    msg_id = None
                    try:
                        msg_id = resp.json().get("messageId")
                    except Exception:
                        pass
                    logger.info(f"Email successfully dispatched to {to_email} via Brevo REST API (msgId: {msg_id})")
                    return True, msg_id, None
                else:
                    api_err_msg = _classify_brevo_api_error(resp.status_code, resp.text, sender_email, to_email)
                    logger.warning(f"Brevo REST API attempt failed: {api_err_msg}")
            except Exception as e:
                api_err_msg = f"Brevo REST API connection failed: {e}"
                logger.warning(api_err_msg)

        # 2. Brevo Multi-Port SMTP Relay (with automatic fallback ports: 587, 465 SSL, 2525)
        smtp_user = (getattr(settings, "SMTP_USER", "") or "").strip()
        smtp_pass = (getattr(settings, "SMTP_PASSWORD", "") or "").strip()
        smtp_host = (getattr(settings, "SMTP_HOST", "smtp-relay.brevo.com") or "smtp-relay.brevo.com").strip()
        configured_port = int(getattr(settings, "SMTP_PORT", 587))

        if smtp_pass and smtp_pass != "stub-password" and smtp_user:
            msg = MIMEMultipart("alternative")
            unique_msg_id = f"<{uuid.uuid4()}@horizonequity.net>"
            msg["Subject"] = subject
            msg["From"] = f"{sender_name} <{sender_email}>"
            msg["To"] = to_email
            msg["Message-ID"] = unique_msg_id

            part1 = MIMEText(text_content or "", "plain", "utf-8")
            part2 = MIMEText(html_content or "", "html", "utf-8")
            msg.attach(part1)
            msg.attach(part2)

            # Ports to try: configured port first, then fallback alternatives
            ports_to_try = [configured_port]
            for p in [587, 465, 2525]:
                if p not in ports_to_try:
                    ports_to_try.append(p)

            last_smtp_err = None
            for port in ports_to_try:
                try:
                    logger.info(f"Attempting Brevo SMTP connection to {smtp_host}:{port}...")
                    if port == 465:
                        with smtplib.SMTP_SSL(smtp_host, 465, timeout=25) as server:
                            server.login(smtp_user, smtp_pass)
                            server.sendmail(sender_email, to_email, msg.as_string())
                    else:
                        with smtplib.SMTP(smtp_host, port, timeout=25) as server:
                            server.starttls()
                            server.login(smtp_user, smtp_pass)
                            server.sendmail(sender_email, to_email, msg.as_string())

                    logger.info(f"Email successfully dispatched to {to_email} via Brevo SMTP ({smtp_host}:{port})")
                    return True, unique_msg_id, None
                except Exception as e:
                    last_smtp_err = _classify_smtp_error(e, sender_email, to_email, smtp_host, port)
                    logger.warning(f"SMTP attempt on port {port} failed: {last_smtp_err}")
                    continue

            # If all SMTP ports failed, return classified error
            final_err = last_smtp_err or api_err_msg or "Brevo SMTP relay connection failed on all available ports."
            return False, None, final_err

        # If Brevo REST API failed and no SMTP was configured
        if api_err_msg:
            return False, None, api_err_msg

        # 3. Fallback mock / stub for local dev only
        if settings.DEBUG:
            logger.info(f"[MOCK / DEV EMAIL] To: {to_email} | Subject: {subject}")
            return True, f"<mock-{uuid.uuid4()}@local>", None

        return False, None, "Brevo configuration missing: Neither BREVO_API_KEY nor SMTP credentials (SMTP_USER/SMTP_PASSWORD) are set in production environment."

    @staticmethod
    async def record_email_log(
        recipient: str,
        subject: str,
        template_key: Optional[str],
        status: str,
        provider_message_id: Optional[str] = None,
        error_message: Optional[str] = None,
    ):
        """Asynchronously insert audit record into the email_logs table."""
        try:
            from app.core.database import async_session
            from app.models.email_log import EmailLog

            async with async_session() as db:
                log_entry = EmailLog(
                    recipient=recipient,
                    subject=subject,
                    template_key=template_key,
                    status=status,
                    provider_message_id=provider_message_id,
                    error_message=error_message,
                )
                db.add(log_entry)
                await db.commit()
        except Exception as e:
            logger.error(f"Failed to record email log in database: {e}")

    @staticmethod
    def render_template(
        template_key: str,
        variables: Dict[str, Any],
        lang: Optional[str] = "en",
    ) -> Tuple[str, str, str]:
        """
        Load template and substitute variables with full 9-language localization support.
        Falls back intentionally to default English templates if a translation is absent.
        Returns: (subject, html_content, text_content)
        """
        # 1. Try localized email builder first
        localized = build_localized_email(template_key, variables, lang=lang)
        if localized:
            return localized

        # 2. Fall back to DEFAULT_EMAIL_TEMPLATES
        from app.services.admin_service import DEFAULT_EMAIL_TEMPLATES

        KEY_ALIASES = {
            "welcome_bonus": "account_welcome",
            "welcome": "account_welcome",
            "verify_email": "account_verification",
        }
        resolved_key = KEY_ALIASES.get(template_key, template_key)
        template = DEFAULT_EMAIL_TEMPLATES.get(resolved_key)
        if not template:
            # Fallback basic template
            subject = f"Notification from Horizon Equity: {template_key.replace('_', ' ').title()}"
            html_content = f"<div style='font-family: sans-serif; padding: 20px;'><h2>{subject}</h2><p>{variables}</p></div>"
            text_content = f"{subject}\n{variables}"
            return subject, html_content, text_content

        subject = template.get("subject", "Horizon Equity Notification")
        html_content = template.get("html_content", "")
        text_content = template.get("text_content", "")

        # Default standard variables
        base_url = EmailService._get_frontend_url()
        merged_vars = {
            "login_url": f"{base_url}/auth/login",
            "dashboard_url": f"{base_url}/dashboard",
            "rules_url": f"{base_url}/dashboard/withdrawals",
            "support_email": getattr(settings, "SMTP_FROM", "support@horizonequity.net"),
            "date": datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC"),
        }
        merged_vars.update(variables)

        for key, val in merged_vars.items():
            token_str = f"{{{{{key}}}}}"
            val_str = str(val if val is not None else "")
            subject = subject.replace(token_str, val_str)
            html_content = html_content.replace(token_str, val_str)
            text_content = text_content.replace(token_str, val_str)

        return subject, html_content, text_content

    async def send_templated_email(
        self,
        to_email: str,
        template_key: str,
        variables: Dict[str, Any],
        lang: Optional[str] = "en",
    ) -> bool:
        """Render a system template and dispatch via Brevo with operational logging."""
        subject, html_content, text_content = self.render_template(template_key, variables, lang=lang)
        success, msg_id, err_msg = await asyncio.to_thread(
            self._send_email_sync,
            to_email=to_email,
            subject=subject,
            html_content=html_content,
            text_content=text_content,
            template_key=template_key,
        )

        status_str = "sent" if success else "failed"
        await self.record_email_log(
            recipient=to_email,
            subject=subject,
            template_key=template_key,
            status=status_str,
            provider_message_id=msg_id,
            error_message=err_msg,
        )
        return success

    async def send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        text_content: Optional[str] = None,
        template_key: Optional[str] = None,
    ) -> bool:
        """Directly dispatch email and record audit log."""
        success, msg_id, err_msg = await asyncio.to_thread(
            self._send_email_sync,
            to_email=to_email,
            subject=subject,
            html_content=html_content,
            text_content=text_content or "",
            template_key=template_key,
        )
        status_str = "sent" if success else "failed"
        await self.record_email_log(
            recipient=to_email,
            subject=subject,
            template_key=template_key or "custom",
            status=status_str,
            provider_message_id=msg_id,
            error_message=err_msg,
        )
        return success

    def _send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        text_content: Optional[str] = None,
    ) -> Tuple[bool, Optional[str], Optional[str]]:
        """Synchronous wrapper for _send_email_sync for backwards compatibility."""
        return self._send_email_sync(
            to_email=to_email,
            subject=subject,
            html_content=html_content,
            text_content=text_content or "",
        )

    def dispatch_background(
        self,
        to_email: str,
        template_key: str,
        variables: Dict[str, Any],
        lang: Optional[str] = "en",
    ):
        """Schedule email sending on the running asyncio loop without blocking caller."""
        try:
            loop = asyncio.get_running_loop()
            loop.create_task(self.send_templated_email(to_email, template_key, variables, lang=lang))
        except RuntimeError:
            # No running event loop, dispatch in thread
            asyncio.run(self.send_templated_email(to_email, template_key, variables, lang=lang))

    # ========================================================
    # HIGH-LEVEL TRANSACTIONAL EMAIL HELPERS
    # ========================================================

    def send_welcome_bonus_email(
        self,
        user_email: str,
        user_name: str,
        bonus_amount: str = "10.00",
        lang: Optional[str] = "en",
    ):
        """Send Phase 6 Email 1: Welcome to Horizon Equity — Your $10 Welcome Bonus."""
        base_url = self._get_frontend_url()
        self.dispatch_background(
            to_email=user_email,
            template_key="welcome_bonus",
            variables={
                "user_name": user_name or "Investor",
                "bonus_amount": bonus_amount,
                "login_url": f"{base_url}/auth/login",
                "dashboard_url": f"{base_url}/dashboard",
                "rules_url": f"{base_url}/dashboard/withdrawals",
            },
            lang=lang,
        )

    def send_verification_email(
        self,
        user_email: str,
        user_name: str,
        token: str,
        expires_hours: int = 24,
        lang: Optional[str] = "en",
    ):
        """Send Phase 6 Email 2: Account Email Verification."""
        base_url = self._get_frontend_url()
        verification_link = f"{base_url}/auth/verify-email?token={token}"
        self.dispatch_background(
            to_email=user_email,
            template_key="account_verification",
            variables={
                "user_name": user_name or "Investor",
                "verification_link": verification_link,
                "expires_hours": str(expires_hours),
            },
            lang=lang,
        )

    def send_email_verified_confirmation(
        self,
        user_email: str,
        user_name: str,
        bonus_amount: str = "10.00",
        lang: Optional[str] = "en",
    ):
        """Send Phase 3C: Email Verified Confirmation."""
        base_url = self._get_frontend_url()
        self.dispatch_background(
            to_email=user_email,
            template_key="email_verified_confirmation",
            variables={
                "user_name": user_name or "Investor",
                "bonus_amount": bonus_amount,
                "login_url": f"{base_url}/auth/login",
                "dashboard_url": f"{base_url}/dashboard",
                "invest_url": f"{base_url}/dashboard/investments",
            },
            lang=lang,
        )

    def send_password_reset_email(
        self,
        user_email: str,
        user_name: str,
        token: str,
        expires_minutes: int = 60,
        lang: Optional[str] = "en",
    ):
        """Send Phase 3D: Secure Password Reset."""
        base_url = self._get_frontend_url()
        reset_link = f"{base_url}/auth/reset-password?token={token}"
        self.dispatch_background(
            to_email=user_email,
            template_key="password_reset",
            variables={
                "user_name": user_name or "Investor",
                "reset_link": reset_link,
                "expires_minutes": str(expires_minutes),
            },
            lang=lang,
        )

    def send_bonus_unlocked_email(
        self,
        user_email: str,
        user_name: str,
        bonus_amount: str = "10.00",
        plan_name: str = "Silver Starter Tier",
        lang: Optional[str] = "en",
    ):
        """Send Phase 6 Email 3: Promotional Bonus Unlocked for Withdrawal."""
        base_url = self._get_frontend_url()
        self.dispatch_background(
            to_email=user_email,
            template_key="bonus_unlocked",
            variables={
                "user_name": user_name or "Investor",
                "bonus_amount": bonus_amount,
                "plan_name": plan_name,
                "login_url": f"{base_url}/dashboard",
                "dashboard_url": f"{base_url}/dashboard",
                "withdraw_url": f"{base_url}/dashboard/withdrawals",
            },
            lang=lang,
        )

    def send_deposit_submitted_email(
        self,
        user_email: str,
        user_name: str,
        amount: str,
        currency: str,
        reference: str,
        lang: Optional[str] = "en",
    ):
        """Send Phase 7: Deposit Submitted."""
        base_url = self._get_frontend_url()
        self.dispatch_background(
            to_email=user_email,
            template_key="deposit_submitted",
            variables={
                "user_name": user_name or "Investor",
                "amount": str(amount),
                "currency": currency.upper(),
                "reference": reference,
                "dashboard_url": f"{base_url}/dashboard/deposits",
            },
            lang=lang,
        )

    def send_deposit_confirmed_email(
        self,
        user_email: str,
        user_name: str,
        amount: str,
        currency: str,
        tx_hash: str,
        lang: Optional[str] = "en",
    ):
        """Send Phase 7: Deposit Confirmed & Credited."""
        base_url = self._get_frontend_url()
        self.dispatch_background(
            to_email=user_email,
            template_key="deposit_confirmed",
            variables={
                "user_name": user_name or "Investor",
                "amount": str(amount),
                "currency": currency.upper(),
                "tx_hash": tx_hash or "Confirmed on-chain",
                "login_url": f"{base_url}/dashboard",
                "dashboard_url": f"{base_url}/dashboard",
            },
            lang=lang,
        )

    def send_deposit_rejected_email(
        self,
        user_email: str,
        user_name: str,
        amount: str,
        currency: str,
        reason: str,
        lang: Optional[str] = "en",
    ):
        """Send Phase 7: Deposit Rejected."""
        base_url = self._get_frontend_url()
        self.dispatch_background(
            to_email=user_email,
            template_key="deposit_rejected",
            variables={
                "user_name": user_name or "Investor",
                "amount": str(amount),
                "currency": currency.upper(),
                "reason": reason or "Verification proof mismatch.",
                "dashboard_url": f"{base_url}/dashboard/tickets",
            },
            lang=lang,
        )

    def send_withdrawal_submitted_email(
        self,
        user_email: str,
        user_name: str,
        amount: str,
        currency: str,
        reference: str,
        destination: str,
        lang: Optional[str] = "en",
    ):
        """Send Phase 6 Email 4 & Phase 7: Withdrawal Submitted."""
        base_url = self._get_frontend_url()
        self.dispatch_background(
            to_email=user_email,
            template_key="withdrawal_submitted",
            variables={
                "user_name": user_name or "Investor",
                "amount": str(amount),
                "currency": currency.upper(),
                "reference": reference,
                "destination": destination,
                "dashboard_url": f"{base_url}/dashboard/withdrawal-history",
            },
            lang=lang,
        )

    def send_withdrawal_completed_email(
        self,
        user_email: str,
        user_name: str,
        amount: str,
        currency: str,
        wallet_address: str,
        tx_hash: str,
        lang: Optional[str] = "en",
    ):
        """Send Phase 6 Email 6 & Phase 7: Withdrawal Completed."""
        base_url = self._get_frontend_url()
        self.dispatch_background(
            to_email=user_email,
            template_key="withdrawal_completed",
            variables={
                "user_name": user_name or "Investor",
                "amount": str(amount),
                "currency": currency.upper(),
                "wallet_address": wallet_address,
                "tx_hash": tx_hash,
                "dashboard_url": f"{base_url}/dashboard/withdrawal-history",
            },
            lang=lang,
        )

    def send_withdrawal_rejected_email(
        self,
        user_email: str,
        user_name: str,
        amount: str,
        currency: str,
        reference: str,
        reason: str,
        lang: Optional[str] = "en",
    ):
        """Send Phase 6 Email 5 & Phase 7: Withdrawal Rejected."""
        base_url = self._get_frontend_url()
        self.dispatch_background(
            to_email=user_email,
            template_key="withdrawal_rejected",
            variables={
                "user_name": user_name or "Investor",
                "amount": str(amount),
                "currency": currency.upper(),
                "reference": reference,
                "reason": reason or "Administrative compliance rejection.",
                "dashboard_url": f"{base_url}/dashboard/tickets",
            },
            lang=lang,
        )

    def send_investment_activated_email(
        self,
        user_email: str,
        user_name: str,
        plan_name: str,
        amount: str,
        currency: str,
        maturity_date: str,
        expected_return: str,
        lang: Optional[str] = "en",
    ):
        """Send Phase 7: Investment Plan Activated."""
        base_url = self._get_frontend_url()
        self.dispatch_background(
            to_email=user_email,
            template_key="investment_activated",
            variables={
                "user_name": user_name or "Investor",
                "plan_name": plan_name,
                "amount": str(amount),
                "currency": currency.upper(),
                "maturity_date": maturity_date,
                "expected_return": str(expected_return),
                "dashboard_url": f"{base_url}/dashboard/active-investments",
            },
            lang=lang,
        )

    def send_investment_matured_email(
        self,
        user_email: str,
        user_name: str,
        plan_name: str,
        amount: str,
        return_amount: str,
        currency: str,
        lang: Optional[str] = "en",
    ):
        """Send Phase 7: Investment Contract Matured."""
        base_url = self._get_frontend_url()
        self.dispatch_background(
            to_email=user_email,
            template_key="investment_matured",
            variables={
                "user_name": user_name or "Investor",
                "plan_name": plan_name,
                "amount": str(amount),
                "return_amount": str(return_amount),
                "currency": currency.upper(),
                "login_url": f"{base_url}/dashboard",
                "dashboard_url": f"{base_url}/dashboard",
            },
            lang=lang,
        )

    def send_security_alert_email(
        self,
        user_email: str,
        user_name: str,
        event_type: str,
        ip_address: str,
        lang: Optional[str] = "en",
    ):
        """Send Phase 7: Security Alert."""
        base_url = self._get_frontend_url()
        self.dispatch_background(
            to_email=user_email,
            template_key="security_alert",
            variables={
                "user_name": user_name or "Investor",
                "event_type": event_type,
                "ip_address": ip_address or "Unknown IP",
                "timestamp": datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC"),
                "dashboard_url": f"{base_url}/dashboard/settings",
            },
            lang=lang,
        )


email_service = EmailService()
