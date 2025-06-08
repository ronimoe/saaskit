import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  getCurrentUser,
  getCurrentSession,
  signInWithPassword,
  signUpWithPassword,
  signInWithOAuth,
  signOut,
  resetPassword,
  updatePassword,
  updateUserMetadata,
  isAuthenticated,
  getUserId,
} from '../auth-helpers'
import { createMockSupabaseClient, createMockUser, createMockSession, createMockAuthResponse } from '../test/mocks'

describe('Auth Helpers', () => {
  let mockSupabase: ReturnType<typeof createMockSupabaseClient>

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('getCurrentUser', () => {
    it('returns user when authenticated', async () => {
      const mockUser = createMockUser()
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      const result = await getCurrentUser(mockSupabase)

      expect(result).toEqual(mockUser)
      expect(mockSupabase.auth.getUser).toHaveBeenCalledOnce()
    })

    it('returns null when not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const result = await getCurrentUser(mockSupabase)

      expect(result).toBeNull()
    })

    it('handles authentication errors', async () => {
      const mockError = { message: 'Invalid JWT token' }
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: mockError,
      })

      const result = await getCurrentUser(mockSupabase)

      expect(result).toBeNull()
    })
  })

  describe('getCurrentSession', () => {
    it('returns session when authenticated', async () => {
      const mockSession = createMockSession()
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      })

      const result = await getCurrentSession(mockSupabase)

      expect(result).toEqual(mockSession)
      expect(mockSupabase.auth.getSession).toHaveBeenCalledOnce()
    })

    it('returns null when no session exists', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      })

      const result = await getCurrentSession(mockSupabase)

      expect(result).toBeNull()
    })

    it('handles session errors', async () => {
      const mockError = { message: 'Session expired' }
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: mockError,
      })

      const result = await getCurrentSession(mockSupabase)

      expect(result).toBeNull()
    })
  })

  describe('signInWithPassword', () => {
    it('successfully signs in with valid credentials', async () => {
      const mockUser = createMockUser()
      const mockSession = createMockSession()
      const authResponse = createMockAuthResponse(mockUser, mockSession)
      
      mockSupabase.auth.signInWithPassword.mockResolvedValue(authResponse)

      const result = await signInWithPassword(mockSupabase, 'test@example.com', 'password123')

      expect(result.data.user).toEqual(mockUser)
      expect(result.data.session).toEqual(mockSession)
      expect(result.error).toBeNull()
      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
    })

    it('handles invalid credentials', async () => {
      const mockError = { message: 'Invalid login credentials' }
      const authResponse = {
        data: { user: null, session: null },
        error: mockError,
      }
      
      mockSupabase.auth.signInWithPassword.mockResolvedValue(authResponse)

      const result = await signInWithPassword(mockSupabase, 'wrong@example.com', 'wrongpassword')

      expect(result.data.user).toBeNull()
      expect(result.data.session).toBeNull()
      expect(result.error).toEqual(mockError)
    })

    it('handles invalid email format', async () => {
      const mockError = { message: 'Invalid email format' }
      const authResponse = {
        data: { user: null, session: null },
        error: mockError,
      }
      
      mockSupabase.auth.signInWithPassword.mockResolvedValue(authResponse)

      const result = await signInWithPassword(mockSupabase, 'invalid-email', 'password123')

      expect(result.data.user).toBeNull()
      expect(result.data.session).toBeNull()
      expect(result.error).toEqual(mockError)
    })

    it('handles short password', async () => {
      const mockError = { message: 'Password must be at least 6 characters long' }
      const authResponse = {
        data: { user: null, session: null },
        error: mockError,
      }
      
      mockSupabase.auth.signInWithPassword.mockResolvedValue(authResponse)

      const result = await signInWithPassword(mockSupabase, 'test@example.com', '123')

      expect(result.data.user).toBeNull()
      expect(result.data.session).toBeNull()
      expect(result.error).toEqual(mockError)
    })
  })

  describe('signUpWithPassword', () => {
    it('successfully creates new user account', async () => {
      const mockUser = createMockUser()
      const mockSession = createMockSession()
      const authResponse = createMockAuthResponse(mockUser, mockSession)
      
      mockSupabase.auth.signUp.mockResolvedValue(authResponse)

      const result = await signUpWithPassword(mockSupabase, 'new@example.com', 'password123')

      expect(result.data.user).toEqual(mockUser)
      expect(result.data.session).toEqual(mockSession)
      expect(result.error).toBeNull()
      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: 'new@example.com',
        password: 'password123',
        options: undefined,
      })
    })

    it('handles user already exists error', async () => {
      const mockError = { message: 'User already registered' }
      const authResponse = {
        data: { user: null, session: null },
        error: mockError,
      }
      
      mockSupabase.auth.signUp.mockResolvedValue(authResponse)

      const result = await signUpWithPassword(mockSupabase, 'existing@example.com', 'password123')

      expect(result.data.user).toBeNull()
      expect(result.data.session).toBeNull()
      expect(result.error).toEqual(mockError)
    })

    it('accepts options parameter', async () => {
      const mockUser = createMockUser()
      const mockSession = createMockSession()
      const authResponse = createMockAuthResponse(mockUser, mockSession)
      const options = { emailRedirectTo: 'https://example.com/auth/callback' }
      
      mockSupabase.auth.signUp.mockResolvedValue(authResponse)

      await signUpWithPassword(mockSupabase, 'new@example.com', 'password123', options)

      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: 'new@example.com',
        password: 'password123',
        options,
      })
    })

    it('handles invalid email format for signup', async () => {
      const mockError = { message: 'Invalid email format' }
      const authResponse = {
        data: { user: null, session: null },
        error: mockError,
      }
      
      mockSupabase.auth.signUp.mockResolvedValue(authResponse)

      const result = await signUpWithPassword(mockSupabase, 'invalid-email', 'password123')

      expect(result.data.user).toBeNull()
      expect(result.data.session).toBeNull()
      expect(result.error).toEqual(mockError)
    })

    it('handles weak password for signup', async () => {
      const mockError = { message: 'Password must be at least 6 characters long' }
      const authResponse = {
        data: { user: null, session: null },
        error: mockError,
      }
      
      mockSupabase.auth.signUp.mockResolvedValue(authResponse)

      const result = await signUpWithPassword(mockSupabase, 'test@example.com', 'weak')

      expect(result.data.user).toBeNull()
      expect(result.data.session).toBeNull()
      expect(result.error).toEqual(mockError)
    })
  })

  describe('signInWithOAuth', () => {
    it('initiates Google OAuth flow', async () => {
      const mockAuthResponse = { data: { url: 'https://oauth.google.com' }, error: null }
      mockSupabase.auth.signInWithOAuth.mockResolvedValue(mockAuthResponse)

      const result = await signInWithOAuth(mockSupabase, 'google')

      expect(mockSupabase.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: undefined,
      })
      expect(result).toEqual(mockAuthResponse)
    })

    it('initiates GitHub OAuth flow with options', async () => {
      const mockAuthResponse = { data: { url: 'https://oauth.github.com' }, error: null }
      mockSupabase.auth.signInWithOAuth.mockResolvedValue(mockAuthResponse)
      const options = { redirectTo: 'https://example.com/dashboard' }

      const result = await signInWithOAuth(mockSupabase, 'github', options)

      expect(mockSupabase.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'github',
        options,
      })
      expect(result).toEqual(mockAuthResponse)
    })

    it('supports all OAuth providers', async () => {
      const providers = ['google', 'github', 'apple', 'discord', 'facebook'] as const
      const mockAuthResponse = { data: { url: 'https://oauth.url' }, error: null }
      mockSupabase.auth.signInWithOAuth.mockResolvedValue(mockAuthResponse)

      for (const provider of providers) {
        await signInWithOAuth(mockSupabase, provider)
        expect(mockSupabase.auth.signInWithOAuth).toHaveBeenCalledWith({
          provider,
          options: undefined,
        })
      }
    })
  })

  describe('signOut', () => {
    it('successfully signs out user', async () => {
      mockSupabase.auth.signOut.mockResolvedValue({ error: null })

      const result = await signOut(mockSupabase)

      expect(result.error).toBeNull()
      expect(mockSupabase.auth.signOut).toHaveBeenCalledOnce()
    })

    it('handles sign out errors', async () => {
      const mockError = { message: 'Failed to sign out' }
      mockSupabase.auth.signOut.mockResolvedValue({ error: mockError })

      const result = await signOut(mockSupabase)

      expect(result.error).toEqual(mockError)
    })
  })

  describe('resetPassword', () => {
    it('sends password reset email', async () => {
      mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({
        data: {},
        error: null,
      })

      const result = await resetPassword(mockSupabase, 'test@example.com')

      expect(result.error).toBeNull()
      expect(mockSupabase.auth.resetPasswordForEmail).toHaveBeenCalledWith('test@example.com', {
        redirectTo: undefined,
      })
    })

    it('handles reset password errors', async () => {
      const mockError = { message: 'Email not found' }
      mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({
        data: {},
        error: mockError,
      })

      const result = await resetPassword(mockSupabase, 'notfound@example.com')

      expect(result.error).toEqual(mockError)
    })

    it('includes redirectTo when provided', async () => {
      mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({
        data: {},
        error: null,
      })

      await resetPassword(mockSupabase, 'test@example.com', 'https://example.com/reset')

      expect(mockSupabase.auth.resetPasswordForEmail).toHaveBeenCalledWith('test@example.com', {
        redirectTo: 'https://example.com/reset',
      })
    })

    it('handles invalid email format for password reset', async () => {
      const mockError = { message: 'Invalid email format' }
      mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({
        data: {},
        error: mockError,
      })

      const result = await resetPassword(mockSupabase, 'invalid-email')

      expect(result.error).toEqual(mockError)
    })
  })

  describe('updatePassword', () => {
    it('updates user password successfully', async () => {
      const mockUser = createMockUser()
      mockSupabase.auth.updateUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      const result = await updatePassword(mockSupabase, 'newpassword123')

      expect(result.data.user).toEqual(mockUser)
      expect(result.error).toBeNull()
      expect(mockSupabase.auth.updateUser).toHaveBeenCalledWith({
        password: 'newpassword123',
      })
    })

    it('handles password update errors', async () => {
      const mockError = { message: 'Password update failed' }
      mockSupabase.auth.updateUser.mockResolvedValue({
        data: { user: null },
        error: mockError,
      })

      const result = await updatePassword(mockSupabase, 'newpassword123')

      expect(result.data.user).toBeNull()
      expect(result.error).toEqual(mockError)
    })
  })

  describe('updateUserMetadata', () => {
    it('updates user metadata successfully', async () => {
      const mockUser = createMockUser()
      const metadata = { displayName: 'John Doe', avatar: 'avatar.jpg' }
      mockSupabase.auth.updateUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      const result = await updateUserMetadata(mockSupabase, metadata)

      expect(result.data.user).toEqual(mockUser)
      expect(result.error).toBeNull()
      expect(mockSupabase.auth.updateUser).toHaveBeenCalledWith({
        data: metadata,
      })
    })

    it('handles metadata update errors', async () => {
      const mockError = { message: 'Failed to update user' }
      const metadata = { displayName: 'John Doe' }
      mockSupabase.auth.updateUser.mockResolvedValue({
        data: { user: null },
        error: mockError,
      })

      const result = await updateUserMetadata(mockSupabase, metadata)

      expect(result.data.user).toBeNull()
      expect(result.error).toEqual(mockError)
    })
  })

  describe('Utility Functions', () => {
    describe('isAuthenticated', () => {
      it('returns true when user is authenticated', async () => {
        const mockUser = createMockUser()
        mockSupabase.auth.getUser.mockResolvedValue({
          data: { user: mockUser },
          error: null,
        })

        const result = await isAuthenticated(mockSupabase)

        expect(result).toBe(true)
      })

      it('returns false when user is not authenticated', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
          data: { user: null },
          error: null,
        })

        const result = await isAuthenticated(mockSupabase)

        expect(result).toBe(false)
      })

      it('returns false when there is an authentication error', async () => {
        const mockError = { message: 'Invalid token' }
        mockSupabase.auth.getUser.mockResolvedValue({
          data: { user: null },
          error: mockError,
        })

        const result = await isAuthenticated(mockSupabase)

        expect(result).toBe(false)
      })
    })

    describe('getUserId', () => {
      it('returns user ID when authenticated', async () => {
        const mockUser = createMockUser({ id: 'user-456' })
        mockSupabase.auth.getUser.mockResolvedValue({
          data: { user: mockUser },
          error: null,
        })

        const result = await getUserId(mockSupabase)

        expect(result).toBe('user-456')
      })

      it('returns null when not authenticated', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
          data: { user: null },
          error: null,
        })

        const result = await getUserId(mockSupabase)

        expect(result).toBeNull()
      })

      it('returns null when there is an error', async () => {
        const mockError = { message: 'Invalid token' }
        mockSupabase.auth.getUser.mockResolvedValue({
          data: { user: null },
          error: mockError,
        })

        const result = await getUserId(mockSupabase)

        expect(result).toBeNull()
      })
    })
  })
}) 