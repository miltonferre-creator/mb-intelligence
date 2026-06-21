#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
MB Intelligence – Análise Crítica Completa v2
Visão da jornada do cliente e da MB, coerência das telas,
dimensão temporal, bugs funcionais e backlog priorizado.
"""

import os
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT, TA_JUSTIFY
from reportlab.platypus import (
    BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer,
    Table, TableStyle, HRFlowable, KeepTogether
)

# ─── Paleta MB ───────────────────────────────────────────────────────────────
BRAND     = colors.HexColor("#5b070b")
BRAND_LT  = colors.HexColor("#8b1a1e")
RED_D     = colors.HexColor("#c0392b")
AMBER     = colors.HexColor("#e67e22")
AMBER_LT  = colors.HexColor("#fff3e0")
GREEN     = colors.HexColor("#1a7a4a")
GREEN_LT  = colors.HexColor("#e8f5e9")
BLUE      = colors.HexColor("#1565c0")
BLUE_LT   = colors.HexColor("#e3f2fd")
INK       = colors.HexColor("#111318")
MUTED     = colors.HexColor("#667085")
LINE      = colors.HexColor("#dfe4ea")
SOFT      = colors.HexColor("#f5f6f8")
WHITE     = colors.white
BLACK     = colors.black

W, H = A4   # 595 x 842 pt
MARGIN = 22 * mm
TW = W - 2 * MARGIN

def hx(c):
    return '#%02x%02x%02x' % (int(c.red*255), int(c.green*255), int(c.blue*255))

# ─── Estilos ─────────────────────────────────────────────────────────────────
def make_styles():
    base = getSampleStyleSheet()
    S = {}

    def ps(name, **kw):
        defaults = dict(fontName="Helvetica", fontSize=9, leading=13,
                        textColor=INK, spaceAfter=3)
        defaults.update(kw)
        return ParagraphStyle(name, parent=base["Normal"], **defaults)

    S["cover_title"]   = ps("ct", fontName="Helvetica-Bold", fontSize=32,
                              leading=38, textColor=WHITE, alignment=TA_CENTER)
    S["cover_sub"]     = ps("cs", fontName="Helvetica", fontSize=13,
                              leading=18, textColor=WHITE, alignment=TA_CENTER)
    S["cover_meta"]    = ps("cm", fontName="Helvetica", fontSize=10,
                              leading=14, textColor=colors.HexColor("#ffd9da"),
                              alignment=TA_CENTER)
    S["h1"]            = ps("h1", fontName="Helvetica-Bold", fontSize=16,
                              leading=20, textColor=BRAND, spaceBefore=14, spaceAfter=6)
    S["h2"]            = ps("h2", fontName="Helvetica-Bold", fontSize=12,
                              leading=16, textColor=BRAND_LT, spaceBefore=10, spaceAfter=4)
    S["h3"]            = ps("h3", fontName="Helvetica-Bold", fontSize=10,
                              leading=13, textColor=INK, spaceBefore=7, spaceAfter=3)
    S["body"]          = ps("bd", fontSize=9, leading=14, alignment=TA_JUSTIFY)
    S["bullet"]        = ps("bl", fontSize=9, leading=13, leftIndent=12,
                              alignment=TA_LEFT)
    S["small"]         = ps("sm", fontSize=8, leading=11, textColor=MUTED)
    S["code"]          = ps("co", fontName="Courier", fontSize=8, leading=11,
                              textColor=colors.HexColor("#2d3748"),
                              backColor=colors.HexColor("#f7fafc"), leftIndent=8)
    S["label_ok"]      = ps("lk", fontName="Helvetica-Bold", fontSize=8,
                              textColor=GREEN)
    S["label_warn"]    = ps("lw", fontName="Helvetica-Bold", fontSize=8,
                              textColor=AMBER)
    S["label_err"]     = ps("le", fontName="Helvetica-Bold", fontSize=8,
                              textColor=RED_D)
    S["label_crit"]    = ps("lc", fontName="Helvetica-Bold", fontSize=8,
                              textColor=BRAND)
    S["toc_item"]      = ps("ti", fontSize=9, leading=14, leftIndent=6,
                              textColor=INK)
    return S

def bi(text, ST, icon="OK", color=GREEN):
    return Paragraph(f'<font color="{hx(color)}"><b>{icon}</b></font>  {text}', ST["bullet"])

def ok(text, ST):  return bi(text, ST, "✔", GREEN)
def wa(text, ST):  return bi(text, ST, "⚠", AMBER)
def er(text, ST):  return bi(text, ST, "✖", RED_D)
def cr(text, ST):  return bi(text, ST, "⛔", BRAND)

def divider(color=LINE):
    return HRFlowable(width="100%", thickness=0.5, color=color, spaceAfter=6, spaceBefore=4)

def badge_table(items, ST):
    """items = [(label, value, color), ...]"""
    data = []
    row = []
    for i, (label, value, bg) in enumerate(items):
        cell = Table([[Paragraph(f'<b>{label}</b>', ST["small"]),
                       Paragraph(str(value), ST["small"])]],
                     colWidths=[55*mm, 40*mm])
        cell.setStyle(TableStyle([
            ("BACKGROUND", (0,0), (-1,-1), bg),
            ("TEXTCOLOR",  (0,0), (-1,-1), WHITE),
            ("FONTSIZE",   (0,0), (-1,-1), 8),
            ("INNERGRID",  (0,0), (-1,-1), 0, WHITE),
            ("BOX",        (0,0), (-1,-1), 0, WHITE),
            ("TOPPADDING", (0,0), (-1,-1), 4),
            ("BOTTOMPADDING", (0,0), (-1,-1), 4),
            ("LEFTPADDING",   (0,0), (-1,-1), 6),
        ]))
        row.append(cell)
        if len(row) == 3 or i == len(items)-1:
            while len(row) < 3:
                row.append("")
            data.append(row)
            row = []
    t = Table(data, colWidths=[TW/3]*3, hAlign="LEFT")
    t.setStyle(TableStyle([
        ("VALIGN",      (0,0), (-1,-1), "TOP"),
        ("LEFTPADDING", (0,0), (-1,-1), 3),
        ("RIGHTPADDING",(0,0), (-1,-1), 3),
        ("TOPPADDING",  (0,0), (-1,-1), 3),
        ("BOTTOMPADDING",(0,0), (-1,-1), 3),
    ]))
    return t

def info_box(text, ST, bg=BLUE_LT, border=BLUE):
    t = Table([[Paragraph(text, ST["body"])]], colWidths=[TW])
    t.setStyle(TableStyle([
        ("BACKGROUND",    (0,0), (-1,-1), bg),
        ("LEFTPADDING",   (0,0), (-1,-1), 10),
        ("RIGHTPADDING",  (0,0), (-1,-1), 10),
        ("TOPPADDING",    (0,0), (-1,-1), 7),
        ("BOTTOMPADDING", (0,0), (-1,-1), 7),
        ("LINEAFTER",     (0,0), (0,-1), 3, border),
    ]))
    return t

def crit_box(text, ST):
    return info_box(text, ST, bg=colors.HexColor("#fff0f0"), border=BRAND)

def warn_box(text, ST):
    return info_box(text, ST, bg=AMBER_LT, border=AMBER)

def ok_box(text, ST):
    return info_box(text, ST, bg=GREEN_LT, border=GREEN)

def code_line(text, ST):
    t = Table([[Paragraph(text, ST["code"])]], colWidths=[TW])
    t.setStyle(TableStyle([
        ("BACKGROUND",    (0,0), (-1,-1), colors.HexColor("#f7fafc")),
        ("LEFTPADDING",   (0,0), (-1,-1), 10),
        ("TOPPADDING",    (0,0), (-1,-1), 5),
        ("BOTTOMPADDING", (0,0), (-1,-1), 5),
        ("BOX",           (0,0), (-1,-1), 0.5, LINE),
    ]))
    return t

def section_header(title, ST, color=BRAND):
    t = Table([[Paragraph(title, ParagraphStyle("sh",
               fontName="Helvetica-Bold", fontSize=14, leading=18,
               textColor=WHITE))]], colWidths=[TW])
    t.setStyle(TableStyle([
        ("BACKGROUND",    (0,0), (-1,-1), color),
        ("LEFTPADDING",   (0,0), (-1,-1), 12),
        ("TOPPADDING",    (0,0), (-1,-1), 7),
        ("BOTTOMPADDING", (0,0), (-1,-1), 7),
    ]))
    return t

def grid_table(rows, cols_w, ST, header_bg=BRAND, header_color=WHITE,
               alt_bg=SOFT, font_size=8):
    """Generic grid with header row."""
    style = [
        ("BACKGROUND",    (0,0), (-1,0), header_bg),
        ("TEXTCOLOR",     (0,0), (-1,0), header_color),
        ("FONTNAME",      (0,0), (-1,0), "Helvetica-Bold"),
        ("FONTSIZE",      (0,0), (-1,-1), font_size),
        ("LEADING",       (0,0), (-1,-1), font_size+3),
        ("ROWBACKGROUNDS",(0,1), (-1,-1), [WHITE, alt_bg]),
        ("GRID",          (0,0), (-1,-1), 0.4, LINE),
        ("VALIGN",        (0,0), (-1,-1), "TOP"),
        ("LEFTPADDING",   (0,0), (-1,-1), 6),
        ("RIGHTPADDING",  (0,0), (-1,-1), 6),
        ("TOPPADDING",    (0,0), (-1,-1), 4),
        ("BOTTOMPADDING", (0,0), (-1,-1), 4),
    ]
    data = []
    for i, row in enumerate(rows):
        data.append([Paragraph(str(c), ParagraphStyle(
            f"gc{i}", fontName="Helvetica-Bold" if i==0 else "Helvetica",
            fontSize=font_size, leading=font_size+3,
            textColor=WHITE if i==0 else INK)) for c in row])
    t = Table(data, colWidths=cols_w)
    t.setStyle(TableStyle(style))
    return t

# ─── Page callbacks ───────────────────────────────────────────────────────────
def on_cover_page(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(BRAND)
    canvas.rect(0, 0, W, H, fill=1, stroke=0)
    canvas.setFillColor(colors.HexColor("#8b1a1e"))
    canvas.rect(0, H*0.55, W, H*0.45, fill=1, stroke=0)
    canvas.setFillColor(colors.HexColor("#ffffff20"))
    for i in range(8):
        y = 60 + i*90
        canvas.setLineWidth(0.5)
        canvas.setStrokeColor(colors.HexColor("#ffffff15"))
        canvas.line(0, y, W, y)
    canvas.restoreState()

def on_normal_page(canvas, doc):
    canvas.saveState()
    # header bar
    canvas.setFillColor(BRAND)
    canvas.rect(0, H - 18*mm, W, 18*mm, fill=1, stroke=0)
    canvas.setFillColor(WHITE)
    canvas.setFont("Helvetica-Bold", 9)
    canvas.drawString(MARGIN, H - 10*mm, "MB Intelligence · Análise Crítica Completa v2.0 · 2026")
    canvas.setFont("Helvetica", 8)
    canvas.drawRightString(W - MARGIN, H - 10*mm, "Confidencial · Uso interno MB")
    # footer
    canvas.setFillColor(SOFT)
    canvas.rect(0, 0, W, 14*mm, fill=1, stroke=0)
    canvas.setFillColor(LINE)
    canvas.rect(0, 14*mm, W, 0.5, fill=1, stroke=0)
    canvas.setFillColor(MUTED)
    canvas.setFont("Helvetica", 7.5)
    canvas.drawString(MARGIN, 5*mm, "MB Empresas Assessoria · Plataforma MB Intelligence")
    canvas.drawRightString(W - MARGIN, 5*mm, f"Página {doc.page}")
    canvas.restoreState()

# ─── Document builder ─────────────────────────────────────────────────────────
def build_doc():
    output = os.path.join(os.path.dirname(__file__),
                          "MB_Intelligence_Analise_Critica_v2_2026.pdf")
    ST = make_styles()

    doc = BaseDocTemplate(
        output, pagesize=A4,
        topMargin=22*mm, bottomMargin=18*mm,
        leftMargin=MARGIN, rightMargin=MARGIN
    )
    cover_frame  = Frame(0, 0, W, H, id="cover")
    normal_frame = Frame(MARGIN, 14*mm, TW, H - 36*mm, id="normal")

    doc.addPageTemplates([
        PageTemplate(id="Cover",  frames=[cover_frame],  onPage=on_cover_page),
        PageTemplate(id="Normal", frames=[normal_frame], onPage=on_normal_page),
    ])

    story = []

    # =========================================================
    # CAPA
    # =========================================================
    story.append(Spacer(1, 48*mm))
    story.append(Paragraph("MB Intelligence", ST["cover_sub"]))
    story.append(Spacer(1, 6*mm))
    story.append(Paragraph("ANÁLISE CRÍTICA COMPLETA", ST["cover_title"]))
    story.append(Spacer(1, 3*mm))
    story.append(Paragraph("Versão 2.0 · Revisão Total", ST["cover_title"]))
    story.append(Spacer(1, 12*mm))
    story.append(Paragraph(
        "Jornada do Cliente · Jornada da MB · Dimensão Temporal · Bugs Funcionais · Backlog Priorizado",
        ST["cover_sub"]))
    story.append(Spacer(1, 18*mm))
    for line in [
        "Tipo: Análise Crítica de Produto | Data: Maio/2026",
        "Cobertura: 100% das telas · Ambos os lados (cliente + MB)",
        "Status: Leitura do código-fonte + API em execução real",
    ]:
        story.append(Paragraph(line, ST["cover_meta"]))
        story.append(Spacer(1, 3*mm))
    story.append(Spacer(1, 28*mm))
    story.append(Paragraph(
        "USO EXCLUSIVO MB · CONFIDENCIAL", ST["cover_meta"]))

    from reportlab.platypus import NextPageTemplate, PageBreak
    story.append(NextPageTemplate("Normal"))
    story.append(PageBreak())

    # =========================================================
    # SEÇÃO 0 – RESUMO EXECUTIVO
    # =========================================================
    story.append(section_header("0  RESUMO EXECUTIVO — O QUE MAIS IMPORTA", ST))
    story.append(Spacer(1, 4*mm))

    story.append(Paragraph(
        "Esta análise releu cada arquivo do produto de forma metódica — "
        "client-pages.js, admin-pages.js, app.js, server-supabase.js e seed.js — "
        "para mapear a experiência real de cada perfil de usuário. "
        "O diagnóstico abaixo é severo porque os problemas identificados são severos.",
        ST["body"]))
    story.append(Spacer(1, 4*mm))

    story.append(Paragraph("PROBLEMA CENTRAL (bloqueia tudo)", ST["h2"]))
    story.append(crit_box(
        "<b>O sistema não tem dimensão temporal.</b> Nenhuma tela — nem do cliente "
        "nem da MB — tem filtro de mês/ano. O formulário 'Alimentar Portal' não tem "
        "campo de competência. Cada salvamento SOBRESCREVE o mesmo snapshot. "
        "O gráfico 'Evolução mensal' sempre exibe 1 ponto. A 'evolução' não existe.",
        ST))
    story.append(Spacer(1, 3*mm))

    resumo_data = [
        ["Dimensão", "Resultado", "Impacto"],
        ["Filtros de período (cliente)", "Ausente em 100% das telas", "Crítico"],
        ["Filtros de período (MB/admin)", "Ausente em 100% das telas", "Crítico"],
        ["Campo competência no Alimentar Portal", "NÃO EXISTE", "Bloqueante"],
        ["Snapshots históricos por cliente", "Sempre 1 (overwrite)", "Bloqueante"],
        ["Gráfico de evolução mensal", "Sempre 1 ponto de dado", "Grave"],
        ["PATCH /approvals/:id", "Rota não implementada — 404", "Bloqueante"],
        ["Filas operacionais no Cockpit MB", "Valores hardcoded no código", "Grave"],
        ["Competência nos uploads (doc/import)", "Hardcoded '2026-06'", "Funcional"],
        ["DRE — Clínica Norte (R$1.200/mês)", "Array vazio []", "Grave"],
        ["Fluxo de Caixa — Clínica Norte", "Array vazio []", "Grave"],
        ["Score — metodologia documentada", "Algoritmo existe no server ✔", "OK"],
        ["DRE — Comércio Silva (CFO)", "18 linhas estruturadas ✔", "OK"],
        ["Relatório impresso layout MB", "Implementado com assinaturas ✔", "OK"],
    ]
    story.append(grid_table(resumo_data,
        [65*mm, 70*mm, 25*mm], ST, font_size=8))
    story.append(Spacer(1, 6*mm))
    story.append(divider())

    # =========================================================
    # SEÇÃO 1 – AUSÊNCIA DA DIMENSÃO TEMPORAL
    # =========================================================
    story.append(Spacer(1, 2*mm))
    story.append(section_header("1  O PROBLEMA RAIZ: SISTEMA SEM DIMENSÃO TEMPORAL", ST))
    story.append(Spacer(1, 4*mm))

    story.append(Paragraph("1.1  Como o dado financeiro é armazenado", ST["h2"]))
    story.append(Paragraph(
        "O banco de dados tem a tabela <b>financial_snapshots</b>. Cada linha representa "
        "uma competência (mês) de um cliente. A arquitetura permite múltiplos meses — "
        "mas o produto <b>não usa esse recurso</b>.", ST["body"]))
    story.append(Spacer(1, 3*mm))
    story.append(code_line("server-supabase.js linha 874:  PATCH /financial_snapshots?id=eq.${existing[0].id}", ST))
    story.append(Paragraph(
        "O PATCH busca o snapshot mais recente e o sobrescreve. Nunca cria um registro novo "
        "para um mês diferente. Resultado: cada cliente tem exatamente 1 snapshot na vida — "
        "o do cadastro, atualizado indefinidamente.", ST["body"]))
    story.append(Spacer(1, 3*mm))

    story.append(Paragraph("1.2  O formulário 'Alimentar Portal' não tem campo de competência", ST["h2"]))
    story.append(crit_box(
        "O formulário <b>update-finance</b> tem 11 campos (faturamento, despesas, impostos, "
        "folha, caixa, score, score operacional, fôlego, capacidade de investimento, meta de "
        "margem, NCG). <b>Não tem campo 'competência'.</b> Mesmo que o backend suportasse "
        "múltiplos meses, seria impossível informar de qual mês são os dados.",
        ST))
    story.append(Spacer(1, 3*mm))
    story.append(Paragraph(
        "Campos presentes no formulário de Alimentar Portal:", ST["h3"]))
    campos = ["revenue", "expenses", "taxes", "payroll", "cash",
              "score", "operationalScore", "runway", "investmentCapacity",
              "marginTarget", "workingCapitalDays", "confidence", "insight"]
    for c in campos:
        story.append(ok(f"<code>{c}</code>", ST) if c != "competence" else
                     cr(f"<code>{c}</code> — AUSENTE", ST))
    story.append(cr("<code>competence</code> — AUSENTE (campo essencial para série histórica)", ST))
    story.append(Spacer(1, 4*mm))

    story.append(Paragraph("1.3  O gráfico 'Evolução mensal consolidada' é enganoso", ST["h2"]))
    story.append(warn_box(
        "O título diz 'Evolução mensal consolidada'. O código sempre exibirá 1 ponto "
        "de dado por cliente porque só há 1 snapshot no banco. O eixo X não tem labels "
        "de mês visíveis. O Chart usa barras SVG sem eixos. O cliente CFO paga R$2.000/mês "
        "para ver um gráfico de linha com um único ponto.",
        ST))
    story.append(Spacer(1, 3*mm))
    story.append(code_line(
        "seed.js — silva.months: [[\"Mai/26\", 183, 142]]  ← 1 único ponto", ST))
    story.append(code_line(
        "client-pages.js — latestMonth = data.months?.at(-1)?.[0] || \"competência atual\"", ST))
    story.append(Spacer(1, 3*mm))

    story.append(Paragraph("1.4  Consequências por plano", ST["h2"]))
    conseq_data = [
        ["Plano", "Consequência da falta de histórico"],
        ["Contabilidade R$800", "Sem dados financeiros mesmo no mês atual — mínima perda"],
        ["Financeiro IA R$1.200", "Gráfico de evolução = 1 ponto, sem DRE, sem Cash Flow"],
        ["CFO as a Service R$2.000",
         "O cliente mais exigente vê gráfico de 1 ponto. DRE e DFC não têm referência de período. "
         "Nenhuma comparação mês/mês. Score não tem histórico."],
    ]
    story.append(grid_table(conseq_data, [45*mm, 110*mm], ST))
    story.append(Spacer(1, 6*mm))
    story.append(divider())

    # =========================================================
    # SEÇÃO 2 – JORNADA DO CLIENTE TELA A TELA
    # =========================================================
    story.append(Spacer(1, 2*mm))
    story.append(section_header("2  JORNADA DO CLIENTE — ANÁLISE TELA A TELA", ST))
    story.append(Spacer(1, 4*mm))

    story.append(Paragraph(
        "O cliente (empresário) acessa o portal em <b>#/cliente/inteligencia</b> e navega "
        "por 6 telas: Inteligência, Onboarding, Documentos, Importações, Comunicação, "
        "Perfil. Analisamos cada uma pelo que o cliente <i>precisa</i> versus o que "
        "<i>recebe</i>.", ST["body"]))
    story.append(Spacer(1, 4*mm))

    # ── 2.1 Login / Entrada
    story.append(Paragraph("2.1  Login e primeiro acesso", ST["h2"]))
    story.append(ok("Formulário de login funcional com Supabase Auth real", ST))
    story.append(ok("Botões de acesso rápido (fill-login) úteis para testes", ST))
    story.append(wa("Registro de novo cliente (#/contratar) cria conta no Supabase mas redireciona para onboarding com dados em branco", ST))
    story.append(er("Sem recuperação de senha implementada", ST))
    story.append(er("Sem 2FA mesmo para plano CFO (dados financeiros sensíveis)", ST))
    story.append(Spacer(1, 4*mm))

    # ── 2.2 Inteligência Financeira – Contabilidade
    story.append(Paragraph("2.2  Inteligência Financeira — Plano Contabilidade", ST["h2"]))
    story.append(Paragraph(
        "Cliente paga R$800/mês. Espera: guias organizadas, status fiscal, alertas de "
        "vencimento, documentos acessíveis.", ST["body"]))
    story.append(Spacer(1, 2*mm))
    story.append(ok("Cockpit com resumo executivo por plano (texto correto para contabilidade)", ST))
    story.append(ok("processStatus() usa dados reais de documentos e importações", ST))
    story.append(ok("documentHealthBars() calcula corretamente por regex nos dados reais", ST))
    story.append(wa("KPI 'Resultado' exibe 'Plano atual não libera análise financeira completa' — correto, mas confuso sem contexto do upgrade", ST))
    story.append(wa("KPI 'Score' exibe 'Score completo disponível no CFO' — legítimo upsell, mas falta link de upgrade", ST))
    story.append(er("Nenhum filtro de período nos documentos exibidos no portal contábil", ST))
    story.append(er("Nenhuma visualização de calendário fiscal / vencimentos futuros", ST))
    story.append(er("Insight exibido: 'Dados carregados do Supabase.' — mensagem interna técnica visível ao cliente pagante", ST))
    story.append(Spacer(1, 4*mm))

    # ── 2.3 Inteligência Financeira – Financeiro IA
    story.append(Paragraph("2.3  Inteligência Financeira — Plano Financeiro IA", ST["h2"]))
    story.append(Paragraph(
        "Cliente paga R$1.200/mês. Espera: dashboard gerencial, faturamento, "
        "impostos, folha, gráficos com evolução, análises automáticas.", ST["body"]))
    story.append(Spacer(1, 2*mm))
    story.append(ok("4 KPIs visíveis (faturamento, impostos, resultado, score)", ST))
    story.append(ok("Gráfico linha Receita x Despesas presente", ST))
    story.append(ok("Copiloto com tarefas da MB visível", ST))
    story.append(er("Gráfico de evolução mensal mostra apenas 1 ponto (Mai/26) — sem histórico", ST))
    story.append(er("Sem filtro de mês/ano em nenhuma visualização", ST))
    story.append(er("DRE: array vazio — Clínica Norte (este plano) não tem DRE mesmo pagando R$1.200/mês", ST))
    story.append(er("Cash Flow: array vazio — Clínica Norte não tem DFC mesmo pagando R$1.200/mês", ST))
    story.append(cr("Nota de rodapé dos KPIs: 'Resultado calculado com dados disponíveis' — desconfiança", ST))
    story.append(wa("Composição de despesas ausente neste plano (só CFO vê)", ST))
    story.append(Spacer(1, 4*mm))
    story.append(warn_box(
        "<b>Clínica Norte paga R$1.200/mês</b> e vê: 4 KPIs, 1 gráfico de 1 ponto, "
        "lista de tarefas. Não há DRE, não há DFC, não há composição de despesas. "
        "O produto entrega menos valor do que o prometido.",
        ST))
    story.append(Spacer(1, 4*mm))

    # ── 2.4 Inteligência Financeira – CFO
    story.append(Paragraph("2.4  Inteligência Financeira — CFO as a Service", ST["h2"]))
    story.append(Paragraph(
        "Cliente paga R$2.000/mês. Espera: DRE completa, DFC estruturada, "
        "score com breakdown, gráficos executivos, análises consultivas, "
        "comparação de períodos.", ST["body"]))
    story.append(Spacer(1, 2*mm))
    story.append(ok("DRE com 18 linhas (5 blocos: Receita, Custo, Despesas Op., Resultado Fin., Impostos)", ST))
    story.append(ok("DFC em 3 seções: FCO, FCI, FCF + Saldo final (estrutura NBC T 3.8)", ST))
    story.append(ok("Score com breakdown por dimensão (Liquidez, Rentabilidade, Eficiência, Folha, Impostos, Capital de Giro)", ST))
    story.append(ok("Gráficos CFO (Evolução executiva, Score/capacidade, Composição despesas, Margem, Investimento)", ST))
    story.append(ok("Composição de despesas calculada de dados reais (não hardcoded)", ST))
    story.append(ok("Botão 'Imprimir' e 'Excel' na DRE e no Fluxo de Caixa", ST))
    story.append(wa("expenseCompositionBars() calcula de revenue/payroll/taxes/expenses — depende de dados completos no snapshot", ST))
    story.append(er("Gráfico de evolução executiva: ainda 1 ponto (mesmo problema temporal)", ST))
    story.append(er("SEM filtro de período — DRE e DFC não têm seletor de mês/ano", ST))
    story.append(er("DRE não exibe o mês de competência — apenas 'Competência atual validada pela MB'", ST))
    story.append(er("Score não tem histórico — não há como comparar score de abril vs. maio", ST))
    story.append(er("'MB CFO: acompanhar diferença entre crescimento de receita e avanço das despesas' — conselho vago sem dados históricos", ST))
    story.append(er("Impressão do relatório: CNPJ/CRC da MB aparece como 'informar nos parâmetros oficiais da MB'", ST))
    story.append(Spacer(1, 4*mm))
    story.append(crit_box(
        "<b>O cliente CFO paga R$2.000/mês mas não pode:</b><br/>"
        "1. Ver DRE de um mês anterior<br/>"
        "2. Comparar faturamento de jan/fev/mar<br/>"
        "3. Ver como o score evoluiu<br/>"
        "4. Filtrar qualquer dado por período<br/>"
        "5. Navegar entre competências<br/>"
        "Um CFO real tomaria decisões com base em tendência — o produto não entrega tendência.",
        ST))
    story.append(Spacer(1, 4*mm))

    # ── 2.5 Onboarding
    story.append(Paragraph("2.5  Tela de Onboarding", ST["h2"]))
    story.append(ok("Checklist de 5 etapas com status dinâmico (usa dados reais de documentos e finance)", ST))
    story.append(ok("Barra de progresso calculada corretamente", ST))
    story.append(ok("Consultor MB visível com data da próxima revisão", ST))
    story.append(wa("nextReview calculado como NOW + 7 dias — não vem do banco de dados, é sempre aleatório", ST))
    story.append(wa("Sem histórico de onboarding — cliente não vê o que mudou entre sessões", ST))
    story.append(er("Sem botão para o cliente reportar dúvida ou problema diretamente da tela de onboarding", ST))
    story.append(er("'Cockpit liberado: Parcial' — não explica o que está bloqueado e por quê", ST))
    story.append(Spacer(1, 4*mm))

    # ── 2.6 Documentos
    story.append(Paragraph("2.6  Tela de Documentos (cliente)", ST["h2"]))
    story.append(ok("Tabela de documentos usa dados reais do Supabase", ST))
    story.append(ok("Download gera URL assinada do Supabase Storage (5 min) — correto", ST))
    story.append(ok("Upload de arquivo pelo cliente registra importação corretamente", ST))
    story.append(wa("Coluna 'Competência' exibe campo 'due' — que é data de vencimento, não competência", ST))
    story.append(er("Nenhum filtro por categoria, mês, ano ou status", ST))
    story.append(er("Sem ordenação — documentos aparecem em ordem de cadastro", ST))
    story.append(er("Campo competência no upload defaulta para '2026-06' hardcoded — precisa ser mês atual dinâmico", ST))
    story.append(er("Sem paginação — todos os documentos carregados de uma vez", ST))
    story.append(Spacer(1, 4*mm))

    # ── 2.7 Importações
    story.append(Paragraph("2.7  Tela de Importações (cliente)", ST["h2"]))
    story.append(ok("Tabela usa dados reais (API /imports)", ST))
    story.append(wa("Sem filtro por período, tipo ou status", ST))
    story.append(er("Resultado da importação é texto livre sem estrutura (ex: 'Solicitar novo arquivo')", ST))
    story.append(er("Nenhuma ação disponível — cliente não pode cancelar ou reenviar", ST))
    story.append(Spacer(1, 4*mm))

    # ── 2.8 Comunicação
    story.append(Paragraph("2.8  Tela de Comunicação (cliente)", ST["h2"]))
    story.append(ok("Consultor e analista MB visíveis", ST))
    story.append(ok("Histórico de mensagens carregado do Supabase", ST))
    story.append(ok("Envio de mensagem funcional via API", ST))
    story.append(wa("Input pré-preenchido com 'Escrever mensagem para a MB' — deveria ser placeholder, não value", ST))
    story.append(wa("Sem notificação quando MB responde — cliente precisa acessar a tela para ver resposta", ST))
    story.append(er("Sem thread/agrupamento de conversas — todas mensagens em lista plana", ST))
    story.append(er("Sem indicação de leitura (visto/não visto)", ST))
    story.append(Spacer(1, 4*mm))

    # ── 2.9 Perfil
    story.append(Paragraph("2.9  Tela de Perfil (cliente)", ST["h2"]))
    story.append(ok("Dados cadastrais exibidos corretamente", ST))
    story.append(ok("Módulos liberados por plano corretos", ST))
    story.append(er("Nenhum campo editável pelo próprio cliente — para mudar e-mail ou telefone depende da MB", ST))
    story.append(er("Sem troca de senha pelo cliente", ST))
    story.append(er("Sem visualização de histórico de pagamentos / status da assinatura", ST))
    story.append(Spacer(1, 6*mm))
    story.append(divider())

    # =========================================================
    # SEÇÃO 3 – JORNADA DA MB (ADMIN) TELA A TELA
    # =========================================================
    story.append(Spacer(1, 2*mm))
    story.append(section_header("3  JORNADA DA MB (ADMIN) — ANÁLISE TELA A TELA", ST))
    story.append(Spacer(1, 4*mm))

    story.append(Paragraph(
        "A equipe MB usa 11 telas administrativas para operar clientes, publicar dados, "
        "aprovar análises e monitorar a carteira. Analisamos cada tela criticamente.",
        ST["body"]))
    story.append(Spacer(1, 4*mm))

    # ── 3.1 Operação MB
    story.append(Paragraph("3.1  Cockpit de Operação MB (#/admin/operacao)", ST["h2"]))
    story.append(ok("4 KPIs dinâmicos usando dados reais (clientes ativos, em risco, aprovações, importações)", ST))
    story.append(ok("Seletor de cliente altera contexto de todas as telas — design funcional", ST))
    story.append(ok("Jornada operacional com 4 etapas (Cadastro, Documentos, Importações, Análise)", ST))
    story.append(ok("Próximas ações (tarefas) do cliente selecionado visíveis", ST))
    story.append(ok("Trilha de auditoria recente presente", ST))
    story.append(wa("'Aprovações do cliente' lista só aprovações — sem botão de ação direta no cockpit", ST))
    story.append(wa("'Oportunidade comercial' é texto fixo por planId — não usa dados reais para recomendar upsell", ST))
    story.append(er("<b>Filas operacionais HARDCODED</b> no código: Fiscal='11 guias/XML', DRE='9 relatórios'", ST))
    story.append(er("Nenhum filtro de período — cockpit não distingue ações de hoje vs. ações de 30 dias atrás", ST))
    story.append(er("KPI 'Clientes em risco' conta onboarding + baixa confiança mas sem drill-down para ver quais são", ST))
    story.append(Spacer(1, 3*mm))
    story.append(code_line(
        "admin-pages.js linha 118: [\"Fiscal\", \"11 guias/XML\", \"Alta\", \"Paula\", pill(\"Atenção\")]  ← HARDCODED", ST))
    story.append(Spacer(1, 4*mm))

    # ── 3.2 Gestão de Clientes
    story.append(Paragraph("3.2  Gestão de Clientes (#/admin/clientes)", ST["h2"]))
    story.append(ok("Lista de clientes com plano, status e maturidade", ST))
    story.append(ok("'Operar' altera o cliente em contexto", ST))
    story.append(er("Sem busca / filtro — com 50+ clientes a tela ficaria inutilizável", ST))
    story.append(er("Sem ordenação por nome, plano, status ou risco", ST))
    story.append(er("Botão 'Operar' não navega para detalhes do cliente — só troca contexto global", ST))
    story.append(er("Sem visualização de KPIs do cliente diretamente na lista (faturamento, score, risco)", ST))
    story.append(Spacer(1, 4*mm))

    # ── 3.3 Novo Cliente
    story.append(Paragraph("3.3  Cadastro de Novo Cliente (#/admin/novo-cliente)", ST["h2"]))
    story.append(ok("Formulário completo (CNPJ, cidade, segmento, regime, plano, consultor, analista)", ST))
    story.append(ok("Integra com Supabase: cria client, company, financial_snapshot inicial", ST))
    story.append(wa("Sem criação automática de usuário para o cliente — a MB precisa criar separadamente em 'Usuários'", ST))
    story.append(wa("Sem envio de e-mail de boas-vindas / link de acesso ao novo cliente", ST))
    story.append(er("Sem validação de CNPJ (aceita '00.000.000/0001-00' fictício)", ST))
    story.append(er("Sem verificação de duplicidade de CNPJ antes de salvar", ST))
    story.append(Spacer(1, 4*mm))

    # ── 3.4 Alimentar Portal (MAIS CRÍTICO)
    story.append(Paragraph("3.4  Alimentar Portal (#/admin/alimentar-portal) ← FLUXO MAIS CRÍTICO", ST["h2"]))
    story.append(crit_box(
        "Esta é a tela mais importante do produto. É aqui que a MB insere os dados que o cliente "
        "verá no dashboard. E ela tem o problema mais grave do sistema: <b>ausência do campo "
        "competência</b>. Cada salvamento sobrescreve o snapshot mais recente, tornando "
        "impossível construir histórico pelo produto.",
        ST))
    story.append(Spacer(1, 3*mm))
    story.append(ok("11 campos financeiros bem organizados (faturamento a NCG)", ST))
    story.append(ok("Campo confiança dos dados presente", ST))
    story.append(ok("Botão criar tarefa/pendência funcional", ST))
    story.append(ok("Formulário criar análise para aprovação funcional", ST))
    story.append(ok("Mapa visual 'Como aparece para o cliente' muito claro para a equipe", ST))
    story.append(cr("SEM campo de competência — impossível adicionar dados de meses anteriores", ST))
    story.append(cr("PATCH sempre sobrescreve o último snapshot — sem acúmulo histórico", ST))
    story.append(er("Campo 'Análise MB' salva apenas 1 texto (insight[0]) — array insights perde conteúdo", ST))
    story.append(er("Sem campos para DRE manual — não há como inserir linhas de DRE pela interface", ST))
    story.append(er("Sem campos para Cash Flow — FCO/FCI/FCF não são editáveis pela interface", ST))
    story.append(er("Meta de margem e NCG salvos sem referência de período", ST))
    story.append(Spacer(1, 4*mm))
    story.append(Paragraph("Fluxo esperado vs. fluxo real:", ST["h3"]))
    fluxo_data = [
        ["O que a MB precisa fazer", "O que o produto permite"],
        ["Fechar mês de Junho/2026", "Sobrescreve snapshot de Maio/2026"],
        ["Comparar Maio vs. Junho", "Impossível — Maio é apagado"],
        ["Mostrar evolução ao cliente", "1 ponto de dado no gráfico"],
        ["Informar período do fechamento", "Sem campo competência"],
        ["Criar DRE do mês", "Sem interface — apenas via seed.js ou DB direto"],
        ["Criar DFC do mês", "Sem interface — apenas via seed.js ou DB direto"],
    ]
    story.append(grid_table(fluxo_data, [80*mm, 75*mm], ST,
                             header_bg=BRAND, font_size=8))
    story.append(Spacer(1, 4*mm))

    # ── 3.5 Planos
    story.append(Paragraph("3.5  Planos e Permissões (#/admin/planos)", ST["h2"]))
    story.append(ok("Preços editáveis pela MB com PATCH na API", ST))
    story.append(ok("Matriz de permissões por módulo/plano presente", ST))
    story.append(wa("Mudança de preço não atualiza cobranças de clientes existentes (lógica comercial faltante)", ST))
    story.append(er("Sem versionamento de preços — não há histórico de quando o preço foi alterado", ST))
    story.append(Spacer(1, 4*mm))

    # ── 3.6 Documentos (admin)
    story.append(Paragraph("3.6  Documentos (#/admin/documentos)", ST["h2"]))
    story.append(ok("Upload real para Supabase Storage com path estruturado por competência", ST))
    story.append(ok("Controle de visibilidade (Cliente / Somente MB)", ST))
    story.append(wa("Campo competência defaulta para '2026-06' — precisa ser mês atual dinâmico", ST))
    story.append(er("Sem filtro na lista de documentos por categoria, mês ou cliente", ST))
    story.append(er("Sem preview de documento antes da publicação", ST))
    story.append(Spacer(1, 4*mm))

    # ── 3.7 Importações (admin)
    story.append(Paragraph("3.7  Importações (#/admin/importacoes)", ST["h2"]))
    story.append(ok("Upload real para Storage com path versionado por competência", ST))
    story.append(ok("Lista geral de importações de todos os clientes visível para MB", ST))
    story.append(wa("Campo competência defaulta para '2026-06' hardcoded", ST))
    story.append(er("Sem processamento automático de OFX/CSV — apenas registra o arquivo, não extrai dados", ST))
    story.append(er("Sem filtro por período, tipo ou status na lista de importações", ST))
    story.append(er("Status e resultado são campos de texto livre sem padronização", ST))
    story.append(Spacer(1, 4*mm))

    # ── 3.8 Aprovações
    story.append(Paragraph("3.8  Aprovações (#/admin/aprovacoes) ← FUNCIONALIDADE QUEBRADA", ST["h2"]))
    story.append(crit_box(
        "A tela de aprovações é central para o processo: a IA gera análises → a MB revisa → "
        "o cliente recebe. Porém o endpoint PATCH /approvals/:id <b>não existe no servidor</b>. "
        "O formulário de revisão sempre retorna 404. Nenhuma aprovação pode ser salva via API.",
        ST))
    story.append(Spacer(1, 3*mm))
    story.append(ok("Design do fluxo de governança (Gera → Revisa → Libera) bem comunicado", ST))
    story.append(ok("Cards de aprovação com textarea para editar texto antes de liberar", ST))
    story.append(ok("Seletor de status (Aprovado / Editar / Rejeitado / Aguardando) presente", ST))
    story.append(cr("PATCH /approvals/:id retorna 404 — funcionalidade totalmente quebrada na API", ST))
    story.append(er("Lista mostra aprovações de TODOS os clientes misturados — sem filtro por cliente", ST))
    story.append(er("Sem notificação ao cliente quando análise é aprovada e liberada", ST))
    story.append(er("Sem histórico de quem aprovou e quando", ST))
    story.append(er("Fallback local (localStorage) funciona para salvamento, mas Supabase fica desatualizado", ST))
    story.append(Spacer(1, 3*mm))
    story.append(code_line(
        "app.js linha 245: await MBI.api.request('/approvals/'+data.approvalId, {method:'PATCH',...})", ST))
    story.append(code_line(
        "server-supabase.js — rota PATCH /approvals/:id NÃO IMPLEMENTADA → HTTP 404", ST))
    story.append(Spacer(1, 4*mm))

    # ── 3.9 Relatórios
    story.append(Paragraph("3.9  Relatórios Operacionais (#/admin/relatorios)", ST["h2"]))
    story.append(ok("4 tabelas com dados reais: carteira por plano, risco, produtividade, documentos", ST))
    story.append(ok("MRR estimado calculado por plano × clientes", ST))
    story.append(ok("Risco de cancelamento identifica clientes com onboarding + baixa confiança + tarefas abertas", ST))
    story.append(wa("MRR considera todos os clientes com preço-padrão — não reflete descontos/customizações", ST))
    story.append(er("Sem filtro de período — relatórios mostram estado atual, não evolução no tempo", ST))
    story.append(er("Sem exportação dos relatórios (PDF/Excel)", ST))
    story.append(er("Sem gráfico de crescimento da carteira ao longo do tempo", ST))
    story.append(er("Produtividade da equipe conta tarefas por nome — frágil se nome mudar", ST))
    story.append(Spacer(1, 4*mm))

    # ── 3.10 Usuários
    story.append(Paragraph("3.10  Usuários (#/admin/usuarios)", ST["h2"]))
    story.append(ok("Criação de usuário com Supabase Auth real", ST))
    story.append(ok("Lista de usuários MB e clientes", ST))
    story.append(er("Sem edição de usuário existente (sem PATCH para usuários)", ST))
    story.append(er("Sem desativação de usuário (sem PATCH para status)", ST))
    story.append(er("Senha '123456' como default hardcoded no código", ST))
    story.append(Spacer(1, 4*mm))

    # ── 3.11 Auditoria
    story.append(Paragraph("3.11  Auditoria (#/admin/auditoria)", ST["h2"]))
    story.append(ok("Trilha de auditoria gravada no Supabase (audit_logs)", ST))
    story.append(ok("Registra: quem, o quê, onde, resultado", ST))
    story.append(er("Sem filtro por data, usuário ou tipo de ação", ST))
    story.append(er("Sem paginação — todos os logs carregados de uma vez", ST))
    story.append(er("Sem exportação da trilha (compliance exige exportação)", ST))
    story.append(Spacer(1, 6*mm))
    story.append(divider())

    # =========================================================
    # SEÇÃO 4 – INCOERÊNCIAS GRAVES DE DADOS E NARRATIVA
    # =========================================================
    story.append(Spacer(1, 2*mm))
    story.append(section_header("4  INCOERÊNCIAS GRAVES — DADOS E NARRATIVA", ST))
    story.append(Spacer(1, 4*mm))

    story.append(Paragraph("4.1  Nomenclatura enganosa", ST["h2"]))
    incoer_data = [
        ["Onde aparece", "Texto no produto", "Problema real"],
        ["Gráfico principal", "Evolução mensal consolidada", "1 ponto = sem evolução"],
        ["Gráfico CFO", "Receita, despesas e pressão de margem em visão ampliada", "1 ponto = sem visão ampliada"],
        ["Meta de margem", "Meta lida da configuração financeira do cliente", "Campo marginTarget sem período"],
        ["Insight CFO", "acompanhar diferença entre crescimento de receita...", "Sem dados históricos para calcular crescimento"],
        ["DRE competência", "Competência atual validada pela MB", "Sem indicação do mês/ano real"],
        ["Score", "MB Financial Score", "Calculado na hora — não reflete histórico de meses"],
        ["Operação cockpit", "11 guias/XML · Fiscal", "Hardcoded — não reflete realidade"],
        ["Onboarding", "Próxima revisão: {data}", "Calculada como NOW+7 dias, não do banco"],
    ]
    story.append(grid_table(incoer_data, [40*mm, 65*mm, 50*mm], ST, font_size=7.5))
    story.append(Spacer(1, 4*mm))

    story.append(Paragraph("4.2  Incompletude por plano — o que está vazio", ST["h2"]))
    vazio_data = [
        ["Plano", "Campo", "Valor no banco", "Impacto no cliente"],
        ["Financeiro IA", "dre", "[] (array vazio)", "Nenhuma DRE exibida"],
        ["Financeiro IA", "cashBridge", "[] (array vazio)", "Nenhum DFC exibido"],
        ["Contabilidade", "dre", "[] (array vazio)", "Correto — plano não inclui"],
        ["Contabilidade", "cashBridge", "[] (array vazio)", "Correto — plano não inclui"],
        ["CFO", "months", "[['Mai/26', 183, 142]]", "1 ponto no gráfico de evolução"],
        ["CFO", "scoreBreakdown dimensions", "6 dimensões calculadas ✔", "OK"],
        ["Financeiro IA", "months", "[['Mai/26', 97, 70]]", "1 ponto no gráfico"],
        ["Contabilidade", "months", "[['Mai/26', 43, 0]]", "1 ponto (despesas = 0)"],
    ]
    story.append(grid_table(vazio_data, [35*mm, 38*mm, 45*mm, 37*mm], ST, font_size=7.5))
    story.append(Spacer(1, 4*mm))

    story.append(Paragraph("4.3  Coerência da Impressão de Relatórios", ST["h2"]))
    story.append(ok("Layout HTML com cabeçalho MB, logo, seção meta, tabela, notas e assinaturas", ST))
    story.append(ok("Campos de assinatura: Responsável Técnico + Responsável pela empresa", ST))
    story.append(ok("Número de documento dinâmico (MBI-202606-clientId-type)", ST))
    story.append(wa("CNPJ/CRC da MB: 'CNPJ/CRC: informar nos parâmetros oficiais da MB' — nunca preenchido", ST))
    story.append(wa("Insight inserido no relatório impresso pode ser 'Dados carregados do Supabase.' — mensagem técnica", ST))
    story.append(wa("DRE impressa: competência = 'Competência atual validada pela MB' — sem data real", ST))
    story.append(er("Logo: tenta carregar 'assets/mb-logo-premium.svg' — se não existir, relatório sai sem logo", ST))
    story.append(er("Relatório abre window.open() com popup — bloqueado em muitos browsers modernos", ST))
    story.append(Spacer(1, 6*mm))
    story.append(divider())

    # =========================================================
    # SEÇÃO 5 – BUGS FUNCIONAIS CONFIRMADOS
    # =========================================================
    story.append(Spacer(1, 2*mm))
    story.append(section_header("5  BUGS FUNCIONAIS CONFIRMADOS — CÓDIGO E API", ST))
    story.append(Spacer(1, 4*mm))

    bugs_data = [
        ["#", "Bug", "Localização", "Severidade"],
        ["B1", "PATCH /approvals/:id retorna 404 — rota inexistente",
         "server-supabase.js (ausente)", "BLOQUEANTE"],
        ["B2", "Campo competência ausente no formulário Alimentar Portal — impossível criar histórico",
         "admin-pages.js publicationCenter()", "BLOQUEANTE"],
        ["B3", "PATCH finance sempre sobrescreve último snapshot (nunca cria novo mês)",
         "server-supabase.js linha 874", "CRÍTICO"],
        ["B4", "Upload de documentos/importações com mês hardcoded '2026-06'",
         "admin-pages.js documents()/imports()", "FUNCIONAL"],
        ["B5", "Filas operacionais do cockpit MB com valores hardcoded",
         "admin-pages.js operationV2() linha 118", "GRAVE"],
        ["B6", "nextReview no onboarding calculado como NOW+7 — não vem do banco",
         "client-pages.js onboarding()", "MENOR"],
        ["B7", "Insight[0] único salvo pelo formulário — array insights[1] e [2] apagados",
         "server-supabase.js PATCH /finance + admin-pages.js", "GRAVE"],
        ["B8", "CNPJ/CRC da MB nunca preenchido no relatório impresso",
         "app.js printReport()", "FUNCIONAL"],
        ["B9", "Logo do relatório pode falhar se SVG não existir em assets/",
         "app.js printReport()", "MENOR"],
        ["B10", "Usuário cliente criado sem envio de e-mail ou instrução de acesso",
         "server-supabase.js register-client + /users", "FUNCIONAL"],
    ]
    story.append(grid_table(bugs_data, [10*mm, 80*mm, 55*mm, 20*mm], ST, font_size=7.5))
    story.append(Spacer(1, 6*mm))
    story.append(divider())

    # =========================================================
    # SEÇÃO 6 – O QUE FUNCIONA BEM
    # =========================================================
    story.append(Spacer(1, 2*mm))
    story.append(section_header("6  O QUE FUNCIONA BEM — PONTOS POSITIVOS", ST, color=GREEN))
    story.append(Spacer(1, 4*mm))

    story.append(Paragraph(
        "Apesar dos problemas graves, existem fundações sólidas que merecem reconhecimento:",
        ST["body"]))
    story.append(Spacer(1, 3*mm))

    positivos = [
        ("Autenticação Supabase real", "JWT ES256, sessão persistida, multi-tenant com isolamento"),
        ("DRE com 18 linhas (CFO)", "5 blocos: Receita, CMV, Despesas Op., Resultado Fin., Impostos — estrutura NBC"),
        ("DFC com 3 seções (CFO)", "FCO, FCI, FCF + saldo inicial/final/variação — estrutura NBC T 3.8"),
        ("Score com algoritmo", "6 dimensões ponderadas calculadas no servidor (não número manual)"),
        ("Relatório impresso", "Layout HTML com logo, assinaturas, número de documento, CNPJ"),
        ("Upload para Storage", "Supabase Storage real com path estruturado por competência"),
        ("Isolamento multi-tenant", "Cliente só vê seus dados; MB vê todos — verificado via API"),
        ("Sync remoto-local", "Fallback para localStorage quando API indisponível"),
        ("Auditoria completa", "Trilha de audit_logs no Supabase para todas as ações"),
        ("Aprovações workflow", "Fluxo de governança bem desenhado (mesmo com o bug do PATCH)"),
        ("expenseCompositionBars()", "Calcula composição real de revenue/payroll/taxes/expenses"),
        ("calculateFinancialScore()", "Algoritmo no servidor com scoreHigherIsBetter/scoreLowerIsBetter"),
        ("buildProfessionalDre()", "Função robusta que constrói DRE de dados financeiros brutos"),
        ("buildCashFlowReport()", "Função que monta DFC de 3 seções a partir de cash_flow_reports"),
        ("historyToMonths()", "Busca últimos 12 snapshots — pronto para usar quando histórico existir"),
        ("remoteOrLocal()", "Pattern elegante de API-first com fallback local"),
    ]
    for nome, detalhe in positivos:
        story.append(ok(f"<b>{nome}:</b> {detalhe}", ST))
    story.append(Spacer(1, 6*mm))
    story.append(divider())

    # =========================================================
    # SEÇÃO 7 – DIAGNÓSTICO POR PLANO E VALOR ENTREGUE
    # =========================================================
    story.append(Spacer(1, 2*mm))
    story.append(section_header("7  DIAGNÓSTICO DE VALOR ENTREGUE POR PLANO", ST))
    story.append(Spacer(1, 4*mm))

    story.append(Paragraph("7.1  Contabilidade — R$800/mês", ST["h2"]))
    story.append(Paragraph(
        "Cliente tipo: Serviços Prime ME. Necessidade: guias, DAS, documentos fiscais, "
        "status de obrigações.", ST["body"]))
    story.append(Spacer(1, 2*mm))
    story.append(ok("Documentos acessíveis com download do Storage", ST))
    story.append(ok("Portal contábil com status fiscal (DAS/Contábil/Trabalhista)", ST))
    story.append(ok("Copiloto com tarefas da MB visível", ST))
    story.append(wa("Sem calendário de vencimentos — o cliente não vê 'DAS vence em 5 dias'", ST))
    story.append(er("Insights: 'Dados carregados do Supabase' — mensagem técnica visível", ST))
    story.append(er("Nenhum filtro temporal em documentos", ST))
    story.append(Paragraph("<b>Veredicto: entrega o básico mas sem temporalidade e sem alertas proativos.</b>",
                           ST["label_warn"]))
    story.append(Spacer(1, 4*mm))

    story.append(Paragraph("7.2  Financeiro IA — R$1.200/mês", ST["h2"]))
    story.append(Paragraph(
        "Cliente tipo: Clínica Norte PME. Necessidade: dashboard gerencial, "
        "evolução de faturamento, análises automáticas, visibilidade de folha e impostos.",
        ST["body"]))
    story.append(Spacer(1, 2*mm))
    story.append(ok("4 KPIs financeiros com dados reais", ST))
    story.append(ok("Gráfico presente (mesmo com 1 ponto)", ST))
    story.append(er("DRE vazia — array [] — cliente vê tela em branco ou bloqueada", ST))
    story.append(er("DFC vazia — array [] — não há fluxo de caixa para este plano", ST))
    story.append(er("Gráfico de evolução: 1 ponto = sem evolução", ST))
    story.append(er("Sem filtro de período", ST))
    story.append(Paragraph(
        "<b>Veredicto: paga R$1.200/mês e recebe dashboard básico sem evolução nem DRE. "
        "Diferença mínima percebida em relação ao plano de R$800.</b>",
        ST["label_err"]))
    story.append(Spacer(1, 4*mm))

    story.append(Paragraph("7.3  CFO as a Service — R$2.000/mês", ST["h2"]))
    story.append(Paragraph(
        "Cliente tipo: Comércio Silva LTDA. Necessidade: DRE profissional, "
        "DFC 3 seções, score com tendência, comparação de períodos, consultoria executiva.",
        ST["body"]))
    story.append(Spacer(1, 2*mm))
    story.append(ok("DRE 18 linhas estruturada — ponto mais forte do produto", ST))
    story.append(ok("DFC FCO/FCI/FCF com saldo inicial/final", ST))
    story.append(ok("Score com 6 dimensões e breakdown", ST))
    story.append(ok("Gráficos executivos (margem, composição, investimento, score/capacidade)", ST))
    story.append(ok("Relatório impresso com layout MB e assinaturas", ST))
    story.append(er("Gráfico de evolução: 1 ponto — sem tendência histórica", ST))
    story.append(er("DRE sem data de competência visível", ST))
    story.append(er("Score sem histórico — não há 'era 78 em abril, foi 82 em maio'", ST))
    story.append(er("Nenhum filtro mês/ano em qualquer tela", ST))
    story.append(er("CNPJ/CRC da MB faltante no relatório impresso", ST))
    story.append(Paragraph(
        "<b>Veredicto: melhor plano do produto, mas sem dimensão temporal o CFO real "
        "não consegue tomar decisões baseadas em tendência — que é exatamente o que ele paga.</b>",
        ST["label_warn"]))
    story.append(Spacer(1, 6*mm))
    story.append(divider())

    # =========================================================
    # SEÇÃO 8 – BACKLOG PRIORIZADO
    # =========================================================
    story.append(Spacer(1, 2*mm))
    story.append(section_header("8  BACKLOG PRIORIZADO — 5 SPRINTS", ST))
    story.append(Spacer(1, 4*mm))

    story.append(Paragraph(
        "Ordenado por impacto no cliente pagante e severidade técnica. "
        "Sprints de 2 semanas cada.", ST["body"]))
    story.append(Spacer(1, 4*mm))

    # Sprint 1
    story.append(Paragraph("Sprint 1 — Corrigir bloqueantes (sem entrega de produto sem isso)", ST["h2"]))
    sp1 = [
        ["#", "Tarefa", "Arquivo(s)", "Esforço"],
        ["1.1", "Implementar PATCH /approvals/:id no servidor",
         "server-supabase.js", "2h"],
        ["1.2", "Adicionar campo competência (input[type=month]) no formulário Alimentar Portal",
         "admin-pages.js publicationCenter()", "1h"],
        ["1.3", "Modificar PATCH /finance para criar novo snapshot se competência diferir",
         "server-supabase.js handleFinance()", "4h"],
        ["1.4", "Dinamizar default de competência nos uploads (mês atual dinâmico)",
         "admin-pages.js documents()/imports()", "30min"],
        ["1.5", "Preencher CNPJ/CRC da MB no printReport()",
         "app.js printReport()", "30min"],
    ]
    story.append(grid_table(sp1, [10*mm, 85*mm, 55*mm, 15*mm], ST, font_size=7.5))
    story.append(Spacer(1, 4*mm))

    # Sprint 2
    story.append(Paragraph("Sprint 2 — Dimensão temporal na interface", ST["h2"]))
    sp2 = [
        ["#", "Tarefa", "Arquivo(s)", "Esforço"],
        ["2.1", "Selector de competência (mês/ano) nas telas de Inteligência — cliente e admin",
         "client-pages.js + admin-pages.js", "1 dia"],
        ["2.2", "Filtrar dados financeiros por competência selecionada",
         "sync.js + services/finance.js", "1 dia"],
        ["2.3", "Exibir rótulo de competência na DRE e no DFC impressos",
         "app.js printReport()", "2h"],
        ["2.4", "Histórico de score: array de pontos por mês",
         "server-supabase.js financeToApi()", "4h"],
        ["2.5", "Filtro de período na tela de Documentos (cliente e admin)",
         "client-pages.js + admin-pages.js", "4h"],
    ]
    story.append(grid_table(sp2, [10*mm, 85*mm, 55*mm, 15*mm], ST, font_size=7.5))
    story.append(Spacer(1, 4*mm))

    # Sprint 3
    story.append(Paragraph("Sprint 3 — Gráficos com dados reais e múltiplos pontos", ST["h2"]))
    sp3 = [
        ["#", "Tarefa", "Detalhe"],
        ["3.1", "Gráfico evolução com eixo X de competências",
         "Chart.js com labels de Jan/Fev/Mar... ao invés de SVG estático"],
        ["3.2", "Gráfico de score histórico",
         "Linha de score por mês após Sprint 2.4"],
        ["3.3", "Gráfico comparativo DRE mês anterior vs. mês atual",
         "Requer Sprint 1.3 (múltiplos snapshots)"],
        ["3.4", "Correção do título 'Evolução mensal' — só exibir quando N > 1 mês",
         "client-pages.js intelligence()"],
    ]
    story.append(grid_table(sp3, [10*mm, 55*mm, 90*mm], ST, font_size=7.5))
    story.append(Spacer(1, 4*mm))

    # Sprint 4
    story.append(Paragraph("Sprint 4 — Completar dados do Plano Financeiro IA", ST["h2"]))
    sp4 = [
        ["#", "Tarefa", "Impacto"],
        ["4.1", "DRE para plano Financeiro IA: calcular buildProfessionalDre() mesmo sem linhas explícitas",
         "Clínica Norte deixa de ver DRE vazia"],
        ["4.2", "DFC para plano Financeiro IA: usar buildCashFlowReport() com dados disponíveis",
         "Clínica Norte obtém visão de caixa"],
        ["4.3", "Filtrar insights para remover mensagens técnicas ('Dados carregados do Supabase.')",
         "Nenhum cliente vê mensagem interna"],
        ["4.4", "Interface para criar/editar linhas de DRE e DFC pelo Alimentar Portal",
         "MB pode construir DRE sem acessar banco diretamente"],
    ]
    story.append(grid_table(sp4, [10*mm, 95*mm, 50*mm], ST, font_size=7.5))
    story.append(Spacer(1, 4*mm))

    # Sprint 5
    story.append(Paragraph("Sprint 5 — Qualidade operacional e buscas", ST["h2"]))
    sp5 = [
        ["#", "Tarefa"],
        ["5.1", "Busca/filtro na lista de clientes (Gestão de Clientes)"],
        ["5.2", "Filas operacionais no Cockpit MB com dados reais (contar documentos/tarefas/aprovações por fila)"],
        ["5.3", "Paginação nas listas de documentos, importações e auditoria"],
        ["5.4", "nextReview do onboarding salvo no banco (campo next_review_at no client)"],
        ["5.5", "Edição e desativação de usuários (PATCH /users/:id)"],
        ["5.6", "Calendário fiscal com vencimentos para plano Contabilidade"],
        ["5.7", "Validação de CNPJ no cadastro de cliente"],
        ["5.8", "Exportação de relatórios operacionais em CSV/Excel"],
    ]
    story.append(grid_table(sp5, [10*mm, 145*mm], ST, font_size=7.5))
    story.append(Spacer(1, 6*mm))
    story.append(divider())

    # =========================================================
    # SEÇÃO 9 – DIAGNÓSTICO FINAL
    # =========================================================
    story.append(Spacer(1, 2*mm))
    story.append(section_header("9  DIAGNÓSTICO FINAL", ST))
    story.append(Spacer(1, 4*mm))

    story.append(Paragraph("O produto tem fundações excelentes e problemas de produto graves.", ST["h2"]))
    story.append(Spacer(1, 3*mm))

    story.append(Paragraph(
        "A arquitetura técnica (Supabase, isolamento multi-tenant, sync remoto-local, "
        "DRE profissional, DFC 3 seções, score com algoritmo) demonstra maturidade técnica "
        "e visão de produto clara. <b>O produto NÃO é tecnicamente ruim.</b>",
        ST["body"]))
    story.append(Spacer(1, 3*mm))
    story.append(Paragraph(
        "Mas há uma lacuna fundamental: <b>o produto foi construído como uma fotografia, "
        "não como um filme.</b> Cada tela mostra o estado atual. Nenhuma tela mostra "
        "a evolução. Um empresário que paga R$2.000/mês por CFO precisa de tendência, "
        "comparação e projeção — o produto entrega apenas 1 frame.",
        ST["body"]))
    story.append(Spacer(1, 4*mm))

    final_data = [
        ["Dimensão", "Nota", "Comentário"],
        ["Arquitetura técnica", "8/10", "Supabase, multi-tenant, isolamento, sync — sólido"],
        ["Funcionalidades entregues (CFO)", "6/10", "DRE e DFC boas, mas sem período e sem histórico"],
        ["Funcionalidades entregues (Financeiro IA)", "3/10", "DRE e DFC vazias, gráfico de 1 ponto"],
        ["Funcionalidades entregues (Contabilidade)", "5/10", "Básico funciona, sem calendário fiscal"],
        ["Dimensão temporal", "0/10", "Ausente em 100% das telas do produto"],
        ["Jornada do cliente CFO", "4/10", "Boa estrutura, quebra no que mais importa"],
        ["Jornada da equipe MB", "5/10", "Alimentar Portal funciona mas sem competência"],
        ["Bugs críticos", "2/10", "PATCH /approvals não existe — workflow de aprovação quebrado"],
        ["Qualidade dos dados exibidos", "5/10", "Muitos zeros, arrays vazios, 1 ponto no gráfico"],
        ["Impressão de relatórios", "7/10", "Layout bom, faltam CNPJ/CRC e competência real"],
    ]
    story.append(grid_table(final_data, [65*mm, 20*mm, 70*mm], ST, font_size=8))
    story.append(Spacer(1, 4*mm))

    story.append(crit_box(
        "<b>Prioridade máxima antes de qualquer nova funcionalidade:</b><br/>"
        "1. Implementar campo de competência no Alimentar Portal<br/>"
        "2. Modificar PATCH /finance para criar novos snapshots mensais<br/>"
        "3. Implementar PATCH /approvals/:id no servidor<br/>"
        "Sem esses 3 itens, o produto não tem dimensão temporal e o workflow de "
        "aprovação de IA está completamente quebrado.",
        ST))
    story.append(Spacer(1, 4*mm))

    story.append(ok_box(
        "<b>Quando os 3 itens acima forem resolvidos</b>, o produto terá base sólida "
        "para evoluir: adicionar filtros de período nas telas, exibir gráficos com "
        "múltiplos pontos reais, comparar DRE de meses diferentes e entregar o valor "
        "de CFO que justifica R$2.000/mês.",
        ST))
    story.append(Spacer(1, 6*mm))

    story.append(Paragraph(
        "MB Empresas Assessoria · MB Intelligence · Análise Crítica v2.0 · Maio/2026 · Confidencial",
        ParagraphStyle("foot", fontName="Helvetica", fontSize=7.5,
                       textColor=MUTED, alignment=TA_CENTER)))

    doc.build(story)
    print(f"PDF gerado: {output}")

if __name__ == "__main__":
    build_doc()
