const path = require('path');
const fs = require('fs');
const yaml = require('js-yaml');
const swaggerUi = require('swagger-ui-express');

function loadOpenApiSpec() {
  const yamlPath = path.resolve(__dirname, '../../specs/001-basic-functional-requirements/contracts/openapi.yaml');
  try {
    const content = fs.readFileSync(yamlPath, 'utf8');
    return yaml.load(content);
  } catch (e) {
    // Fallback: minimal placeholder so UI still mounts
    return {
      openapi: '3.0.3',
      info: { title: 'API', version: '0.0.0', description: `Failed to load OpenAPI YAML at ${yamlPath}: ${e.message}` },
      paths: {},
    };
  }
}

function mountSwagger(app) {
  const baseSpec = loadOpenApiSpec();
  app.get('/openapi.json', (req, res) => {
    const proto = req.headers['x-forwarded-proto'] || req.protocol || 'http';
    const host = req.headers['x-forwarded-host'] || req.get('host');
    const url = `${proto}://${host}`;
    const spec = { ...baseSpec, servers: [{ url }] };
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
