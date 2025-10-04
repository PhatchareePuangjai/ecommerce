// Minimal perf harness: runs N requests to /search and logs P95 latency approximation
const http = require('http');

const N = Number(process.env.N || 50);
const HOST = process.env.HOST || 'localhost';
const PORT = Number(process.env.PORT || 3000);

function request() {
  const t0 = Date.now();
  return new Promise((resolve) => {
    const req = http.request({ hostname: HOST, port: PORT, path: '/search?q=Hat', method: 'GET' }, (res) => {
      res.on('data', () => {});
      res.on('end', () => resolve(Date.now() - t0));
    });
    req.on('error', () => resolve(Date.now() - t0));
    req.end();
  });
}

(async () => {
  const times = [];
  for (let i = 0; i < N; i++) times.push(await request());
  const sorted = times.sort((a, b) => a - b);
  const p95 = sorted[Math.floor(0.95 * (sorted.length - 1))];
  console.log(JSON.stringify({ N, p95_ms: p95, min_ms: sorted[0], max_ms: sorted[sorted.length - 1] }, null, 2));
})();

