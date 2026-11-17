# ============================================
# HORIZON EQUITY - SUPPORT WIDGET TEST SUITE
# ============================================

import pytest
import uuid
from pydantic import ValidationError

from app.models.user import User
from app.models.site_setting import SiteSetting
from app.models.audit_log import AuditLog
from app.services.admin_service import admin_service
from app.schemas.support_widget import SupportChannelItem, SupportWidgetConfig
from sqlalchemy.future import select


@pytest.mark.asyncio
async def test_get_support_widget_default_config(test_db):
    """Verify default support widget configuration initializes with robust institutional channels."""
    config = await admin_service.get_support_widget_config(test_db)

    assert config["enabled"] is True
    assert config["title"] == "Horizon Concierge Support"
    assert config["position"] == "bottom-right"
    assert config["visibility_scope"] == "both"
    assert config["draggable"] is True
    assert len(config["channels"]) >= 4

    types = [c["type"] for c in config["channels"]]
    assert "whatsapp" in types
    assert "telegram" in types
    assert "email" in types
    assert "custom" in types


@pytest.mark.asyncio
async def test_admin_update_support_widget_config(test_db):
    """Verify administrator can update positioning, visibility scopes, and reorder channels with audit logging."""
    admin = User(
        id=uuid.uuid4(),
        email="support_admin@horizonequity.com",
        password_hash="hash",
        full_name="Support Director",
        referral_code="REF-SUPADM",
        is_admin=True,
        is_active=True,
    )
    test_db.add(admin)
    await test_db.commit()

    updated_payload = {
        "enabled": True,
        "title": "Horizon Private Wealth Desk",
        "welcome_message": "Welcome. Our private bankers are available to assist with institutional clearing.",
        "position": "bottom-left",
        "offset_x": 32,
        "offset_y": 32,
        "mobile_position": "bottom-right",
        "mobile_offset_x": 20,
        "mobile_offset_y": 20,
        "show_on_mobile": True,
        "show_on_desktop": True,
        "draggable": False,
        "visibility_scope": "primary",
        "channels": [
            {
                "id": "wa-new",
                "type": "whatsapp",
                "name": "Direct WhatsApp Line",
                "value": "+447123456789",
                "country_code": "+44",
                "description": "Direct WhatsApp line to senior wealth managers",
                "prefilled_message": "Hello, I require assistance with a withdrawal.",
                "enabled": True,
                "order": 1,
            },
            {
                "id": "tg-new",
                "type": "telegram",
                "name": "VIP Telegram",
                "value": "HorizonVIPDesk",
                "description": "Encrypted desk",
                "prefilled_message": None,
                "enabled": False,  # Disabled
                "order": 2,
            },
        ],
    }

    result = await admin_service.update_support_widget_config(
        test_db,
        config=updated_payload,
        admin_id=admin.id,
    )

    assert result["title"] == "Horizon Private Wealth Desk"
    assert result["position"] == "bottom-left"
    assert result["offset_x"] == 32
    assert result["visibility_scope"] == "primary"
    assert len(result["channels"]) == 2

    # Verify audit log generated
    audit_res = await test_db.execute(
        select(AuditLog).filter(
            AuditLog.admin_id == admin.id,
            AuditLog.action == "support_widget_settings_updated",
        )
    )
    audit = audit_res.scalars().first()
    assert audit is not None
    assert audit.new_values["config"]["title"] == "Horizon Private Wealth Desk"


def test_unsafe_url_validation_rejection():
    """Verify that malicious XSS protocols (javascript:, data:, vbscript:) are strictly blocked."""
    with pytest.raises(ValidationError):
        SupportChannelItem(
            id="bad-1",
            type="custom",
            name="Malicious Link",
            value="javascript:alert(document.cookie)",
            enabled=True,
            order=1,
        )

    with pytest.raises(ValidationError):
        SupportChannelItem(
            id="bad-2",
            type="custom",
            name="Data URI Link",
            value="data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==",
            enabled=True,
            order=2,
        )


def test_valid_channel_types_and_values():
    """Verify valid social platforms, phones, and emails pass schema validation."""
    c1 = SupportChannelItem(
        id="c1",
        type="whatsapp",
        name="WhatsApp Support",
        value="+447999888777",
        country_code="+44",
        prefilled_message="Need account help",
        enabled=True,
        order=1,
    )
    assert c1.type == "whatsapp"
    assert c1.value == "+447999888777"

    c2 = SupportChannelItem(
        id="c2",
        type="telegram",
        name="Telegram Channel",
        value="https://t.me/HorizonOfficial",
        enabled=True,
        order=2,
    )
    assert c2.type == "telegram"

    c3 = SupportChannelItem(
        id="c3",
        type="email",
        name="Support Email",
        value="support@horizon-equity.net",
        enabled=True,
        order=3,
    )
    assert c3.type == "email"


def test_widget_config_constraints():
    """Verify position and offset limits enforce UI bounds."""
    # Invalid position should raise
    with pytest.raises(ValidationError):
        SupportWidgetConfig(
            position="center-middle",  # Not allowed
        )

    # Offset out of bounds should raise
    with pytest.raises(ValidationError):
        SupportWidgetConfig(
            offset_x=999,  # max is 200
        )

