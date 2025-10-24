FROM python:3.11-slim

WORKDIR /app

# Instalar dependencias del sistema necesarias para compilar bcrypt
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libffi-dev \
    && rm -rf /var/lib/apt/lists/*

# Copiar primero requirements.txt para aprovechar el cache
COPY requirements.txt .

# Instalar dependencias de Python, incluyendo bcrypt
RUN pip install --no-cache-dir -r requirements.txt \
    && pip install bcrypt

# Copiar el resto de la aplicación
COPY . /app

# Variables de entorno
ENV PYTHONUNBUFFERED=1
ENV HELPDESK_DB_PATH=/data/helpdesk.db

# Volumen compartido para la base de datos
VOLUME ["/data"]

# Exponer el puerto del backend
EXPOSE 8000

# Comando para iniciar el servidor
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000"]