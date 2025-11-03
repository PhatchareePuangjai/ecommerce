const crypto = require('crypto');

const REQUIRED_FIELDS = ['label', 'recipient', 'line1', 'city', 'state', 'postalCode', 'country'];

function normalizeString(value) {
  if (typeof value !== 'string') return value;
  return value.trim();
}

function validateAddress(input = {}) {
  const errors = [];
  const value = { ...input };

  REQUIRED_FIELDS.forEach((field) => {
    const val = normalizeString(value[field]);
    if (!val) {
      errors.push(field);
    } else {
      value[field] = val;
    }
  });

  if (value.country) {
    value.country = value.country.toUpperCase();
  }

  value.label = normalizeString(value.label);
  value.recipient = normalizeString(value.recipient);
  value.line1 = normalizeString(value.line1);
  value.line2 = normalizeString(value.line2) || null;
  value.city = normalizeString(value.city);
  value.state = normalizeString(value.state);
  value.postalCode = normalizeString(value.postalCode);
  value.phone = normalizeString(value.phone) || null;
  value.isDefaultShipping = Boolean(value.isDefaultShipping);

  return {
    valid: errors.length === 0,
    errors,
    value
  };
}

function createAddress(payload, { now = new Date(), id = crypto.randomUUID() } = {}) {
  const { valid, errors, value } = validateAddress(payload);
  if (!valid) {
    const error = new Error('invalid_address');
    error.errors = errors;
    throw error;
  }

  return {
    id,
    label: value.label,
    recipient: value.recipient,
    line1: value.line1,
    line2: value.line2,
    city: value.city,
    state: value.state,
    postalCode: value.postalCode,
    country: value.country,
    phone: value.phone,
    isDefaultShipping: value.isDefaultShipping,
    createdAt: now,
    updatedAt: now
  };
}

module.exports = {
  createAddress,
  validateAddress
};
