const metrics = require('../../src/observability/metrics');

describe('Observability Metrics Scaffold', () => {
  beforeEach(() => metrics.resetAll());

  test('status reflection latency is computed', () => {
    const id = 'status-1';
    const t0 = 1_000_000;
    const t1 = t0 + 42_000; // 42s
    metrics.startStatusEvent(id, t0);
    metrics.markStatusReflected(id, t1);
    const lat = metrics.getStatusReflectionLatencyMs(id);
    expect(lat).toBe(42_000);
  });

  test('notification handoff latency is computed', () => {
    const id = 'notif-1';
    const s0 = 2_000_000;
    const s1 = s0 + 120_000; // 2 minutes
    metrics.startNotificationHandoff(id, s0);
    metrics.markNotificationHandedOff(id, s1);
    const lat = metrics.getNotificationHandoffLatencyMs(id);
    expect(lat).toBe(120_000);
  });
});

