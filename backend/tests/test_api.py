import os
import subprocess
import sys

import pytest
from fastapi.testclient import TestClient

# Ensure base DB exists for tests
ROOT = os.path.dirname(os.path.dirname(__file__))
BASE = os.path.join(ROOT, "..", "base")
DB = os.path.join(ROOT, "..", "base", "helpdesk.db")

sys.path.insert(0, ROOT)
from backend import server as server_module  # noqa: E402

client = TestClient(server_module.app)


@pytest.fixture(scope="session", autouse=True)
def init_db():
    # Run the init script to make sure DB is present
    script = os.path.join(ROOT, "..", "base", "init_db.py")
    # If HELPDESK_DB_PATH is set, pass it to the init script so tests can
    # create an isolated DB matching the server's DB_PATH.
    out = os.environ.get("HELPDESK_DB_PATH")
    cmd = [sys.executable, script, "--seed"]
    if out:
        # ensure we recreate the DB when using an explicit output path
        cmd.extend(["--out", out, "--reset"])
    subprocess.check_call(cmd)
    yield


def test_login_admin():
    r = client.post("/auth/login", json={"username": "admin", "password": "admin123"})
    assert r.status_code == 200
    data = r.json()
    assert "token" in data
    assert data["user"]["username"] == "admin"


def test_get_tickets_requires_auth():
    r = client.get("/tickets")
    assert r.status_code == 401


def test_get_tickets_with_token():
    r = client.post("/auth/login", json={"username": "admin", "password": "admin123"})
    assert r.status_code == 200
    token = r.json()["token"]
    r2 = client.get("/tickets", headers={"Authorization": f"Bearer {token}"})
    assert r2.status_code == 200
    assert isinstance(r2.json(), list)
