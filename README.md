# 🧭 Boscodesk — Aplicación Helpdesk (Vite + React + Tailwind + FastAPI)

Aplicación tipo **Helpdesk** con frontend en **Vite + React + Tailwind** y backend en **FastAPI**.  
Este README explica cómo ejecutar y depurar el proyecto localmente o con **Docker Compose**.

---

## 🚀 Requisitos previos

### Entorno local

- **Node.js** (versión recomendada: **18.x** o **20.x**)
- **npm** o **yarn**
- **Python 3.10+**
- **Git Bash / WSL / PowerShell** (en Windows)

Verifica tus versiones:

```bash
node -v
npm -v
python --version
```

### Con Docker

- **Docker** y **Docker Compose** instalados y funcionando correctamente.

---

## ⚙️ Instalación del frontend

Desde la carpeta raíz del proyecto (donde está `package.json`):

```bash
npm install
```

---

## 🧩 Ejecución en desarrollo

Inicia el servidor de desarrollo:

```bash
npm run dev
```

Por defecto, Vite usará el **puerto 3000**.  
Accede desde el navegador a:

👉 [http://localhost:3000](http://localhost:3000)

---

## 🏗️ Build y preview

Compila el frontend para producción:

```bash
npm run build
```

Previsualiza la build localmente:

```bash
npm run preview
```

---

## 🐳 Despliegue con Docker

El proyecto incluye un archivo `docker-compose.yml` que levanta dos servicios:

- `backend` → API de **FastAPI**
- `frontend` → Aplicación web con **Vite**

### 1. Construir las imágenes

```bash
docker-compose build
```

### 2. Levantar los contenedores

Para ejecución en segundo plano:

```bash
docker-compose up -d
```

O si prefieres ver los logs directamente en consola:

```bash
docker-compose up
```

### 3. Inicializar la base de datos

El backend usa una base de datos **SQLite** por defecto, ubicada en `/data/helpdesk.db`.

Puedes crearla de dos formas:

#### 🅰️ Opción A — Desde tu máquina

Ejecuta el script de inicialización antes de levantar los contenedores:

```bash
python base/init_db.py --seed --out ./data/helpdesk.db --reset
```

Luego, monta esa carpeta como volumen `db_data`.

#### 🅱️ Opción B — Dentro del contenedor

```bash
docker-compose exec backend python base/init_db.py --seed --out /data/helpdesk.db --reset
```

---

## 🧪 Comprobación (Smoke Test)

Verifica que todo esté funcionando correctamente:

- **Frontend:**  
  [http://localhost:3000](http://localhost:3000)

- **Backend:**  
  Test rápido del endpoint `/auth/login` con usuario por defecto (`admin / admin123`):

```bash
curl -sS -X POST http://localhost:8000/auth/login   -H "Content-Type: application/json"   -d '{"username":"admin","password":"admin123"}' | jq
```

Si ves un token JWT en la respuesta, todo está bien ✅

---

## 📋 Logs y apagado

Ver logs del backend:

```bash
docker-compose logs -f backend
```

Apagar y eliminar contenedores (y volúmenes):

```bash
docker-compose down -v
```

---

## 🧠 Notas y buenas prácticas

- Si haces cambios en el **backend**, reconstruye la imagen:
  ```bash
  docker-compose build backend
  ```
- La variable `HELPDESK_DB_PATH` ya apunta a `/data/helpdesk.db`.
- Para producción se recomienda:
  - Migrar a **PostgreSQL** o **MySQL**
  - Usar **Alembic** para migraciones
  - Servir el frontend con **Nginx**

---

> 📘 **Autor:** Proyecto Boscodesk  
> 📅 Última actualización: Octubre 2025  
> 🧩 Tecnologías: FastAPI · React · Tailwind · SQLite · Docker
