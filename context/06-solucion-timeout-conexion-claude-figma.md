# Solución al problema de timeout en la conexión entre Claude y Figma

## Descripción del problema

Al intentar utilizar la herramienta `join_channel` para establecer una conexión entre Claude/Copilot y el plugin de Figma a través del protocolo MCP (Model Context Protocol), se producía un timeout. El problema surgió después de la refactorización del código original.

Los síntomas específicos eran:
- El plugin de Figma se conectaba correctamente al servidor WebSocket en el puerto 3055
- El plugin creaba un canal (por ejemplo, "zw2xc1pl")
- Al intentar que Claude/Copilot se uniera a ese canal mediante la herramienta `join_channel`, se producía un timeout
- Antes de la refactorización, la conexión funcionaba casi de inmediato

## Análisis y diagnóstico

### 1. Entendiendo el flujo de comunicación

El flujo de comunicación completo debería ser:
1. El plugin de Figma se conecta al servidor WebSocket (socket.ts) en el puerto 3055
2. El plugin crea un canal aleatorio (ejemplo: "zw2xc1pl") 
3. Claude/Copilot utiliza la herramienta `join_channel` para unirse a ese canal
4. Una vez conectado, Claude/Copilot puede enviar comandos a Figma

### 2. Identificación de componentes clave

Para diagnosticar el problema, se analizaron varios componentes:

- La implementación del WebSocketClient en `core/websocket/websocket-client.ts`
- La implementación del ChannelManager en `core/channels/channel-manager.ts`
- La herramienta `join_channel` en `tools/document/index.ts`
- El servidor WebSocket en `socket.ts`
- El cliente WebSocket en la interfaz del plugin (`ui.html`)

### 3. La causa raíz

Tras analizar el código, se identificó una **discrepancia crítica en los formatos de mensaje** utilizados para unirse a los canales:

1. **El plugin de Figma** enviaba un mensaje con este formato:
   ```javascript
   {
     type: "join",
     channel: channelName.trim()
   }
   ```

2. **El servidor WebSocket en `socket.ts`** esperaba recibir un mensaje con ese mismo formato (`type: "join"`).

3. **Pero el WebSocketClient refactorizado** enviaba un mensaje con este formato completamente diferente:
   ```javascript
   {
     id: uuid(),
     command: "join",
     params: { channel: channelName }
   }
   ```

Esta incompatibilidad de formatos causaba que:
- El servidor WebSocket nunca reconociera correctamente las solicitudes de conexión al canal
- No se enviara confirmación de la unión al canal
- Se produjera el timeout después de 30 segundos de espera

## Solución implementada

La solución fue modificar el método `joinChannel` del `WebSocketClient` para asegurar que envíe el mensaje en el formato que espera el servidor WebSocket:

```typescript
async joinChannel(channelName: string): Promise<void> {
  if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
    throw new Error("No conectado a Figma");
  }

  try {
    // No usar sendCommand para el comando join, enviar directamente en el formato
    // que espera el servidor socket.ts
    return new Promise<void>((resolve, reject) => {
      const message = {
        type: "join",
        channel: channelName.trim()
      };
      
      if (this.ws) {
        this.ws.send(JSON.stringify(message));
        logger.info(`Solicitud de unión al canal enviada: ${channelName}`);
        
        // Establecer timeout para la respuesta
        const timeout = setTimeout(() => {
          reject(new Error(`Timeout al unirse al canal ${channelName}`));
        }, WS_REQUEST_TIMEOUT);

        // Configurar un listener de una sola vez para esperar la confirmación
        const joinListener = (data: any) => {
          try {
            const message = JSON.parse(data.toString());
            
            if (message.type === "system" && 
                message.message && 
                message.message.result && 
                message.channel === channelName) {
              // Éxito al unirse al canal
              clearTimeout(timeout);
              this.currentChannel = channelName;
              logger.info(`Unido al canal: ${channelName}`);
              this.emit('channel_joined', channelName);
              this.ws?.removeListener('message', joinListener);
              resolve();
            }
            // Si es un error, también lo manejamos
            else if (message.type === "error") {
              clearTimeout(timeout);
              this.ws?.removeListener('message', joinListener);
              reject(new Error(message.message || "Error al unirse al canal"));
            }
          } catch (error) {
            // No hacemos nada aquí - otros listeners manejarán esto
          }
        };

        this.ws.on('message', joinListener);
      } else {
        reject(new Error("No conectado a Figma"));
      }
    });
  } catch (error) {
    logger.error(`Error al unirse al canal: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}
```

### Mejoras incorporadas

La solución incluye varias mejoras:

1. **Formato de mensaje correcto**: El método ahora envía el mensaje con el formato correcto que espera el servidor.

2. **Manejo robusto de respuestas**: Se implementó un listener específico para captar la respuesta de confirmación de unión al canal.

3. **Timeout configurable**: Se mantiene el timeout utilizando la configuración existente (`WS_REQUEST_TIMEOUT`).

4. **Manejo de errores mejorado**: Si el servidor envía un error, este se captura y se rechaza la promesa con el mensaje adecuado.

## Resultados

Con esta solución implementada:

1. Claude/Copilot puede unirse correctamente al canal creado por el plugin de Figma
2. La conexión se establece casi inmediatamente, como lo hacía antes de la refactorización
3. El sistema de comunicación funciona correctamente, permitiendo a Claude/Copilot enviar comandos a Figma

## Lecciones aprendidas

Este caso demuestra la importancia de:

1. **Mantener compatibilidad de protocolos**: Al refactorizar código, asegurarse de que los formatos de mensaje se mantengan compatibles entre componentes.

2. **Pruebas adecuadas**: Realizar pruebas exhaustivas después de una refactorización, especialmente en la comunicación entre componentes.

3. **Diagnóstico sistemático**: Analizar cada componente del flujo de comunicación para identificar la causa raíz.

4. **Documentación del protocolo**: Documentar claramente el formato de los mensajes esperados por cada componente del sistema.