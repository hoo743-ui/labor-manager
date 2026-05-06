const https = require('https');
const http = require('http');

const SUPA_HOST = 'suunsnhegngvjuoguiie.supabase.co';
const SKIP_HEADERS = new Set(['host','connection','transfer-encoding','keep-alive','te','trailers','upgrade','content-length']);

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('access-control-allow-origin', '*');
    res.setHeader('access-control-allow-methods', 'GET,POST,PATCH,DELETE,OPTIONS');
    res.setHeader('access-control-allow-headers', 'apikey,authorization,content-type,prefer,x-client-info');
    return res.status(204).end();
  }

  const parts = Array.isArray(req.query.path) ? req.query.path : (req.query.path ? [req.query.path] : []);
  const rawUrl = req.url || '';
  const q = rawUrl.indexOf('?');
  const qs = q > -1 ? rawUrl.slice(q) : '';
  const path = '/' + parts.join('/') + qs;

  const headers = { host: SUPA_HOST };
  for (const [k, v] of Object.entries(req.headers || {})) {
    if (!SKIP_HEADERS.has(k.toLowerCase())) headers[k] = v;
  }

  const body = !['GET','HEAD','OPTIONS'].includes(req.method) && req.body
    ? (typeof req.body === 'string' ? req.body : JSON.stringify(req.body))
    : null;

  if (body) headers['content-length'] = Buffer.byteLength(body).toString();

  return new Promise((resolve) => {
    const options = { hostname: SUPA_HOST, port: 443, path, method: req.method, headers };
    const upstream = https.request(options, (upRes) => {
      const chunks = [];
      upRes.on('data', chunk => chunks.push(chunk));
      upRes.on('end', () => {
        const text = Buffer.concat(chunks).toString('utf8');
        for (const [k, v] of Object.entries(upRes.headers)) {
          if (!['content-encoding','transfer-encoding','connection'].includes(k.toLowerCase())) {
            try { res.setHeader(k, v); } catch (_) {}
          }
        }
        res.setHeader('access-control-allow-origin', '*');
        res.status(upRes.statusCode).send(text);
        resolve();
      });
    });
    upstream.on('error', (e) => {
      res.status(500).json({ error: e.message });
      resolve();
    });
    upstream.setTimeout(20000, () => {
      upstream.destroy();
      res.status(504).json({ error: 'Gateway timeout' });
      resolve();
    });
    if (body) upstream.write(body);
    upstream.end();
  });
};
