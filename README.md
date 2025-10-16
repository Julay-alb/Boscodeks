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

Si la instalación da problemas por permisos o archivos bloqueados en Windows, cierra editores o procesos que puedan mantener abiertos archivos en `node_modules` y vuelve a ejecutar.

## Ejecutar en desarrollo
```bash
npm run dev
```

Esto arrancará Vite en el puerto 3000. Abre:
- http://localhost:3000/

Si ves un overlay de error en la página, copia la salida completa de la terminal y pégala aquí.

## Build y preview
```bash
npm run build
npm run preview
```

`build` ejecuta un script adicional opcional `tools/generate-llms.js` si existe, pero no es obligatorio (el `|| true` evita fallos si falta).

## Cambios y fixes aplicados (importante)
- Añadido `vite.config.js` para configurar el alias `@` apuntando a `src/` y habilitar `@vitejs/plugin-react`.
- Corregido `src/main.jsx` para importar `@/app` (coincide con `src/app.jsx`).
- Corregido `src/components/ui/toast.jsx` (se cerró correctamente la lista de exportaciones que provocaba un parse error con esbuild).

Si actualizas o renombrar archivos, procura mantener las rutas consistentes con el uso del alias `@`.

## Problemas comunes y soluciones
- Error: `Failed to resolve import "@/App"` → Verifica que importas el archivo con la misma capitalización que existe en `src/` o renombra el fichero.
- Error: `Expected identifier but found end of file` en `toast.jsx` → Archivo mal terminado; revisa la sintaxis. Ya corregado en este repo.
- Problema `pm: command not found` en ejecuciones previas → Asegúrate de ejecutar `npm run dev` y no un comando mal tecleado. Si tu terminal lanza `pm` por error, abre una terminal nueva.

## Cómo reportar errores aquí
Incluye:
- Salida completa de la terminal cuando ejecutas `npm run dev`.
- El contenido (o el path) del archivo que sale en el error.

## Notas para desarrollo local
- Alias `@` funciona gracias a `vite.config.js`. Si prefieres no usar alias, cambia imports a rutas relativas.
- Tailwind ya está configurado; si modificas `tailwind.config.js` ejecuta reinicio del dev server si no detecta cambios.

---
Si quieres, puedo:
- Añadir scripts útiles a `package.json` (por ejemplo `clean`, `format`, `test`).
- Configurar Husky/Prettier/ESLint si lo deseas.

Si ahora ejecutas `npm run dev` en tu terminal y pegas la salida completa, la reviso y cierro las últimas issues que aparezcan.