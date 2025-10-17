FastAPI backend scaffold for BoscoDesk

Quick start:

1. Create a virtual environment (recommended):

```bash
python -m venv .venv
source .venv/bin/activate  # or .venv\Scripts\activate on Windows (bash.exe)
```

2. Install dependencies:

```bash
pip install -r requirements.txt
# opcional: instalar bcrypt para hashing seguro de contraseñas
pip install bcrypt
```

3. Inicializar la base de datos (si no existe):

```bash
python ../base/init_db.py --seed
```

4. Run the server:

```bash
uvicorn backend.server:app --reload --port 8000
```

The server exposes (main endpoints):

- POST `/auth/login`
- GET `/tickets` (requires Authorization: Bearer <token>)
- POST `/tickets` (requires Authorization)
- PUT `/tickets/{id}`
- DELETE `/tickets/{id}`
- POST `/tickets/{id}/comments`

Notes:

- The backend uses SQLite at `base/helpdesk.db`. The init script `base/init_db.py` creates this file from `base/schema.sql` and `base/seed.sql`.
- Set `HELPDESK_SECRET` environment variable to override the default JWT secret used by the server.
- For production use a proper DB (Postgres/MySQL), a migration tool (Alembic) and secure secret management.

Example calls (curl):

```bash
# login
curl -X POST http://localhost:8000/auth/login -H 'Content-Type: application/json' -d '{"username":"admin","password":"changeme"}'

# get tickets (token is the JWT returned)
curl -H "Authorization: Bearer <TOKEN>" http://localhost:8000/tickets
```
