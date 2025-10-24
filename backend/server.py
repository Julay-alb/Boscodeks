import hashlib
import os
import sqlite3
import time
from typing import Optional

import bcrypt
import jwt
from fastapi import Depends, FastAPI, HTTPException, Header
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

APP_DIR = os.path.dirname(__file__)
DEFAULT_DB = os.path.join(APP_DIR, "..", "base", "helpdesk.db")
# Allow overriding the DB location via environment variable for tests/CI
DB_PATH = os.path.abspath(os.environ.get("HELPDESK_DB_PATH", DEFAULT_DB))

@asynccontextmanager
async def lifespan(app: FastAPI):
    # startup
    try:
        print(f"startup: DB_PATH={DB_PATH} exists={os.path.exists(DB_PATH)}")
    except Exception as e:
        print("startup: error checking DB_PATH", e)
    yield
    # shutdown (no-op for now)

app = FastAPI(lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

SECRET = os.environ.get("HELPDESK_SECRET", "cambiame_por_una_clave_segura")


class LoginIn(BaseModel):
    username: str
    password: str


class TicketIn(BaseModel):
    title: str
    description: Optional[str] = ""
    priority: str = "medium"


class TicketUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    assignee_id: Optional[int] = None


def get_db():
    if not os.path.exists(DB_PATH):
        raise RuntimeError(f"DB not found at {DB_PATH}. Run base/init_db.py first.")
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn


def create_token(username: str):
    payload = {"sub": username, "iat": int(time.time())}
    token = jwt.encode(payload, SECRET, algorithm="HS256")
    # PyJWT sometimes returns bytes (older versions) — ensure str
    if isinstance(token, bytes):
        token = token.decode("utf-8")
    return token


def verify_password(plain: str, hashed: str) -> bool:
    """
    Verifica contraseña contra:
      1) bcrypt (si el hash parece ser bcrypt)
      2) sha256 hex (legacy, 64 caracteres hex)
      3) comparación plain text (solo para desarrollo)
    """
    if hashed is None:
        return False

    # Asegurarnos que trabajamos con str
    if isinstance(hashed, bytes):
        try:
            hashed = hashed.decode("utf-8")
        except Exception:
            # si no se puede decodificar, tratar como bytes para bcrypt
            try:
                return bcrypt.checkpw(plain.encode("utf-8"), hashed)
            except Exception:
                return False

    # Intentar bcrypt first (bcrypt hashes empiezan por $2b$ o $2a$ o $2y$ típicamente)
    try:
        if hashed.startswith("$2a$") or hashed.startswith("$2b$") or hashed.startswith("$2y$"):
            return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        # si bcrypt falla, seguimos con los siguientes pasos
        pass

    # Fallback SHA256 (hash hex de 64 chars)
    try:
        if len(hashed) == 64 and all(c in "0123456789abcdef" for c in hashed.lower()):
            return hashlib.sha256(plain.encode("utf-8")).hexdigest() == hashed
    except Exception:
        pass

    # último recurso: comparar texto plano (solo desarrollo)
    return plain == hashed


def get_current_user(
    authorization: Optional[str] = Header(None, alias="Authorization"),
):
    if not authorization:
        raise HTTPException(status_code=401, detail="No token")
    # Support both 'Bearer <token>' and raw token in the header
    if authorization.startswith("Bearer "):
        token = authorization.split()[1]
    else:
        token = authorization
    try:
        payload = jwt.decode(token, SECRET, algorithms=["HS256"]) if token else {}
        username = payload.get("sub")
        if not username:
            raise HTTPException(status_code=401)
        # load user from DB
        conn = get_db()
        cur = conn.execute(
            "SELECT id, username, full_name, role FROM users WHERE username = ?",
            (username,),
        )
        row = cur.fetchone()
        conn.close()
        if not row:
            raise HTTPException(status_code=401)
        return {
            "id": row["id"],
            "username": row["username"],
            "name": row["full_name"],
            "role": row["role"],
        }
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")


@app.post("/auth/login")
def login(data: LoginIn):
    conn = get_db()
    cur = conn.execute(
        "SELECT id, username, full_name, password_hash, role "
        "FROM users WHERE username = ?",
        (data.username,),
    )
    row = cur.fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=401, detail="Credenciales inválidas")

    try:
        result = verify_password(data.password, row["password_hash"])
    except Exception as e:
        print("auth debug: verify_password raised:", e)
        result = False

    hash_prefix = (row["password_hash"][:8] + "...") if row["password_hash"] else "None"
    print(
        "auth debug: login user=",
        data.username,
        "hash=",
        hash_prefix,
        "verify=",
        result,
    )

    if not result:
        raise HTTPException(status_code=401, detail="Credenciales inválidas")

    token = create_token(row["username"])
    return {
        "token": token,
        "user": {
            "username": row["username"],
            "name": row["full_name"],
            "role": row["role"],
        },
    }


