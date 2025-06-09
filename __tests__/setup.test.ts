// Simple test to verify Jest setup is working
describe('Jest Setup', () => {
  it('should be configured correctly', () => {
    expect(true).toBe(true);
  });

  it('should have Jest globals available', () => {
    expect(jest).toBeDefined();
    expect(describe).toBeDefined();
    expect(it).toBeDefined();
    expect(expect).toBeDefined();
  });

  it('should clear mocks between tests', () => {
    const mockFn = jest.fn();
    mockFn();
    expect(mockFn).toHaveBeenCalledTimes(1);
  });
}); 