import { setupServer } from 'msw/node'
import { accountHandlers, patientHandlers } from './handlers'

export const server = setupServer(...accountHandlers, ...patientHandlers)
