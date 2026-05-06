export const config = { runtime: 'edge' };

const SUPA_URL = 'https://suunsnhegngvjuoguiie.supabase.co';

export default async function handler(req) {
  const url = new URL(req.url);
  const supaPath = url.pathname.replace(/^\/api\/supa/, '');
  const targetUrl = SUPA_URL + supaPath + url.search;

  const headers = new Headers(req.headers);
  headers.delete('host');

  try {
    const res = await fetch(targetUrl, {
      method: req.method,
      headers,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : null,
    });

    const resHeaders = new Headers(res.headers);
    resHeaders.set('access-control-allow-origin', '*');

    return new Response(res.body, {
      status: res.status,
      headers: resHeaders,
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
}
