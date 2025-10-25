"""Init script for helpdesk SQLite DB.

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
    """Genera un hash bcrypt a partir de una contraseña en texto plano."""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(plain.encode("utf-8"), salt).decode("utf-8")


def run_sql_file(conn: sqlite3.Connection, path: str):
    """Ejecuta un archivo SQL completo en la conexión dada."""
    with open(path, "r", encoding="utf-8") as f:
        sql = f.read()
    conn.executescript(sql)


def ensure_admin_user(conn: sqlite3.Connection):
    """Crea o actualiza el usuario admin con contraseña y rol por defecto."""
    username = "admin"
    default_password = "admin123"
    default_role = "Administrador"

    cur = conn.cursor()
    cur.execute("SELECT password_hash, role FROM users WHERE username = ?", (username,))
    row = cur.fetchone()

    if not row:
        # Crear nuevo usuario admin
        hashed = hash_password(default_password)
        cur.execute(
            "INSERT INTO users (username, full_name, password_hash, role) VALUES (?, ?, ?, ?)",
            (username, "Administrador del sistema", hashed, default_role),
        )
        print("✅ Usuario admin creado con contraseña 'admin123'")
    else:
        # Verificar si el hash coincide
        db_hash, db_role = row
        if not bcrypt.checkpw(default_password.encode("utf-8"), db_hash.encode("utf-8")):
            new_hash = hash_password(default_password)
            cur.execute(
                "UPDATE users SET password_hash = ? WHERE username = ?",
                (new_hash, username),
            )
            print("🔄 Contraseña del admin restablecida a 'admin123'")
        if db_role != default_role:
            cur.execute(
                "UPDATE users SET role = ? WHERE username = ?",
                (default_role, username),
            )
            print("🔧 Rol del admin actualizado a 'Administrador'")


def init_db(seed: bool = False, reset: bool = False, out_path: str | None = None):
    target = out_path or DB_PATH
    if reset and os.path.exists(target):
        os.remove(target)
        print(f"🗑️  Eliminada base existente: {target}")

    conn = sqlite3.connect(target)
    conn.execute("PRAGMA foreign_keys = ON;")
    run_sql_file(conn, SCHEMA)
    print(f"✅ Base de datos inicializada en {target}")

    # Cargar datos de seed.sql si corresponde
    if seed and os.path.exists(SEED):
        run_sql_file(conn, SEED)
        print("🌱 Datos seed cargados desde seed.sql")

    # Asegurar usuario admin
    ensure_admin_user(conn)

    conn.commit()
    conn.close()
    print("🏁 Inicialización completada correctamente.")


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--seed", action="store_true", help="also apply seed.sql")
    p.add_argument("--reset", action="store_true", help="delete existing DB before creating")
    p.add_argument("--out", type=str, default=None, help="path for the output DB file")
    args = p.parse_args()

    init_db(seed=args.seed, reset=args.reset, out_path=args.out)
