const crypto = require('crypto');
const { promisify } = require('util');

const scrypt = promisify(crypto.scrypt);
const KEY_LENGTH = 64;

async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = await scrypt(password, salt, KEY_LENGTH);
  return `${salt}:${derivedKey.toString('hex')}`;
}

async function verifyPassword(password, storedHash) {
  const [salt, key] = storedHash.split(':');
  if (!salt || !key) {
    throw new Error('invalid_hash');
  }
  const derivedKey = await scrypt(password, salt, KEY_LENGTH);
  return crypto.timingSafeEqual(Buffer.from(key, 'hex'), Buffer.from(derivedKey.toString('hex'), 'hex'));
}

module.exports = {
  hashPassword,
  verifyPassword
};
