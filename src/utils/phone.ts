export function formatPhone(value: string): string {
  const phone = value.replace(/\D/g, '')
  return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
}
