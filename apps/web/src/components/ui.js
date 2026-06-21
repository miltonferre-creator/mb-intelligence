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

  function kpi(label, value, hint, analysis, color, delta, sparkValues) {
    const direction = Number(delta || 0);
    const deltaText = direction === 0 ? "sem variação" : `${direction > 0 ? "+" : ""}${direction.toFixed(1).replace(".", ",")}%`;
    const deltaClass = direction > 0 ? "is-up" : direction < 0 ? "is-down" : "is-flat";
    const points = (sparkValues || []).map(Number).filter((item) => Number.isFinite(item));
    const max = Math.max(...points, 1);
    const min = Math.min(...points, 0);
    const range = Math.max(max - min, 1);
    const spark = points.length
      ? points.map((item, index) => `${(index / Math.max(points.length - 1, 1)) * 100},${34 - ((item - min) / range) * 28}`).join(" ")
      : "0,28 100,28";
    return `
      <article class="metric-card kpi-card ${color || "brand"}">
        <div class="metric-top"><span>${label}</span><em>${hint || ""}</em></div>
        <div class="kpi-value-row"><strong>${value}</strong><span class="delta-pill ${deltaClass}">${deltaText}</span></div>
        <svg class="kpi-spark" viewBox="0 0 100 38" preserveAspectRatio="none" aria-hidden="true">
          <polyline points="${spark}" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></polyline>
        </svg>
        <div class="metric-analysis"><strong>IA/MB:</strong> ${analysis}</div>
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
    const width = 520;
    const height = 220;
    const padding = 34;
    const values = months.flatMap((item) => [Number(item[1] || 0), Number(item[2] || 0)]);
    const max = Math.max(...values, 1) * 1.12;
    const xFor = (index) => padding + (index / Math.max(months.length - 1, 1)) * (width - padding * 2);
    const yFor = (value) => height - padding - (Number(value || 0) / max) * (height - padding * 2);
    const line = (key) => months.map((item, index) => `${xFor(index)},${yFor(item[key])}`).join(" ");
    const area = (key) => `${padding},${height - padding} ${line(key)} ${width - padding},${height - padding}`;
    return `
      <svg class="chart-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="Grafico de evolucao financeira">
        ${[0, 1, 2, 3].map((i) => {
          const value = (max / 3) * (3 - i);
          const y = yFor(value);
          return `<line x1="${padding}" x2="${width - padding}" y1="${y}" y2="${y}" stroke="#e7ebf0" stroke-width="1"></line><text x="4" y="${y + 4}" font-size="10" fill="#8b94a3">${chartValue(value)}</text>`;
        }).join("")}
        <polygon points="${area(1)}" fill="rgba(29,78,216,.12)"></polygon>
        <polygon points="${area(2)}" fill="rgba(217,119,6,.12)"></polygon>
        <polyline class="chart-line-draw" points="${line(1)}" fill="none" stroke="#1d4ed8" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"></polyline>
        <polyline class="chart-line-draw delay" points="${line(2)}" fill="none" stroke="#d97706" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"></polyline>
        ${months.map((item, index) => `
          <g class="chart-point" tabindex="0">
            <title>${item[0]} - Receita: ${chartValue(item[1])} | Despesas: ${chartValue(item[2])} | Resultado: ${chartValue(Number(item[1] || 0) - Number(item[2] || 0))}</title>
            <circle class="point-visible" cx="${xFor(index)}" cy="${yFor(item[1])}" r="4" fill="#1d4ed8"></circle>
            <circle class="chart-hit" cx="${xFor(index)}" cy="${yFor(item[1])}" r="12" fill="transparent"></circle>
          </g>
          <g class="chart-point" tabindex="0">
            <title>${item[0]} - Despesas: ${chartValue(item[2])} | Receita: ${chartValue(item[1])} | Resultado: ${chartValue(Number(item[1] || 0) - Number(item[2] || 0))}</title>
            <circle class="point-visible" cx="${xFor(index)}" cy="${yFor(item[2])}" r="4" fill="#d97706"></circle>
            <circle class="chart-hit" cx="${xFor(index)}" cy="${yFor(item[2])}" r="12" fill="transparent"></circle>
          </g>
          <text x="${xFor(index)}" y="${height - 4}" text-anchor="middle" font-size="11" fill="#667085">${item[0]}</text>
        `).join("")}
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

  function shell({ title, subtitle, menu, content, sessionLabel, sessionName }) {
    return `
      <div class="app-shell">
        <aside class="sidebar">
          <div class="side-brand">
            <img src="assets/mb-logo-premium.svg" alt="MB">
            <div><strong>MB Intelligence</strong><span>Produto operacional</span></div>
          </div>
          <nav class="side-menu">${menu}</nav>
          <div class="side-account">
            <span>${sessionLabel}</span>
            <strong>${sessionName}</strong>
            <div style="margin-top:10px"><button class="btn btn-dark" type="button" data-action="logout">${icon("log-out")} Sair</button></div>
          </div>
        </aside>
        <main class="content">
          <header class="topbar">
            <div><h1>${title}</h1><p>${subtitle}</p></div>
            <div class="topbar-actions">
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
    return items.map(([route, iconName, label]) => `
      <button class="nav-btn ${route === activeRoute ? "is-active" : ""}" type="button" data-route="${route}">
        ${icon(iconName)} <span>${label}</span>
      </button>
    `).join("");
  }

  function toast(message) {
    return message ? `<div class="toast">${message}</div>` : "";
  }

  MBI.ui = { icon, escape, money, pill, metric, kpi, table, bars, lineChart, groupedBars, scoreGauge, runway, donut, waterfall, radar, dreTable, shell, nav, toast, statusClass };
})();
