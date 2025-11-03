const { createAddress, validateAddress } = require('../../src/models/auth/address');

const basePayload = {
  label: 'Home',
  recipient: 'Pat Lee',
  line1: '123 Market St',
  city: 'San Francisco',
  state: 'CA',
  postalCode: '94105',
  country: 'US',
  isDefaultShipping: true,
  phone: '+14155550123'
};

describe('Address Model', () => {
  test('createAddress generates id and timestamps', () => {
    const address = createAddress(basePayload, { now: new Date('2025-11-02T09:00:00.000Z') });
    expect(address).toMatchObject({
      label: 'Home',
      recipient: 'Pat Lee',
      country: 'US',
      isDefaultShipping: true,
      createdAt: new Date('2025-11-02T09:00:00.000Z'),
      updatedAt: new Date('2025-11-02T09:00:00.000Z')
    });
    expect(address.id).toEqual(expect.any(String));
  });

  test('validateAddress requires mandatory fields', () => {
    const { valid, errors } = validateAddress({});
    expect(valid).toBe(false);
    expect(errors).toEqual(expect.arrayContaining(['label', 'recipient', 'line1', 'city', 'state', 'postalCode', 'country']));
  });

  test('validateAddress normalizes country codes and trims strings', () => {
    const payload = {
      ...basePayload,
      label: ' Home ',
      country: 'us'
    };
    const { valid, value } = validateAddress(payload);
    expect(valid).toBe(true);
    expect(value.label).toBe('Home');
    expect(value.country).toBe('US');
  });
});
