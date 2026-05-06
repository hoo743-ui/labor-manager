const SUPA_BASE = 'https://suunsnhegngvjuoguiie.supabase.co';
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
  const target = SUPA_BASE + '/' + parts.join('/') + qs;

  const headers = { host: 'suunsnhegngvjuoguiie.supabase.co' };
  for (const [k, v] of Object.entries(req.headers || {})) {
    if (!SKIP_HEADERS.has(k.toLowerCase())) headers[k] = v;
  }

  const body = !['GET','HEAD','OPTIONS'].includes(req.method) && req.body
    ? (typeof req.body === 'string' ? req.body : JSON.stringify(req.body))
    : undefined;

  try {
    const up = await fetch(target, { method: req.method, headers, body });
    const text = await up.text();
    up.headers.forEach((val, key) => {
      if (!['content-encoding','transfer-encoding','connection'].includes(key.toLowerCase())) {
        try { res.setHeader(key, val); } catch (_) {}
      }
    });
    res.setHeader('access-control-allow-origin', '*');
    res.status(up.status).send(text);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
