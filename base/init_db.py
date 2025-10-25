"""
Init script for Helpdesk SQLite DB.

Usage:
  python init_db.py             # creates helpdesk.db using schema.sql
  python init_db.py --seed      # also loads and hashes users from seed.sql
  python init_db.py --reset     # deletes old DB first
  python init_db.py --out /path/to/db  # custom DB location
"""

import sqlite3
import os
import argparse
import bcrypt
import re
from pathlib import Path

# --- Paths ---
HERE = Path(__file__).resolve().parent
DEFAULT_DB = HERE / "helpdesk.db"
SCHEMA = HERE / "schema.sql"
SEED = HERE / "seed.sql"

DB_PATH = Path(os.getenv("HELPDESK_DB_PATH", DEFAULT_DB))


# --- Utils ---
def hash_password(plain: str) -> str:
    """Generate a bcrypt hash from a plaintext password."""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(plain.encode("utf-8"), salt).decode("utf-8")


def run_sql_file(conn: sqlite3.Connection, path: Path):
    """Execute a .sql file on a given SQLite connection."""
    if not path.exists():
        raise FileNotFoundError(f"Archivo SQL no encontrado: {path}")
    with open(path, "r", encoding="utf-8") as f:
        sql = f.read()
    conn.executescript(sql)


def hash_seed_users(conn: sqlite3.Connection, seed_path: Path):
    """
    Detect and hash plaintext passwords from seed.sql before inserting them.
    Example line handled:
      INSERT INTO users (username, full_name, password_hash, role) VALUES ('admin', 'Julian', 'changeme', 'admin');
    """
    if not seed_path.exists():
        print("⚠️  seed.sql no encontrado, omitiendo datos iniciales.")
        return

    with open(seed_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Find all INSERT INTO users statements
    pattern = r"INSERT INTO users\s*\([^)]*\)\s*VALUES\s*\(([^;]*)\);"
    matches = re.findall(pattern, content, flags=re.IGNORECASE)

    if not matches:
        print("ℹ️  No se encontraron usuarios en seed.sql.")
        return

    for match in matches:
        # Split fields safely by comma (naive but fine for seed)
        fields = [x.strip().strip("'\"") for x in match.split(",")]
        if len(fields) < 4:
            continue
        username, full_name, password, role = fields[:4]
        hashed = hash_password(password)
        print(f"🔐 Usuario '{username}' -> password '{password}' hasheado.")
        conn.execute(
            "INSERT INTO users (username, full_name, password_hash, role) VALUES (?, ?, ?, ?)",
            (username, full_name, hashed, role),
        )

    # Insert tickets/comments (everything else)
    other_lines = []
    in_block = False
    for line in content.splitlines():
        if "INSERT INTO users" in line or line.strip().startswith("--"):
            continue
        if "INSERT INTO tickets" in line or "INSERT INTO comments" in line:
            in_block = True
        if in_block:
            other_lines.append(line)

    other_sql = "\n".join(other_lines)
    if other_sql.strip():
        conn.executescript(other_sql)
        print("🗃️  Tickets y comentarios cargados desde seed.sql")


def ensure_admin_user(conn: sqlite3.Connection):
    """Crea o actualiza el usuario admin con contraseña y rol por defecto."""
    username = "admin"
    default_password = "admin123"
    default_role = "admin"


    cur = conn.cursor()
    cur.execute("SELECT password_hash, role FROM users WHERE username = ?", (username,))
    row = cur.fetchone()

    if not row:
        hashed = hash_password(default_password)
        cur.execute(
            "INSERT INTO users (username, full_name, password_hash, role) VALUES (?, ?, ?, ?)",
            (username, "Administrador del sistema", hashed, default_role),
        )
        print("✅ Usuario 'admin' creado con contraseña 'admin123'")
    else:
        db_hash, db_role = row
        try:
            same_pass = bcrypt.checkpw(default_password.encode("utf-8"), db_hash.encode("utf-8"))
        except Exception:
            same_pass = False
        if not same_pass:
            new_hash = hash_password(default_password)
            cur.execute("UPDATE users SET password_hash=? WHERE username=?", (new_hash, username))
            print("🔄 Contraseña del admin restablecida a 'admin123'")
        if db_role != default_role:
            cur.execute("UPDATE users SET role=? WHERE username=?", (default_role, username))
            print("🔧 Rol del admin actualizado a 'Administrador'")


def init_db(seed: bool = False, reset: bool = False, out_path: str | None = None):
    """Initialize the helpdesk database from schema and optional seed data."""
    target = Path(out_path) if out_path else DB_PATH
    os.makedirs(target.parent, exist_ok=True)

    if reset and target.exists():
        target.unlink()
        print(f"🗑️  Eliminada base existente: {target}")

    conn = sqlite3.connect(target)
    conn.execute("PRAGMA foreign_keys = ON;")

    # Load schema
    run_sql_file(conn, SCHEMA)
    print(f"✅ Esquema base cargado en {target}")

    # Load and hash seed
    if seed:
        hash_seed_users(conn, SEED)
    else:
        print("ℹ️  Seed omitido (usar --seed para cargar datos iniciales)")

    # Ensure admin user
    ensure_admin_user(conn)

    conn.commit()
    conn.close()
    print("🏁 Inicialización completada correctamente.")


# --- CLI ---
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Inicializa la base de datos del Helpdesk.")
    parser.add_argument("--seed", action="store_true", help="Cargar seed.sql y hashear usuarios automáticamente")
    parser.add_argument("--reset", action="store_true", help="Eliminar base existente antes de crearla")
    parser.add_argument("--out", type=str, default=None, help="Ruta personalizada del archivo .db")
    args = parser.parse_args()

    init_db(seed=args.seed, reset=args.reset, out_path=args.out)
