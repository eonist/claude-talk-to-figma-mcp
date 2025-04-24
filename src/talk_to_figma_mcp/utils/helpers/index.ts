/**
 * Utilidades generales para Claude Talk to Figma MCP
 */

/**
 * Parsea argumentos de línea de comandos
 * 
 * @param args Los argumentos de la línea de comandos
 * @returns Objeto con los argumentos parseados
 */
export function parseCommandLineArgs(args: string[]): Record<string, string | number | boolean> {
  const result: Record<string, string | number | boolean> = {};

  for (const arg of args) {
    if (arg.startsWith('--')) {
      const parts = arg.substring(2).split('=');
      const key = parts[0];
      
      // Si no hay valor o es boolean
      if (parts.length === 1) {
        result[key] = true;
        continue;
      }
      
      const value = parts[1];
      
      // Convertir a número si es posible
      if (!isNaN(Number(value))) {
        result[key] = Number(value);
      } else if (value === 'true') {
        result[key] = true;
      } else if (value === 'false') {
        result[key] = false;
      } else {
        result[key] = value;
      }
    }
  }
  
  return result;
}

/**
 * Retrasa la ejecución por un tiempo determinado
 * 
 * @param ms Milisegundos a esperar
 * @returns Promesa que se resuelve después del tiempo especificado
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Intenta ejecutar una función con reintentos en caso de fallos
 * 
 * @param fn Función a ejecutar (debe devolver una promesa)
 * @param retries Número de reintentos
 * @param delayMs Tiempo de espera entre reintentos (ms)
 * @param backoffFactor Factor de incremento para el tiempo de espera
 * @returns Resultado de la función
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delayMs: number = 1000,
  backoffFactor: number = 1.5
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) throw error;
    
    await delay(delayMs);
    return withRetry(fn, retries - 1, delayMs * backoffFactor, backoffFactor);
  }
}