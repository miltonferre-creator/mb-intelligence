function getConfig() {
  return {
    url: process.env.SUPABASE_URL,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    anonKey: process.env.SUPABASE_ANON_KEY,
    documentsBucket: process.env.SUPABASE_DOCUMENTS_BUCKET || "mb-documents"
  };
}

function isConfigured() {
  const config = getConfig();
  return Boolean(config.url && config.serviceRoleKey);
}

async function supabaseRequest(path, options = {}) {
  const config = getConfig();
  if (!isConfigured()) {
    throw new Error("Supabase não configurado. Informe SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.");
  }

  const response = await fetch(`${config.url}${path}`, {
    method: options.method || "GET",
    headers: {
      apikey: config.serviceRoleKey,
      Authorization: `Bearer ${config.serviceRoleKey}`,
      ...(options.body && !(options.body instanceof Buffer) ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {})
    },
    body: options.body instanceof Buffer || typeof options.body === "string"
      ? options.body
      : options.body
        ? JSON.stringify(options.body)
        : undefined
  });

  const text = await response.text();
  const data = text ? tryJson(text) : null;

  if (!response.ok) {
    const message = data?.message || data?.error || text || "Erro Supabase.";
    throw new Error(message);
  }

  return data;
}

function tryJson(text) {
  try {
    return JSON.parse(text);
  } catch (error) {
    return text;
  }
}

async function uploadDocumentObject(storagePath, buffer, mimeType) {
  const config = getConfig();
  return supabaseRequest(`/storage/v1/object/${config.documentsBucket}/${storagePath}`, {
    method: "POST",
    headers: {
      "Content-Type": mimeType || "application/octet-stream",
      "x-upsert": "false"
    },
    body: buffer
  });
}

async function createSignedDocumentUrl(storagePath, expiresInSeconds = 300) {
  const config = getConfig();
  return supabaseRequest(`/storage/v1/object/sign/${config.documentsBucket}/${storagePath}`, {
    method: "POST",
    body: { expiresIn: expiresInSeconds }
  });
}

async function deleteDocumentObject(storagePath) {
  const config = getConfig();
  return supabaseRequest(`/storage/v1/object/${config.documentsBucket}`, {
    method: "DELETE",
    body: { prefixes: [storagePath] }
  });
}

module.exports = {
  getConfig,
  isConfigured,
  supabaseRequest,
  uploadDocumentObject,
  createSignedDocumentUrl,
  deleteDocumentObject
};
