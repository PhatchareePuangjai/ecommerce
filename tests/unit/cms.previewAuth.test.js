const express = require('express');
const request = require('supertest');
const { requirePreviewRole } = require('../../src/services/cms/previewAuth');

describe('CMS Preview Auth Middleware', () => {
  const app = express();
  app.get('/preview', requirePreviewRole(), (req, res) => res.json({ ok: true }));

  test('403 without role header', async () => {
    const res = await request(app).get('/preview');
    expect(res.status).toBe(403);
  });

  test('200 with editor role', async () => {
    const res = await request(app).get('/preview').set('x-preview-role', 'editor');
    expect(res.status).toBe(200);
  });
});

