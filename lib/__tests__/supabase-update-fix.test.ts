import { handleSupabaseResponse } from '../supabase';

describe('Supabase UPDATE operation fix', () => {
  it('should return error for UPDATE without select() - simulating null data', () => {
    // This simulates what happens when UPDATE is called without .select()
    const responseWithoutSelect = {
      data: null, // Supabase returns null for UPDATE without select()
      error: null
    };

    const result = handleSupabaseResponse(responseWithoutSelect);

    expect(result.error).toBe('No data returned');
    expect(result.data).toBe(null);
  });

  it('should return success for UPDATE with select() - simulating returned data', () => {
    // This simulates what happens when UPDATE is called with .select()
    const mockUpdatedProfile = {
      id: 'test-id',
      full_name: 'Updated Name',
      updated_at: '2024-01-01T00:00:00Z'
    };

    const responseWithSelect = {
      data: [mockUpdatedProfile], // Supabase returns array with .select()
      error: null
    };

    const result = handleSupabaseResponse(responseWithSelect);

    expect(result.error).toBe(null);
    expect(result.data).toEqual([mockUpdatedProfile]);
  });

  it('should handle single record UPDATE with select().single()', () => {
    // This simulates UPDATE with .select().single()
    const mockUpdatedProfile = {
      id: 'test-id',
      full_name: 'Updated Name',
      updated_at: '2024-01-01T00:00:00Z'
    };

    const responseWithSingle = {
      data: mockUpdatedProfile, // single() returns object directly
      error: null
    };

    const result = handleSupabaseResponse(responseWithSingle);

    expect(result.error).toBe(null);
    expect(result.data).toBe(mockUpdatedProfile);
  });

  it('should handle Supabase errors properly', () => {
    const mockError = new Error('Database connection failed');
    
    const responseWithError = {
      data: null,
      error: mockError
    };

    const result = handleSupabaseResponse(responseWithError);

    expect(result.error).toBe('Database connection failed');
    expect(result.data).toBe(null);
  });

  it('should handle empty array response', () => {
    // Sometimes UPDATE with select() might return empty array if no rows match
    const responseWithEmptyArray = {
      data: [],
      error: null
    };

    const result = handleSupabaseResponse(responseWithEmptyArray);

    expect(result.error).toBe(null);
    expect(result.data).toEqual([]);
  });

  describe('Profile update scenarios', () => {
    it('demonstrates the fix for profile updates', () => {
      // Before fix: UPDATE without select() returns null data
      const oldUpdateResponse = {
        data: null, // This caused "No data returned" error
        error: null
      };

      const oldResult = handleSupabaseResponse(oldUpdateResponse);
      expect(oldResult.error).toBe('No data returned');

      // After fix: UPDATE with select() returns actual data
      const newUpdateResponse = {
        data: [{
          id: 'profile-id',
          full_name: 'John Doe',
          email: 'john@example.com',
          updated_at: '2024-01-01T12:00:00Z'
        }],
        error: null
      };

      const newResult = handleSupabaseResponse(newUpdateResponse);
      expect(newResult.error).toBe(null);
      expect(newResult.data).toHaveLength(1);
      expect((newResult.data as any[])[0].full_name).toBe('John Doe');
    });
  });
}); 