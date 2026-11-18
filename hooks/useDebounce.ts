import { useEffect, useState } from "react";

/**
 * Retarde la mise à jour d'une valeur après la fin de la saisie utilisateur.
 * Évite d'appeler l'API à chaque frappe au clavier.
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
