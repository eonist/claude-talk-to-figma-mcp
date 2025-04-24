/**
 * Sistema de logging para Claude Talk to Figma MCP
 * 
 * Escribe a stderr en lugar de stdout para evitar que los logs sean capturados
 * por el sistema MCP y enviados como respuestas.
 */
import { LogLevel } from '../../config/config';

/**
 * Logger que escribe a stderr para no interferir con la salida MCP
 */
class Logger {
  private level: LogLevel = LogLevel.INFO;

  /**
   * Configura el nivel de logging
   */
  setLevel(level: LogLevel): void {
    this.level = level;
  }

  /**
   * Determina si un nivel de log debe ser mostrado
   */
  private shouldLog(messageLevel: LogLevel): boolean {
    const levels = Object.values(LogLevel);
    return levels.indexOf(messageLevel) >= levels.indexOf(this.level);
  }

  /**
   * Registra mensaje de debug
   */
  debug(message: string): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      process.stderr.write(`[DEBUG] ${message}\n`);
    }
  }

  /**
   * Registra mensaje informativo
   */
  info(message: string): void {
    if (this.shouldLog(LogLevel.INFO)) {
      process.stderr.write(`[INFO] ${message}\n`);
    }
  }

  /**
   * Registra advertencia
   */
  warn(message: string): void {
    if (this.shouldLog(LogLevel.WARN)) {
      process.stderr.write(`[WARN] ${message}\n`);
    }
  }

  /**
   * Registra error
   */
  error(message: string): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      process.stderr.write(`[ERROR] ${message}\n`);
    }
  }

  /**
   * Registra mensaje genérico
   */
  log(message: string): void {
    process.stderr.write(`[LOG] ${message}\n`);
  }
}

// Exporta una instancia singleton del logger
export const logger = new Logger();