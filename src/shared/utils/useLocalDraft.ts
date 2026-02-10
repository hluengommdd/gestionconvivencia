import { useEffect, useState } from 'react';

/**
 * Hook para persistir datos en localStorage del navegador
 * Útil para guardar estados de formularios parcialmente completados
 * 
 * @param key - Clave única para identificar el dato en localStorage
 * @param initialValue - Valor inicial si no existe dato en localStorage
 * @returns [valor, setValor, clear] - Estado, setter y función para limpiar
 */
export function useLocalDraft<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const raw = localStorage.getItem(key);
      if (raw) return JSON.parse(raw) as T;
    } catch {
      // ignore
    }
    return initialValue;
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore
    }
  }, [key, value]);

  const clear = () => {
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
    setValue(initialValue);
  };

  return [value, setValue, clear] as const;
}
