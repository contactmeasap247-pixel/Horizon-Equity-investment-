# ============================================
# HORIZON EQUITY - SITE SETTINGS SERVICE
# ============================================

from typing import List, Optional, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.site_setting import SiteSetting
from app.schemas.settings import SiteSettingCreate


class SettingsService:
    """Business logic for configuring and querying dynamic site parameters."""

    @staticmethod
    async def get_setting(db: AsyncSession, key: str) -> Optional[SiteSetting]:
        """Fetch a specific site setting by key."""
        result = await db.execute(select(SiteSetting).filter(SiteSetting.key == key.strip()))
        return result.scalars().first()

    async def get_setting_value(self, db: AsyncSession, key: str, default: Any = None) -> Any:
        """Fetch the JSON value of a site setting directly, returning default if not found."""
        setting = await self.get_setting(db, key)
        if setting is None:
            return default
        return setting.value

    @staticmethod
    async def get_all_settings(db: AsyncSession, group_name: Optional[str] = None) -> List[SiteSetting]:
        """Fetch all site settings, optionally filtered by group_name."""
        query = select(SiteSetting)
        if group_name:
            query = query.filter(SiteSetting.group_name == group_name.strip())
        result = await db.execute(query.order_by(SiteSetting.key.asc()))
        return list(result.scalars().all())

    async def create_setting(self, db: AsyncSession, setting_in: SiteSettingCreate) -> SiteSetting:
        """Create a new site setting entry."""
        existing = await self.get_setting(db, setting_in.key)
        if existing:
            # Overwrite value
            existing.value = setting_in.value
            existing.type = setting_in.type
            existing.group_name = setting_in.group_name
            existing.description = setting_in.description
            db.add(existing)
            await db.commit()
            await db.refresh(existing)
            return existing

        new_setting = SiteSetting(
            key=setting_in.key.strip(),
            value=setting_in.value,
            type=setting_in.type,
            group_name=setting_in.group_name,
            description=setting_in.description,
        )
        db.add(new_setting)
        await db.commit()
        await db.refresh(new_setting)
        return new_setting

    async def update_setting(
        self, db: AsyncSession, key: str, value: Any, description: Optional[str] = None
    ) -> Optional[SiteSetting]:
        """Update the value and/or description of an existing site setting."""
        setting = await self.get_setting(db, key)
        if setting is None:
            return None

        setting.value = value
        if description is not None:
            setting.description = description
            
        db.add(setting)
        await db.commit()
        await db.refresh(setting)
        return setting


settings_service = SettingsService()
