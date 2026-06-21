(function () {
  window.MBI = window.MBI || {};

  const API_URL_KEY = "mbi.api.url";
  // Em produção (Vercel) o frontend e a API ficam no mesmo domínio — URL relativa.
  // Em desenvolvimento (arquivo local) usa o servidor local na porta 3333.
  const DEFAULT_API_URL = window.location.protocol === "file:" ? "http://localhost:3333" : "";

  function baseUrl() {
    return localStorage.getItem(API_URL_KEY) || DEFAULT_API_URL;
  }

  function setBaseUrl(url) {
    localStorage.setItem(API_URL_KEY, url || DEFAULT_API_URL);
  }

  function token() {
    return MBI.storage.getSession()?.token || null;
  }

  async function request(path, options = {}) {
    const isFormData = options.body instanceof FormData;
    const headers = {
      ...(options.headers || {})
    };
    if (!isFormData) headers["Content-Type"] = "application/json";

    if (options.auth !== false && token()) {
      headers.Authorization = `Bearer ${token()}`;
    }

    let response;
    try {
      response = await fetch(`${baseUrl()}${path}`, {
        method: options.method || "GET",
        headers,
        body: options.body === undefined ? undefined : isFormData ? options.body : JSON.stringify(options.body)
      });
    } catch (error) {
      const unavailable = new Error("API local indisponível.");
      unavailable.apiUnavailable = true;
      unavailable.cause = error;
      throw unavailable;
    }

    const text = await response.text();
    const data = text ? JSON.parse(text) : null;

    if (response.status === 401 && !options.skipRefresh && options.auth !== false && MBI.auth?.refreshSession) {
      try {
        await MBI.auth.refreshSession();
        return request(path, { ...options, skipRefresh: true });
      } catch (refreshError) {
        MBI.storage.clearSession();
      }
    }

    if (!response.ok) {
      const err = new Error(data?.error || "Erro na API.");
      err.status = response.status;
      err.details = data?.details;
      throw err;
    }

    return data;
  }

  async function health() {
    try {
      return await request("/health", { auth: false });
    } catch (error) {
      return null;
    }
  }

  MBI.api = { baseUrl, setBaseUrl, request, health };
})();
