# ============================================
# HORIZON EQUITY - EMAIL SERVICE
# ============================================

import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings

logger = logging.getLogger("horizon.email")


class EmailService:
    """Sends emails. Falls back to console printing if SMTP_PASSWORD is 'stub-password'."""

    @staticmethod
    def _send_email(to_email: str, subject: str, html_content: str, text_content: str):
        if settings.SMTP_PASSWORD == "stub-password":
            logger.info(f"[STUB EMAIL] To: {to_email} | Subject: {subject}\nContent: {text_content}")
            print(f"\n[MOCK EMAIL]\nTo: {to_email}\nSubject: {subject}\n{text_content}\n")
            return

        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = settings.SMTP_FROM
            msg["To"] = to_email

            part1 = MIMEText(text_content, "plain")
            part2 = MIMEText(html_content, "html")
            msg.attach(part1)
            msg.attach(part2)

            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
                server.starttls()
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.sendmail(settings.SMTP_FROM, to_email, msg.as_string())
            logger.info(f"Email successfully sent to {to_email} via SMTP")
        except Exception as e:
            logger.error(f"Failed to send email to {to_email} via SMTP: {e}")

    @staticmethod
    def _get_frontend_url() -> str:
        """Resolve secure frontend base URL for verification and password reset links."""
        url = (settings.VERCEL_FRONTEND_URL or "").strip()
        if not url:
            return "http://localhost:3000" if settings.DEBUG else "https://horizon-equity-investment.vercel.app"
        url = url.rstrip("/")
        if url.startswith("http://") and "localhost" not in url and "127.0.0.1" not in url:
            url = "https://" + url[7:]
        elif not url.startswith("http://") and not url.startswith("https://"):
            url = f"https://{url}"
        return url

    @staticmethod
    def send_verification_email(email: str, token: str):
        """Send an email verification message."""
        base_url = EmailService._get_frontend_url()
        verification_link = f"{base_url}/auth/verify-email?token={token}"
        text_content = f"Please verify your account by clicking the link: {verification_link}"
        html_content = f"""
        <html>
            <body style="font-family: sans-serif; background-color: #0a0a12; color: #ffffff; padding: 20px;">
                <h2 style="color: #d4af37;">Welcome to Horizon Equity</h2>
                <p>Please verify your account by clicking the button below:</p>
                <a href="{verification_link}" style="display: inline-block; background-color: #d4af37; color: black; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 15px 0;">Verify Account</a>
                <p style="font-size: 12px; color: #a0a0b0;">Or copy and paste this link in your browser: {verification_link}</p>
            </body>
        </html>
        """
        EmailService._send_email(email, "Verify your Horizon Equity account", html_content, text_content)

    @staticmethod
    def send_password_reset_email(email: str, token: str):
        """Send a password reset email."""
        base_url = EmailService._get_frontend_url()
        reset_link = f"{base_url}/auth/reset-password?token={token}"
        text_content = f"We received a request to reset your password. Please click the link to reset your password: {reset_link}"
        html_content = f"""
        <html>
            <body style="font-family: sans-serif; background-color: #0a0a12; color: #ffffff; padding: 20px;">
                <h2 style="color: #d4af37;">Horizon Equity - Password Reset</h2>
                <p>We received a request to reset your password. Click the button below to set a new password:</p>
                <a href="{reset_link}" style="display: inline-block; background-color: #d4af37; color: black; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 15px 0;">Reset Password</a>
                <p style="font-size: 12px; color: #a0a0b0;">Or copy and paste this link in your browser: {reset_link}</p>
            </body>
        </html>
        """
        EmailService._send_email(email, "Reset your Horizon Equity password", html_content, text_content)


email_service = EmailService()
