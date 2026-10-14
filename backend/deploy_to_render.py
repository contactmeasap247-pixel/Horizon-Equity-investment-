"""
Horizon Equity - Automated Render Deployment Script
Reads credentials from backend/.env and creates/configures the Render Web Service via Render API.
"""

import json
import os
import sys
import urllib.request
import urllib.error
from pathlib import Path

# Built-in .env parser (zero external dependencies)
env_path = Path(__file__).resolve().parent / ".env"
env_vars_loaded = {}
if env_path.exists():
    with open(env_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                env_vars_loaded[k.strip()] = v.strip().strip('"').strip("'")

def get_env(key: str, default: str = "") -> str:
    return os.getenv(key) or env_vars_loaded.get(key) or default

RENDER_API_KEY = get_env("RENDER_API_KEY").strip()
VERCEL_FRONTEND_URL = get_env("VERCEL_FRONTEND_URL").strip().rstrip("/")
REPO_URL = "https://github.com/contactmeasap247-pixel/Horizon-Equity-investment-"
SERVICE_NAME = "horizon-equity-backend"

API_BASE = "https://api.render.com/v1"


def render_request(endpoint: str, method: str = "GET", data: dict = None):
    url = f"{API_BASE}{endpoint}"
    headers = {
        "Authorization": f"Bearer {RENDER_API_KEY}",
        "Accept": "application/json",
        "Content-Type": "application/json",
    }
    encoded_data = json.dumps(data).encode("utf-8") if data else None
    req = urllib.request.Request(url, data=encoded_data, headers=headers, method=method)

    try:
        with urllib.request.urlopen(req) as resp:
            content = resp.read().decode("utf-8")
            return json.loads(content) if content else {}
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8")
        print(f"[ERROR] HTTP {e.code} on {method} {endpoint}: {error_body}")
        raise e


def get_owner_id():
    print("[1/4] Authenticating with Render API...")
    owners = render_request("/owners")
    if not owners:
        raise ValueError("No owners found for this Render API key.")
    owner = owners[0].get("owner", {})
    owner_id = owner.get("id")
    print(f"[OK] Authenticated as {owner.get('name', 'User')} ({owner.get('email', '')}) [ID: {owner_id}]")
    return owner_id


def get_existing_service():
    services = render_request("/services?limit=50")
    for s in services:
        service_obj = s.get("service", {})
        if service_obj.get("name") == SERVICE_NAME:
            return service_obj
    return None


def deploy():
    if not RENDER_API_KEY or RENDER_API_KEY == "your_render_api_key_here":
        print("[ERROR] RENDER_API_KEY is missing or set to placeholder in backend/.env")
        print("Please set your RENDER_API_KEY in backend/.env before running this script.")
        sys.exit(1)

    if not VERCEL_FRONTEND_URL or "your-project.vercel.app" in VERCEL_FRONTEND_URL:
        print("[ERROR] VERCEL_FRONTEND_URL is missing or set to placeholder in backend/.env")
        print("Please set your real VERCEL_FRONTEND_URL in backend/.env before running this script.")
        sys.exit(1)

    owner_id = get_owner_id()

    # Prepare environment variables strictly from environment or backend/.env
    db_url = get_env("DATABASE_URL")
    if not db_url:
        print("[ERROR] DATABASE_URL is missing in environment or backend/.env")
        sys.exit(1)

    redis_url = get_env("REDIS_URL")
    if not redis_url:
        print("[ERROR] REDIS_URL is missing in environment or backend/.env")
        sys.exit(1)

    jwt_secret = get_env("JWT_SECRET_KEY")
    if not jwt_secret:
        print("[ERROR] JWT_SECRET_KEY is missing in environment or backend/.env")
        sys.exit(1)

    admin_email = get_env("ADMIN_EMAIL", "admin@horizonequity.com")
    admin_password = get_env("ADMIN_PASSWORD")
    if not admin_password:
        print("[ERROR] ADMIN_PASSWORD is missing in environment or backend/.env")
        sys.exit(1)

    allowed_origins = f"{VERCEL_FRONTEND_URL},http://localhost:3000,http://localhost:8000"

    env_vars = [
        {"key": "DATABASE_URL", "value": db_url},
        {"key": "REDIS_URL", "value": redis_url},
        {"key": "ALLOWED_ORIGINS", "value": allowed_origins},
        {"key": "VERCEL_FRONTEND_URL", "value": VERCEL_FRONTEND_URL},
        {"key": "JWT_SECRET_KEY", "value": jwt_secret},
        {"key": "JWT_ALGORITHM", "value": "HS256"},
        {"key": "JWT_EXPIRE_MINUTES", "value": "1440"},
        {"key": "DEBUG", "value": "True"},
        {"key": "PYTHON_VERSION", "value": "3.11.9"},
        {"key": "ADMIN_EMAIL", "value": admin_email},
        {"key": "ADMIN_PASSWORD", "value": admin_password},
        {"key": "UPLOAD_DIR", "value": "./uploads"},
    ]

    print("[2/4] Checking existing Render services...")
    existing = get_existing_service()

    if existing:
        service_id = existing.get("id")
        service_url = existing.get("serviceDetails", {}).get("url")
        print(f"[INFO] Found existing service '{SERVICE_NAME}' (ID: {service_id})")
        print("[3/4] Triggering a new deploy...")
        deploy_res = render_request(f"/services/{service_id}/deploys", method="POST", data={})
        deploy_id = deploy_res.get("id", "N/A")
        print(f"[OK] Deploy triggered (Deploy ID: {deploy_id})")
        print(f"[4/4] Live Service URL: {service_url}")
    else:
        print(f"[2/4] Creating new Web Service '{SERVICE_NAME}' on Render...")
        payload = {
            "type": "web_service",
            "name": SERVICE_NAME,
            "ownerId": owner_id,
            "repo": REPO_URL,
            "branch": "main",
            "rootDir": "backend",
            "autoDeploy": "yes",
            "serviceDetails": {
                "env": "python",
                "plan": "free",
                "region": "frankfurt",
                "buildCommand": "pip install -r requirements.txt",
                "startCommand": "uvicorn app.main:app --host 0.0.0.0 --port $PORT",
                "envVars": env_vars,
            },
        }
        res = render_request("/services", method="POST", data=payload)
        service = res.get("service", {})
        service_url = service.get("serviceDetails", {}).get("url", "Creating...")
        print(f"[OK] Web Service created successfully!")
        print(f"[4/4] Live Service URL: {service_url}")

    print("\n" + "=" * 50)
    print("DEPLOYMENT INITIATED TO RENDER!")
    print(f"Service URL: {service_url if 'service_url' in locals() else 'Check Render dashboard'}")
    print("=" * 50)


if __name__ == "__main__":
    deploy()
