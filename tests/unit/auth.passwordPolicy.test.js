const { validatePassword, PASSWORD_ERRORS } = require('../../src/services/auth/passwordPolicy');

describe('Password Policy Validation', () => {
  test('accepts password meeting length and complexity requirements', () => {
    const result = validatePassword('Secure123');
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('rejects passwords shorter than 8 characters', () => {
    const result = validatePassword('Short1');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain(PASSWORD_ERRORS.LENGTH);
  });

  test('rejects passwords without mixed case or number', () => {
    const result = validatePassword('alllowercase');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain(PASSWORD_ERRORS.COMPLEXITY);
  });

  test('rejects empty passwords', () => {
    const result = validatePassword('');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain(PASSWORD_ERRORS.REQUIRED);
  });
});
