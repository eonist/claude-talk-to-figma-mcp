# Plan Maestro para la Ampliación del Conjunto de Herramientas de Claude Talk To Figma MCP

## 📋 Resumen Ejecutivo

Este documento presenta un plan maestro para implementar nuevas herramientas en el MCP "Claude Talk To Figma" que ampliarán significativamente las capacidades de manipulación de elementos de Figma a través de Claude. Las nuevas herramientas se centran en propiedades de layout, constraints, efectos visuales, propiedades de trazo (stroke) y manipulación de propiedades de componentes, permitiendo un control más granular y avanzado de los diseños en Figma.

## 🔍 Análisis de Requerimientos

### Categorización de Nuevas Herramientas

Las nuevas herramientas solicitadas pueden categorizarse en cinco grupos principales:

1. **Propiedades de Layout**
   - `layoutSizingHorizontal` (FIXED/HUG/FILL)
   - `layoutSizingVertical` (FIXED/HUG/FILL)
   - `layoutGrow`
   - `layoutAlign`
   - `minWidth`, `minHeight`, `maxWidth`, `maxHeight`

2. **Constraints**
   - `constraints` (posiblemente TOP, BOTTOM, LEFT, RIGHT, SCALE, etc.)

3. **Propiedades Visuales**
   - `opacity`
   - `blendMode`
   - `clipsContent` (para frames)
   - `rotation`

4. **Propiedades de Trazo (Stroke)**
   - `strokeAlign` (INSIDE/CENTER/OUTSIDE)
   - `strokeCap`, `strokeJoin`
   - `strokeWeight` (específico por lado: `strokeTopWeight`, etc.)
   - `dashPattern`

5. **Propiedades de Componentes**
   - `componentPropertyDefinitions`
   - `componentPropertyReferences`
   - `editComponentProperty`

### Integración con la Arquitectura Actual

En base al análisis arquitectónico previo, las nuevas herramientas deberían integrarse siguiendo el patrón existente:

1. Extender el servidor MCP (`talk_to_figma_mcp/server.ts`) con nuevas definiciones de herramientas
2. Implementar la lógica correspondiente en el plugin de Figma (`claude_mcp_plugin/code.js`)
3. Mantener la coherencia en el manejo de errores, validación de parámetros y procesamiento asincrónico

## 🧩 Estrategia de Implementación

### 1. Fase de Diseño y Definición

#### 1.1 Definición de Esquemas Zod

Para cada nueva herramienta, definiremos su esquema utilizando Zod, siguiendo el patrón existente:

```typescript
server.tool(
  "tool_name",
  "Tool description",
  {
    parameter1: z.type().describe("Parameter description"),
    parameter2: z.enum(["OPTION1", "OPTION2"]).describe("Parameter description"),
    // ...
  },
  async ({ parameter1, parameter2 }) => {
    // Implementation
  }
);
```

#### 1.2 Organización por Categorías

Agruparemos la implementación por las categorías mencionadas anteriormente para mantener un código organizado y facilitar el mantenimiento.

### 2. Fase de Desarrollo

#### 2.1 Implementación de Herramientas de Layout

##### 2.1.1 `set_layout_sizing`
Permitirá configurar el comportamiento de redimensionamiento de un nodo en ambos ejes.

```typescript
server.tool(
  "set_layout_sizing",
  "Set the layout sizing properties of a node in Figma",
  {
    nodeId: z.string().describe("The ID of the node to modify"),
    horizontal: z.enum(["FIXED", "HUG", "FILL"]).optional().describe("Horizontal sizing behavior"),
    vertical: z.enum(["FIXED", "HUG", "FILL"]).optional().describe("Vertical sizing behavior")
  },
  async ({ nodeId, horizontal, vertical }) => {
    // Implementation
  }
);
```

##### 2.1.2 `set_layout_grow_align`
Configurará las propiedades de crecimiento y alineación en un layout auto.

##### 2.1.3 `set_size_constraints`
Establecerá límites de tamaño (min/max width/height).

#### 2.2 Implementación de Constraints

##### 2.2.1 `set_constraints`
Configurará cómo se comporta un nodo cuando su padre cambia de tamaño.

#### 2.3 Implementación de Propiedades Visuales

