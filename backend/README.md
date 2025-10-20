# BoscoDesk — Backend (FastAPI)

Este backend es una pequeña aplicación FastAPI para desarrollo local.
Proporciona autenticación mediante JWT y operaciones CRUD para tickets y
comentarios.

## Resumen

- Aplicación: FastAPI
- Base de datos: `base/helpdesk.db` (SQLite)

## Requisitos

- Python 3.10 o superior

## Instalación rápida

1. Crear y activar un entorno virtual

```bash
python -m venv .venv
source .venv/Scripts/activate
```

2. Instalar dependencias

```bash
pip install -r requirements.txt
```

3. Inicializar la base de datos

```bash
python ../base/init_db.py --seed
```

4. Ejecutar el servidor (desarrollo)

```bash
uvicorn backend.server:app --reload --port 8000
```

## Endpoints principales

- POST /auth/login
- GET /tickets
- POST /tickets
- PUT /tickets/{id}
- DELETE /tickets/{id}
- POST /tickets/{id}/comments

## Tests

Para ejecutar tests en un entorno aislado:

```bash
python ../base/init_db.py --seed --out tmp/test_helpdesk.db --reset
export HELPDESK_DB_PATH="$(pwd)/tmp/test_helpdesk.db"
pytest -q backend/tests
```

## Producción

Para producción considera usar Postgres o MySQL, gestión segura de secretos,
bcrypt para hashing y Alembic para migraciones.

---
