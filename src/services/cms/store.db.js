const { query } = require('../../db');
const { validateContent } = require('../../models/cms/content');
const { validateBanner } = require('../../models/cms/banner');
const { isVisible, resolveBanners } = require('./scheduling');
const { transition } = require('./workflow');
const { incCounter } = require('../../observability/metrics');

// Helper to map DB rows to objects
function mapArticle(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    section: row.section,
    status: row.status,
    schedule: { startAt: row.schedule_start, endAt: row.schedule_end },
    publishedAt: row.published_at,
    authorId: row.author_id,
    audit: row.audit || [],
  };
}

function mapBanner(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    mediaUrl: row.media_url,
    linkUrl: row.link_url,
    position: row.position,
    order: row.sort_order,
    status: row.status,
    schedule: { startAt: row.schedule_start, endAt: row.schedule_end },
    publishedAt: row.published_at,
    audit: row.audit || [],
  };
}

// Articles
async function createArticle(input) {
  const draft = { ...input, status: 'draft' };
  const { valid, value, errors } = validateContent(draft);
  if (!valid) {
    const err = new Error('validation failed');
    err.details = errors;
    throw err;
  }
  const res = await query(
    `INSERT INTO cms_articles (title, body, section, status, schedule_start, schedule_end, author_id, audit)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     RETURNING id, title, body, section, status, schedule_start, schedule_end, published_at, author_id, audit`,
    [
      value.title,
      value.body,
      value.section || null,
      value.status,
      value.schedule?.startAt || null,
      value.schedule?.endAt || null,
      value.authorId || null,
      JSON.stringify([]),
    ]
  );
  return mapArticle(res.rows[0]);
}

async function getArticle(id) {
  const res = await query('SELECT * FROM cms_articles WHERE id=$1', [id]);
  return mapArticle(res.rows[0]);
}

async function updateArticle(id, patch = {}) {
  const current = await getArticle(id);
  if (!current) return null;
  const merged = { ...current, ...patch };
  const { valid, value, errors } = validateContent(merged);
  if (!valid) {
    const err = new Error('validation failed');
    err.details = errors;
    throw err;
  }
  const res = await query(
    `UPDATE cms_articles SET title=$2, body=$3, section=$4, status=$5, schedule_start=$6, schedule_end=$7, author_id=$8
     WHERE id=$1
     RETURNING *`,
    [
      id,
      value.title,
      value.body,
      value.section || null,
      value.status,
      value.schedule?.startAt || null,
      value.schedule?.endAt || null,
      value.authorId || null,
    ]
  );
  return mapArticle(res.rows[0]);
}

async function articleAction(id, action, actor = 'system') {
  const current = await getArticle(id);
  if (!current) return null;
  const updated = transition(current, action, actor);
  const audit = Array.isArray(current.audit) ? current.audit : [];
  const entry = { at: new Date().toISOString(), actor, action, from: current.status, to: updated.status };
  audit.push(entry);
  const res = await query(
    `UPDATE cms_articles SET status=$2, published_at=$3, audit=$4::jsonb WHERE id=$1 RETURNING *`,
    [id, updated.status, updated.publishedAt || null, JSON.stringify(audit)]
  );
  if (action === 'publish') incCounter('cms.article.publish');
  if (action === 'unpublish') incCounter('cms.article.unpublish');
  return mapArticle(res.rows[0]);
}

async function listPublishedArticles(now = new Date()) {
  const res = await query(
    `SELECT * FROM cms_articles
     WHERE status='published'
       AND (schedule_start IS NULL OR schedule_start <= $1)
       AND (schedule_end IS NULL OR schedule_end >= $1)
     ORDER BY published_at DESC NULLS LAST`,
    [new Date(now).toISOString()]
  );
  return res.rows.map(mapArticle).filter((a) => isVisible(a, now));
}

// Banners
async function createBanner(input) {
  const draft = { ...input, status: 'draft' };
  const { valid, value, errors } = validateBanner(draft);
  if (!valid) {
    const err = new Error('validation failed');
    err.details = errors;
    throw err;
  }
  const res = await query(
    `INSERT INTO cms_banners (title, media_url, link_url, position, sort_order, status, schedule_start, schedule_end, audit)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     RETURNING *`,
    [
      value.title,
      value.mediaUrl,
      value.linkUrl || null,
      value.position,
      value.order || 0,
      value.status,
      value.schedule?.startAt || null,
      value.schedule?.endAt || null,
      JSON.stringify([]),
    ]
  );
  return mapBanner(res.rows[0]);
}

async function getBanner(id) {
  const res = await query('SELECT * FROM cms_banners WHERE id=$1', [id]);
  return mapBanner(res.rows[0]);
}

async function updateBanner(id, patch = {}) {
  const current = await getBanner(id);
  if (!current) return null;
  const merged = { ...current, ...patch };
  const { valid, value, errors } = validateBanner(merged);
  if (!valid) {
    const err = new Error('validation failed');
    err.details = errors;
    throw err;
  }
  const res = await query(
    `UPDATE cms_banners SET title=$2, media_url=$3, link_url=$4, position=$5, sort_order=$6, status=$7, schedule_start=$8, schedule_end=$9
     WHERE id=$1
     RETURNING *`,
    [
      id,
      value.title,
      value.mediaUrl,
      value.linkUrl || null,
      value.position,
      value.order || 0,
      value.status,
      value.schedule?.startAt || null,
      value.schedule?.endAt || null,
    ]
  );
  if (
    patch.schedule &&
    (patch.schedule.startAt !== current.schedule?.startAt || patch.schedule.endAt !== current.schedule?.endAt)
  ) {
    incCounter('cms.banner.schedule_changed');
  }
  return mapBanner(res.rows[0]);
}

async function bannerAction(id, action, actor = 'system') {
  const current = await getBanner(id);
  if (!current) return null;
  let status;
  if (action === 'publish') status = 'published';
  else if (action === 'unpublish') status = 'draft';
  else {
    const err = new Error(`invalid banner action: ${action}`);
    err.code = 'INVALID_ACTION';
    throw err;
  }
  const audit = Array.isArray(current.audit) ? current.audit : [];
  const entry = { at: new Date().toISOString(), actor, action, from: current.status, to: status };
  audit.push(entry);
  const res = await query(
    `UPDATE cms_banners SET status=$2, published_at=$3, audit=$4::jsonb WHERE id=$1 RETURNING *`,
    [id, status, status === 'published' ? new Date().toISOString() : null, JSON.stringify(audit)]
  );
  if (action === 'publish') incCounter('cms.banner.publish');
  if (action === 'unpublish') incCounter('cms.banner.unpublish');
  return mapBanner(res.rows[0]);
}

async function listVisibleBanners(now = new Date()) {
  const res = await query(
    `SELECT * FROM cms_banners
     WHERE status='published'
       AND (schedule_start IS NULL OR schedule_start <= $1)
       AND (schedule_end IS NULL OR schedule_end >= $1)`,
    [new Date(now).toISOString()]
  );
  const list = res.rows.map(mapBanner).filter((b) => isVisible(b, now));
  return resolveBanners(list, now);
}

module.exports = {
  createArticle,
  getArticle,
  updateArticle,
  articleAction,
  listPublishedArticles,
  createBanner,
  getBanner,
  updateBanner,
  bannerAction,
  listVisibleBanners,
};

