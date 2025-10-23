const path = require('path');
const fs = require('fs');
const yaml = require('js-yaml');
const swaggerUi = require('swagger-ui-express');

function safeLoadYaml(yamlPath) {
  try {
    const content = fs.readFileSync(yamlPath, 'utf8');
    return yaml.load(content);
  } catch (e) {
    return null;
  }
}

function mergeSpecs(into, add) {
  if (!add) return into;
  // Merge paths
  into.paths = into.paths || {};
  if (add.paths) {
    for (const [k, v] of Object.entries(add.paths)) {
      into.paths[k] = v;
    }
  }
  // Merge components (schemas, responses, parameters, requestBodies, securitySchemes, headers)
  into.components = into.components || {};
  const compKeys = ['schemas', 'responses', 'parameters', 'requestBodies', 'securitySchemes', 'headers'];
  if (add.components) {
    for (const ck of compKeys) {
      if (add.components[ck]) {
        into.components[ck] = into.components[ck] || {};
        Object.assign(into.components[ck], add.components[ck]);
      }
    }
  }
  // Merge tags (by name)
  if (add.tags) {
    const existing = new Set((into.tags || []).map((t) => t.name || JSON.stringify(t)));
    into.tags = into.tags || [];
    for (const t of add.tags) {
      const key = t.name || JSON.stringify(t);
      if (!existing.has(key)) into.tags.push(t);
    }
  }
  return into;
}

function loadCombinedOpenApiSpec() {
  // Start from umbrella spec if available
  const umbrellaPath = path.resolve(__dirname, '../../specs/001-basic-functional-requirements/contracts/openapi.yaml');
  const base = safeLoadYaml(umbrellaPath) || { openapi: '3.0.3', info: { title: 'API', version: '0.0.0' }, paths: {} };
  let combined = { openapi: base.openapi || '3.0.3', info: base.info || { title: 'API', version: '0.0.0' }, paths: {}, components: {} };
  mergeSpecs(combined, base);

  // Merge all feature specs under specs/*/contracts/openapi.yaml
  const specsDir = path.resolve(__dirname, '../../specs');
  try {
    const entries = fs.readdirSync(specsDir, { withFileTypes: true });
    for (const ent of entries) {
      if (!ent.isDirectory()) continue;
      const p = path.join(specsDir, ent.name, 'contracts', 'openapi.yaml');
      if (!fs.existsSync(p)) continue;
      const spec = safeLoadYaml(p);
      if (spec) mergeSpecs(combined, spec);
    }
  } catch (e) {
    // ignore; combined will at least have base
  }

  return combined;
}

function mountSwagger(app) {
  const combinedSpec = loadCombinedOpenApiSpec();
  app.get('/openapi.json', (req, res) => {
    const proto = req.headers['x-forwarded-proto'] || req.protocol || 'http';
    const host = req.headers['x-forwarded-host'] || req.get('host');
    const url = `${proto}://${host}`;
    const spec = { ...combinedSpec, servers: [{ url }] };
    res.json(spec);
  });
  // Let Swagger UI fetch the spec from /openapi.json (ensures correct servers)
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(null, {
      explorer: true,
      swaggerOptions: {
        url: '/openapi.json',
      },
    })
  );
}

module.exports = { mountSwagger };