##### 2.3.1 `set_opacity`
Establecerá la opacidad de un nodo.

##### 2.3.2 `set_blend_mode`
Configurará el modo de mezcla de un nodo.

##### 2.3.3 `set_clips_content`
Configurará si un frame recorta o no su contenido.

##### 2.3.4 `set_rotation`
Establecerá la rotación de un nodo.

#### 2.4 Implementación de Propiedades de Trazo

##### 2.4.1 `set_stroke_properties`
Configurará propiedades generales del trazo como alineación, terminaciones, etc.

##### 2.4.2 `set_individual_stroke_weights`
Establecerá pesos de trazo diferentes para cada lado.

##### 2.4.3 `set_dash_pattern`
Configurará patrones de líneas discontinuas.

#### 2.5 Implementación de Propiedades de Componentes

##### 2.5.1 `define_component_property`
Creará definiciones de propiedades para componentes.

##### 2.5.2 `set_component_property_references`
Establecerá referencias a propiedades de componentes.

##### 2.5.3 `edit_component_property`
Modificará valores de propiedades de componentes existentes.

### 3. Fase de Pruebas e Integración

#### 3.1 Pruebas Unitarias
Crearemos pruebas para cada nueva herramienta verificando:
- Validación correcta de parámetros
- Manejo adecuado de errores
- Funcionamiento esperado de la herramienta

#### 3.2 Pruebas de Integración
Verificaremos la integración completa del flujo:
1. Solicitud desde Claude
2. Procesamiento por el servidor MCP
3. Comunicación a través de WebSockets
4. Ejecución en el plugin de Figma
5. Retorno de resultados

#### 3.3 Documentación de Casos de Uso
Para cada herramienta, documentaremos ejemplos claros de uso y resultados esperados.

## ⚙️ Plan de Implementación Detallado

### 1. Propiedades de Layout (Sprint 1)

#### 1.1 Implementación de `set_layout_sizing`

**Servidor MCP:**
```typescript
server.tool(
  "set_layout_sizing",
  "Set the layout sizing properties of a node in Figma",
  {
    nodeId: z.string().describe("The ID of the node to modify"),
    horizontal: z.enum(["FIXED", "HUG", "FILL"]).optional().describe("Horizontal sizing behavior"),
    vertical: z.enum(["FIXED", "HUG", "FILL"]).optional().describe("Vertical sizing behavior")
  },
  async ({ nodeId, horizontal, vertical }) => {
    try {
      const result = await sendCommandToFigma("set_layout_sizing", {
        nodeId,
        horizontal,
        vertical
      });
      
      return {
        content: [
          {
            type: "text",
            text: `Successfully updated layout sizing for node "${result.name}"`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error setting layout sizing: ${error instanceof Error ? error.message : String(error)}`
          }
        ]
      };
    }
  }
);
```

**Plugin de Figma:**
```javascript
case 'set_layout_sizing':
  (async () => {
    try {
      const node = figma.getNodeById(params.nodeId);
      if (!node || !('layoutSizingHorizontal' in node)) {
        throw new Error('Invalid node or node does not support layout sizing');
      }
      
      if (params.horizontal) {
        node.layoutSizingHorizontal = params.horizontal;
      }
      
      if (params.vertical) {
        node.layoutSizingVertical = params.vertical;
      }
      
      sendResponse({ id: id, result: { name: node.name } });
    } catch (error) {
      sendResponse({ id: id, error: error.message });
    }
  })();
  break;
