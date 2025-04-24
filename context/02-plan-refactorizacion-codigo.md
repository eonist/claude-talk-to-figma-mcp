# Plan de Refactorización: Claude Talk to Figma MCP

## Objetivo

Refactorizar el código del proyecto "Claude Talk to Figma MCP" para mejorar su mantenibilidad, escalabilidad y facilitar la implementación de nuevas herramientas descritas en el plan anterior.

## Análisis de la Situación Actual

El archivo `server.ts` actual:
- Tiene más de 1800 líneas de código
- Mezcla diferentes responsabilidades (conexión WebSocket, definición de herramientas, lógica de negocio)
- Dificulta el mantenimiento y expansión
- Carece de una estructura modular que permita agregar fácilmente nuevas funcionalidades

## Principios de la Refactorización

1. **Separación de Responsabilidades**: Cada archivo debe tener un propósito claro y único
2. **Modularidad**: Organizar el código en módulos independientes y cohesivos
3. **Escalabilidad**: Facilitar la adición de nuevas herramientas y funcionalidades
4. **Mantenibilidad**: Mejorar la legibilidad y facilitar la depuración
5. **Consistencia**: Mantener coherencia en la estructura y estilo del código

## Nueva Estructura de Directorios

```
src/talk_to_figma_mcp/
├── server.ts                     # Punto de entrada principal (simplificado)
├── config/
│   └── config.ts                 # Configuración y constantes
├── core/
│   ├── mcp-server.ts             # Inicialización y gestión del servidor MCP
│   ├── websocket-client.ts       # Cliente WebSocket para Figma
│   ├── request-manager.ts        # Gestión de solicitudes y respuestas
│   └── channel-manager.ts        # Gestión de canales de comunicación
├── types/
│   ├── commands.ts               # Tipos para comandos de Figma
│   ├── responses.ts              # Tipos para respuestas de Figma
│   └── tools.ts                  # Tipos relacionados con las herramientas MCP
├── utils/
│   ├── logger.ts                 # Sistema de logging
│   ├── figma-utils.ts            # Utilidades para trabajar con datos de Figma
│   └── error-handler.ts          # Manejo centralizado de errores
├── prompts/
│   ├── design-strategy.ts        # Prompts relacionados con estrategias de diseño
│   └── text-replacement.ts       # Prompts para reemplazo de texto
└── tools/
    ├── index.ts                  # Registro centralizado de herramientas
    ├── document-tools.ts         # Herramientas para información del documento
    ├── selection-tools.ts        # Herramientas para selección
    ├── node-tools.ts             # Herramientas para manipulación de nodos
    ├── shape-tools.ts            # Herramientas para crear y modificar formas
    ├── text-tools.ts             # Herramientas para manipulación de texto
    ├── component-tools.ts        # Herramientas para componentes
    ├── layout-tools.ts           # Herramientas de layout (actual + nuevo)
    ├── effect-tools.ts           # Herramientas de efectos visuales
    └── style-tools.ts            # Herramientas para estilos
```

## Plan de Implementación

### Fase 1: Preparación y Configuración Inicial

1. **Crear estructura de directorios**
   - Crear carpetas según la estructura propuesta
   - Configurar importaciones/exportaciones de módulos

2. **Extraer configuración**
   - Mover constantes, opciones de línea de comando y configuración a `config/config.ts`
   - Implementar sistema centralizado para parámetros configurables

3. **Establecer sistema de tipos**
   - Definir interfaces y tipos en archivos dedicados
   - Mejorar tipado para aumentar seguridad y facilitar autocompletado

4. **Configurar utilidades**
   - Implementar un sistema de logging mejorado en `utils/logger.ts`
   - Crear utilidades para filtrar y procesar datos de Figma en `utils/figma-utils.ts`

### Fase 2: Implementación del Core

1. **Cliente WebSocket**
   - Extraer toda la lógica de gestión de WebSocket a `core/websocket-client.ts`
   - Mejorar la reconexión y manejo de errores

2. **Gestor de solicitudes**
   - Implementar un sistema robusto para gestionar solicitudes a Figma
   - Mejorar el seguimiento y timeout de solicitudes

