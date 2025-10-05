# MigraCare - Despliegue en Google Apps Script

## 📋 Instrucciones de Despliegue

### 1. Crear un Nuevo Proyecto en Google Apps Script

1. Ve a [script.google.com](https://script.google.com)
2. Haz clic en "Nuevo proyecto"
3. Cambia el nombre del proyecto a "MigraCare"

### 2. Configurar el Archivo HTML

1. En el editor de Google Apps Script, elimina el archivo `Code.gs` por defecto
2. Haz clic en "Archivo" → "Nuevo" → "Archivo HTML"
3. Nombra el archivo `index`
4. Copia y pega el contenido completo del archivo `gas-index.html`

### 3. Configurar el Archivo CSS

1. Haz clic en "Archivo" → "Nuevo" → "Archivo HTML"
2. Nombra el archivo `styles`
3. Copia y pega el contenido completo del archivo `gas-styles.css`

### 4. Configurar el Archivo JavaScript

1. Haz clic en "Archivo" → "Nuevo" → "Archivo HTML"
2. Nombra el archivo `app`
3. Copia y pega el contenido completo del archivo `gas-app.js`

### 5. Configurar el Archivo Code.gs (Backend)

1. Haz clic en "Archivo" → "Nuevo" → "Archivo HTML"
2. Nombra el archivo `Code`
3. Copia y pega el siguiente código:

```javascript
function doGet() {
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}
```

### 6. Configurar el Archivo appsscript.json

1. Haz clic en "Archivo" → "Nuevo" → "Archivo JSON"
2. Nombra el archivo `appsscript`
3. Copia y pega el siguiente contenido:

```json
{
  "timeZone": "America/Mexico_City",
  "dependencies": {
    "enabledAdvancedServices": []
  },
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8",
  "webapp": {
    "access": "ANYONE",
    "executeAs": "USER_DEPLOYING"
  }
}
```

### 7. Desplegar la Aplicación

1. Haz clic en "Implementar" → "Nueva implementación"
2. Selecciona "Tipo" → "Aplicación web"
3. Configura:
   - **Descripción**: MigraCare v1.0
   - **Ejecutar como**: Yo (tu email)
   - **Quién tiene acceso**: Cualquiera
4. Haz clic en "Implementar"
5. Copia la URL de la aplicación web

### 8. Configurar Permisos

1. La primera vez que accedas a la URL, Google te pedirá autorización
2. Haz clic en "Revisar permisos"
3. Selecciona tu cuenta de Google
4. Haz clic en "Avanzado" → "Ir a MigraCare (no seguro)"
5. Haz clic en "Permitir"

## 🚀 Características de la Aplicación

### ✅ Funcionalidades Implementadas
- **Registro de Episodios**: Formulario completo y modo express
- **Dashboard**: Estadísticas y métricas en tiempo real
- **Almacenamiento Local**: Los datos se guardan en el navegador
- **Diseño Responsivo**: Optimizado para móviles y escritorio
- **Interfaz Moderna**: Diseño glassmorphism con gradientes

### 📱 Compatibilidad
- **Navegadores**: Chrome, Firefox, Safari, Edge
- **Dispositivos**: Móviles, tablets, escritorio
- **Sistemas**: iOS, Android, Windows, macOS, Linux

### 🔧 Personalización
- **Configuración**: Nombre de la app, descripción, colores
- **Medicamentos**: Lista personalizable de medicamentos
- **Síntomas**: Lista personalizable de síntomas
- **Triggers**: Lista personalizable de desencadenantes

## 📊 Estructura de Datos

Los episodios se almacenan en `localStorage` con la siguiente estructura:

```javascript
{
  id: "timestamp",
  date: "2024-01-15",
  time: "14:30",
  intensity: 7,
  medications: ["Ibuprofeno", "Paracetamol"],
  symptoms: ["Dolor pulsátil", "Náuseas"],
  notes: "Notas adicionales",
  stressLevel: 5,
  sleepHours: 8,
  triggers: ["Estrés", "Falta de sueño"]
}
```

## 🛠️ Mantenimiento

### Actualizar la Aplicación
1. Modifica los archivos en Google Apps Script
2. Haz clic en "Implementar" → "Gestionar implementaciones"
3. Selecciona la implementación existente
4. Haz clic en "Nueva versión"
5. La actualización se aplicará automáticamente

### Respaldo de Datos
- Los datos se almacenan localmente en el navegador
- Para respaldar: Exporta los datos desde la configuración
- Para restaurar: Importa el archivo de respaldo

## 🔒 Seguridad

- **Datos Locales**: Toda la información se mantiene en el dispositivo
- **Sin Servidor**: No hay transmisión de datos a servidores externos
- **Privacidad**: Cumple con estándares de privacidad médica
- **HTTPS**: Conexión segura garantizada por Google

## 📞 Soporte

Para soporte técnico o reportar problemas:
1. Revisa la consola del navegador (F12)
2. Verifica que todos los archivos estén correctamente configurados
3. Asegúrate de que los permisos estén configurados correctamente

## 🎯 Próximas Funcionalidades

- **Sincronización**: Sincronización entre dispositivos
- **Exportación**: Exportar datos a PDF/Excel
- **Análisis**: Gráficos y tendencias avanzadas
- **Recordatorios**: Notificaciones de medicamentos
- **Colaboración**: Compartir datos con médicos

---

**MigraCare** - Tu compañero inteligente para el seguimiento y gestión de migrañas.
