const MIN_LENGTH = 8;

const PASSWORD_ERRORS = {
  REQUIRED: 'required',
  LENGTH: 'length',
  COMPLEXITY: 'complexity'
};

const hasLower = (password) => /[a-z]/.test(password);
const hasUpper = (password) => /[A-Z]/.test(password);
const hasNumber = (password) => /\d/.test(password);
const hasLetter = (password) => /[a-zA-Z]/.test(password);

/**
 * Validate password against policy (min length, mixed case or digit).
 * @param {string} password
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validatePassword(password) {
  const errors = [];

  if (typeof password !== 'string' || password.trim() === '') {
    errors.push(PASSWORD_ERRORS.REQUIRED);
    return { valid: false, errors };
  }

  if (password.length < MIN_LENGTH) {
    errors.push(PASSWORD_ERRORS.LENGTH);
  }

  const mixedCase = hasLower(password) && hasUpper(password);
  if (!hasLetter(password) || !(mixedCase || hasNumber(password))) {
    errors.push(PASSWORD_ERRORS.COMPLEXITY);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

module.exports = {
  MIN_LENGTH,
  PASSWORD_ERRORS,
  validatePassword
};
