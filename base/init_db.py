"""Init script for helpdesk SQLite DB.

Usage:
  python init_db.py         # creates /data/helpdesk.db using schema.sql
  python init_db.py --seed  # also loads seed.sql
Notes:
- If bcrypt is installed, passwords in seed.sql will be hashed using bcrypt.
  Otherwise they will be replaced with a SHA256 hash (not recommended for production).
"""

import sqlite3
import os
import hashlib
import argparse

DB_PATH = os.getenv("HELPDESK_DB_PATH", "/data/helpdesk.db")
HERE = os.path.dirname(__file__)
SCHEMA = os.path.join(HERE, "schema.sql")
SEED = os.path.join(HERE, "seed.sql")


def hash_password(plain: str) -> str:
    try:
        import bcrypt
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(plain.encode("utf-8"), salt).decode("utf-8")
    except Exception:
        # fallback: SHA256 (not secure for production)
        print("[warning] bcrypt not available; falling back to SHA256 for password hashing")
        return hashlib.sha256(plain.encode("utf-8")).hexdigest()


def run_sql_file(conn: sqlite3.Connection, path: str):
    with open(path, "r", encoding="utf-8") as f:
        sql = f.read()
    conn.executescript(sql)


def init_db(seed: bool = False, reset: bool = False, out_path: str | None = None):
    target = out_path or DB_PATH
    if reset and os.path.exists(target):
        os.remove(target)
        print(f"Removed existing DB: {target}")

    conn = sqlite3.connect(target)
    conn.execute("PRAGMA foreign_keys = ON;")
    run_sql_file(conn, SCHEMA)
    print(f"Initialized database at {target}")

    if seed and os.path.exists(SEED):
        # Read seed.sql, but intercept password placeholders to hash them
        with open(SEED, "r", encoding="utf-8") as f:
            lines = f.readlines()

        fixed = []
        for line in lines:
            if "INSERT INTO users" in line and "changeme" in line:
                hashed = hash_password("changeme")
                fixed_line = line.replace("'changeme'", f"'{hashed}'")
                fixed.append(fixed_line)
            else:
                fixed.append(line)

        script = "".join(fixed)
        conn.executescript(script)
        print("Seed data applied")

    # Crear usuario admin por defecto si no existe
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE username = ?", ("admin",))
    user = cursor.fetchone()

    if not user:
        hashed_password = hash_password("admin")
        cursor.execute(
            "INSERT INTO users (username, full_name, password_hash, role) VALUES (?, ?, ?, ?)",
            ("admin", "Administrador", hashed_password, "admin")
        )
        print("Usuario admin creado por defecto.")
    else:
        print("Usuario admin ya existe.")

    conn.commit()
    conn.close()


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--seed", action="store_true", help="also apply seed.sql")
    p.add_argument("--reset", action="store_true", help="delete existing DB before creating")
    p.add_argument("--out", type=str, default=None, help="path for the output DB file; defaults to /data/helpdesk.db")
    args = p.parse_args()

    init_db(seed=args.seed, reset=args.reset, out_path=args.out)
    print("Done.")