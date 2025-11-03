function createMailer({ transport }) {
  if (!transport || typeof transport.send !== 'function') {
    throw new Error('transport.send is required');
  }

  return {
    async sendVerification({ email, token, expiresAt }) {
      await transport.send({
        to: email,
        type: 'verify',
        subject: 'Verify your account',
        meta: {
          token,
          expiresAt
        }
      });
    },

    async sendPasswordReset({ email, token, expiresAt }) {
      await transport.send({
        to: email,
        type: 'reset',
        subject: 'Reset your password',
        meta: {
          token,
          expiresAt
        }
      });
    }
  };
}

function createMailboxTransport(mailbox) {
  return {
    async send(message) {
      mailbox.push(message);
    }
  };
}

module.exports = {
  createMailer,
  createMailboxTransport
};
