const { createAddress } = require('../../models/auth/address');

const MAX_ADDRESSES = 5;

function createProfileService({ store, clock = () => new Date() } = {}) {
  if (!store || typeof store.getUserById !== 'function') {
    throw new Error('store.getUserById is required');
  }

  return {
    async getProfile(userId) {
      const user = await store.getUserById(userId);
      if (!user) return null;
      const addresses = await store.listAddresses(userId);
      return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isVerified: user.isVerified,
        defaultPaymentTokenId: user.defaultPaymentTokenId,
        addresses
      };
    },

    async updateProfile(userId, payload) {
      const updates = {};
      if (Object.prototype.hasOwnProperty.call(payload, 'firstName') && payload.firstName !== undefined) {
        updates.firstName = payload.firstName;
      }
      if (Object.prototype.hasOwnProperty.call(payload, 'lastName') && payload.lastName !== undefined) {
        updates.lastName = payload.lastName;
      }
      if (Object.prototype.hasOwnProperty.call(payload, 'defaultPaymentTokenId')) {
        updates.defaultPaymentTokenId = payload.defaultPaymentTokenId;
      }

      await store.updateProfile(userId, updates);
      return this.getProfile(userId);
    },

    async addAddress(userId, payload) {
      const existing = await store.listAddresses(userId);
      if (existing.length >= MAX_ADDRESSES) {
        throw new Error('address_limit');
      }
      const now = clock();
      const addressPayload = { ...payload };
      if (existing.length === 0 && !addressPayload.isDefaultShipping) {
        addressPayload.isDefaultShipping = true;
      }
      const address = createAddress(addressPayload, { now });
      const stored = await store.addAddress(userId, address);
      return stored;
    },

    async removeAddress(userId, addressId) {
      return store.removeAddress(userId, addressId);
    }
  };
}

module.exports = {
  createProfileService,
  MAX_ADDRESSES
};
