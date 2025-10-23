// Facade that selects memory or db-backed store based on env CMS_STORE=memory|db (default: memory)
const backend = (process.env.CMS_STORE || 'memory').toLowerCase();
// eslint-disable-next-line no-console
if (!['memory', 'db'].includes(backend)) console.warn(`Unknown CMS_STORE=${backend}, defaulting to memory`);

// Dynamic require to avoid loading pg unless needed
// eslint-disable-next-line import/no-dynamic-require, global-require
const impl = backend === 'db' ? require('./store.db') : require('./store.memory');

module.exports = impl;

