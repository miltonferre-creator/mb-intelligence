const { loadEnv } = require("../lib/env");
const path = require("node:path");
const { getConfig, isConfigured, supabaseRequest } = require("../lib/supabase-client");

loadEnv(path.resolve(__dirname, "../../.env"));

async function main() {
  const config = getConfig();
  if (!isConfigured()) {
    console.log(JSON.stringify({
      configured: false,
      hasUrl: Boolean(config.url),
      hasServiceRole: Boolean(config.serviceRoleKey)
    }));
    return;
  }

  const result = {
    configured: true,
    url: config.url,
    bucket: config.documentsBucket,
    restReachable: false,
    plansTableReady: false,
    bucketReady: false,
    errors: []
  };

  try {
    await supabaseRequest("/rest/v1/", { method: "GET" });
    result.restReachable = true;
  } catch (error) {
    result.errors.push(`REST: ${error.message}`);
  }

  try {
    await supabaseRequest("/rest/v1/plans?select=id&limit=1", { method: "GET" });
    result.plansTableReady = true;
  } catch (error) {
    result.errors.push(`plans: ${error.message}`);
  }

  try {
    await supabaseRequest(`/storage/v1/bucket/${config.documentsBucket}`, { method: "GET" });
    result.bucketReady = true;
  } catch (error) {
    result.errors.push(`bucket: ${error.message}`);
  }

  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
