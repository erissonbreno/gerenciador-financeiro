import { setupServer } from 'msw/node'
import { accountHandlers, patientHandlers, paymentHandlers } from './handlers'

export const server = setupServer(...accountHandlers, ...patientHandlers, ...paymentHandlers)
