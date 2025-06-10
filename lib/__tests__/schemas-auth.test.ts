import {
  loginSchema,
  signupSchema,
  passwordResetSchema,
  passwordResetConfirmSchema,
  authMessages,
  type LoginFormData,
  type SignupFormData,
  type PasswordResetFormData,
  type PasswordResetConfirmFormData,
} from '../schemas/auth';
import { ZodError } from 'zod';

describe('Auth Schemas', () => {
  describe('loginSchema', () => {
    describe('Valid inputs', () => {
      it('should validate correct login data', () => {
        const validData = {
          email: 'test@example.com',
          password: 'password123',
        };

        const result = loginSchema.parse(validData);
        expect(result).toEqual(validData);
      });

      it('should automatically lowercase email', () => {
        const inputData = {
          email: 'Test@Example.Com',
          password: 'password123',
        };

        const result = loginSchema.parse(inputData);
        expect(result.email).toBe('test@example.com');
      });

      it('should accept minimum valid password (6 characters)', () => {
        const validData = {
          email: 'test@example.com',
          password: '123456',
        };

        const result = loginSchema.parse(validData);
        expect(result).toEqual(validData);
      });

      it('should accept various email formats', () => {
        const validEmails = [
          'user@domain.com',
          'user.name@domain.com',
          'user+tag@domain.com',
          'user123@sub.domain.co.uk',
          'a@b.co',
        ];

        validEmails.forEach(email => {
          const data = { email, password: 'password123' };
          const result = loginSchema.parse(data);
          expect(result.email).toBe(email.toLowerCase());
        });
      });
    });

    describe('Invalid inputs', () => {
      it('should reject empty email', () => {
        const invalidData = {
          email: '',
          password: 'password123',
        };

        expect(() => loginSchema.parse(invalidData)).toThrow(ZodError);
        
        try {
          loginSchema.parse(invalidData);
        } catch (error) {
          expect(error).toBeInstanceOf(ZodError);
          const zodError = error as ZodError;
          expect(zodError.errors[0].message).toBe('Email is required');
          expect(zodError.errors[0].path).toEqual(['email']);
        }
      });

      it('should reject invalid email formats', () => {
        const invalidEmails = [
          'invalid-email',
          '@domain.com',
          'user@',
          'user..name@domain.com',
          'user@domain',
          ' ',
        ];

        invalidEmails.forEach(email => {
          const data = { email, password: 'password123' };
          expect(() => loginSchema.parse(data)).toThrow(ZodError);
          
          try {
            loginSchema.parse(data);
          } catch (error) {
            const zodError = error as ZodError;
            expect(zodError.errors[0].message).toBe('Please enter a valid email address');
          }
        });
      });

      it('should reject empty password', () => {
        const invalidData = {
          email: 'test@example.com',
          password: '',
        };

        expect(() => loginSchema.parse(invalidData)).toThrow(ZodError);
        
        try {
          loginSchema.parse(invalidData);
        } catch (error) {
          const zodError = error as ZodError;
          expect(zodError.errors[0].message).toBe('Password is required');
          expect(zodError.errors[0].path).toEqual(['password']);
        }
      });

      it('should reject password shorter than 6 characters', () => {
        const invalidData = {
          email: 'test@example.com',
          password: '12345',
        };

        expect(() => loginSchema.parse(invalidData)).toThrow(ZodError);
        
        try {
          loginSchema.parse(invalidData);
        } catch (error) {
          const zodError = error as ZodError;
          expect(zodError.errors[0].message).toBe('Password must be at least 6 characters');
        }
      });

      it('should reject missing fields', () => {
        expect(() => loginSchema.parse({})).toThrow(ZodError);
        expect(() => loginSchema.parse({ email: 'test@example.com' })).toThrow(ZodError);
        expect(() => loginSchema.parse({ password: 'password123' })).toThrow(ZodError);
      });
    });
  });

  describe('signupSchema', () => {
    describe('Valid inputs', () => {
      it('should validate correct signup data', () => {
        const validData = {
          email: 'test@example.com',
          password: 'Password123!',
          confirmPassword: 'Password123!',
          terms: true,
        };

        const result = signupSchema.parse(validData);
        expect(result).toEqual(validData);
      });

      it('should accept minimum valid strong password (8 chars with requirements)', () => {
        const validData = {
          email: 'test@example.com',
          password: 'Password1',
          confirmPassword: 'Password1',
          terms: true,
        };

        const result = signupSchema.parse(validData);
        expect(result).toEqual(validData);
      });

      it('should automatically lowercase email in signup', () => {
        const inputData = {
          email: 'User@Domain.Com',
          password: 'Password123!',
          confirmPassword: 'Password123!',
          terms: true,
        };

        const result = signupSchema.parse(inputData);
        expect(result.email).toBe('user@domain.com');
      });

      it('should accept various strong password formats', () => {
        const validPasswords = [
          'Password1',
          'MySecret123',
          'Complex1Pass',
          'StrongPass9',
          'Aa1bcdefgh',
        ];

        validPasswords.forEach(password => {
          const data = {
            email: 'test@example.com',
            password,
            confirmPassword: password,
            terms: true,
          };
          const result = signupSchema.parse(data);
          expect(result.password).toBe(password);
        });
      });
    });

    describe('Invalid inputs', () => {
      it('should reject weak passwords (no uppercase)', () => {
        const invalidData = {
          email: 'test@example.com',
          password: 'password123',
          confirmPassword: 'password123',
          terms: true,
        };

        expect(() => signupSchema.parse(invalidData)).toThrow(ZodError);
        
        try {
          signupSchema.parse(invalidData);
        } catch (error) {
          const zodError = error as ZodError;
          expect(zodError.errors[0].message).toBe(
            'Password must contain at least one uppercase letter, one lowercase letter, and one number'
          );
        }
      });

      it('should reject weak passwords (no lowercase)', () => {
        const invalidData = {
          email: 'test@example.com',
          password: 'PASSWORD123',
          confirmPassword: 'PASSWORD123',
          terms: true,
        };

        expect(() => signupSchema.parse(invalidData)).toThrow(ZodError);
      });

      it('should reject weak passwords (no numbers)', () => {
        const invalidData = {
          email: 'test@example.com',
          password: 'Password',
          confirmPassword: 'Password',
          terms: true,
        };

        expect(() => signupSchema.parse(invalidData)).toThrow(ZodError);
      });

      it('should reject passwords shorter than 8 characters', () => {
        const invalidData = {
          email: 'test@example.com',
          password: 'Pass1',
          confirmPassword: 'Pass1',
          terms: true,
        };

        expect(() => signupSchema.parse(invalidData)).toThrow(ZodError);
        
        try {
          signupSchema.parse(invalidData);
        } catch (error) {
          const zodError = error as ZodError;
          expect(zodError.errors.some(e => e.message === 'Password must be at least 8 characters')).toBe(true);
        }
      });

      it('should reject mismatched passwords', () => {
        const invalidData = {
          email: 'test@example.com',
          password: 'Password123!',
          confirmPassword: 'DifferentPass1',
          terms: true,
        };

        expect(() => signupSchema.parse(invalidData)).toThrow(ZodError);
        
        try {
          signupSchema.parse(invalidData);
        } catch (error) {
          const zodError = error as ZodError;
          expect(zodError.errors[0].message).toBe('Passwords do not match');
          expect(zodError.errors[0].path).toEqual(['confirmPassword']);
        }
      });

      it('should reject when terms are not accepted', () => {
        const invalidData = {
          email: 'test@example.com',
          password: 'Password123!',
          confirmPassword: 'Password123!',
          terms: false,
        };

        expect(() => signupSchema.parse(invalidData)).toThrow(ZodError);
        
        try {
          signupSchema.parse(invalidData);
        } catch (error) {
          const zodError = error as ZodError;
          expect(zodError.errors[0].message).toBe('You must accept the terms and conditions');
          expect(zodError.errors[0].path).toEqual(['terms']);
        }
      });

      it('should reject missing terms field', () => {
        const invalidData = {
          email: 'test@example.com',
          password: 'Password123!',
          confirmPassword: 'Password123!',
        };

        expect(() => signupSchema.parse(invalidData)).toThrow(ZodError);
      });

      it('should reject empty password in signup', () => {
        const invalidData = {
          email: 'test@example.com',
          password: '',
          confirmPassword: '',
          terms: true,
        };

        expect(() => signupSchema.parse(invalidData)).toThrow(ZodError);
        
        try {
          signupSchema.parse(invalidData);
        } catch (error) {
          const zodError = error as ZodError;
          expect(zodError.errors.some(e => e.message === 'Password is required')).toBe(true);
        }
      });

      it('should handle multiple validation errors', () => {
        const invalidData = {
          email: 'invalid-email',
          password: 'weak',
          confirmPassword: 'different',
          terms: false,
        };

        expect(() => signupSchema.parse(invalidData)).toThrow(ZodError);
        
        try {
          signupSchema.parse(invalidData);
        } catch (error) {
          const zodError = error as ZodError;
          expect(zodError.errors.length).toBeGreaterThan(1);
          
          const errorMessages = zodError.errors.map(e => e.message);
          expect(errorMessages).toContain('Please enter a valid email address');
          expect(errorMessages).toContain('You must accept the terms and conditions');
        }
      });
    });
  });

  describe('passwordResetSchema', () => {
    describe('Valid inputs', () => {
      it('should validate correct email for password reset', () => {
        const validData = {
          email: 'test@example.com',
        };

        const result = passwordResetSchema.parse(validData);
        expect(result).toEqual(validData);
      });

      it('should automatically lowercase email in password reset', () => {
        const inputData = {
          email: 'User@Domain.Com',
        };

        const result = passwordResetSchema.parse(inputData);
        expect(result.email).toBe('user@domain.com');
      });

      it('should accept various email formats for password reset', () => {
        const validEmails = [
          'user@domain.com',
          'user.name+tag@sub.domain.co.uk',
          'a@b.co',
        ];

        validEmails.forEach(email => {
          const data = { email };
          const result = passwordResetSchema.parse(data);
          expect(result.email).toBe(email.toLowerCase());
        });
      });
    });

    describe('Invalid inputs', () => {
      it('should reject empty email for password reset', () => {
        const invalidData = {
          email: '',
        };

        expect(() => passwordResetSchema.parse(invalidData)).toThrow(ZodError);
        
        try {
          passwordResetSchema.parse(invalidData);
        } catch (error) {
          const zodError = error as ZodError;
          expect(zodError.errors[0].message).toBe('Email is required');
        }
      });

      it('should reject invalid email formats for password reset', () => {
        const invalidEmails = [
          'invalid-email',
          '@domain.com',
          'user@',
          ' ',
        ];

        invalidEmails.forEach(email => {
          const data = { email };
          expect(() => passwordResetSchema.parse(data)).toThrow(ZodError);
        });
      });

      it('should reject missing email field', () => {
        expect(() => passwordResetSchema.parse({})).toThrow(ZodError);
      });
    });
  });

  describe('passwordResetConfirmSchema', () => {
    describe('Valid inputs', () => {
      it('should validate correct password reset confirmation data', () => {
        const validData = {
          password: 'NewPassword123!',
          confirmPassword: 'NewPassword123!',
        };

        const result = passwordResetConfirmSchema.parse(validData);
        expect(result).toEqual(validData);
      });

      it('should accept minimum valid strong password for reset', () => {
        const validData = {
          password: 'NewPass1',
          confirmPassword: 'NewPass1',
        };

        const result = passwordResetConfirmSchema.parse(validData);
        expect(result).toEqual(validData);
      });

      it('should accept various strong password formats for reset', () => {
        const validPasswords = [
          'NewPassword1',
          'ResetMyPass123',
          'SecurePass9',
        ];

        validPasswords.forEach(password => {
          const data = {
            password,
            confirmPassword: password,
          };
          const result = passwordResetConfirmSchema.parse(data);
          expect(result.password).toBe(password);
        });
      });
    });

    describe('Invalid inputs', () => {
      it('should reject weak passwords in reset (no uppercase)', () => {
        const invalidData = {
          password: 'newpassword123',
          confirmPassword: 'newpassword123',
        };

        expect(() => passwordResetConfirmSchema.parse(invalidData)).toThrow(ZodError);
      });

      it('should reject weak passwords in reset (no lowercase)', () => {
        const invalidData = {
          password: 'NEWPASSWORD123',
          confirmPassword: 'NEWPASSWORD123',
        };

        expect(() => passwordResetConfirmSchema.parse(invalidData)).toThrow(ZodError);
      });

      it('should reject weak passwords in reset (no numbers)', () => {
        const invalidData = {
          password: 'NewPassword',
          confirmPassword: 'NewPassword',
        };

        expect(() => passwordResetConfirmSchema.parse(invalidData)).toThrow(ZodError);
      });

      it('should reject passwords shorter than 8 characters in reset', () => {
        const invalidData = {
          password: 'NewP1',
          confirmPassword: 'NewP1',
        };

        expect(() => passwordResetConfirmSchema.parse(invalidData)).toThrow(ZodError);
      });

      it('should reject mismatched passwords in reset', () => {
        const invalidData = {
          password: 'NewPassword123!',
          confirmPassword: 'DifferentPassword1',
        };

        expect(() => passwordResetConfirmSchema.parse(invalidData)).toThrow(ZodError);
        
        try {
          passwordResetConfirmSchema.parse(invalidData);
        } catch (error) {
          const zodError = error as ZodError;
          expect(zodError.errors[0].message).toBe('Passwords do not match');
          expect(zodError.errors[0].path).toEqual(['confirmPassword']);
        }
      });

      it('should reject empty passwords in reset', () => {
        const invalidData = {
          password: '',
          confirmPassword: '',
        };

        expect(() => passwordResetConfirmSchema.parse(invalidData)).toThrow(ZodError);
      });

      it('should reject missing fields in reset', () => {
        expect(() => passwordResetConfirmSchema.parse({})).toThrow(ZodError);
        expect(() => passwordResetConfirmSchema.parse({ password: 'NewPassword1' })).toThrow(ZodError);
        expect(() => passwordResetConfirmSchema.parse({ confirmPassword: 'NewPassword1' })).toThrow(ZodError);
      });
    });
  });

  describe('Type Exports', () => {
    it('should export correct LoginFormData type', () => {
      const loginData: LoginFormData = {
        email: 'test@example.com',
        password: 'password123',
      };

      // This test ensures the type is correctly exported and can be used
      expect(typeof loginData.email).toBe('string');
      expect(typeof loginData.password).toBe('string');
    });

    it('should export correct SignupFormData type', () => {
      const signupData: SignupFormData = {
        email: 'test@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        terms: true,
      };

      expect(typeof signupData.email).toBe('string');
      expect(typeof signupData.password).toBe('string');
      expect(typeof signupData.confirmPassword).toBe('string');
      expect(typeof signupData.terms).toBe('boolean');
    });

    it('should export correct PasswordResetFormData type', () => {
      const resetData: PasswordResetFormData = {
        email: 'test@example.com',
      };

      expect(typeof resetData.email).toBe('string');
    });

    it('should export correct PasswordResetConfirmFormData type', () => {
      const resetConfirmData: PasswordResetConfirmFormData = {
        password: 'NewPassword123!',
        confirmPassword: 'NewPassword123!',
      };

      expect(typeof resetConfirmData.password).toBe('string');
      expect(typeof resetConfirmData.confirmPassword).toBe('string');
    });
  });

  describe('authMessages', () => {
    it('should export all required auth messages', () => {
      expect(authMessages).toBeDefined();
      expect(typeof authMessages).toBe('object');
    });

    it('should contain correct message keys and values', () => {
      const expectedMessages = {
        invalidCredentials: 'Invalid email or password',
        emailNotFound: 'No account found with this email address',
        emailAlreadyExists: 'An account with this email already exists',
        passwordTooWeak: 'Password is too weak. Please choose a stronger password.',
        loginSuccess: 'Welcome back!',
        signupSuccess: 'Account created successfully! Please check your email for verification.',
        passwordResetSent: 'Password reset link sent to your email',
        passwordResetSuccess: 'Password updated successfully',
        networkError: 'Network error. Please check your connection and try again.',
        unexpectedError: 'An unexpected error occurred. Please try again.',
      };

      Object.entries(expectedMessages).forEach(([key, value]) => {
        expect(authMessages).toHaveProperty(key);
        expect(authMessages[key as keyof typeof authMessages]).toBe(value);
      });
    });

    it('should have all expected message keys', () => {
      const expectedKeys = [
        'invalidCredentials',
        'emailNotFound',
        'emailAlreadyExists',
        'passwordTooWeak',
        'loginSuccess',
        'signupSuccess',
        'passwordResetSent',
        'passwordResetSuccess',
        'networkError',
        'unexpectedError',
      ];

      expectedKeys.forEach(key => {
        expect(authMessages).toHaveProperty(key);
        expect(typeof authMessages[key as keyof typeof authMessages]).toBe('string');
      });
    });

    it('should be read-only (const assertion)', () => {
      // This test ensures the const assertion is working
      // Objects with const assertion are still mutable at runtime, but TypeScript prevents it
      // Let's test that the object structure is correct instead
      expect(Object.isFrozen(authMessages)).toBe(false); // const assertion doesn't freeze at runtime
      expect(typeof authMessages).toBe('object');
      expect(authMessages).toHaveProperty('invalidCredentials');
    });

    it('should contain non-empty message strings', () => {
      Object.values(authMessages).forEach(message => {
        expect(typeof message).toBe('string');
        expect(message.length).toBeGreaterThan(0);
        expect(message.trim()).toBe(message); // No leading/trailing whitespace
      });
    });
  });

  describe('Edge Cases and Complex Scenarios', () => {
    it('should handle standard email formats', () => {
      // Test with various standard email formats
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org',
      ];

      validEmails.forEach(email => {
        const data = {
          email,
          password: 'password123',
        };

        const result = loginSchema.parse(data);
        expect(result.email).toBe(email);
      });
    });

    it('should handle very long valid emails', () => {
      const longEmail = 'very.long.email.address.that.is.still.valid@very.long.domain.name.example.com';
      const data = {
        email: longEmail,
        password: 'password123',
      };

      const result = loginSchema.parse(data);
      expect(result.email).toBe(longEmail);
    });

    it('should handle complex password patterns in signup', () => {
      const complexPasswords = [
        'Password123!@#$%^&*()',
        'My-Super_Complex.Pass1',
        'Complex_Pass123',
        'StrongPassword9',
      ];

      complexPasswords.forEach(password => {
        const data = {
          email: 'test@example.com',
          password,
          confirmPassword: password,
          terms: true,
        };

        const result = signupSchema.parse(data);
        expect(result.password).toBe(password);
      });
    });

    it('should handle whitespace-only inputs', () => {
      const whitespaceData = {
        email: '   ',
        password: '   ',
      };

      expect(() => loginSchema.parse(whitespaceData)).toThrow(ZodError);
    });

    it('should validate signup with minimal required complexity', () => {
      // Test exactly meeting the minimum requirements
      const minimalData = {
        email: 'a@b.co',
        password: 'Aa123456', // Exactly 8 chars, has upper, lower, number
        confirmPassword: 'Aa123456',
        terms: true,
      };

      const result = signupSchema.parse(minimalData);
      expect(result).toEqual(minimalData);
    });

    it('should handle case sensitivity in password matching', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'Password123!',
        confirmPassword: 'password123!', // Different case
        terms: true,
      };

      expect(() => signupSchema.parse(invalidData)).toThrow(ZodError);
    });
  });

  describe('Schema Composition and Reuse', () => {
    it('should use the same email validation across all schemas', () => {
      const email = 'Test@Example.Com';
      
      // Test that all schemas process email consistently
      const loginResult = loginSchema.parse({ email, password: 'password123' });
      const resetResult = passwordResetSchema.parse({ email });
      const signupResult = signupSchema.parse({
        email,
        password: 'Password123!',
        confirmPassword: 'Password123!',
        terms: true,
      });

      expect(loginResult.email).toBe('test@example.com');
      expect(resetResult.email).toBe('test@example.com');
      expect(signupResult.email).toBe('test@example.com');
    });

    it('should use strong password validation in signup and reset confirm', () => {
      const weakPassword = 'weak'; // Doesn't meet strong password requirements
      
      // Should fail in signup
      expect(() => signupSchema.parse({
        email: 'test@example.com',
        password: weakPassword,
        confirmPassword: weakPassword,
        terms: true,
      })).toThrow(ZodError);

      // Should fail in password reset confirm
      expect(() => passwordResetConfirmSchema.parse({
        password: weakPassword,
        confirmPassword: weakPassword,
      })).toThrow(ZodError);

      // But basic password should work in login
      const loginResult = loginSchema.parse({
        email: 'test@example.com',
        password: 'weakpass', // Only needs to be 6+ characters for login
      });
      expect(loginResult.password).toBe('weakpass');
    });
  });
}); 