def row_to_ticket(row: sqlite3.Row) -> dict:
    return {
        "id": str(row["id"]),
        "title": row["title"],
        "description": row["description"],
        "priority": row["priority"],
        "status": row["status"],
        "reporter_id": row["reporter_id"],
        "assignee_id": row["assignee_id"],
        "createdAt": row["created_at"],
        "updatedAt": row["updated_at"],
    }


@app.get("/tickets")
def list_tickets(user: dict = Depends(get_current_user)):
    conn = get_db()
    cur = conn.execute("SELECT * FROM tickets ORDER BY created_at DESC")
    rows = cur.fetchall()
    tickets = [row_to_ticket(r) for r in rows]
    # attach comments for each ticket
    for t in tickets:
        cur = conn.execute(
            "SELECT id, author_id, text, created_at FROM comments "
            "WHERE ticket_id = ? ORDER BY created_at ASC",
            (int(t["id"]),),
        )
        comments = [
            {
                "id": str(c["id"]),
                "author_id": c["author_id"],
                "text": c["text"],
                "createdAt": c["created_at"],
            }
            for c in cur.fetchall()
        ]
        t["comments"] = comments
    conn.close()
    return tickets


@app.post("/tickets")
def create_ticket(ticket: TicketIn, user: dict = Depends(get_current_user)):
    conn = get_db()
    cur = conn.execute(
        "INSERT INTO tickets (title, description, priority, status, "
        "reporter_id, assignee_id, created_at, updated_at) "
        "VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))",
        (ticket.title, ticket.description, ticket.priority, "open", user["id"], None),
    )
    conn.commit()
    ticket_id = cur.lastrowid
    cur = conn.execute("SELECT * FROM tickets WHERE id = ?", (ticket_id,))
    row = cur.fetchone()
    t = row_to_ticket(row)
    t["comments"] = []
    conn.close()
    return t


@app.put("/tickets/{ticket_id}")
def update_ticket(
    ticket_id: int, updates: TicketUpdate, user: dict = Depends(get_current_user)
):
    conn = get_db()
    cur = conn.execute("SELECT * FROM tickets WHERE id = ?", (ticket_id,))
    row = cur.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Ticket not found")

    # use Pydantic V2-compatible model_dump to avoid deprecation warnings
    try:
        data = updates.model_dump(exclude_unset=True)
    except Exception:
        # fallback for Pydantic V1: dict()
        data = updates.dict(exclude_unset=True)
    # build simple update
    fields = []
    values = []
    for k, v in data.items():
        fields.append(f"{k} = ?")
        values.append(v)
    if fields:
        values.append(ticket_id)
        prefix = ", ".join(fields)
        sql = (
            f"UPDATE tickets SET {prefix}, updated_at = datetime('now') WHERE id = ?"
        )
        conn.execute(sql, tuple(values))
        conn.commit()

    cur = conn.execute("SELECT * FROM tickets WHERE id = ?", (ticket_id,))
    row = cur.fetchone()
    t = row_to_ticket(row)
    cur = conn.execute(
        "SELECT id, author_id, text, created_at FROM comments "
        "WHERE ticket_id = ? ORDER BY created_at ASC",
        (ticket_id,),
    )
    t["comments"] = [
        {
            "id": str(c["id"]),
            "author_id": c["author_id"],
            "text": c["text"],
            "createdAt": c["created_at"],
        }
        for c in cur.fetchall()
    ]
    conn.close()
    return t


@app.delete("/tickets/{ticket_id}")
def delete_ticket(ticket_id: int, user: dict = Depends(get_current_user)):
    conn = get_db()
    cur = conn.execute("SELECT id FROM tickets WHERE id = ?", (ticket_id,))
    if not cur.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="Ticket not found")
    conn.execute("DELETE FROM tickets WHERE id = ?", (ticket_id,))
    conn.commit()
    conn.close()
    return {"ok": True}


@app.post("/tickets/{ticket_id}/comments")
def add_comment(ticket_id: int, payload: dict, user: dict = Depends(get_current_user)):
    text = payload.get("text")
    if not text:
        raise HTTPException(status_code=400, detail="Missing text")
    conn = get_db()
    cur = conn.execute("SELECT id FROM tickets WHERE id = ?", (ticket_id,))
    if not cur.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="Ticket not found")
    cur = conn.execute(
        "INSERT INTO comments (ticket_id, author_id, text, created_at) "
        "VALUES (?, ?, ?, datetime('now'))",
        (ticket_id, user["id"], text),
    )
    conn.commit()
    comment_id = cur.lastrowid
    cur = conn.execute(
        "SELECT id, author_id, text, created_at FROM comments WHERE id = ?",
        (comment_id,),
    )
    row = cur.fetchone()
    comment = {
        "id": str(row["id"]),
        "author_id": row["author_id"],
        "text": row["text"],
        "createdAt": row["created_at"],
    }
    conn.close()
    return comment
