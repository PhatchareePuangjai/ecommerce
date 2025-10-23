const request = require('supertest');
const { app } = require('../../src/api/app');

describe('Integration: CMS Banners scheduling', () => {
  test('only active banners are visible and sorted by publishedAt then order', async () => {
    // future banner
    let res = await request(app)
      .post('/cms/banners')
      .send({ title: 'Future', mediaUrl: 'u', position: 'home', order: 1, schedule: { startAt: '2999-01-01T00:00:00Z' } });
    const futureId = res.body.id;
    await request(app).put(`/cms/banners/${futureId}`).send({ action: 'publish' });

    // past banner
    res = await request(app)
      .post('/cms/banners')
      .send({ title: 'Past', mediaUrl: 'u', position: 'home', order: 1, schedule: { endAt: '2000-01-01T00:00:00Z' } });
    const pastId = res.body.id;
    await request(app).put(`/cms/banners/${pastId}`).send({ action: 'publish' });

    // active banners A (older publishAt)
    res = await request(app)
      .post('/cms/banners')
      .send({ title: 'ActiveA', mediaUrl: 'u', position: 'home', order: 1 });
    const activeA = res.body.id;
    await request(app).put(`/cms/banners/${activeA}`).send({ action: 'publish' });
    await request(app).put(`/cms/banners/${activeA}`).send({ publishedAt: '2025-01-01T00:00:00Z' });

    // active banners B (newer publishAt, lower order)
    res = await request(app)
      .post('/cms/banners')
      .send({ title: 'ActiveB', mediaUrl: 'u', position: 'home', order: 0 });
    const activeB = res.body.id;
    await request(app).put(`/cms/banners/${activeB}`).send({ action: 'publish' });
    await request(app).put(`/cms/banners/${activeB}`).send({ publishedAt: '2025-12-31T00:00:00Z' });

    // active banners C (same publishAt as A but higher order)
    res = await request(app)
      .post('/cms/banners')
      .send({ title: 'ActiveC', mediaUrl: 'u', position: 'home', order: 5 });
    const activeC = res.body.id;
    await request(app).put(`/cms/banners/${activeC}`).send({ action: 'publish' });
    await request(app).put(`/cms/banners/${activeC}`).send({ publishedAt: '2025-01-01T00:00:00Z' });

    const list = await request(app).get('/cms/banners');
    expect(list.status).toBe(200);
    const ids = list.body.items.map((b) => b.id);
    expect(ids).toEqual([activeB, activeC, activeA]);
    expect(ids).not.toContain(futureId);
    expect(ids).not.toContain(pastId);
  });
});

