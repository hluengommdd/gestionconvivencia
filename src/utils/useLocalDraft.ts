import { useEffect, useState } from 'react';

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
