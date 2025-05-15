import { useEffect, useState } from "react";

export function useStickyState<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined" || !window.localStorage) {
      return initialValue;
    }

    const persistedValue = window.localStorage.getItem(key);

    return persistedValue !== null
      ? (JSON.parse(persistedValue) as T)
      : initialValue;
  });

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as [T, React.Dispatch<React.SetStateAction<T>>];
}
