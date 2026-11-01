# ============================================
# HORIZON EQUITY - BREVO DIAGNOSTICS & ERROR HANDLING TESTS
# ============================================

import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import smtplib
import socket

from app.services.email_service import _classify_brevo_api_error, _classify_smtp_error


def test_api_error_classification():
    # 401 Unauthorized
    err_401 = _classify_brevo_api_error(401, '{"message":"Key not found","code":"unauthorized"}', "noreply@horizonequity.net", "test@example.com")
    assert "Authentication Failure" in err_401

    # 400 Sender
    err_sender = _classify_brevo_api_error(400, '{"message":"Sender email is not verified"}', "noreply@horizonequity.net", "test@example.com")
    assert "Sender address" in err_sender

    # 400 Recipient
    err_recipient = _classify_brevo_api_error(400, '{"message":"Invalid recipient email"}', "noreply@horizonequity.net", "invalid-email")
    assert "Invalid Recipient" in err_recipient

    # 402 Quota
    err_quota = _classify_brevo_api_error(402, '{"message":"credits exhausted"}', "noreply@horizonequity.net", "test@example.com")
    assert "Quota Exceeded" in err_quota

    # 429 Rate limit
    err_429 = _classify_brevo_api_error(429, '{"message":"rate limit exceeded"}', "noreply@horizonequity.net", "test@example.com")
    assert "Rate Limit" in err_429

    print("API error classification: PASS")


def test_smtp_error_classification():
    # Auth error
    err_auth = _classify_smtp_error(smtplib.SMTPAuthenticationError(535, b"Authentication failed"), "noreply@horizonequity.net", "test@example.com", "smtp-relay.brevo.com", 587)
    assert "Authentication Failure" in err_auth

    # Sender refused
    err_sender = _classify_smtp_error(smtplib.SMTPSenderRefused(550, b"Sender not allowed", "noreply@horizonequity.net"), "noreply@horizonequity.net", "test@example.com", "smtp-relay.brevo.com", 587)
    assert "Sender Refused" in err_sender

    # Timeout
    err_timeout = _classify_smtp_error(TimeoutError("timed out"), "noreply@horizonequity.net", "test@example.com", "smtp-relay.brevo.com", 587)
    assert "Network Timeout" in err_timeout

    print("SMTP error classification: PASS")


if __name__ == "__main__":
    test_api_error_classification()
    test_smtp_error_classification()
    print("ALL BREVO DIAGNOSTICS UNIT TESTS PASSED!")

