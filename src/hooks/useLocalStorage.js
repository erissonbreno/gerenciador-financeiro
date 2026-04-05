import { useState, useCallback } from 'react'
import { readStorage, writeStorage } from '../utils/storage'

export function useLocalStorage(key, defaultValue) {
  const [value, setValue] = useState(() => readStorage(key, defaultValue))

  const set = useCallback(
    (newValue) => {
      setValue((prev) => {
        const resolved = typeof newValue === 'function' ? newValue(prev) : newValue
        writeStorage(key, resolved)
        return resolved
      })
    },
    [key],
  )

  return [value, set]
}
