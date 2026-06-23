(function () {
  window.MBI = window.MBI || {};

  function icon(name) {
    return `<i data-lucide="${name}" aria-hidden="true"></i>`;
  }

  // Escapa dado de usuario antes de interpolar em HTML (corpo, atributos e textarea).
  // Fonte unica de verdade para evitar XSS armazenado em todas as telas.
  function escape(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
  }

  function money(value) {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(Number(value || 0));
  }

  // ===== Moeda em formularios: digitacao estilo calculadora (centavos) =====
  function moneyFromCents(cents) {
    const n = (Number(cents) || 0) / 100;
    const fixed = n.toFixed(2);
    const parts = fixed.split(".");
    const int = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return int + "," + parts[1];
  }

  function moneyParse(value) {
    if (typeof value === "number") return value;
    const raw = String(value == null ? "" : value).replace(/[^\d,.-]/g, "");
    if (!raw) return 0;
    const normalized = raw.replace(/\.(?=\d{3}(\D|$))/g, "").replace(",", ".");
    const n = Number(normalized);
    return Number.isFinite(n) ? n : 0;
  }

  function moneyInputValue(value) {
    return moneyFromCents(Math.round(moneyParse(value) * 100));
  }

  function moneyField(label, name, value, opts) {
    opts = opts || {};
    const input = `<div class="money-wrap"><span class="money-prefix">R$</span><input class="money-input" data-money inputmode="decimal" name="${name}" value="${moneyInputValue(value || 0)}" autocomplete="off"${opts.required ? " required" : ""}></div>`;
    return label ? `<label><span>${label}</span>${input}</label>` : input;
  }

  // ===== Modal/dialog: abre por acao, fecha no X ou no backdrop =====
  function modal(config) {
    config = config || {};
    const size = config.size ? ` modal-${config.size}` : "";
    return `
      <div class="modal-overlay" data-modal-overlay>
        <div class="modal-card${size}" role="dialog" aria-modal="true" aria-label="${escape(config.title || "")}">
          <header class="modal-head">
            <div>
              ${config.icon ? `<span class="modal-icon">${icon(config.icon)}</span>` : ""}
              <div><h3>${escape(config.title || "")}</h3>${config.subtitle ? `<p>${escape(config.subtitle)}</p>` : ""}</div>
            </div>
            <button class="modal-x" type="button" data-action="modal-close" aria-label="Fechar">${icon("x")}</button>
          </header>
          <div class="modal-body">${config.body || ""}</div>
        </div>
      </div>
    `;
  }

  function statusClass(value) {
    const text = String(value || "").toLowerCase();
    if (text.includes("erro") || text.includes("venc") || text.includes("pendente") || text.includes("aguard")) return "status-danger";
    if (text.includes("ativo") || text.includes("aprovado") || text.includes("valid") || text.includes("dispon")) return "status-ok";
    return "status-warning";
  }

  function pill(text, extra) {
    return `<span class="status-pill ${extra || statusClass(text)}">${text}</span>`;
  }

  function metric(label, value, hint, analysis, color) {
    return `
      <article class="metric-card">
        <div class="metric-top"><span>${label}</span><em>${hint || ""}</em></div>
        <strong>${value}</strong>
        <div class="metric-band ${color || "brand"}"></div>
        <div class="metric-analysis"><strong>IA/MB:</strong> ${analysis}</div>
      </article>
    `;
  }

  function kpi(label, value, hint, analysis, color, delta, sparkValues, invert) {
    const direction = Number(delta || 0);
    const deltaText = direction === 0 ? "sem variação" : `${direction > 0 ? "+" : ""}${direction.toFixed(1).replace(".", ",")}%`;
    // invert=true para indicadores onde subir e ruim (impostos, despesas): o sinal segue
    // a direcao real, mas a cor reflete bom/ruim (verde/vermelho).
    const good = invert ? direction < 0 : direction > 0;
    const deltaClass = direction === 0 ? "is-flat" : good ? "is-up" : "is-down";
    const points = (sparkValues || []).map(Number).filter((item) => Number.isFinite(item));
    const max = Math.max(...points, 1);
    const min = Math.min(...points, 0);
    const range = Math.max(max - min, 1);
    const arrow = direction === 0 ? "" : direction > 0 ? "▲ " : "▼ ";
    const coords = points.length
      ? points.map((item, index) => [(index / Math.max(points.length - 1, 1)) * 100, 34 - ((item - min) / range) * 30])
      : [[0, 28], [100, 28]];
    const line = coords.map((p) => `${p[0]},${p[1]}`).join(" ");
    const area = `0,38 ${line} 100,38`;
    return `
      <article class="metric-card kpi-card ${color || "brand"}" title="${analysis || ""}">
        <div class="metric-top"><span>${label}</span><em>${hint || ""}</em></div>
        <strong class="kpi-value">${value}</strong>
        <div class="kpi-foot">
          <div class="kpi-trend"><span class="delta-pill ${deltaClass}">${arrow}${deltaText}</span><em>vs. mês anterior</em></div>
          <svg class="kpi-spark" viewBox="0 0 100 38" preserveAspectRatio="none" aria-hidden="true">
            <polygon points="${area}" fill="currentColor" fill-opacity="0.13"></polygon>
            <polyline points="${line}" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></polyline>
          </svg>
        </div>
      </article>
    `;
  }

  function table(headers, rows) {
    const dense = headers.length <= 3;
    const minWidth = dense ? "" : `min-width:${Math.max(headers.length * 145, 580)}px`;
    const columns = `grid-template-columns: repeat(${headers.length}, minmax(${dense ? 0 : 140}px, 1fr)); ${minWidth}`;
    return `
      <div class="data-table">
        <div class="data-row is-head" style="${columns}">${headers.map((item) => `<span>${item}</span>`).join("")}</div>
        ${rows.map((row) => `<div class="data-row" style="${columns}">${row.map((cell) => `<span>${cell}</span>`).join("")}</div>`).join("")}
      </div>
    `;
  }

  // ===== Lista moderna de documentos (cliente e admin) =====
  function fileIcon(doc) {
    const f = String(doc.fileName || doc.originalFileName || doc.name || "");
    const m = f.match(/\.([a-z0-9]+)$/i);
    const ext = m ? m[1].toLowerCase() : "";
    if (/pdf/.test(ext)) return "file-text";
    if (/xlsx?|csv|ods/.test(ext)) return "sheet";
    if (/docx?|odt|rtf|txt/.test(ext)) return "file-type-2";
    if (/png|jpe?g|gif|webp|svg/.test(ext)) return "image";
    if (/zip|rar|7z/.test(ext)) return "folder-archive";
    if (/xml|ofx|json/.test(ext)) return "file-code-2";
    return "file";
  }

  function docCategoryClass(category) {
    const t = String(category || "").toLowerCase();
    if (t.includes("fisc")) return "is-fiscal";
    if (t.includes("trab") || t.includes("folha")) return "is-trab";
    if (t.includes("cont")) return "is-cont";
    if (t.includes("financ")) return "is-fin";
    if (t.includes("societ") || t.includes("contrat")) return "is-soc";
    return "is-other";
  }

  function docList(docs, actionsFor) {
    if (!docs || !docs.length) {
      return `<div class="empty-lock">${icon("folder-open")}<h3>Nenhum documento</h3><p>Os arquivos publicados pela MB aparecem aqui.</p></div>`;
    }
    return `<div class="doc-list">${docs.map((doc) => {
      const name = escape(doc.description || doc.name || doc.fileName || "Documento");
      const original = doc.fileName || doc.originalFileName;
      const comp = doc.competence ? `Comp. ${escape(doc.competence)}` : "";
      const due = (doc.dueDate || doc.due) ? `Vence ${escape(doc.dueDate || doc.due)}` : "";
      const meta = [escape(doc.category || "Documento"), comp, due].filter(Boolean).join(" &middot; ");
      return `<div class="doc-card">
        <div class="doc-icon ${docCategoryClass(doc.category)}">${icon(fileIcon(doc))}</div>
        <div class="doc-info">
          <strong>${name}</strong>
          <span class="doc-meta">${meta}${original && original !== name ? ` &middot; <em>${escape(original)}</em>` : ""}</span>
        </div>
        <div class="doc-actions">${pill(doc.status || "Disponível")}${actionsFor ? actionsFor(doc) : ""}</div>
      </div>`;
    }).join("")}</div>`;
  }

  function bars(items) {
    return `
      <div class="bar-chart">
        ${items.map(([label, value, text, color]) => `
          <div class="bar-row" title="${label}: ${text}">
            <span>${label}</span>
            <div class="bar-track"><div class="bar-fill ${color || ""}" style="--value:${Math.min(Number(value || 0), 100)}%"></div></div>
            <strong>${text}</strong>
          </div>
        `).join("")}
      </div>
    `;
  }

  function chartValue(value) {
    return `${Number(value || 0).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mil`;
  }

  function lineChart(months) {
    if (!months || !months.length) {
      return `<div class="empty-lock">${icon("database")}<h3>Aguardando histórico validado</h3><p>O gráfico será exibido quando a MB salvar a primeira competência financeira.</p></div>`;
    }
    if (months.length === 1) {
      const item = months[0];
      const revenue = Number(item[1] || 0);
      const expenses = Number(item[2] || 0);
      const result = revenue - expenses;
      const max = Math.max(revenue, expenses, Math.abs(result), 1);
      const bar = (label, value, color) => `
        <div class="single-chart-bar" title="${item[0]} - ${label}: ${chartValue(value)}">
          <span>${label}</span>
          <div><i class="${color}" style="--value:${Math.min(Math.abs(value) / max * 100, 100)}%"></i></div>
          <strong>${chartValue(value)}</strong>
        </div>`;
      return `
        <div class="single-period-chart">
          <div class="single-period-head">${icon("bar-chart-3")} <strong>${item[0]}</strong><span>Primeira competência financeira registrada</span></div>
          ${bar("Receita", revenue, "blue")}
          ${bar("Despesas", expenses, "amber")}
          ${bar("Resultado", result, result >= 0 ? "teal" : "brand")}
        </div>
      `;
    }
    const width = 560;
    const height = 240;
    const padL = 46, padR = 16, padT = 18, padB = 28;
    const values = months.flatMap((item) => [Number(item[1] || 0), Number(item[2] || 0)]);
    let maxV = Math.max(...values), minV = Math.min(...values);
    if (maxV === minV) { maxV = maxV || 1; minV = 0; }
    // Escala pela FAIXA dos dados (nao a partir de zero): a linha usa a altura toda
    // e mostra a variacao real, em vez de ficar achatada no topo.
    const span = (maxV - minV) || 1;
    const top = maxV + span * 0.18;
    const bottom = Math.max(minV - span * 0.18, 0);
    const range = (top - bottom) || 1;
    const xFor = (i) => padL + (i / Math.max(months.length - 1, 1)) * (width - padL - padR);
    const yFor = (v) => padT + (1 - (Number(v || 0) - bottom) / range) * (height - padT - padB);
    const pts = (key) => months.map((item, i) => [xFor(i), yFor(item[key])]);
    const smooth = (p) => {
      if (p.length < 2) return p.length ? `M ${p[0][0]} ${p[0][1]}` : "";
      let d = `M ${p[0][0]} ${p[0][1]}`;
      for (let i = 0; i < p.length - 1; i++) {
        const p0 = p[i - 1] || p[i], p1 = p[i], p2 = p[i + 1], p3 = p[i + 2] || p2, t = 0.16;
        d += ` C ${p1[0] + (p2[0] - p0[0]) * t} ${p1[1] + (p2[1] - p0[1]) * t} ${p2[0] - (p3[0] - p1[0]) * t} ${p2[1] - (p3[1] - p1[1]) * t} ${p2[0]} ${p2[1]}`;
      }
      return d;
    };
    const areaPath = (key) => `${smooth(pts(key))} L ${xFor(months.length - 1)} ${height - padB} L ${xFor(0)} ${height - padB} Z`;
    const gridVals = [0, 1, 2, 3].map((i) => bottom + (range * i) / 3);
    return `
      <svg class="chart-svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Evolucao de receita e despesas">
        <defs>
          <linearGradient id="gradRev" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#1d4ed8" stop-opacity="0.28"></stop><stop offset="100%" stop-color="#1d4ed8" stop-opacity="0"></stop></linearGradient>
          <linearGradient id="gradExp" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#d97706" stop-opacity="0.20"></stop><stop offset="100%" stop-color="#d97706" stop-opacity="0"></stop></linearGradient>
        </defs>
        ${gridVals.map((value) => { const y = yFor(value); return `<line x1="${padL}" x2="${width - padR}" y1="${y}" y2="${y}" stroke="#eceff3" stroke-width="1"></line><text x="${padL - 6}" y="${y + 3}" text-anchor="end" font-size="10" fill="#9aa3af">${chartValue(value)}</text>`; }).join("")}
        <path d="${areaPath(1)}" fill="url(#gradRev)"></path>
        <path d="${areaPath(2)}" fill="url(#gradExp)"></path>
        <path d="${smooth(pts(2))}" fill="none" stroke="#d97706" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path>
        <path d="${smooth(pts(1))}" fill="none" stroke="#1d4ed8" stroke-width="2.75" stroke-linecap="round" stroke-linejoin="round"></path>
        ${months.map((item, i) => `
          <g class="chart-point" tabindex="0"><title>${item[0]} · Receita ${chartValue(item[1])} · Despesas ${chartValue(item[2])} · Resultado ${chartValue(Number(item[1] || 0) - Number(item[2] || 0))}</title>
            <circle cx="${xFor(i)}" cy="${yFor(item[1])}" r="3.5" fill="#1d4ed8"></circle>
            <circle cx="${xFor(i)}" cy="${yFor(item[2])}" r="3.5" fill="#d97706"></circle>
            <circle class="chart-hit" cx="${xFor(i)}" cy="${(yFor(item[1]) + yFor(item[2])) / 2}" r="16" fill="transparent"></circle>
          </g>
          <text x="${xFor(i)}" y="${height - 8}" text-anchor="middle" font-size="11" fill="#667085">${item[0]}</text>
        `).join("")}
      </svg>
    `;
  }

  // Grafico executivo (tema escuro): Receita (linha + pontos + area + callout no pico)
  // e Tendencia (regressao linear, tracejada). Usado no Dashboard do cliente.
  function execLineChart(months) {
    if (!months || months.length < 2) {
      return `<div class="empty-lock">${icon("activity")}<h3>Aguardando histórico</h3><p>O gráfico aparece quando houver competências suficientes.</p></div>`;
    }
    const W = 600, H = 206, padL = 54, padR = 22, padT = 24, padB = 26;
    const rev = months.map((m) => Number(m[1] || 0));
    const n = rev.length;
    const meanX = (n - 1) / 2;
    const meanY = rev.reduce((a, b) => a + b, 0) / n;
    let num = 0, den = 0;
    rev.forEach((y, i) => { num += (i - meanX) * (y - meanY); den += (i - meanX) ** 2; });
    const slope = den ? num / den : 0;
    const intercept = meanY - slope * meanX;
    const trend = rev.map((_, i) => intercept + slope * i);
    let maxV = Math.max(...rev, ...trend), minV = Math.min(...rev, ...trend);
    if (maxV === minV) { maxV = maxV || 1; minV = 0; }
    const span = (maxV - minV) || 1;
    const top = maxV + span * 0.18, bottom = Math.max(minV - span * 0.18, 0);
    const range = (top - bottom) || 1;
    const xFor = (i) => padL + (i / (n - 1)) * (W - padL - padR);
    const yFor = (v) => padT + (1 - (v - bottom) / range) * (H - padT - padB);
    const smooth = (p) => {
      let d = `M ${p[0][0]} ${p[0][1]}`;
      for (let i = 0; i < p.length - 1; i++) {
        const p0 = p[i - 1] || p[i], p1 = p[i], p2 = p[i + 1], p3 = p[i + 2] || p2, t = 0.16;
        d += ` C ${p1[0] + (p2[0] - p0[0]) * t} ${p1[1] + (p2[1] - p0[1]) * t} ${p2[0] - (p3[0] - p1[0]) * t} ${p2[1] - (p3[1] - p1[1]) * t} ${p2[0]} ${p2[1]}`;
      }
      return d;
    };
    const revPts = rev.map((v, i) => [xFor(i), yFor(v)]);
    const revLine = smooth(revPts);
    const area = `${revLine} L ${xFor(n - 1)} ${H - padB} L ${xFor(0)} ${H - padB} Z`;
    const last = revPts[n - 1];
    const grid = [0, 1, 2, 3].map((i) => bottom + (range * i) / 3);
    const cx = Math.min(last[0] - 4, W - 108), cy = Math.max(last[1] - 34, 6);
    return `
      <svg class="exec-chart" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Receita ao longo do tempo">
        <defs>
          <linearGradient id="execArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#e0606a" stop-opacity="0.34"></stop><stop offset="100%" stop-color="#e0606a" stop-opacity="0"></stop></linearGradient>
          <filter id="execGlow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="2.4" result="b"></feGaussianBlur><feMerge><feMergeNode in="b"></feMergeNode><feMergeNode in="SourceGraphic"></feMergeNode></feMerge></filter>
        </defs>
        ${grid.map((v) => { const y = yFor(v); return `<line x1="${padL}" x2="${W - padR}" y1="${y}" y2="${y}" stroke="rgba(255,255,255,.08)" stroke-width="1"></line><text x="${padL - 8}" y="${y + 4}" text-anchor="end" font-size="11" fill="rgba(255,255,255,.42)">${chartValue(v)}</text>`; }).join("")}
        <path d="${area}" fill="url(#execArea)"></path>
        <path d="M ${xFor(0)} ${yFor(trend[0])} L ${xFor(n - 1)} ${yFor(trend[n - 1])}" fill="none" stroke="rgba(255,255,255,.4)" stroke-width="2" stroke-dasharray="6 5"></path>
        <path d="${revLine}" fill="none" stroke="#e0606a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" filter="url(#execGlow)"></path>
        ${revPts.map((p, i) => `<circle cx="${p[0]}" cy="${p[1]}" r="${i === n - 1 ? 5 : 3.2}" fill="#13101a" stroke="#e0606a" stroke-width="2"></circle>`).join("")}
        ${months.map((m, i) => (i % 2 === 0 || i === n - 1) ? `<text x="${xFor(i)}" y="${H - 8}" text-anchor="middle" font-size="10" fill="rgba(255,255,255,.5)">${String(m[0]).split(" ")[0]}</text>` : "").join("")}
        <g transform="translate(${cx}, ${cy})"><rect width="104" height="26" rx="13" fill="#8f121b"></rect><text x="52" y="17" text-anchor="middle" font-size="13" font-weight="700" fill="#fff">${chartValue(rev[n - 1])}</text></g>
      </svg>
    `;
  }

  function groupedBars(months) {
    if (!months || !months.length) return `<div class="empty-lock">${icon("bar-chart-3")}<h3>Sem histórico</h3><p>A MB ainda não salvou competências suficientes.</p></div>`;
    const max = Math.max(...months.flatMap((item) => [Number(item[1] || 0), Number(item[2] || 0), Math.abs(Number(item[1] || 0) - Number(item[2] || 0))]), 1);
    return `
      <div class="grouped-bars">
        ${months.map((item) => {
          const revenue = Number(item[1] || 0);
          const expenses = Number(item[2] || 0);
          const result = revenue - expenses;
          const h = (value) => `${Math.max((Math.abs(value) / max) * 100, 3)}%`;
          return `<div class="grouped-month" title="${item[0]} | Receita ${chartValue(revenue)} | Despesas ${chartValue(expenses)} | Resultado ${chartValue(result)}">
            <div class="grouped-stack">
              <i class="blue" style="--height:${h(revenue)}"></i>
              <i class="amber" style="--height:${h(expenses)}"></i>
              <i class="${result >= 0 ? "teal" : "brand"}" style="--height:${h(result)}"></i>
            </div>
            <span>${item[0]}</span>
          </div>`;
        }).join("")}
      </div>
    `;
  }

  // Fluxo de caixa mensal: barras pareadas (entradas x saidas) em tema escuro.
  // months = [label, entradasMil, saidasMil]
  function cashFlowChart(months) {
    if (!months || !months.length) {
      return `<div class="empty-lock">${icon("waves")}<h3>Sem fluxo de caixa</h3><p>O gráfico aparece quando a MB registrar entradas e saídas mensais.</p></div>`;
    }
    const W = 600, H = 206, padL = 54, padR = 18, padT = 16, padB = 28;
    const inflow = months.map((m) => Number(m[1] || 0));
    const outflow = months.map((m) => Number(m[2] || 0));
    const maxV = Math.max(...inflow, ...outflow, 1);
    const n = months.length;
    const plotW = W - padL - padR, plotH = H - padT - padB, baseY = padT + plotH;
    const slot = plotW / n;
    const bw = Math.min(slot * 0.3, 17);
    const gap = 4;
    const yFor = (v) => baseY - (v / maxV) * plotH;
    const grid = [0, 1, 2, 3].map((i) => (maxV * i) / 3);
    return `
      <svg class="exec-chart" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Fluxo de caixa mensal">
        <defs>
          <linearGradient id="cfIn" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#34d399"></stop><stop offset="100%" stop-color="#10b981" stop-opacity=".7"></stop></linearGradient>
          <linearGradient id="cfOut" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fbbf24"></stop><stop offset="100%" stop-color="#e0606a" stop-opacity=".85"></stop></linearGradient>
        </defs>
        ${grid.map((v) => { const y = yFor(v); return `<line x1="${padL}" x2="${W - padR}" y1="${y}" y2="${y}" stroke="rgba(255,255,255,.08)"></line><text x="${padL - 8}" y="${y + 4}" text-anchor="end" font-size="11" fill="rgba(255,255,255,.42)">${chartValue(v)}</text>`; }).join("")}
        ${months.map((m, i) => {
          const cx = padL + slot * i + slot / 2;
          const yIn = yFor(inflow[i]), yOut = yFor(outflow[i]);
          const net = inflow[i] - outflow[i];
          const x1 = cx - bw - gap / 2, x2 = cx + gap / 2;
          return `<g><title>${escape(String(m[0]))} · Entradas ${chartValue(inflow[i])} · Saídas ${chartValue(outflow[i])} · Saldo ${chartValue(net)}</title>
            <rect x="${x1}" y="${yIn}" width="${bw}" height="${Math.max(baseY - yIn, 2)}" rx="3" fill="url(#cfIn)"></rect>
            <rect x="${x2}" y="${yOut}" width="${bw}" height="${Math.max(baseY - yOut, 2)}" rx="3" fill="url(#cfOut)"></rect>
          </g>`;
        }).join("")}
        ${months.map((m, i) => (i % 2 === 0 || i === n - 1) ? `<text x="${padL + slot * i + slot / 2}" y="${H - 8}" text-anchor="middle" font-size="10" fill="rgba(255,255,255,.5)">${String(m[0]).split(" ")[0]}</text>` : "").join("")}
      </svg>
    `;
  }

  function scoreGauge(score, title) {
    const value = Math.max(0, Math.min(Number(score || 0), 100));
    return `
      <div class="score-gauge" style="--score:${value}%">
        <div class="score-arc"><span></span></div>
        <strong>${Math.round(value)}</strong>
        <em>/100</em>
        <p>${title || "MB Financial Score"}</p>
      </div>
    `;
  }

  function runway(days) {
    const value = Math.max(0, Number(days || 0));
    const percent = Math.min((value / 60) * 100, 100);
    const status = value >= 45 ? "Saudável" : value >= 15 ? "Atenção" : "Crítico";
    return `
      <div class="runway-meter" style="--runway:${percent}%">
        <div class="runway-zones"><span>Crítico</span><span>Atenção</span><span>Saudável</span></div>
        <div class="runway-track"><i></i></div>
        <div class="runway-scale"><span>0d</span><span>15d</span><strong>${Math.round(value)}d</strong><span>45d</span><span>60d+</span></div>
        ${pill(status)}
      </div>
    `;
  }

  function donut(items, center) {
    const colors = { brand: "#8f121b", teal: "#0f766e", blue: "#1d4ed8", amber: "#d97706", gray: "#8b94a3" };
    const total = items.reduce((sum, item) => sum + Math.max(Number(item.value || 0), 0), 0) || 1;
    let cursor = 0;
    const stops = items.map((item) => {
      const start = cursor;
      cursor += (Math.max(Number(item.value || 0), 0) / total) * 100;
      return `${colors[item.color] || colors.brand} ${start}% ${cursor}%`;
    }).join(", ");
    return `
      <div class="donut-wrap">
        <div class="donut-chart" style="--donut: conic-gradient(${stops})"><strong>${center || "100%"}</strong><span>Total</span></div>
        <div class="donut-legend">${items.map((item) => `<span><i class="${item.color || "brand"}"></i>${item.label}<strong>${item.text}</strong></span>`).join("")}</div>
      </div>
    `;
  }

  function waterfall(items) {
    const clean = (items || []).filter((item) => item && item.type !== "section");
    if (!clean.length) return `<div class="empty-lock">${icon("bar-chart-big")}<h3>Sem dados para cascata</h3><p>A MB ainda precisa validar as linhas gerenciais.</p></div>`;
    const max = Math.max(...clean.map((item) => Math.abs(Number(item.amount || 0))), 1);
    return `
      <div class="waterfall-chart">
        ${clean.slice(0, 10).map((item) => {
          const amount = Number(item.amount || 0);
          const kind = item.type === "total" || item.type === "subtotal" ? "total" : amount < 0 ? "negative" : "positive";
          return `<div class="waterfall-item ${kind}" title="${item.label}: ${money(amount)}">
            <div class="waterfall-bar"><i style="--height:${Math.max(Math.abs(amount) / max * 100, 4)}%"></i></div>
            <strong>${money(amount)}</strong>
            <span>${String(item.label || "").replace(/\(.+?\)|=|-/g, "").trim().slice(0, 16)}</span>
          </div>`;
        }).join("")}
      </div>
    `;
  }

  function radar(dimensions) {
    const rows = (dimensions || []).slice(0, 6);
    if (!rows.length) return "";
    const cx = 120;
    const cy = 110;
    const radius = 76;
    const point = (index, currentRadius) => {
      const angle = (-90 + (360 / rows.length) * index) * Math.PI / 180;
      return [cx + Math.cos(angle) * currentRadius, cy + Math.sin(angle) * currentRadius];
    };
    const polygon = rows.map((row, index) => point(index, radius * Math.max(Number(row.score || 0), 0) / 100).join(",")).join(" ");
    const outer = rows.map((_, index) => point(index, radius).join(",")).join(" ");
    return `
      <svg class="radar-chart" viewBox="0 0 240 220" role="img" aria-label="Radar de score">
        <polygon points="${outer}" fill="rgba(143,18,27,.04)" stroke="#dfe4ea"></polygon>
        ${rows.map((_, index) => {
          const [x, y] = point(index, radius);
          return `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="#e7ebf0"></line>`;
        }).join("")}
        <polygon class="radar-poly" points="${polygon}" fill="rgba(143,18,27,.22)" stroke="#8f121b" stroke-width="3"></polygon>
        ${rows.map((row, index) => {
          const [x, y] = point(index, radius + 20);
          return `<text x="${x}" y="${y}" text-anchor="middle" font-size="10" fill="#667085">${row.label}</text>`;
        }).join("")}
      </svg>
    `;
  }

  function dreTable(rows) {
    if (!rows.length) return `<div class="empty-lock">${icon("lock")}<h3>DRE ainda não validada</h3><p>Este cliente ainda não possui dados suficientes ou aprovação MB para DRE gerencial.</p></div>`;
    const normalize = (row) => Array.isArray(row)
      ? { label: row[0], amount: row[1], percent: row[2], type: row[3] || "normal", variation: row[4] || "-", ytd: row[5] || "-" }
      : row;
    return `
      <div class="dre-table">
        <div class="dre-row is-head"><span>Conta gerencial</span><span>Valor</span><span>% Receita</span><span>Variação</span><span>YTD</span></div>
        ${rows.map(normalize).map((row) => `
          <div class="dre-row ${row.type === "section" ? "is-section" : ""} ${row.type === "subtotal" ? "is-subtotal" : ""} ${row.type === "total" ? "is-total" : ""}">
            <span>${row.label}</span><strong>${row.type === "section" ? "" : money(row.amount)}</strong><span>${row.percent || ""}</span><span>${row.variation || ""}</span><span>${row.ytd || ""}</span>
          </div>
        `).join("")}
      </div>
    `;
  }

  function shell({ title, subtitle, menu, content, sessionLabel, sessionName, topbarExtra }) {
    return `
      <div class="app-shell">
        <div class="app-backdrop" data-action="toggle-sidebar" aria-hidden="true"></div>
        <aside class="sidebar">
          <div class="side-brand">
            <img src="assets/mb-logo-premium.svg" alt="MB Intelligence">
            <span class="side-mono" aria-hidden="true">MB</span>
            <div><strong>MB Intelligence</strong><span>Produto operacional</span></div>
          </div>
          <nav class="side-menu">${menu}</nav>
          <div class="side-account">
            <span>${sessionLabel}</span>
            <strong>${sessionName}</strong>
            <div style="margin-top:10px"><button class="btn btn-dark" type="button" data-action="logout">${icon("log-out")} <span>Sair</span></button></div>
          </div>
        </aside>
        <main class="content">
          <header class="topbar">
            <div class="topbar-left">
              <button class="icon-btn nav-toggle" type="button" data-action="toggle-sidebar" title="Recolher menu" aria-label="Recolher menu">${icon("panel-left")}</button>
              <div><h1>${title}</h1><p>${subtitle}</p></div>
            </div>
            <div class="topbar-actions">
              ${topbarExtra || ""}
              <button class="icon-btn" type="button" title="Notificações">${icon("bell")}</button>
              <button class="icon-btn" type="button" title="Ajuda">${icon("circle-help")}</button>
            </div>
          </header>
          ${content}
        </main>
      </div>
    `;
  }

  function nav(items, activeRoute) {
    return items.map(([route, iconName, label]) => {
      // Item sem rota vira cabecalho de secao do menu (agrupa o fluxo de trabalho).
      if (!route) return `<span class="nav-group">${label}</span>`;
      return `
      <button class="nav-btn ${route === activeRoute ? "is-active" : ""}" type="button" data-route="${route}" title="${label}">
        ${icon(iconName)} <span>${label}</span>
      </button>
    `;
    }).join("");
  }

  function toast(message) {
    return message ? `<div class="toast">${message}</div>` : "";
  }

  MBI.ui = { icon, escape, money, moneyFromCents, moneyParse, moneyInputValue, moneyField, modal, pill, metric, kpi, table, docList, fileIcon, bars, lineChart, execLineChart, groupedBars, cashFlowChart, scoreGauge, runway, donut, waterfall, radar, dreTable, shell, nav, toast, statusClass };
})();