3. **Gestor de canales**
   - Extraer la lógica de gestión de canales a `core/channel-manager.ts`
   - Mejorar la organización y mantenimiento de canales

4. **Servidor MCP**
   - Simplificar la inicialización y configuración del servidor MCP
   - Definir una clara API para registrar herramientas y prompts

### Fase 3: Migración de Herramientas

1. **Agrupar herramientas por categorías**
   - Mover definiciones de herramientas a archivos específicos según categoría
   - Mantener coherencia en el estilo y documentación

2. **Implementar registro centralizado**
   - Crear sistema para registrar todas las herramientas en `tools/index.ts`
   - Facilitar la habilitación/deshabilitación de herramientas

3. **Mejorar manejo de errores**
   - Implementar un sistema consistente de manejo de errores
   - Proporcionar mensajes de error más descriptivos y útiles

4. **Extraer prompts**
   - Mover definiciones de prompts a archivos dedicados
   - Mantener coherencia en el formato y documentación

### Fase 4: Punto de Entrada Principal

1. **Simplificar server.ts**
   - Reducir a su mínima expresión
   - Encargarlo únicamente de importar y configurar los módulos necesarios

2. **Implementar inicio modular**
   - Crear sistema para inicialización ordenada de componentes
   - Mejorar detección y reporte de errores durante el inicio

### Fase 5: Pruebas y Validación

1. **Pruebas de regresión**
   - Verificar que todas las funcionalidades existentes siguen funcionando
   - Identificar y corregir posibles problemas

2. **Validación de rendimiento**
   - Asegurar que la refactorización no afecta negativamente al rendimiento
   - Optimizar puntos críticos si es necesario

3. **Revisión de código**
   - Verificar coherencia en estilo y estructura
   - Asegurar documentación completa y útil

## Cronograma Estimado

- **Fase 1 (Preparación)**: 1 día
- **Fase 2 (Core)**: 2 días
- **Fase 3 (Migración de Herramientas)**: 3-4 días
- **Fase 4 (Punto de Entrada)**: 1 día
- **Fase 5 (Pruebas)**: 1-2 días

**Total estimado**: 8-10 días

## Consideraciones Especiales

1. **Compatibilidad hacia atrás**
   - Mantener la misma API externa para no romper integraciones existentes
   - Asegurar que los comandos de Figma mantienen la misma estructura

2. **Documentación**
   - Actualizar documentación para reflejar la nueva estructura
   - Añadir comentarios en el código para facilitar la comprensión

3. **Versionado**
   - Considerar un incremento de versión secundaria para reflejar la refactorización
   - Documentar claramente los cambios en el CHANGELOG

## Beneficios Esperados

1. **Mejor mantenibilidad**: Código más fácil de entender y mantener
2. **Mayor escalabilidad**: Facilidad para añadir nuevas herramientas y funcionalidades
3. **Mejor colaboración**: Posibilidad de que varios desarrolladores trabajen en paralelo
4. **Mejor testing**: Facilidad para implementar pruebas unitarias y de integración
5. **Reducción de errores**: Mejor tipado y manejo de errores consistente

## Riesgos y Mitigación

| Riesgo | Probabilidad | Impacto | Estrategia de mitigación |
|--------|-------------|---------|--------------------------|
| Introducción de errores | Media | Alto | Pruebas exhaustivas de regresión |
| Incompatibilidad con versiones anteriores | Baja | Alto | Mantener la misma API externa |
| Retrasos en la implementación | Media | Medio | Priorizar componentes críticos primero |
| Complejidad excesiva | Baja | Medio | Revisar periódicamente para mantener la simplicidad |

## Próximos Pasos

1. Obtener aprobación para el plan de refactorización
2. Crear una rama de desarrollo dedicada
3. Implementar la Fase 1 y validar la estructura básica
4. Continuar con las siguientes fases secuencialmente
5. Realizar pruebas exhaustivas antes de fusionar con la rama principal

Este plan proporciona una hoja de ruta clara para transformar el código existente en una estructura más modular y mantenible, preparándolo para las nuevas funcionalidades que se desean implementar.