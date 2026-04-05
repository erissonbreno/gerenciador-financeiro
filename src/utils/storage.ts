export function readStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key)
    return item ? (JSON.parse(item) as T) : defaultValue
  } catch {
    return defaultValue
  }
}

export function writeStorage<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data))
}

export function clearStorage(key: string): void {
  localStorage.removeItem(key)
}
