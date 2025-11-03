const express = require('express');

const { validatePassword, PASSWORD_ERRORS } = require('../../services/auth/passwordPolicy');
const { hashPassword, verifyPassword } = require('../../services/auth/passwordHasher');
const authStore = require('../../services/auth/store');
const { createVerificationService, VerificationError } = require('../../services/auth/verification');
const { createLockoutService } = require('../../services/auth/lockout');
const { createSessionService } = require('../../services/auth/session');
const { createMailer, createMailboxTransport } = require('../../services/auth/mailer');
const { createResetService, ResetError } = require('../../services/auth/reset');
const metrics = require('../../observability/metrics');

const router = express.Router();

const mailbox = [];

const transport = createMailboxTransport(mailbox);
const mailer = createMailer({ transport });

const verificationService = createVerificationService({
  mailer,
  tokenStore: {
    replaceVerificationToken: authStore.replaceVerificationToken,
    findVerificationToken: authStore.findVerificationToken,
    markTokenConsumed: authStore.markTokenConsumed,
    deleteVerificationToken: authStore.deleteVerificationToken
  }
});

const lockoutService = createLockoutService({ store: authStore });
const sessionService = createSessionService({ store: authStore });
const resetService = createResetService({
  store: authStore,
  mailer,
  lockoutService,
  passwordHasher: { hashPassword }
});

function getMailbox(app) {
  if (!app.locals.mailbox || app.locals.mailbox !== mailbox) {
    app.locals.mailbox = mailbox;
  }
  return mailbox;
}

function isValidEmail(email) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
}

router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName = null, lastName = null } = req.body || {};

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ error: 'invalid_email', message: 'Valid email required' });
    }

    const passwordResult = validatePassword(password);
    if (!passwordResult.valid) {
      const status = passwordResult.errors.includes(PASSWORD_ERRORS.LENGTH) ? 400 : 400;
      return res.status(status).json({ error: 'invalid_password', message: passwordResult.errors.join(',') });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existing = await authStore.findUserByEmail(normalizedEmail);
    if (existing) {
      return res.status(409).json({ error: 'user_exists', message: 'Email already registered' });
    }

    const passwordHash = await hashPassword(password);
    let user;
    try {
      user = await authStore.createUser({
        email: normalizedEmail,
        passwordHash,
        firstName,
        lastName,
        now: new Date()
      });
    } catch (error) {
      if (error && error.code === '23505') {
        return res.status(409).json({ error: 'user_exists', message: 'Email already registered' });
      }
      throw error;
    }

    const verification = await verificationService.issue({
      userId: user.id,
      email: user.email
    });

    getMailbox(req.app); // ensure mailbox reflected in app.locals

    return res.status(201).json({
      id: user.id,
      email: normalizedEmail,
      isVerified: false,
      verification: {
        status: 'pending',
        expiresAt: verification.expiresAt.toISOString()
      }
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('register_error', err);
    return res.status(500).json({ error: 'server_error' });
  }
});

router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body || {};
    if (!token || typeof token !== 'string') {
      return res.status(400).json({ error: 'invalid_token', message: 'Token required' });
    }

    let userId;
    try {
      const result = await verificationService.verify(token);
      userId = result.userId;
    } catch (error) {
      if (error instanceof VerificationError) {
        return res.status(400).json({ error: 'invalid_token', message: 'Token invalid or expired' });
      }
      throw error;
    }

    await authStore.markUserVerified(userId, new Date());

    return res.status(204).send();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('verify_error', err);
    return res.status(500).json({ error: 'server_error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password || !isValidEmail(email)) {
      return res.status(400).json({ error: 'invalid_request', message: 'Email and password required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await authStore.findUserByEmail(normalizedEmail);
    if (!user) {
      metrics.recordAuthLoginFailure();
      return res.status(401).json({ error: 'invalid_credentials' });
    }

    const lockStatus = lockoutService.isLocked(user);
    if (lockStatus.locked) {
      metrics.recordAuthLockout();
      return res.status(403).json({ error: 'account_locked', retryAfter: lockStatus.retryAfter });
    }

    let passwordValid = false;
    try {
      passwordValid = await verifyPassword(password, user.passwordHash);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('verify_password_error', err);
    }

    if (!passwordValid) {
      metrics.recordAuthLoginFailure();
      const failure = await lockoutService.recordFailure(user);
      if (failure.locked) {
        metrics.recordAuthLockout();
        return res.status(403).json({ error: 'account_locked', retryAfter: failure.retryAfter });
      }
      return res.status(401).json({ error: 'invalid_credentials' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ error: 'email_unverified' });
    }

    await lockoutService.recordSuccess(user);
    metrics.recordAuthLoginSuccess();

    const session = await sessionService.issue(user.id, {
      userAgent: req.get('user-agent') || null,
      ip: req.ip || null
    });

    return res.status(200).json({
      accessToken: session.token,
      tokenType: 'Bearer',
      expiresIn: session.expiresIn
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('login_error', err);
    return res.status(500).json({ error: 'server_error' });
  }
});

router.post('/logout', async (req, res) => {
  try {
    const authHeader = req.get('authorization') || '';
    const [, token] = authHeader.split(' ');

    if (!token) {
      return res.status(401).json({ error: 'invalid_token' });
    }

    const revoked = await sessionService.revoke(token);
    if (!revoked) {
      return res.status(401).json({ error: 'invalid_token' });
    }

    return res.status(204).send();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('logout_error', err);
    return res.status(500).json({ error: 'server_error' });
  }
});

router.post('/password/forgot', async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email || !isValidEmail(email)) {
      return res.status(202).send();
    }

    const result = await resetService.requestReset(email);
    if (result.delivered) {
      metrics.recordAuthResetRequested();
    }
    return res.status(202).send();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('forgot_password_error', err);
    return res.status(500).json({ error: 'server_error' });
  }
});

router.post('/password/reset', async (req, res) => {
  try {
    const { token, newPassword } = req.body || {};
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'invalid_request' });
    }

    try {
      await resetService.completeReset({ token, newPassword });
    } catch (error) {
      if (error instanceof ResetError) {
        if (error.code === 'invalid_password') {
          metrics.recordAuthResetFailed();
          return res.status(400).json({ error: 'invalid_password', details: error.details });
        }
        metrics.recordAuthResetFailed();
        return res.status(400).json({ error: error.code });
      }
      throw error;
    }

    metrics.recordAuthResetCompleted();
    return res.status(204).send();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('reset_password_error', err);
    return res.status(500).json({ error: 'server_error' });
  }
});

module.exports = { router, mailbox };
