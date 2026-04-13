import { setupWorker } from 'msw/browser'
import { http, passthrough } from 'msw'
import { accountHandlers } from './handlers'

export const worker = setupWorker(
  http.all('/api/v1/*', () => passthrough()),
  ...accountHandlers,
)
