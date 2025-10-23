const { resetAll, getCounter } = require('../../src/observability/metrics');
const { createArticle, articleAction, createBanner, updateBanner, bannerAction } = require('../../src/services/cms/store');

describe('Observability: CMS metrics', () => {
  beforeEach(() => resetAll());

  test('increments counters on article publish/unpublish', () => {
    const a = createArticle({ title: 'A', body: 'B' });
    articleAction(a.id, 'submit');
    articleAction(a.id, 'approve');
    articleAction(a.id, 'publish');
    expect(getCounter('cms.article.publish')).toBe(1);
    articleAction(a.id, 'unpublish');
    expect(getCounter('cms.article.unpublish')).toBe(1);
  });

  test('increments counters on banner publish/unpublish and schedule change', () => {
    const b = createBanner({ title: 'B', mediaUrl: 'u', position: 'home' });
    bannerAction(b.id, 'publish');
    expect(getCounter('cms.banner.publish')).toBe(1);
    updateBanner(b.id, { schedule: { startAt: new Date().toISOString() } });
    expect(getCounter('cms.banner.schedule_changed')).toBe(1);
    bannerAction(b.id, 'unpublish');
    expect(getCounter('cms.banner.unpublish')).toBe(1);
  });
});

