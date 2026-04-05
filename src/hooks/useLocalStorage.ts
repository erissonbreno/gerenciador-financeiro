import { useState, useCallback } from 'react'
import { readStorage, writeStorage } from '../utils/storage'

type SetValue<T> = T | ((prev: T) => T)

export function useLocalStorage<T>(key: string, defaultValue: T): [T, (newValue: SetValue<T>) => void] {
  const [value, setValue] = useState<T>(() => readStorage(key, defaultValue))

  const set = useCallback(
    (newValue: SetValue<T>) => {
      setValue((prev) => {
        const resolved = typeof newValue === 'function'
          ? (newValue as (prev: T) => T)(prev)
          : newValue
        writeStorage(key, resolved)
        return resolved
      })
    },
    [key],
  )

  return [value, set]
}
