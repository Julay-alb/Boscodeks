FROM python:3.11-slim

WORKDIR /app

# Instalar bcrypt
RUN pip install bcrypt

# Copiar el contenido del proyecto
COPY . .

# Ejecutar el script de inicialización
CMD ["python", "init_db.py"]