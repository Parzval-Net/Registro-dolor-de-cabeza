# Registro de Dolor de Cabeza

Versión estática de MigraCare lista para publicarse en GitHub Pages. Solo requiere subir el contenido de esta carpeta a un repositorio público y habilitar Pages apuntando a la rama/main folder.

## Archivos incluidos
- `index.html` + carpeta `assets/` y recursos generados por Vite.
- `manifest.json`, `sw.js`, `favicon.ico`, `robots.txt`, `404.html` para compatibilidad con GitHub Pages/PWA.

## Publicación manual
1. Crea un repositorio vacío en GitHub (por ejemplo `registro-dolor-de-cabeza`).
2. Copia todos los archivos de `registro-dolor-de-cabeza/` (incluyendo la carpeta `assets/`) al repositorio.
3. Realiza commit y push.
4. Activa GitHub Pages desde **Settings → Pages** seleccionando la rama principal.

## Uso
- Abre `index.html` en un servidor estático (o `npm run preview`) para probar. Si lo abres como archivo local, algunos features PWA (service worker) se desactivan, pero el registro de episodios funciona.
- Los datos se almacenan por usuario en `localStorage`, por lo que cada persona debe iniciar sesión en su dispositivo para recuperar sus episodios.
