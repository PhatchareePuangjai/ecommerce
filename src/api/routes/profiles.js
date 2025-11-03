const express = require('express');

const authStore = require('../../services/auth/store');
const { createSessionService } = require('../../services/auth/session');
const { createProfileService } = require('../../services/auth/profile');

const router = express.Router();

const sessionService = createSessionService({ store: authStore });
const profileService = createProfileService({ store: authStore });

async function requireAuth(req, res, next) {
  const header = req.get('authorization') || '';
  const [scheme, token] = header.split(' ');
  if (!token || scheme?.toLowerCase() !== 'bearer') {
    return res.status(401).json({ error: 'invalid_token' });
  }

  const session = await sessionService.validate(token);
  if (!session) {
    return res.status(401).json({ error: 'invalid_token' });
  }

  req.auth = { userId: session.userId, token };
  return next();
}

router.use(requireAuth);

router.get('/', async (req, res) => {
  try {
    const profile = await profileService.getProfile(req.auth.userId);
    if (!profile) {
      return res.status(404).json({ error: 'not_found' });
    }
    return res.status(200).json(profile);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('get_profile_error', err);
    return res.status(500).json({ error: 'server_error' });
  }
});

router.put('/', async (req, res) => {
  try {
    const { firstName, lastName, defaultPaymentTokenId } = req.body || {};
    const profile = await profileService.updateProfile(req.auth.userId, {
      firstName,
      lastName,
      defaultPaymentTokenId
    });
    if (!profile) {
      return res.status(404).json({ error: 'not_found' });
    }
    return res.status(200).json(profile);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('update_profile_error', err);
    return res.status(500).json({ error: 'server_error' });
  }
});

router.post('/addresses', async (req, res) => {
  try {
    let address;
    try {
      address = await profileService.addAddress(req.auth.userId, req.body || {});
    } catch (err) {
      if (err instanceof Error && err.message === 'address_limit') {
        return res.status(400).json({ error: 'address_limit' });
      }
      if (err instanceof Error && err.message === 'invalid_address') {
        return res.status(400).json({ error: 'invalid_address', details: err.errors || [] });
      }
      throw err;
    }

    return res.status(201).json(address);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('add_address_error', err);
    return res.status(500).json({ error: 'server_error' });
  }
});

router.delete('/addresses/:addressId', async (req, res) => {
  try {
    const removed = await profileService.removeAddress(req.auth.userId, req.params.addressId);
    if (!removed) {
      return res.status(404).json({ error: 'not_found' });
    }
    return res.status(204).send();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('delete_address_error', err);
    return res.status(500).json({ error: 'server_error' });
  }
});

module.exports = { router };
