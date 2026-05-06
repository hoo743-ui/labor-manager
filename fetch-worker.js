self.onmessage = async function(e) {
  const {id, url, method, headers, body} = e.data;
  try {
    const opts = {method: method || 'GET', headers: headers || {}};
    if (body != null) opts.body = body;
    const res = await fetch(url, opts);
    const text = await res.text();
    const hdrs = {};
    res.headers.forEach(function(v, k) { hdrs[k] = v; });
    self.postMessage({id: id, ok: res.ok, status: res.status, statusText: res.statusText, headers: hdrs, body: text});
  } catch(err) {
    self.postMessage({id: id, error: err.message || String(err)});
  }
};
