# ============================================
# HORIZON EQUITY - COMPREHENSIVE EMAIL SERVICE
# Brevo REST API + SMTP Relay with Operational Logging
# ============================================

import uuid
import logging
import smtplib
import asyncio
from datetime import datetime
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Dict, Any, Optional, Tuple

from app.core.config import settings

logger = logging.getLogger("horizon.email")


class EmailService:
    """Enterprise-grade Brevo transactional email client with template rendering and audit logging."""

    @staticmethod
    def _get_frontend_url() -> str:
        """Resolve secure frontend base URL for verification and action links."""
        url = (getattr(settings, "VERCEL_FRONTEND_URL", "") or "").strip()
        if not url:
            return "http://localhost:3000" if settings.DEBUG else "https://horizon-equity-investment.vercel.app"
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
        brevo_key = getattr(settings, "BREVO_API_KEY", "") or ""
        if brevo_key.strip() and brevo_key.strip() != "stub-brevo-key":
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
                    "api-key": brevo_key.strip(),
                    "content-type": "application/json",
                }
                with httpx.Client(timeout=12.0) as client:
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
                    err_msg = f"Brevo API error ({resp.status_code}): {resp.text}"
                    logger.error(err_msg)
            except Exception as e:
                err_msg = f"Failed to send email to {to_email} via Brevo API: {e}"
                logger.error(err_msg)

        # 2. Brevo or Generic SMTP Relay
        smtp_user = getattr(settings, "SMTP_USER", "")
        smtp_pass = getattr(settings, "SMTP_PASSWORD", "")
        smtp_host = getattr(settings, "SMTP_HOST", "smtp-relay.brevo.com")
        smtp_port = getattr(settings, "SMTP_PORT", 587)

        if smtp_pass and smtp_pass != "stub-password" and smtp_user:
            try:
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

                with smtplib.SMTP(smtp_host, smtp_port, timeout=15) as server:
                    server.starttls()
                    server.login(smtp_user, smtp_pass)
                    server.sendmail(sender_email, to_email, msg.as_string())

                logger.info(f"Email successfully dispatched to {to_email} via Brevo SMTP ({smtp_host})")
                return True, unique_msg_id, None
            except Exception as e:
                err_msg = f"Failed to send email to {to_email} via SMTP: {e}"
                logger.error(err_msg)
                return False, None, err_msg

        # 3. Fallback mock / stub for local dev
        logger.info(f"[MOCK / DEV EMAIL] To: {to_email} | Subject: {subject}")
        return True, f"<mock-{uuid.uuid4()}@local>", None

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
    def render_template(template_key: str, variables: Dict[str, Any]) -> Tuple[str, str, str]:
        """
        Load template by key from DEFAULT_EMAIL_TEMPLATES and substitute variables.
        Returns: (subject, html_content, text_content)
        """
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
    ) -> bool:
        """Render a system template and dispatch via Brevo with operational logging."""
        subject, html_content, text_content = self.render_template(template_key, variables)
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

    def dispatch_background(self, to_email: str, template_key: str, variables: Dict[str, Any]):
        """Schedule email sending on the running asyncio loop without blocking caller."""
        try:
            loop = asyncio.get_running_loop()
            loop.create_task(self.send_templated_email(to_email, template_key, variables))
        except RuntimeError:
            # No running event loop, dispatch in thread
            asyncio.run(self.send_templated_email(to_email, template_key, variables))

    # ========================================================
    # HIGH-LEVEL TRANSACTIONAL EMAIL HELPERS
    # ========================================================

    def send_welcome_bonus_email(self, user_email: str, user_name: str, bonus_amount: str = "10.00"):
        """Send Phase 6 Email 1: Welcome to Horizon Equity — Your $10 Welcome Bonus."""
        base_url = self._get_frontend_url()
        self.dispatch_background(
            to_email=user_email,
            template_key="welcome_bonus",
            variables={
                "user_name": user_name or "Investor",
                "bonus_amount": bonus_amount,
                "dashboard_url": f"{base_url}/dashboard",
                "rules_url": f"{base_url}/dashboard/withdrawals",
            },
        )

    def send_verification_email(self, user_email: str, user_name: str, token: str, expires_hours: int = 24):
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
        )

    def send_email_verified_confirmation(self, user_email: str, user_name: str, bonus_amount: str = "10.00"):
        """Send Phase 3C: Email Verified Confirmation."""
        base_url = self._get_frontend_url()
        self.dispatch_background(
            to_email=user_email,
            template_key="email_verified_confirmation",
            variables={
                "user_name": user_name or "Investor",
                "bonus_amount": bonus_amount,
                "dashboard_url": f"{base_url}/dashboard",
                "invest_url": f"{base_url}/dashboard/investments",
            },
        )

    def send_password_reset_email(self, user_email: str, user_name: str, token: str, expires_minutes: int = 60):
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
        )

    def send_bonus_unlocked_email(
        self,
        user_email: str,
        user_name: str,
        bonus_amount: str = "10.00",
        plan_name: str = "Silver Starter Tier",
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
                "dashboard_url": f"{base_url}/dashboard",
                "withdraw_url": f"{base_url}/dashboard/withdrawals",
            },
        )

    def send_deposit_submitted_email(self, user_email: str, user_name: str, amount: str, currency: str, reference: str):
        """Send Phase 7: Deposit Submitted."""
        self.dispatch_background(
            to_email=user_email,
            template_key="deposit_submitted",
            variables={
                "user_name": user_name or "Investor",
                "amount": str(amount),
                "currency": currency.upper(),
                "reference": reference,
            },
        )

    def send_deposit_confirmed_email(self, user_email: str, user_name: str, amount: str, currency: str, tx_hash: str):
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
            },
        )

    def send_deposit_rejected_email(self, user_email: str, user_name: str, amount: str, currency: str, reason: str):
        """Send Phase 7: Deposit Rejected."""
        self.dispatch_background(
            to_email=user_email,
            template_key="deposit_rejected",
            variables={
                "user_name": user_name or "Investor",
                "amount": str(amount),
                "currency": currency.upper(),
                "reason": reason or "Verification proof mismatch.",
            },
        )

    def send_withdrawal_submitted_email(
        self, user_email: str, user_name: str, amount: str, currency: str, reference: str, destination: str
    ):
        """Send Phase 6 Email 4 & Phase 7: Withdrawal Submitted."""
        self.dispatch_background(
            to_email=user_email,
            template_key="withdrawal_submitted",
            variables={
                "user_name": user_name or "Investor",
                "amount": str(amount),
                "currency": currency.upper(),
                "reference": reference,
                "destination": destination,
            },
        )

    def send_withdrawal_completed_email(
        self, user_email: str, user_name: str, amount: str, currency: str, wallet_address: str, tx_hash: str
    ):
        """Send Phase 6 Email 6 & Phase 7: Withdrawal Completed."""
        self.dispatch_background(
            to_email=user_email,
            template_key="withdrawal_completed",
            variables={
                "user_name": user_name or "Investor",
                "amount": str(amount),
                "currency": currency.upper(),
                "wallet_address": wallet_address,
                "tx_hash": tx_hash,
            },
        )

    def send_withdrawal_rejected_email(
        self, user_email: str, user_name: str, amount: str, currency: str, reference: str, reason: str
    ):
        """Send Phase 6 Email 5 & Phase 7: Withdrawal Rejected."""
        self.dispatch_background(
            to_email=user_email,
            template_key="withdrawal_rejected",
            variables={
                "user_name": user_name or "Investor",
                "amount": str(amount),
                "currency": currency.upper(),
                "reference": reference,
                "reason": reason or "Administrative compliance rejection.",
            },
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
    ):
        """Send Phase 7: Investment Plan Activated."""
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
            },
        )

    def send_investment_matured_email(
        self,
        user_email: str,
        user_name: str,
        plan_name: str,
        amount: str,
        return_amount: str,
        currency: str,
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
            },
        )

    def send_security_alert_email(self, user_email: str, user_name: str, event_type: str, ip_address: str):
        """Send Phase 7: Security Alert."""
        self.dispatch_background(
            to_email=user_email,
            template_key="security_alert",
            variables={
                "user_name": user_name or "Investor",
                "event_type": event_type,
                "ip_address": ip_address or "Unknown IP",
                "timestamp": datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC"),
            },
        )


email_service = EmailService()
