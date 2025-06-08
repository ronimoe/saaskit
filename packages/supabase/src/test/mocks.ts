import { vi } from 'vitest'

export const createMockSupabaseClient = () => {
  const mockSelect = vi.fn().mockReturnThis()
  const mockFrom = vi.fn().mockReturnThis()
  const mockEq = vi.fn().mockReturnThis()
  const mockInsert = vi.fn().mockReturnThis()
  const mockUpdate = vi.fn().mockReturnThis()
  const mockDelete = vi.fn().mockReturnThis()
  const mockSingle = vi.fn()
  const mockOrder = vi.fn().mockReturnThis()
  const mockLimit = vi.fn().mockReturnThis()
  const mockRange = vi.fn().mockReturnThis()
  const mockIn = vi.fn().mockReturnThis()
  const mockGt = vi.fn().mockReturnThis()
  const mockLt = vi.fn().mockReturnThis()
  const mockGte = vi.fn().mockReturnThis()
  const mockLte = vi.fn().mockReturnThis()
  const mockLike = vi.fn().mockReturnThis()
  const mockIlike = vi.fn().mockReturnThis()
  const mockIs = vi.fn().mockReturnThis()
  const mockNeq = vi.fn().mockReturnThis()
  const mockOr = vi.fn().mockReturnThis()
  const mockAnd = vi.fn().mockReturnThis()

  const mockUpload = vi.fn()
  const mockDownload = vi.fn()
  const mockList = vi.fn()
  const mockGetPublicUrl = vi.fn()
  const mockCreateSignedUrl = vi.fn()
  const mockCreateSignedUrls = vi.fn()
  const mockCopy = vi.fn()
  const mockMove = vi.fn()
  const mockRemove = vi.fn()
  const mockCreateBucket = vi.fn()

  const mockChannel = vi.fn(() => ({
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn(),
    unsubscribe: vi.fn(),
  }))

  // Chain methods for query builder
  mockFrom.mockImplementation(() => ({
    select: mockSelect,
    insert: mockInsert,
    update: mockUpdate,
    delete: mockDelete,
    eq: mockEq,
    in: mockIn,
    gt: mockGt,
    lt: mockLt,
    gte: mockGte,
    lte: mockLte,
    like: mockLike,
    ilike: mockIlike,
    is: mockIs,
    neq: mockNeq,
    or: mockOr,
    and: mockAnd,
    order: mockOrder,
    limit: mockLimit,
    range: mockRange,
    single: mockSingle,
  }))

  return {
    auth: {
      getUser: vi.fn(),
      getSession: vi.fn(),
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signInWithOAuth: vi.fn(),
      signOut: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      updateUser: vi.fn(),
      onAuthStateChange: vi.fn(() => ({ 
        data: { 
          subscription: { 
            unsubscribe: vi.fn() 
          } 
        } 
      })),
    },
    from: mockFrom,
    storage: {
      from: vi.fn(() => ({
        upload: mockUpload,
        download: mockDownload,
        list: mockList,
        getPublicUrl: mockGetPublicUrl,
        createSignedUrl: mockCreateSignedUrl,
        createSignedUrls: mockCreateSignedUrls,
        copy: mockCopy,
        move: mockMove,
        remove: mockRemove,
      })),
      createBucket: mockCreateBucket,
      listBuckets: vi.fn(),
      deleteBucket: vi.fn(),
    },
    channel: mockChannel,
    removeChannel: vi.fn(),
    realtime: undefined,
    // Expose individual mocks for easier testing
    _mocks: {
      select: mockSelect,
      from: mockFrom,
      eq: mockEq,
      insert: mockInsert,
      update: mockUpdate,
      delete: mockDelete,
      single: mockSingle,
      order: mockOrder,
      limit: mockLimit,
      range: mockRange,
      upload: mockUpload,
      download: mockDownload,
      list: mockList,
      getPublicUrl: mockGetPublicUrl,
      createSignedUrl: mockCreateSignedUrl,
      createSignedUrls: mockCreateSignedUrls,
      copy: mockCopy,
      move: mockMove,
      remove: mockRemove,
      createBucket: mockCreateBucket,
      channel: mockChannel,
    }
  }
}

export const createMockUser = (overrides = {}) => ({
  id: 'user-123',
  email: 'test@example.com',
  email_confirmed_at: new Date().toISOString(),
  phone: null,
  confirmed_at: new Date().toISOString(),
  last_sign_in_at: new Date().toISOString(),
  app_metadata: {},
  user_metadata: {},
  role: 'authenticated',
  aud: 'authenticated',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
})

export const createMockSession = (overrides = {}) => ({
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  token_type: 'bearer',
  user: createMockUser(),
  ...overrides,
})

export const createMockAuthResponse = (user = createMockUser(), session = createMockSession(), error = null) => ({
  data: { user, session },
  error,
})

export const createMockDatabaseResponse = (data: any, error = null) => ({
  data,
  error,
})

export const createMockStorageResponse = (data: any, error = null) => ({
  data,
  error,
}) 