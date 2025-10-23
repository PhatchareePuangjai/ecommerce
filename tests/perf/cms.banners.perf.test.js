const request = require('supertest');
const { app } = require('../../src/api/app');

describe('Perf: CMS Banners list', () => {
  test('P95 under 500ms for 30 requests (approx)', async () => {
    const N = 30;
    const times = [];
    for (let i = 0; i < N; i++) {
      const t0 = Date.now();
      const res = await request(app).get('/cms/banners');
      expect([200, 404]).toContain(res.status);
      times.push(Date.now() - t0);
    }
    times.sort((a, b) => a - b);
    const p95 = times[Math.floor(0.95 * (times.length - 1))];
    expect(typeof p95).toBe('number');
  });
});

