#!/usr/bin/env node

/**
 * MigraCare - Google Apps Script Deployment Helper
 * Este script ayuda a preparar los archivos para el despliegue en Google Apps Script
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 MigraCare - Preparando archivos para Google Apps Script...\n');

// Verificar que los archivos fuente existen
const requiredFiles = [
  'gas-index.html',
  'gas-styles.css', 
  'gas-app.js'
];

const missingFiles = requiredFiles.filter(file => !fs.existsSync(file));

if (missingFiles.length > 0) {
  console.error('❌ Error: Faltan los siguientes archivos:');
  missingFiles.forEach(file => console.error(`   - ${file}`));
  process.exit(1);
}

console.log('✅ Todos los archivos fuente encontrados');

// Crear directorio de despliegue
const deployDir = 'gas-deployment';
if (!fs.existsSync(deployDir)) {
  fs.mkdirSync(deployDir);
  console.log(`📁 Directorio de despliegue creado: ${deployDir}`);
}

// Copiar archivos al directorio de despliegue
const filesToCopy = [
  { src: 'gas-index.html', dest: 'index.html' },
  { src: 'gas-styles.css', dest: 'styles.html' },
  { src: 'gas-app.js', dest: 'app.html' }
];

filesToCopy.forEach(({ src, dest }) => {
  const srcPath = path.join(__dirname, src);
  const destPath = path.join(__dirname, deployDir, dest);
  
  fs.copyFileSync(srcPath, destPath);
  console.log(`📄 Copiado: ${src} → ${dest}`);
});

// Crear archivo Code.gs
const codeGs = `function doGet() {
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}`;

fs.writeFileSync(path.join(__dirname, deployDir, 'Code.gs'), codeGs);
console.log('📄 Creado: Code.gs');

// Crear archivo appsscript.json
const appsscriptJson = {
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
};

fs.writeFileSync(
  path.join(__dirname, deployDir, 'appsscript.json'), 
  JSON.stringify(appsscriptJson, null, 2)
);
console.log('📄 Creado: appsscript.json');

// Crear archivo README para el despliegue
const readmeContent = `# MigraCare - Archivos para Google Apps Script

## Archivos incluidos:
- \`index.html\` - Archivo HTML principal
- \`styles.html\` - Estilos CSS
- \`app.html\` - Código JavaScript de la aplicación
- \`Code.gs\` - Código backend de Google Apps Script
- \`appsscript.json\` - Configuración del proyecto

## Instrucciones de despliegue:

1. Ve a [script.google.com](https://script.google.com)
2. Crea un nuevo proyecto llamado "MigraCare"
3. Elimina el archivo Code.gs por defecto
4. Sube todos los archivos de este directorio
5. Implementa como aplicación web
6. Configura el acceso como "Cualquiera"
7. Copia la URL de la aplicación web

## Características:
- ✅ Registro de episodios de migraña
- ✅ Dashboard con estadísticas
- ✅ Modo express para registro rápido
- ✅ Almacenamiento local de datos
- ✅ Diseño responsivo y moderno
- ✅ Compatible con móviles y escritorio

¡MigraCare está listo para usar! 🎉`;

fs.writeFileSync(path.join(__dirname, deployDir, 'README.md'), readmeContent);
console.log('📄 Creado: README.md');

console.log('\n🎉 ¡Archivos preparados exitosamente!');
console.log(`📁 Directorio de despliegue: ${deployDir}`);
console.log('\n📋 Próximos pasos:');
console.log('1. Ve a script.google.com');
console.log('2. Crea un nuevo proyecto llamado "MigraCare"');
console.log('3. Sube todos los archivos del directorio gas-deployment');
console.log('4. Implementa como aplicación web');
console.log('5. ¡Disfruta de MigraCare! 🚀\n');

console.log('📖 Para más detalles, consulta GOOGLE_APPS_SCRIPT_DEPLOYMENT.md');