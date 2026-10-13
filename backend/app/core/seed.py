# ============================================
# HORIZON EQUITY - DATABASE SEEDING UTILITY
# ============================================

import asyncio
from decimal import Decimal
from sqlalchemy.future import select
from app.core.database import async_session, engine, Base
import app.models
from app.models.user import User
from app.models.wallet import Wallet
from app.models.investment_plan import InvestmentPlan
from app.core.security import hash_password
from app.core.config import settings

async def seed_data():
    # Create all tables first if they don't exist
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    print("Seeding initial database data...")
    async with async_session() as db:
        # 1. Seed Investment Plans (Exactly 4 tiers)
        plans_data = [
            {
                "name": "Silver Plan",
                "description": "Foundational yield tier for beginner allocations across diversified liquid digital assets and gold bullion.",
                "min_amount": Decimal("100.0"),
                "max_amount": Decimal("499.0"),
                "return_percentage": Decimal("8.0"),
                "duration_days": 2,
                "referral_bonus_percentage": Decimal("5.0"),
                "is_active": True,
                "is_featured": False,
                "sort_order": 1,
            },
            {
                "name": "Gold Plan",
                "description": "Growth yield portfolio with active algorithmic rebalancing across global forex and energy commodities.",
                "min_amount": Decimal("500.0"),
                "max_amount": Decimal("999.0"),
                "return_percentage": Decimal("16.0"),
                "duration_days": 3,
                "referral_bonus_percentage": Decimal("7.0"),
                "is_active": True,
                "is_featured": True,
                "sort_order": 2,
            },
            {
                "name": "Platinum Plan",
                "description": "Institutional grade multi-asset diversification with quantitative risk hedging and priority clearing.",
                "min_amount": Decimal("1000.0"),
                "max_amount": Decimal("4999.0"),
                "return_percentage": Decimal("28.0"),
                "duration_days": 7,
                "referral_bonus_percentage": Decimal("10.0"),
                "is_active": True,
                "is_featured": True,
                "sort_order": 3,
            },
            {
                "name": "Diamond Plan",
                "description": "Executive syndicate tier with institutional custody, private manager assistance, and uncapped capital limits.",
                "min_amount": Decimal("5000.0"),
                "max_amount": None,
                "return_percentage": Decimal("45.0"),
                "duration_days": 7,
                "referral_bonus_percentage": Decimal("12.0"),
                "is_active": True,
                "is_featured": True,
                "sort_order": 4,
            },
        ]

        for p_data in plans_data:
            q = select(InvestmentPlan).filter(InvestmentPlan.name == p_data["name"])
            res = await db.execute(q)
            existing_plan = res.scalars().first()
            if not existing_plan:
                new_plan = InvestmentPlan(**p_data)
                db.add(new_plan)
                print(f"Created plan: {p_data['name']}")

        # 2. Seed / Update Admin User
        admin_email = settings.ADMIN_EMAIL
        admin_password = settings.ADMIN_PASSWORD
        admin_q = select(User).filter((User.email == admin_email) | (User.is_admin == True))
        admin_res = await db.execute(admin_q)
        admin_user = admin_res.scalars().first()

        if not admin_user:
            admin_user = User(
                email=admin_email,
                full_name="Platform Admin",
                password_hash=hash_password(admin_password),
                is_admin=True,
                kyc_status="verified",
                is_active=True,
                referral_code="HE-ADMIN",
            )
            print(f"Debug: admin_user.referral_code = {admin_user.referral_code}")
            db.add(admin_user)
            await db.flush() # get ID
            
            # Create wallets for Admin
            for curr in ["BTC", "ETH", "USDT", "SOL"]:
                admin_wallet = Wallet(
                    user_id=admin_user.id,
                    currency=curr,
                    balance=Decimal("1000000.0"), # high balance for system admin
                    frozen_balance=Decimal("0.0"),
                    total_deposited=Decimal("0.0"),
                    total_withdrawn=Decimal("0.0"),
                )
                db.add(admin_wallet)
            print(f"Created default admin user ({admin_email}) and wallets.")
        else:
            admin_user.email = admin_email
            admin_user.password_hash = hash_password(admin_password)
            admin_user.is_admin = True
            admin_user.is_active = True
            print(f"Updated existing admin user credentials to {admin_email}.")

        await db.commit()
        print("Seeding complete! (Investment plans & Admin configured)")

if __name__ == "__main__":
    asyncio.run(seed_data())
