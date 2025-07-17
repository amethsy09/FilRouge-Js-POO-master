export class ApiClient {
  constructor(base) {
    if (!/^https?:\/\//.test(base)) base = "http://" + base.replace(/^\/+/, "");
    this.base = base.replace(/\/$/, "");
  }
  _url(p = "") {
    return `${this.base}/${p}`.replace(/([^:]\/)\/+/g, "$1");
  }
  _check(r, v) {
    if (!r.ok) throw new Error(`${v} ${r.status}`);
  }
  async get(p = "", q = {}) {
    const u = new URL(this._url(p));
    for (const [k, v] of Object.entries(q)) u.searchParams.append(k, v);
    const r = await fetch(u);
    this._check(r, "GET");
    return { data: await r.json(), headers: r.headers };
  }
  async post(p = "", b) {
    const r = await fetch(this._url(p), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(b),
    });
    this._check(r, "POST");
    return r.json();
  }
  async put(p = "", id, b) {
    const r = await fetch(this._url(`${p}/${id}`), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(b),
    });
    this._check(r, "PUT");
    return r.json();
  }
  async patch(p = "", id, b) {
    const r = await fetch(this._url(`${p}/${id}`), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(b),
    });
    this._check(r, "PATCH");
    return r.json();
  }
}
