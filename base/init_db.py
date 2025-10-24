"""
Init script for helpdesk SQLite DB.

Usage:
  python init_db.py         # creates /data/helpdesk.db using schema.sql
  python init_db.py --seed  # also loads seed.sql
"""

import sqlite3
import os
import argparse
import bcrypt

HERE = os.path.dirname(__file__)
DB_PATH = os.getenv("HELPDESK_DB_PATH", os.path.join(HERE, "helpdesk.db"))
SCHEMA = os.path.join(HERE, "schema.sql")
SEED = os.path.join(HERE, "seed.sql")


def hash_password(plain: str) -> str:
    """Genera hash bcrypt de la contraseña."""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(plain.encode("utf-8"), salt).decode("utf-8")


def run_sql_file(conn: sqlite3.Connection, path: str):
    """Ejecuta un archivo .sql completo."""
    if not os.path.exists(path):
        print(f"⚠️  Archivo SQL no encontrado: {path}")
        return
    with open(path, "r", encoding="utf-8") as f:
        sql = f.read()
    conn.executescript(sql)


def init_db(seed: bool = False, reset: bool = False, out_path: str | None = None):
    """Inicializa la base de datos."""
    target = out_path or DB_PATH

    # Si existe y pedimos reset
    if reset and os.path.exists(target):
        os.remove(target)
        print(f"🗑️  Base de datos eliminada: {target}")

    conn = sqlite3.connect(target)
    conn.execute("PRAGMA foreign_keys = ON;")

    # Crea estructura base
    run_sql_file(conn, SCHEMA)
    print(f"✅ Base de datos inicializada en {target}")

    # Carga datos iniciales si se pide
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
        print("🌱 Datos de ejemplo aplicados (seed.sql)")

    # ---- Crear usuario admin por defecto ----
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE username = ?", ("admin",))
    user = cursor.fetchone()

    admin_username = "admin"
    admin_password = "admin123"
    admin_full_name = "Administrador del Sistema"
    admin_role = "Administrador"

    if not user:
        hashed_password = hash_password(admin_password)
        cursor.execute(
            """
            INSERT INTO users (username, full_name, password_hash, role)
            VALUES (?, ?, ?, ?)
            """,
            (admin_username, admin_full_name, hashed_password, admin_role),
        )
        print(f"👤 Usuario '{admin_username}' creado con contraseña '{admin_password}' y rol '{admin_role}'.")
    else:
        print("ℹ️  Usuario admin ya existe; no se modificó.")

    conn.commit()
    conn.close()
    print("✅ Inicialización completada correctamente.")


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--seed", action="store_true", help="also apply seed.sql")
    p.add_argument("--reset", action="store_true", help="delete existing DB before creating")
    p.add_argument("--out", type=str, default=None, help="path for the output DB file; defaults to /data/helpdesk.db")
    args = p.parse_args()

    init_db(seed=args.seed, reset=args.reset, out_path=args.out)
    print("🏁 Done.")
