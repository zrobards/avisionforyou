import { vi } from 'vitest'

/**
 * Creates a mock Prisma client for testing.
 * Usage: vi.mock('@/lib/db', () => ({ db: createMockDb() }))
 */
export function createMockDb() {
  return {
    user: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    blogPost: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    contactSubmission: {
      create: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    },
    donation: {
      create: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    },
    newsletterSubscriber: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    newsletter: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    program: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  }
}
