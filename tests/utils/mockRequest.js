function makeHeaders(init = {}) {
  const map = new Map(Object.entries(init).map(([k, v]) => [k.toLowerCase(), String(v)]));
  return {
    get(name) {
      return map.get(String(name).toLowerCase()) ?? null;
    },
    set(name, value) {
      map.set(String(name).toLowerCase(), String(value));
    },
  };
}

function makeCookies(init = {}) {
  const map = new Map(Object.entries(init).map(([k, v]) => [k, { value: String(v) }]));
  return {
    get(name) {
      return map.get(name);
    },
    set(name, value) {
      map.set(name, { value: String(value) });
    },
    getAll() {
      return Array.from(map.entries()).map(([name, obj]) => ({ name, value: obj.value }));
    },
  };
}

/**
 * Minimal Request-like object for Next Route Handlers (app router).
 * Supports: json(), formData(), headers.get(), cookies.get(), url.
 */
export function makeMockRequest({
  url = 'http://localhost/test',
  method = 'GET',
  headers = {},
  cookies = {},
  jsonBody,
  formData,
} = {}) {
  const hdrs = makeHeaders(headers);
  const cks = makeCookies(cookies);

  return {
    method,
    url,
    headers: hdrs,
    cookies: cks,
    async json() {
      if (jsonBody instanceof Error) throw jsonBody;
      return jsonBody;
    },
    async formData() {
      if (formData instanceof Error) throw formData;
      return formData;
    },
  };
}

