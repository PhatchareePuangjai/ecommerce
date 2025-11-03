const { createProfileService } = require('../../src/services/auth/profile');

describe('Profile Service', () => {
  let store;
  let service;
  let now;

  beforeEach(() => {
    now = new Date('2025-11-02T09:30:00.000Z');
    store = {
      getUserById: jest.fn(async (id) =>
        id === 'user-1'
          ? {
              id: 'user-1',
              email: 'user@example.com',
              firstName: 'Test',
              lastName: 'User',
              addresses: [],
              defaultPaymentTokenId: null
            }
          : null
      ),
      updateProfile: jest.fn(async () => ({
        id: 'user-1',
        email: 'user@example.com',
        firstName: 'New',
        lastName: 'Name',
        addresses: [],
        defaultPaymentTokenId: null
      })),
      listAddresses: jest.fn(async () => []),
      addAddress: jest.fn(async (userId, address) => ({
        ...address,
        id: 'addr-1',
        userId
      })),
      removeAddress: jest.fn(async () => true),
      setDefaultAddress: jest.fn(async () => true)
    };
    service = createProfileService({
      store,
      clock: () => new Date(now)
    });
  });

  test('getProfile returns user with addresses', async () => {
    store.listAddresses.mockResolvedValue([
      { id: 'addr-1', label: 'Home', isDefaultShipping: true }
    ]);
    const profile = await service.getProfile('user-1');
    expect(store.getUserById).toHaveBeenCalledWith('user-1');
    expect(profile.addresses).toHaveLength(1);
  });

  test('updateProfile saves basic fields', async () => {
    const result = await service.updateProfile('user-1', { firstName: 'New', lastName: 'Name' });
    expect(store.updateProfile).toHaveBeenCalledWith('user-1', {
      firstName: 'New',
      lastName: 'Name',
      defaultPaymentTokenId: undefined
    });
    expect(result.firstName).toBe('New');
  });

  test('addAddress validates and stores address, enforcing max limit', async () => {
    store.listAddresses.mockResolvedValue([
      { id: 'addr-1', isDefaultShipping: true },
      { id: 'addr-2', isDefaultShipping: false },
      { id: 'addr-3', isDefaultShipping: false },
      { id: 'addr-4', isDefaultShipping: false },
      { id: 'addr-5', isDefaultShipping: false }
    ]);
    const payload = {
      label: 'Work',
      recipient: 'Pat',
      line1: '456 Mission St',
      city: 'SF',
      state: 'CA',
      postalCode: '94105',
      country: 'US',
      isDefaultShipping: false
    };
    await expect(service.addAddress('user-1', payload)).rejects.toThrow('address_limit');

    store.listAddresses.mockResolvedValue([{ id: 'addr-1', isDefaultShipping: true }]);
    const address = await service.addAddress('user-1', payload);
    expect(store.addAddress).toHaveBeenCalled();
    expect(address.label).toBe('Work');
  });

  test('removeAddress delegates to store', async () => {
    await service.removeAddress('user-1', 'addr-1');
    expect(store.removeAddress).toHaveBeenCalledWith('user-1', 'addr-1');
  });
});
