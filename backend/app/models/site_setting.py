# ============================================
# HORIZON EQUITY - SITE SETTINGS MODEL
# ============================================

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, TIMESTAMP, Uuid, JSON
from app.core.database import Base


class SiteSetting(Base):
    __tablename__ = "site_settings"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    key = Column(String(100), unique=True, nullable=False)
    value = Column(JSON, nullable=True)
    type = Column(String(20), nullable=True)  # string, number, boolean, json
    group_name = Column(String(50), nullable=True)
    description = Column(Text, nullable=True)
    created_at = Column(TIMESTAMP, default=datetime.utcnow)
    updated_at = Column(TIMESTAMP, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<SiteSetting {self.key}>"
