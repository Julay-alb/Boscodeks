"""Init script for helpdesk SQLite DB.

Usage:
  python init_db.py         # creates /data/helpdesk.db using schema.sql
  python init_db.py --seed  # also loads seed.sql
  python init_db.py --reset # deletes existing DB before creating
"""

import sqlite3
import os
import argparse
import bcrypt

# --- Paths ---
HERE = os.path.dirname(__file__)
DB_PATH = os.getenv("HELPDESK_DB_PATH", os.path.join(HERE, "helpdesk.db"))
SCHEMA = os.path.join(HERE, "schema.sql")
SEED = os.path.join(HERE, "seed.sql")


# --- Utilities ---
def hash_password(plain: str) -> str:
    """Hash a plaintext password using bcrypt."""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(plain.encode("utf-8"), salt).decode("utf-8")


def run_sql_file(conn: sqlite3.Connection, path: str):
    """Run an SQL file."""
    if not os.path.exists(path):
        print(f"⚠️  File not found: {path}")
        return
    with open(path, "r", encoding="utf-8") as f:
        sql = f.read()
    conn.executescript(sql)


# --- Main init function ---
def init_db(seed: bool = False, reset: bool = False, out_path: str | None = None):
    """Initialize the SQLite database."""
    target = out_path or DB_PATH

    # Remove old DB if requested
    if reset and os.path.exists(target):
        os.remove(target)
        print(f"🗑️  Removed existing DB: {target}")

    # Create new DB
    conn = sqlite3.connect(target)
    conn.execute("PRAGMA foreign_keys = ON;")

    # Load schema
    run_sql_file(conn, SCHEMA)
    print(f"✅ Database initialized at {target}")

    # Apply seed data (if requested)
    if seed and os.path.exists(SEED):
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
        print("🌱 Seed data applied.")

    # Ensure admin user exists
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE username = ?", ("admin",))
    user = cursor.fetchone()

    if not user:
        username = "admin"
        password = "admin123"
        full_name = "Administrador"
        role = "Administrador"
        hashed_password = hash_password(password)

        cursor.execute(
            "INSERT INTO users (username, full_name, password_hash, role) VALUES (?, ?, ?, ?)",
            (username, full_name, hashed_password, role)
        )
        print(f"👑 Usuario '{username}' creado por defecto con rol '{role}' y contraseña '{password}'.")
    else:
        print("ℹ️  Usuario 'admin' ya existe. No se modificó.")

    conn.commit()
    conn.close()
    print("✅ Done.")


# --- CLI entrypoint ---
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Initialize the Helpdesk SQLite database.")
    parser.add_argument("--seed", action="store_true", help="Also apply seed.sql after creating the schema.")
    parser.add_argument("--reset", action="store_true", help="Delete existing DB before creating a new one.")
    parser.add_argument("--out", type=str, default=None, help="Custom output path for the database file.")
    args = parser.parse_args()

    init_db(seed=args.seed, reset=args.reset, out_path=args.out)
