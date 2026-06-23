(function () {
  window.MBI = window.MBI || {};

  // Observabilidade leve, Sentry-ready. Centraliza o registro de falhas para que
  // nenhum erro inesperado morra em silencio. Fallbacks (ex.: offline) tambem
  // passam por aqui como aviso, para nao mascararem problema real.
  function forwardToSentry(error, context, extra) {
    try {
      if (window.Sentry && typeof window.Sentry.captureException === "function") {
        window.Sentry.captureException(error, { tags: { context }, extra: extra || {} });
      }
    } catch (_) { /* nunca deixar o logger quebrar a app */ }
  }

  // Falha inesperada: loga estruturado + encaminha ao Sentry (se instalado).
  function capture(context, error, extra) {
    const payload = {
      level: "error",
      context: context || "app",
      message: error && error.message ? error.message : String(error),
      at: new Date().toISOString(),
      ...(extra || {})
    };
    // eslint-disable-next-line no-console
    console.error("[mbi]", payload, error);
    forwardToSentry(error instanceof Error ? error : new Error(payload.message), payload.context, extra);
  }

  // Causa CONHECIDA (ex.: API offline -> usa cache local). Nao e erro fatal,
  // mas tem que ser visivel, nunca silencioso.
  function warn(context, message, extra) {
    // eslint-disable-next-line no-console
    console.warn("[mbi]", { level: "warn", context, message, at: new Date().toISOString(), ...(extra || {}) });
  }

  // Captura tudo que escapou (erros nao tratados e promises rejeitadas).
  window.addEventListener("error", (event) => {
    capture("window.onerror", event.error || new Error(event.message), { source: event.filename, line: event.lineno });
  });
  window.addEventListener("unhandledrejection", (event) => {
    capture("unhandledrejection", event.reason instanceof Error ? event.reason : new Error(String(event.reason)));
  });

  MBI.observability = { capture, warn };
})();
