# Registro de Depuración: Problemas con Model Context Protocol

## 1. Contexto del Problema

Durante las pruebas de ejecución del proyecto "Claude Talk to Figma MCP" (versión 0.4.0), se han detectado problemas relacionados con el módulo `@modelcontextprotocol/sdk`. Este documento registrará los pasos de depuración, pruebas realizadas y soluciones implementadas.

Fecha: 24 de abril de 2025

## 2. Síntomas Observados

Al ejecutar el comando `bun run start` para iniciar el servidor MCP principal, se produce el siguiente error:

```
error: Cannot find module '@modelcontextprotocol/sdk' from '/Users/xulio/Documents/MS/IA/Claude/Claude Talk To Figma/claude-talk-to-figma-mcp/dist/talk_to_figma_mcp/server.js'
```

Este error indica que el sistema no puede encontrar el módulo del SDK de Model Context Protocol que se utiliza en el archivo `mcp-server.ts`:

```typescript
import { McpServer, StdioServerTransport } from '@modelcontextprotocol/sdk';
```

## 3. Verificación Inicial de Dependencias

La ejecución de `bun install` muestra que todas las dependencias están instaladas:

```
bun install v1.2.8 (adab0f64)
Checked 179 installs across 215 packages (no changes) [11.00ms]
```

Sin embargo, específicamente el SDK de MCP parece no estar disponible para el código compilado en la carpeta `dist`.

## 4. Pasos de Depuración y Soluciones Intentadas

### 4.1. Instalación específica del paquete MCP

Se intentó instalar específicamente el paquete:

```
bun add @modelcontextprotocol/sdk
```

Resultado: El paquete se instaló correctamente (versión 1.10.2), pero el error persistió al intentar ejecutar nuevamente `bun run start`.

### 4.2. Análisis del archivo package.json

En el archivo `package.json` principal, la dependencia está declarada como:

```json
"dependencies": {
  "@modelcontextprotocol/sdk": "latest",
  "uuid": "latest",
  "ws": "latest",
  "zod": "latest"
}
```

Usar "latest" puede causar problemas de compatibilidad si la API ha cambiado recientemente.

### 4.3. Análisis de estructura de directorios

Notamos que hay dos archivos `package.json` diferentes:
- Uno en la raíz del proyecto
- Otro en `src/talk_to_figma_mcp/`

Esto podría causar confusión sobre dónde deberían instalarse las dependencias.

### 4.4. Sincronización de versiones del SDK

Se actualizó la versión del SDK en ambos archivos `package.json` para usar la misma versión (^1.10.2) y se reconstruyó el proyecto:

```
bun run build
```

Resultado: La compilación fue exitosa, pero el error persistió al intentar ejecutar `bun run start`.

## 5. Soluciones propuestas adicionales

Dado que las soluciones iniciales no han funcionado, proponemos las siguientes alternativas adicionales:

1. **Revisar la configuración de tsup**: Examinar `tsup.config.ts` para verificar si hay problemas en la configuración de empaquetado que afecten a las dependencias externas.

2. **Analizar los imports en el código**: Verificar si hay problemas en la forma en que se importa el SDK en los archivos fuente.

3. **Probar con bundleDeps**: Configurar tsup para incluir las dependencias en el bundle resultante utilizando la opción `bundleDeps`.

4. **Forzar reinstalación completa**: Eliminar carpetas `node_modules` y archivos `bun.lock` para forzar una reinstalación completa de todas las dependencias.

5. **Verificar compatibilidad de versiones**: Comprobar si hay incompatibilidades conocidas entre la versión del SDK y las versiones de Bun/Node.js utilizadas.

## 6. Resultados de las pruebas

### 6.1. Sincronización de versiones del SDK (FALLIDO)

Se sincronizaron las versiones del SDK a ^1.10.2 en ambos archivos package.json y se reconstruyó el proyecto, pero el error persistió.

### 6.2. Modificación de la configuración de tsup (FALLIDO)

Se modificó el archivo tsup.config.ts para incluir explícitamente la dependencia @modelcontextprotocol/sdk en el bundle:

```typescript
export default defineConfig({
  // ...configuración existente
  noExternal: ['@modelcontextprotocol/sdk'],
});
```

Resultado: La compilación falló con el siguiente error:

```
The path "." is not exported by package "@modelcontextprotocol/sdk"
```

Esto sugiere que el paquete MCP SDK tiene un campo `exports` en su package.json que no incluye la exportación de la ruta raíz, lo que complica su inclusión directa en el bundle.

### 6.3. Corrección de las importaciones con rutas específicas (EXITOSO)

Al examinar el package.json del paquete @modelcontextprotocol/sdk, se identificó que el campo `exports` estaba configurado para exponer solo rutas específicas con un patrón determinado:

```json
"exports": {
  "./*": {
    "import": "./dist/esm/*",
    "require": "./dist/cjs/*"
  }
}
```

Se modificaron las importaciones en el archivo `src/talk_to_figma_mcp/core/server/mcp-server.ts` para utilizar las rutas específicas con extensión `.js`:

De:
```typescript
import { McpServer, StdioServerTransport } from '@modelcontextprotocol/sdk';
```

A:
```typescript
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
```

Resultado: La compilación y ejecución fueron exitosas. El servidor MCP inició correctamente y estableció conexión con el servidor WebSocket de Figma.

## 8. Solución Final

El problema se resolvió cambiando la forma de importar el SDK de MCP para adaptarse a la estructura de exportaciones del paquete. Los pasos clave para la solución fueron:

1. **Examinar la estructura del paquete MCP SDK**: Se identificó que el SDK utiliza el campo `exports` en su package.json de una manera específica que requiere referencias a archivos concretos dentro del paquete.

2. **Modificar los imports**: Se cambiaron las importaciones para especificar la ruta exacta dentro del paquete, incluyendo la extensión `.js`.

3. **Reconstruir el proyecto**: Al recompilar con las importaciones corregidas, el proyecto se construyó correctamente y generó ejecutables funcionales.

## 9. Lecciones aprendidas

1. **Campo `exports` en package.json**: Los paquetes modernos de JavaScript/TypeScript pueden utilizar el campo `exports` para definir exactamente qué partes del paquete son accesibles y cómo. Es importante entender esta estructura cuando se encuentran problemas de importación.

2. **Importaciones con extensiones en ESM**: Al trabajar con módulos ECMAScript (ESM), a menudo es necesario incluir la extensión `.js` en las importaciones, especialmente cuando el paquete utiliza una estructura de exportaciones específica.

3. **Múltiples package.json**: Tener múltiples archivos package.json en diferentes directorios puede causar confusión sobre dónde se instalan y cómo se resuelven las dependencias. Es importante mantener coherencia entre ellos.

4. **Bundling vs. Dependencias externas**: Para aplicaciones que utilizan dependencias complejas o con estructuras de exportación específicas, puede ser más sencillo mantenerlas como dependencias externas en lugar de intentar incluirlas en el bundle.