```

#### 1.2 Implementación de `set_layout_grow_align`

#### 1.3 Implementación de `set_size_constraints`

### 2. Constraints (Sprint 2)

#### 2.1 Implementación de `set_constraints`

### 3. Propiedades Visuales (Sprint 3)

#### 3.1 Implementación de `set_opacity`

#### 3.2 Implementación de `set_blend_mode`

#### 3.3 Implementación de `set_clips_content`

#### 3.4 Implementación de `set_rotation`

### 4. Propiedades de Trazo (Sprint 4)

#### 4.1 Implementación de `set_stroke_properties`

#### 4.2 Implementación de `set_individual_stroke_weights`

#### 4.3 Implementación de `set_dash_pattern`

### 5. Propiedades de Componentes (Sprint 5)

#### 5.1 Implementación de `define_component_property`

#### 5.2 Implementación de `set_component_property_references`

#### 5.3 Implementación de `edit_component_property`

## 🏁 Plan de Lanzamiento y Documentación

### 1. Actualización de Versión

Proponemos una actualización de versión significativa dado el alcance de las nuevas funcionalidades:
- Versión actual: 0.4.0
- Nueva versión propuesta: 0.5.0

### 2. Actualización de Documentación

1. Actualizar el archivo README.md con las nuevas herramientas disponibles
2. Crear ejemplos de uso para cada nueva herramienta
3. Actualizar el CHANGELOG.md con los detalles de la nueva versión

### 3. Pruebas Finales y Publicación

1. Realizar pruebas exhaustivas de todas las nuevas funcionalidades
2. Identificar y corregir posibles conflictos con funcionalidades existentes
3. Publicar la nueva versión:
   ```bash
   bun run pub:release
   ```

## 🛠️ Consideraciones Técnicas

### 1. Compatibilidad con la API de Figma

Las nuevas propiedades deben validarse contra la API actual de Figma, ya que algunas propiedades podrían no estar disponibles en ciertos tipos de nodos o requerir condiciones específicas.

### 2. Manejo de Errores

Cada implementación debe incluir un manejo robusto de errores que proporcione mensajes claros cuando:
- El nodo no existe
- El nodo no admite la propiedad específica
- Los valores proporcionados están fuera de rango
- Se requieren propiedades adicionales para la operación

### 3. Rendimiento

Para operaciones que podrían aplicarse a múltiples nodos, debemos considerar implementar versiones por lotes (batch) para optimizar el rendimiento, similar a lo que ya existe con `set_multiple_text_contents`.

## ❓ Preguntas y Decisiones Pendientes

1. **Granularidad vs Simplicidad**: ¿Debemos crear herramientas individuales para cada propiedad o agruparlas por categoría funcional?
   - **Recomendación**: Equilibrio entre ambos enfoques, agrupando propiedades relacionadas pero manteniendo herramientas específicas para funcionalidades importantes.

2. **Compatibilidad con Versiones Anteriores**: ¿Cómo manejar la compatibilidad con código que utilice versiones anteriores del MCP?
   - **Recomendación**: Mantener todas las funciones existentes sin cambios y solo agregar nuevas.

3. **Documentación Interactiva**: ¿Deberíamos proporcionar ejemplos interactivos en la documentación?
   - **Recomendación**: Crear un pequeño conjunto de archivos .fig de ejemplo que demuestren cada nueva capacidad.

## 📅 Cronograma Propuesto

1. **Fase de Diseño**: 1 semana
   - Definición de esquemas Zod
   - Diseño de interfaces de herramientas

2. **Fase de Desarrollo**: 5 semanas (1 semana por categoría)
   - Propiedades de Layout (Semana 1)
   - Constraints (Semana 2)
   - Propiedades Visuales (Semana 3)
   - Propiedades de Trazo (Semana 4)
   - Propiedades de Componentes (Semana 5)

3. **Fase de Pruebas**: 1-2 semanas
   - Pruebas unitarias y de integración
   - Correcciones y ajustes

4. **Documentación y Lanzamiento**: 1 semana
   - Actualización de documentación
   - Preparación para lanzamiento de v0.5.0

**Tiempo total estimado**: 8-9 semanas

## 🌟 Conclusión

La ampliación del conjunto de herramientas del MCP "Claude Talk To Figma" con las funcionalidades descritas representará una mejora significativa en las capacidades de manipulación de elementos de Figma a través de Claude. Este plan proporciona una hoja de ruta clara para la implementación, permitiendo un desarrollo estructurado, pruebas exhaustivas y una documentación adecuada.

Las nuevas herramientas permitirán un control mucho más granular sobre los diseños, especialmente en lo relacionado con:
- Propiedades de layout y constraints, fundamentales para diseños responsive
- Efectos visuales que enriquecen la apariencia de los diseños
- Control avanzado de trazos para elementos gráficos más sofisticados
- Manipulación de propiedades de componentes para un mejor aprovechamiento del sistema de diseño

La implementación seguirá las mejores prácticas establecidas en el proyecto, manteniendo la coherencia en la arquitectura actual y garantizando un código mantenible y extensible.