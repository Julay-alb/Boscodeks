# Boscodesk — Aplicación Helpdesk (Vite + React + Tailwind)

Pequeño README en español para arrancar y depurar el proyecto localmente.

## Requisitos

- Node.js (recomendado LTS: 18.x o 20.x). Comprueba con:

```bash
node -v
npm -v
```

- Git Bash/WSL o cualquier terminal en Windows (tu shell actual es `bash.exe`).

## Instalar dependencias

Desde la raíz del proyecto (donde está `package.json`):

```bash
npm install
```

## Ejecutar en desarrollo

```bash
npm run dev
```

Esto arrancará Vite en el puerto 3000. Abre:

- http://localhost:3000/

## Build y preview

```bash
npm run build
npm run preview
```

## Despliegue con Docker

Estas instrucciones usan el `docker-compose.yml` incluido en la raíz. El
servicio levanta dos contenedores: `backend` (FastAPI) y `frontend` (Vite).

1) Requisitos locales

- Docker y Docker Compose instalados en tu máquina.

1. Construir las imágenes

```bash
docker-compose build
```

1. Inicializar y levantar

Si quieres que la base de datos persista en un volumen local (recomendado):

```bash
docker-compose up -d
```

Si prefieres levantar en primer plano para ver logs:

```bash
docker-compose up
```

1. Inicializar la base de datos (si no se ha incluido en la imagen)

La imagen del backend asume que la base de datos estará en `/data/helpdesk.db`.
Puedes inicializarla de dos maneras:

- Ejecutar el script `base/init_db.py` localmente antes de levantar los

  contenedores y montar la carpeta donde quedó el fichero en el volumen `db_data`.
- O entrar al contenedor y ejecutar el script dentro:

```bash
docker-compose exec backend python base/init_db.py --seed --out /data/helpdesk.db --reset
```

1. Smoke test (comprobar que funciona)

- Frontend: abrir `http://localhost:3000`
- Backend health/smoke: hacer una petición rápida al endpoint de tickets o

  login. Ejemplo con curl:

```bash
curl -sS -X POST http://localhost:8000/auth/login -H "Content-Type: application/json" -d '{"username":"admin","password":"admin"}' | jq
```

1. Logs y parada

```bash
docker-compose logs -f backend
docker-compose down -v
```

Notas

- Si cambias código backend, reconstruye la imagen con `docker-compose build backend`.
- La variable `HELPDESK_DB_PATH` en el servicio `backend` ya apunta a `/data/helpdesk.db`.
- Por simplicidad usamos SQLite en un volumen; para producción considera

  usar Postgres/MySQL y migraciones con Alembic.

