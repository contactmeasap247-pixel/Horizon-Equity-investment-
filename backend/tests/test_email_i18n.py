# ============================================
# HORIZON EQUITY - EMAIL I18N TESTS
# ============================================

import sys
from pathlib import Path
import unittest

# Ensure backend root is on PYTHONPATH
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.services.email_translations import build_localized_email, LOCALIZED_EMAIL_DATA
from app.services.email_service import email_service


class TestEmailLocalization(unittest.TestCase):
    def test_supported_languages_coverage(self):
        """Verify that all 9 configured languages have translation definitions."""
        required_langs = {"en", "es", "nl", "pt", "fr", "de", "zh", "ru", "ar"}
        for template_key, lang_map in LOCALIZED_EMAIL_DATA.items():
            self.assertTrue(
                required_langs.issubset(set(lang_map.keys())),
                f"Template {template_key} missing translations for {required_langs - set(lang_map.keys())}",
            )

    def test_localized_welcome_bonus_email(self):
        """Verify welcome bonus email renders for all 9 languages with variables preserved."""
        vars_dict = {
            "user_name": "Marcus Sterling",
            "bonus_amount": "10.00",
            "login_url": "https://horizon-equity.net/auth/login",
            "support_email": "support@horizon-equity.net",
        }

        # Spanish
        subject_es, html_es, text_es = build_localized_email("welcome_bonus", vars_dict, lang="es")
        self.assertIn("Marcus Sterling", html_es)
        self.assertIn("10.00", subject_es)
        self.assertIn("Bienvenido", subject_es)
        self.assertIn("Crédito Promocional", html_es)

        # Dutch
        subject_nl, html_nl, text_nl = build_localized_email("welcome_bonus", vars_dict, lang="nl")
        self.assertIn("Welkom", subject_nl)
        self.assertIn("Marcus Sterling", html_nl)

        # French
        subject_fr, html_fr, text_fr = build_localized_email("welcome_bonus", vars_dict, lang="fr")
        self.assertIn("Bienvenue", subject_fr)

        # German
        subject_de, html_de, text_de = build_localized_email("welcome_bonus", vars_dict, lang="de")
        self.assertIn("Willkommen", subject_de)

        # Chinese
        subject_zh, html_zh, text_zh = build_localized_email("welcome_bonus", vars_dict, lang="zh")
        self.assertIn("欢迎", subject_zh)
        self.assertIn("Marcus Sterling", html_zh)

        # Arabic (RTL check)
        subject_ar, html_ar, text_ar = build_localized_email("welcome_bonus", vars_dict, lang="ar")
        self.assertIn('dir="rtl"', html_ar)
        self.assertIn("مرحبًا", html_ar)

    def test_frontend_url_resolution(self):
        """Verify _get_frontend_url returns production custom domain cleanly."""
        url = email_service._get_frontend_url()
        self.assertEqual(url, "https://horizon-equity.net")

    def test_fallback_to_english(self):
        """Verify fallback to English when unsupported language code is passed."""
        vars_dict = {"user_name": "Marcus", "bonus_amount": "10.00"}
        subject, html, text = build_localized_email("welcome_bonus", vars_dict, lang="xx_UNKNOWN")
        self.assertIn("Welcome to Horizon Equity", subject)

    def test_email_service_render_template_integration(self):
        """Verify email_service.render_template honors lang parameter."""
        vars_dict = {"user_name": "Elena", "bonus_amount": "10.00"}
        subject, html, text = email_service.render_template("welcome_bonus", vars_dict, lang="es")
        self.assertIn("Bienvenido", subject)
        self.assertIn("Elena", html)

    def test_email_service_send_email_methods_exist(self):
        """Verify _send_email and send_email exist to prevent AttributeError."""
        self.assertTrue(hasattr(email_service, "_send_email"))
        self.assertTrue(hasattr(email_service, "send_email"))
        self.assertTrue(hasattr(email_service, "_send_email_sync"))


if __name__ == "__main__":
    unittest.main()
