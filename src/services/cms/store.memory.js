// Simple in-memory store for CMS data. Suitable for tests and local runs.
const { validateContent } = require('../../models/cms/content');
const { validateBanner } = require('../../models/cms/banner');
const { isVisible, resolveBanners } = require('./scheduling');
const { transition } = require('./workflow');
const { incCounter } = require('../../observability/metrics');

let articleSeq = 1;
let bannerSeq = 1;

const articles = new Map(); // id -> article
const banners = new Map(); // id -> banner

function nextArticleId() { return `ART${articleSeq++}`; }
function nextBannerId() { return `BAN${bannerSeq++}`; }

// Articles
function createArticle(input) {
  const base = { ...input, id: nextArticleId(), status: 'draft' };
  const { valid, value, errors } = validateContent(base);
  if (!valid) {
    const err = new Error('validation failed');
    err.details = errors;
    throw err;
  }
  articles.set(value.id, value);
  return value;
}

function getArticle(id) { return articles.get(id) || null; }

function updateArticle(id, patch = {}) {
  const current = getArticle(id);
  if (!current) return null;
  const merged = { ...current, ...patch };
  const { valid, value, errors } = validateContent(merged);
  if (!valid) {
    const err = new Error('validation failed');
    err.details = errors;
    throw err;
  }
  articles.set(id, value);
  return value;
}

function articleAction(id, action, actor = 'system') {
  const current = getArticle(id);
  if (!current) return null;
  const updated = transition(current, action, actor);
  articles.set(id, updated);
  if (action === 'publish') incCounter('cms.article.publish');
  if (action === 'unpublish') incCounter('cms.article.unpublish');
  return updated;
}

function listPublishedArticles(now = new Date()) {
  const out = [];
  for (const a of articles.values()) {
    if (isVisible(a, now)) out.push(a);
  }
  return out;
}

// Banners
function createBanner(input) {
  const base = { ...input, id: nextBannerId(), status: 'draft' };
  const { valid, value, errors } = validateBanner(base);
  if (!valid) {
    const err = new Error('validation failed');
    err.details = errors;
    throw err;
  }
  banners.set(value.id, value);
  return value;
}

function getBanner(id) { return banners.get(id) || null; }

function updateBanner(id, patch = {}) {
  const current = getBanner(id);
  if (!current) return null;
  const merged = { ...current, ...patch };
  const { valid, value, errors } = validateBanner(merged);
  if (!valid) {
    const err = new Error('validation failed');
    err.details = errors;
    throw err;
  }
  if (
    patch.schedule &&
    JSON.stringify(patch.schedule) !== JSON.stringify(current.schedule)
  ) {
    incCounter('cms.banner.schedule_changed');
  }
  banners.set(id, value);
  return value;
}

function bannerAction(id, action, actor = 'system', at = new Date()) {
  const current = getBanner(id);
  if (!current) return null;
  const updated = { ...current };
  if (action === 'publish') {
    updated.status = 'published';
    updated.publishedAt = new Date(at).toISOString();
    incCounter('cms.banner.publish');
  } else if (action === 'unpublish') {
    updated.status = 'draft';
    updated.publishedAt = null;
    incCounter('cms.banner.unpublish');
  } else {
    const err = new Error(`invalid banner action: ${action}`);
    err.code = 'INVALID_ACTION';
    throw err;
  }
  const entry = { at: new Date(at).toISOString(), actor, action, from: current.status, to: updated.status };
  updated.audit = Array.isArray(current.audit) ? [...current.audit, entry] : [entry];
  banners.set(id, updated);
  return updated;
}

function listVisibleBanners(now = new Date()) {
  return resolveBanners(Array.from(banners.values()), now);
}

module.exports = {
  // articles
  createArticle,
  getArticle,
  updateArticle,
  articleAction,
  listPublishedArticles,
  // banners
  createBanner,
  getBanner,
  updateBanner,
  bannerAction,
  listVisibleBanners,
};
