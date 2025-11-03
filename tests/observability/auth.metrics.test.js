const metrics = require('../../src/observability/metrics');

describe('Auth Metrics', () => {
  beforeEach(() => {
    metrics.resetAll();
  });

  test('records login successes and failures', () => {
    metrics.recordAuthLoginSuccess();
    metrics.recordAuthLoginFailure();
    metrics.recordAuthLoginFailure();

    expect(metrics.getCounter('auth.login.success')).toBe(1);
    expect(metrics.getCounter('auth.login.failure')).toBe(2);
  });

  test('records lockouts and reset flows', () => {
    metrics.recordAuthLockout();
    metrics.recordAuthResetRequested();
    metrics.recordAuthResetCompleted();
    metrics.recordAuthResetFailed();
    metrics.recordAuthResetFailed();

    expect(metrics.getCounter('auth.lockout.triggered')).toBe(1);
    expect(metrics.getCounter('auth.reset.requested')).toBe(1);
    expect(metrics.getCounter('auth.reset.completed')).toBe(1);
    expect(metrics.getCounter('auth.reset.failed')).toBe(2);
  });
});
