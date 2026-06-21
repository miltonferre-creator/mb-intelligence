const path = require("node:path");
const { loadEnv } = require("../lib/env");
const { getConfig, isConfigured, supabaseRequest } = require("../lib/supabase-client");

loadEnv(path.resolve(__dirname, "../../.env"));

const allowedMimeTypes = [
  "application/pdf",
  "text/csv",
  "application/xml",
  "text/xml",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/ofx",
  "text/plain",
  "image/png",
  "image/jpeg"
];

async function main() {
  const config = getConfig();
  if (!isConfigured()) {
    throw new Error("Supabase não configurado.");
  }

  try {
    const existing = await supabaseRequest(`/storage/v1/bucket/${config.documentsBucket}`, { method: "GET" });
    console.log(JSON.stringify({ bucket: config.documentsBucket, status: "exists", data: existing }, null, 2));
    return;
  } catch (error) {
    if (!String(error.message).toLowerCase().includes("not found")) {
      console.log(`Bucket ainda não encontrado ou não acessível: ${error.message}`);
    }
  }

  const created = await supabaseRequest("/storage/v1/bucket", {
    method: "POST",
    body: {
      id: config.documentsBucket,
      name: config.documentsBucket,
      public: false,
      file_size_limit: 52428800,
      allowed_mime_types: allowedMimeTypes
    }
  });

  console.log(JSON.stringify({ bucket: config.documentsBucket, status: "created", data: created }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
