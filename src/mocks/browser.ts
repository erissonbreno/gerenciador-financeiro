import { setupWorker } from 'msw/browser'
import { http, passthrough } from 'msw'
import { accountHandlers, paymentHandlers } from './handlers'

export const worker = setupWorker(
  ...paymentHandlers,
  http.all('*/api/v1/*', () => passthrough()),
  ...accountHandlers,
)

export { seedMockData } from './seedData'
