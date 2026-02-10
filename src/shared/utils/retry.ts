/**
 * Opciones para configuración de reintentos
 */
export type RetryOptions = {
  /** Número de reintentos adicionales (default: 2) */
  retries?: number;
  /** Delay base en milisegundos (default: 600ms) */
  baseDelayMs?: number;
};

/**
 * Función auxiliar para pausar la ejecución
 * @param ms - Milisegundos a esperar
 */
export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Ejecuta una función asíncrona con reintentos automáticos
 * Útil para operaciones que pueden fallar transitoriamente (ej: llamadas a API)
 * 
 * @param fn - Función asíncrona a ejecutar
 * @param options - Configuración de reintentos
 * @returns Promesa con el resultado de la función
 * @throws El último error si todos los reintentos fallan
 */
export async function withRetry<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const retries = options.retries ?? 2;
  const baseDelayMs = options.baseDelayMs ?? 600;
  let lastError: unknown = null;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < retries) {
        await sleep(baseDelayMs * (attempt + 1));
        continue;
      }
    }
  }

  throw lastError;
}
