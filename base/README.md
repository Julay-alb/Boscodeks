# Base de datos (SQLite) para Helpdesk

Esta carpeta contiene los artefactos para crear una base de datos SQLite local de prueba.

Archivos:

- `schema.sql` — esquema de tablas: `users`, `tickets`, `comments`.
- `seed.sql` — datos de ejemplo (usuario admin, tickets y comentarios).
- `init_db.py` — script Python que crea `helpdesk.db`, aplica `schema.sql` y opcionalmente `seed.sql`.

Cómo inicializar

1. Crear un entorno Python (recomendado):

```bash
python -m venv .venv
source .venv/Scripts/activate  # Windows PowerShell/Windows CMD: .venv\Scripts\activate
pip install -r ../backend/requirements.txt  # opcional, o instalar bcrypt si lo deseas
```

2. Ejecutar el script:

```bash
python init_db.py --seed
```

Esto generará `base/helpdesk.db` con los datos de ejemplo.

Notas de seguridad

- `init_db.py` usará `bcrypt` si está instalado para hashear contraseñas; si no, usará SHA256 como fallback (no seguro para producción).
- Para producción considera usar Postgres/MySQL y un mecanismo de migraciones (Alembic).

Conectar el backend

- Si usas el backend FastAPI actual (`backend/server.py`) puedes cambiar la conexión a SQLite apuntando a `base/helpdesk.db`. Revisa los ejemplos de conexión en el README del backend.
