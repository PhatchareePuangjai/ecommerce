const { isVisible, resolveBanners } = require('../../src/services/cms/scheduling');

describe('CMS Scheduling', () => {
  const now = new Date('2025-10-10T12:00:00Z');

  test('visibility based on status and schedule', () => {
    expect(isVisible({ status: 'draft' }, now)).toBe(false);
    expect(isVisible({ status: 'published', schedule: {} }, now)).toBe(true);
    expect(
      isVisible({ status: 'published', schedule: { startAt: '2025-10-10T13:00:00Z' } }, now)
    ).toBe(false);
    expect(
      isVisible({ status: 'published', schedule: { endAt: '2025-10-10T13:00:00Z' } }, now)
    ).toBe(true);
  });

  test('resolveBanners sorts by publishedAt then order', () => {
    const list = [
      { id: 'A', status: 'published', order: 1, publishedAt: '2025-10-10T10:00:00Z' },
      { id: 'B', status: 'published', order: 5, publishedAt: '2025-10-09T10:00:00Z' },
      { id: 'C', status: 'published', order: 3, publishedAt: '2025-10-10T11:00:00Z' },
    ];
    const out = resolveBanners(list, now).map((b) => b.id);
    expect(out).toEqual(['C', 'A', 'B']);
  });
});

