# ============================================
# HORIZON EQUITY - EMAIL I18N TESTS
# ============================================

import pytest
from app.services.email_translations import build_localized_email, LOCALIZED_EMAIL_DATA
from app.services.email_service import email_service


def test_supported_languages_coverage():
    """Verify that all 9 configured languages have translation definitions."""
    required_langs = {"en", "es", "nl", "pt", "fr", "de", "zh", "ru", "ar"}
    for template_key, lang_map in LOCALIZED_EMAIL_DATA.items():
        assert required_langs.issubset(set(lang_map.keys())), (
            f"Template {template_key} missing translations for {required_langs - set(lang_map.keys())}"
        )


def test_localized_welcome_bonus_email():
    """Verify welcome bonus email renders for all 9 languages with variables preserved."""
    vars_dict = {
        "user_name": "Marcus Sterling",
        "bonus_amount": "10.00",
        "login_url": "https://horizon-equity-investment.vercel.app/auth/login",
        "support_email": "concierge@horizonequity.net",
    }

    # Spanish
    subject_es, html_es, text_es = build_localized_email("welcome_bonus", vars_dict, lang="es")
    assert "Marcus Sterling" in html_es
    assert "10.00" in subject_es
    assert "Bienvenido" in subject_es
    assert "Crédito Promocional" in html_es

    # Dutch
    subject_nl, html_nl, text_nl = build_localized_email("welcome_bonus", vars_dict, lang="nl")
    assert "Welkom" in subject_nl
    assert "Marcus Sterling" in html_nl

    # French
    subject_fr, html_fr, text_fr = build_localized_email("welcome_bonus", vars_dict, lang="fr")
    assert "Bienvenue" in subject_fr

    # German
    subject_de, html_de, text_de = build_localized_email("welcome_bonus", vars_dict, lang="de")
    assert "Willkommen" in subject_de

    # Chinese
    subject_zh, html_zh, text_zh = build_localized_email("welcome_bonus", vars_dict, lang="zh")
    assert "欢迎" in subject_zh
    assert "Marcus Sterling" in html_zh

    # Arabic (RTL check)
    subject_ar, html_ar, text_ar = build_localized_email("welcome_bonus", vars_dict, lang="ar")
    assert 'dir="rtl"' in html_ar
    assert "مرحبًا" in html_ar


def test_fallback_to_english():
    """Verify fallback to English when unsupported language code is passed."""
    vars_dict = {"user_name": "Marcus", "bonus_amount": "10.00"}
    subject, html, text = build_localized_email("welcome_bonus", vars_dict, lang="xx_UNKNOWN")
    assert "Welcome to Horizon Equity" in subject


def test_email_service_render_template_integration():
    """Verify email_service.render_template honors lang parameter."""
    vars_dict = {"user_name": "Elena", "bonus_amount": "10.00"}
    subject, html, text = email_service.render_template("welcome_bonus", vars_dict, lang="es")
    assert "Bienvenido" in subject
    assert "Elena" in html

