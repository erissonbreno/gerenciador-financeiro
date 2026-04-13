import { AxiosError } from 'axios'

export function isDuplicateCpf(error: unknown): boolean {
  return error instanceof AxiosError && error.response?.status === 409
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError && error.response?.data?.message) {
    return error.response.data.message
  }
  return 'Erro inesperado. Tente novamente.'
}
