import '@testing-library/jest-dom'
import { server } from './mocks/server'
import { db } from './mocks/db'
import { patientTestDb } from './mocks/patientTestDb'

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

afterEach(() => {
  server.resetHandlers()
  db.reset()
  patientTestDb.reset()
})

afterAll(() => server.close())
