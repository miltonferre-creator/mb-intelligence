function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": process.env.MBI_CORS_ORIGIN || "*",
    "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Max-Age": "86400"
  };
}

function send(res, status, data) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    ...corsHeaders()
  });
  res.end(JSON.stringify(data));
}

function ok(res, data) {
  send(res, 200, data);
}

function created(res, data) {
  send(res, 201, data);
}

function noContent(res) {
  res.writeHead(204, corsHeaders());
  res.end();
}

function error(res, status, message, details) {
  send(res, status, { error: message, details });
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 5_000_000) {
        reject(new Error("Payload muito grande."));
        req.destroy();
      }
    });
    req.on("end", () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch (err) {
        reject(new Error("JSON inválido."));
      }
    });
    req.on("error", reject);
  });
}

function parseUrl(req) {
  const url = new URL(req.url, "http://localhost");
  const segments = url.pathname.split("/").filter(Boolean);
  return { url, segments };
}

module.exports = {
  corsHeaders,
  send,
  ok,
  created,
  noContent,
  error,
  readBody,
  parseUrl
};
