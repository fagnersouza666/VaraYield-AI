import { useState, useEffect, useCallback } from 'react';

type SerializableValue = string | number | boolean | object | null;

interface UseLocalStorageOptions<T> {
  serializer?: {
    serialize: (value: T) => string;
    deserialize: (value: string) => T;
  };
  onError?: (error: Error) => void;
}

export const useLocalStorage = <T extends SerializableValue>(
  key: string,
  initialValue: T,
  options?: UseLocalStorageOptions<T>
) => {
  const { serializer, onError } = options || {};
  
  const defaultSerializer = {
    serialize: JSON.stringify,
    deserialize: JSON.parse,
  };

  const actualSerializer = serializer || defaultSerializer;

  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item === null) {
        return initialValue;
      }
      return actualSerializer.deserialize(item);
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      if (onError) {
        onError(error as Error);
      }
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, actualSerializer.serialize(valueToStore));
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
        if (onError) {
          onError(error as Error);
        }
      }
    },
    [key, storedValue, actualSerializer, onError]
  );

  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
      if (onError) {
        onError(error as Error);
      }
    }
  }, [key, initialValue, onError]);

  // Listen for storage changes from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(actualSerializer.deserialize(e.newValue));
        } catch (error) {
          console.error(`Error parsing localStorage key "${key}" from storage event:`, error);
          if (onError) {
            onError(error as Error);
          }
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, actualSerializer, onError]);

  return [storedValue, setValue, removeValue] as const;
};

// Hook for session storage
export const useSessionStorage = <T extends SerializableValue>(
  key: string,
  initialValue: T,
  options?: UseLocalStorageOptions<T>
) => {
  const { serializer, onError } = options || {};
  
  const defaultSerializer = {
    serialize: JSON.stringify,
    deserialize: JSON.parse,
  };

  const actualSerializer = serializer || defaultSerializer;

  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.sessionStorage.getItem(key);
      if (item === null) {
        return initialValue;
      }
      return actualSerializer.deserialize(item);
    } catch (error) {
      console.error(`Error reading sessionStorage key "${key}":`, error);
      if (onError) {
        onError(error as Error);
      }
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.sessionStorage.setItem(key, actualSerializer.serialize(valueToStore));
      } catch (error) {
        console.error(`Error setting sessionStorage key "${key}":`, error);
        if (onError) {
          onError(error as Error);
        }
      }
    },
    [key, storedValue, actualSerializer, onError]
  );

  const removeValue = useCallback(() => {
    try {
      window.sessionStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing sessionStorage key "${key}":`, error);
      if (onError) {
        onError(error as Error);
      }
    }
  }, [key, initialValue, onError]);

  return [storedValue, setValue, removeValue] as const;
};