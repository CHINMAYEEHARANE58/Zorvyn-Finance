const parseNumber = (value, fallback) => {
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : fallback
}

const MOCK_API_MIN_DELAY_MS = parseNumber(import.meta.env.VITE_MOCK_API_MIN_DELAY_MS, 220)
const MOCK_API_MAX_DELAY_MS = parseNumber(import.meta.env.VITE_MOCK_API_MAX_DELAY_MS, 520)
const MOCK_API_ERROR_RATE = parseNumber(import.meta.env.VITE_MOCK_API_ERROR_RATE, 0)

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

const getDelay = () => {
  const min = Math.max(0, Math.min(MOCK_API_MIN_DELAY_MS, MOCK_API_MAX_DELAY_MS))
  const max = Math.max(min, MOCK_API_MAX_DELAY_MS)
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const sleep = (ms) => new Promise((resolve) => {
  window.setTimeout(resolve, ms)
})

export class MockApiError extends Error {
  constructor(message, { status = 500, code = 'MOCK_API_ERROR' } = {}) {
    super(message)
    this.name = 'MockApiError'
    this.status = status
    this.code = code
  }
}

export const getMockApiErrorMessage = (
  error,
  fallback = 'Something went wrong while talking to the mock API.',
) => {
  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallback
}

export const mockApiRequest = async (handler) => {
  await sleep(getDelay())

  const errorRate = clamp(MOCK_API_ERROR_RATE, 0, 1)
  if (errorRate > 0 && Math.random() < errorRate) {
    throw new MockApiError('Mock API simulated a network failure. Please retry.', {
      status: 503,
      code: 'MOCK_API_UNAVAILABLE',
    })
  }

  const data = await handler()

  return {
    ok: true,
    data,
    meta: {
      servedAt: new Date().toISOString(),
      source: 'mock-api',
    },
  }
}
