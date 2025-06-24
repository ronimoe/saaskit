# Account Linking Tests

This directory contains tests for the account linking functionality in the application.

## Test Files

- `page.test.tsx`: Tests for the account linking page component

## Testing Approach

The account linking page tests focus on:

1. **Validation Logic**: Testing all validation paths for the account linking request (token, provider, email)
2. **Authentication Checks**: Ensuring only authenticated users with matching emails can access the linking flow
3. **Token Verification**: Testing the token verification and validation process
4. **Component Rendering**: Verifying the correct components are rendered with the right props
5. **Error Handling**: Testing all error redirect paths

## Mocking Strategy

- `@/lib/supabase`: Mocked to control authentication state
- `@/lib/account-linking`: Mocked to control token verification results
- `next/navigation`: Mocked to verify redirects
- React components: Mocked to isolate page logic from component implementation
- `react.Suspense`: Mocked to control rendering behavior

## Running Tests

Run the tests with:

```bash
npm test app/auth/link-account
```

## Related Tests

- `components/auth/__tests__/account-linking-form.test.tsx`: Tests for the account linking form component
- `lib/__tests__/account-linking.test.ts`: Tests for the account linking utility functions 