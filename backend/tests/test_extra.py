from fastapi.testclient import TestClient

import backend.server as server_module

client = TestClient(server_module.app)


def login_token(username="admin", password="changeme"):
    r = client.post("/auth/login", json={"username": username, "password": password})
    assert r.status_code == 200
    return r.json()["token"]


def test_create_update_comment_delete_ticket():
    token = login_token()
    headers = {"Authorization": f"Bearer {token}"}

    # create ticket
    r = client.post(
        "/tickets",
        json={
            "title": "Test Ticket",
            "description": "desc",
            "priority": "low",
        },
        headers=headers,
    )
    assert r.status_code == 200
    ticket = r.json()
    tid = ticket["id"]

    # add a comment
    r2 = client.post(
        f"/tickets/{tid}/comments",
        json={"text": "hello"},
        headers=headers,
    )
    assert r2.status_code == 200
    comment = r2.json()
    assert comment["text"] == "hello"

    # update ticket
    r3 = client.put(f"/tickets/{tid}", json={"status": "closed"}, headers=headers)
    assert r3.status_code == 200
    updated = r3.json()
    assert updated["status"] == "closed"

    # delete ticket
    r4 = client.delete(f"/tickets/{tid}", headers=headers)
    assert r4.status_code == 200
    assert r4.json().get("ok") is True
