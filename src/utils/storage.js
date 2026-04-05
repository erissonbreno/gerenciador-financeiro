export function readStorage(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch {
    return defaultValue
  }
}

export function writeStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data))
}

export function clearStorage(key) {
  localStorage.removeItem(key)
}
