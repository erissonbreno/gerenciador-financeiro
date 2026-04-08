import '@testing-library/jest-dom'
import { server } from './mocks/server'
import { db } from './mocks/db'

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

afterEach(() => {
  server.resetHandlers()
  db.reset()
})

afterAll(() => server.close())
