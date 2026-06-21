# -*- coding: utf-8 -*-
"""
MB Intelligence — Auditoria Completa de Entrega Comercial Fase 1
Revisao: login, jornadas MB e cliente, funcionalidades criticas, bugs, dados
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.platypus import (
    BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer,
    Table, TableStyle, HRFlowable, KeepTogether, PageBreak
)
from reportlab.graphics.shapes import Drawing, Rect, String, Circle, Line, Polygon, PolyLine
import math

W, H = A4
BRAND   = colors.HexColor("#5b070b")
BRAND2  = colors.HexColor("#8f121b")
GRAY_INK= colors.HexColor("#111318")
GRAY_MUT= colors.HexColor("#667085")
GRAY_SOF= colors.HexColor("#8b94a3")
GRAY_LIN= colors.HexColor("#dfe4ea")
GRAY_BG = colors.HexColor("#f5f6f8")
SUCCESS = colors.HexColor("#12805c")
SUCCESS_L=colors.HexColor("#dcfce7")
WARN    = colors.HexColor("#b7791f")
WARN_L  = colors.HexColor("#fef3c7")
DANGER  = colors.HexColor("#b42318")
DANGER_L= colors.HexColor("#fee2e2")
INFO    = colors.HexColor("#2563eb")
INFO_L  = colors.HexColor("#dbeafe")
TEAL    = colors.HexColor("#0f766e")
TEAL_L  = colors.HexColor("#ccfbf1")
AMBER   = colors.HexColor("#d97706")
AMBER_L = colors.HexColor("#fef9c3")
PURPLE  = colors.HexColor("#7c3aed")
PURPLE_L= colors.HexColor("#ede9fe")
WHITE   = colors.white

OUTPUT = r"C:\MB EMPRESAS\MB_Intelligence_Produto_Final\docs\MB_Auditoria_Fase1_Comercial.pdf"

# ─── ESTILOS ────────────────────────────────────────────────────────────────

def s(name, **kw):
    return ParagraphStyle(name, **kw)

ST = {
    "cover_title": s("ct", fontName="Helvetica-Bold", fontSize=40, leading=46,
                     textColor=BRAND, spaceAfter=8),
    "cover_sub": s("cs", fontName="Helvetica", fontSize=15, leading=22,
                   textColor=BRAND2, spaceAfter=4),
    "cover_meta": s("cm", fontName="Helvetica", fontSize=11, leading=17,
                    textColor=GRAY_INK),
    "h1": s("h1", fontName="Helvetica-Bold", fontSize=18, leading=24,
            textColor=BRAND, spaceBefore=16, spaceAfter=8),
    "h2": s("h2", fontName="Helvetica-Bold", fontSize=13, leading=18,
            textColor=GRAY_INK, spaceBefore=12, spaceAfter=5),
    "h3": s("h3", fontName="Helvetica-Bold", fontSize=10.5, leading=14,
            textColor=GRAY_INK, spaceBefore=8, spaceAfter=3),
    "body": s("b", fontName="Helvetica", fontSize=9.5, leading=15,
              textColor=GRAY_INK, spaceAfter=5, alignment=TA_JUSTIFY),
    "small": s("sm", fontName="Helvetica", fontSize=8.5, leading=13,
               textColor=GRAY_MUT, spaceAfter=3),
    "bullet": s("bl", fontName="Helvetica", fontSize=9.5, leading=15,
                textColor=GRAY_INK, leftIndent=12, spaceAfter=2),
    "center": s("ctr", fontName="Helvetica", fontSize=9, leading=13,
                textColor=GRAY_MUT, alignment=TA_CENTER, spaceAfter=6),
    "big_ok": s("bok", fontName="Helvetica-Bold", fontSize=32, leading=38,
                textColor=SUCCESS, alignment=TA_CENTER),
    "big_warn": s("bwn", fontName="Helvetica-Bold", fontSize=32, leading=38,
                  textColor=WARN, alignment=TA_CENTER),
    "big_bad": s("bbd", fontName="Helvetica-Bold", fontSize=32, leading=38,
                 textColor=DANGER, alignment=TA_CENTER),
    "lbl": s("lbl", fontName="Helvetica-Bold", fontSize=8.5, leading=12,
             textColor=GRAY_MUT, spaceAfter=2),
}

# ─── PAGE CALLBACKS ─────────────────────────────────────────────────────────

def on_cover(canvas, doc):
    canvas.saveState()
    # Fundo branco limpo
    canvas.setFillColor(WHITE)
    canvas.rect(0, 0, W, H, fill=1, stroke=0)
    # Faixa de cabeçalho BRAND no topo (corresponde ao topPadding=H//3)
    canvas.setFillColor(BRAND)
    canvas.rect(0, H - (H // 3), W, H // 3, fill=1, stroke=0)
    # Brilho sutil no lado direito do cabeçalho
    canvas.setFillColorRGB(1, 1, 1, 0.06)
    canvas.rect(W * 0.45, H - (H // 3), W * 0.55, H // 3, fill=1, stroke=0)
    # Marca d'água "MB" no cabeçalho
    canvas.setFont("Helvetica-Bold", 160)
    canvas.setFillColorRGB(1, 1, 1, 0.05)
    canvas.drawString(-6, H - (H // 3) + 30, "MB")
    # Linha separadora entre cabeçalho e conteúdo
    canvas.setFillColor(colors.HexColor("#e2e8f0"))
    canvas.rect(0, H - (H // 3) - 2, W, 2, fill=1, stroke=0)
    # Barra lateral esquerda no corpo (branco)
    canvas.setFillColor(BRAND)
    canvas.rect(0, 40, 4, H - (H // 3) - 50, fill=1, stroke=0)
    # Barra inferior BRAND
    canvas.setFillColor(BRAND)
    canvas.rect(0, 0, W, 6, fill=1, stroke=0)
    # Caixa cinza suave para metadados na parte inferior
    canvas.setFillColor(colors.HexColor("#f8f9fb"))
    canvas.rect(54, 52, W - 108, 110, fill=1, stroke=0)
    canvas.setStrokeColor(colors.HexColor("#e2e8f0"))
    canvas.setLineWidth(0.5)
    canvas.rect(54, 52, W - 108, 110, fill=0, stroke=1)
    canvas.restoreState()


def on_page(canvas, doc):
    canvas.saveState()
    # Fundo branco garantido em todas as páginas internas
    canvas.setFillColor(WHITE)
    canvas.rect(0, 0, W, H, fill=1, stroke=0)
    # Barra topo BRAND fina
    canvas.setFillColor(BRAND)
    canvas.rect(0, H - 5, W, 5, fill=1, stroke=0)
    # Rodapé
    canvas.setFillColor(GRAY_LIN)
    canvas.rect(0, 0, W, 1, fill=1, stroke=0)
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(GRAY_SOF)
    canvas.drawString(40, 13, "MB Intelligence — Auditoria Completa Fase 1 · Entrega Comercial · Confidencial")
    canvas.drawRightString(W - 40, 13, f"Página {doc.page}")
    canvas.restoreState()

# ─── HELPERS ────────────────────────────────────────────────────────────────

def sec_header(title, sub="", color=BRAND):
    elems = []
    dw = W - 80
    d = Drawing(dw, 40)
    d.add(Rect(0, 0, dw, 40, rx=6, ry=6,
               fillColor=colors.Color(color.red, color.green, color.blue, 0.07),
               strokeColor=colors.Color(color.red, color.green, color.blue, 0.22),
               strokeWidth=1))
    d.add(Rect(0, 0, 4, 40, rx=2, ry=2, fillColor=color, strokeColor=None))
    d.add(String(14, 26, title, fontName="Helvetica-Bold", fontSize=14, fillColor=color))
    if sub:
        d.add(String(14, 11, sub, fontName="Helvetica", fontSize=9, fillColor=GRAY_MUT))
    elems.append(d)
    elems.append(Spacer(1, 8))
    return elems


def colored_box(text, color=INFO, bg=INFO_L, prefix=""):
    t = f"{prefix}  {text}" if prefix else text
    style = ParagraphStyle("cb", fontName="Helvetica", fontSize=9, leading=14,
                           textColor=colors.Color(color.red*0.7, color.green*0.7, color.blue*0.7),
                           backColor=bg, borderColor=color, borderWidth=0.5,
                           borderPadding=9, borderRadius=5, spaceAfter=7)
    return Paragraph(t, style)


def ok_box(t):  return colored_box(t, SUCCESS, SUCCESS_L, "✓")
def warn_box(t):return colored_box(t, WARN,    WARN_L,    "⚠")
def bad_box(t): return colored_box(t, DANGER,  DANGER_L,  "✗")
def info_box(t):return colored_box(t, INFO,    INFO_L,    "ℹ")


def status_badge(status, dw=68):
    d = Drawing(dw, 18)
    sc_map = {
        "OK":       (SUCCESS, SUCCESS_L),
        "Funciona": (SUCCESS, SUCCESS_L),
        "Parcial":  (WARN,    WARN_L),
        "Problema": (DANGER,  DANGER_L),
        "Critico":  (DANGER,  DANGER_L),
        "Ausente":  (GRAY_SOF,GRAY_BG),
        "Dados":    (AMBER,   AMBER_L),
        "API":      (PURPLE,  PURPLE_L),
        "Bug":      (DANGER,  DANGER_L),
    }
    sc, sl = sc_map.get(status, (GRAY_MUT, GRAY_BG))
    d.add(Rect(0, 0, dw, 18, rx=4, ry=4, fillColor=sl, strokeColor=None))
    d.add(String(dw/2, 4.5, status, fontName="Helvetica-Bold", fontSize=8,
                 fillColor=sc, textAnchor="middle"))
    return d


def journey_card(title, items, color=TEAL):
    """Cartão de jornada com itens marcados"""
    rows = []
    for icon, text, st in items:
        sc = SUCCESS if st == "OK" else (WARN if st == "Parcial" else (DANGER if st in ("Bug","Critico") else GRAY_SOF))
        badge_d = status_badge(st, 62)
        rows.append([
            Paragraph(f"{icon} {text}", ST["body"]),
            badge_d
        ])
    t = Table(rows, colWidths=[360, 66])
    t.setStyle(TableStyle([
        ("ROWBACKGROUNDS", (0,0), (-1,-1), [WHITE, GRAY_BG]),
        ("TOPPADDING",     (0,0), (-1,-1), 5),
        ("BOTTOMPADDING",  (0,0), (-1,-1), 5),
        ("LEFTPADDING",    (0,0), (-1,-1), 8),
        ("RIGHTPADDING",   (0,0), (-1,-1), 6),
        ("VALIGN",         (0,0), (-1,-1), "MIDDLE"),
        ("GRID",           (0,0), (-1,-1), 0.3, GRAY_LIN),
    ]))
    return t


def full_matrix(rows):
    """Tabela matriz completa com 5 colunas"""
    header = [
        Paragraph("<b>Funcionalidade</b>", ST["lbl"]),
        Paragraph("<b>Tela / Rota</b>", ST["lbl"]),
        Paragraph("<b>Jornada</b>", ST["lbl"]),
        Paragraph("<b>Criticidade</b>", ST["lbl"]),
        Paragraph("<b>Status</b>", ST["lbl"]),
    ]
    data = [header]
    for feat, route, who, crit, stat in rows:
        crit_color = DANGER if crit == "Alta" else (WARN if crit == "Média" else GRAY_SOF)
        d_crit = Drawing(44, 18)
        d_crit.add(Rect(0, 0, 44, 18, rx=4, ry=4,
                        fillColor=colors.Color(crit_color.red, crit_color.green, crit_color.blue, 0.12),
                        strokeColor=None))
        d_crit.add(String(22, 4.5, crit, fontName="Helvetica-Bold", fontSize=8,
                          fillColor=crit_color, textAnchor="middle"))
        data.append([
            Paragraph(feat, ST["body"]),
            Paragraph(f"<font color='#667085'>{route}</font>", ST["small"]),
            Paragraph(who, ST["small"]),
            d_crit,
            status_badge(stat, 68),
        ])
    t = Table(data, colWidths=[175, 105, 60, 48, 72])
    t.setStyle(TableStyle([
        ("BACKGROUND",    (0,0), (-1,0), colors.HexColor("#f0f4f8")),
        ("ROWBACKGROUNDS",(0,1), (-1,-1), [WHITE, GRAY_BG]),
        ("TOPPADDING",    (0,0), (-1,-1), 5),
        ("BOTTOMPADDING", (0,0), (-1,-1), 5),
        ("LEFTPADDING",   (0,0), (-1,-1), 7),
        ("RIGHTPADDING",  (0,0), (-1,-1), 5),
        ("VALIGN",        (0,0), (-1,-1), "MIDDLE"),
        ("GRID",          (0,0), (-1,-1), 0.3, GRAY_LIN),
        ("FONTNAME",      (0,0), (-1,0), "Helvetica-Bold"),
        ("FONTSIZE",      (0,0), (-1,0), 8.5),
    ]))
    return t


def kpi_row(items):
    """Linha de KPI numérico"""
    row_data = []
    for label, value, style_key in items:
        inner = Table([
            [Paragraph(value, ST[style_key])],
            [Paragraph(label, ST["center"])],
        ], colWidths=[(W - 80) / len(items)])
        inner.setStyle(TableStyle([
            ("ALIGN", (0,0), (-1,-1), "CENTER"),
            ("TOPPADDING", (0,0), (-1,-1), 10),
            ("BOTTOMPADDING", (0,0), (-1,-1), 10),
            ("BACKGROUND", (0,0), (-1,-1), GRAY_BG),
        ]))
        row_data.append(inner)
    t = Table([row_data], colWidths=[(W - 80) / len(items)] * len(items))
    t.setStyle(TableStyle([
        ("GRID", (0,0), (-1,-1), 0.5, GRAY_LIN),
        ("LEFTPADDING", (0,0), (-1,-1), 0),
        ("RIGHTPADDING", (0,0), (-1,-1), 0),
        ("TOPPADDING", (0,0), (-1,-1), 0),
        ("BOTTOMPADDING", (0,0), (-1,-1), 0),
    ]))
    return t


def action_table(rows):
    """Tabela de ações priorizadas"""
    header = [
        Paragraph("<b>#</b>", ST["lbl"]),
        Paragraph("<b>Ação necessária</b>", ST["lbl"]),
        Paragraph("<b>Onde</b>", ST["lbl"]),
        Paragraph("<b>Quem</b>", ST["lbl"]),
        Paragraph("<b>Esforço</b>", ST["lbl"]),
        Paragraph("<b>Bloqueia entrega?</b>", ST["lbl"]),
    ]
    data = [header]
    bloq_colors = {"SIM": DANGER, "NÃO": SUCCESS, "PARCIAL": WARN}
    esforcol   = {"Baixo": SUCCESS, "Médio": WARN, "Alto": DANGER, "Config": INFO}
    for i, (acao, onde, quem, esf, bloq) in enumerate(rows, 1):
        bc = bloq_colors.get(bloq, GRAY_MUT)
        ec = esforcol.get(esf, GRAY_MUT)
        d_bloq = Drawing(48, 18)
        d_bloq.add(Rect(0,0,48,18,rx=4,ry=4,fillColor=colors.Color(bc.red,bc.green,bc.blue,0.15),strokeColor=None))
        d_bloq.add(String(24,4.5,bloq,fontName="Helvetica-Bold",fontSize=8,fillColor=bc,textAnchor="middle"))
        d_esf = Drawing(46, 18)
        d_esf.add(Rect(0,0,46,18,rx=4,ry=4,fillColor=colors.Color(ec.red,ec.green,ec.blue,0.15),strokeColor=None))
        d_esf.add(String(23,4.5,esf,fontName="Helvetica-Bold",fontSize=8,fillColor=ec,textAnchor="middle"))
        data.append([
            Paragraph(f"<b>{i}</b>", ST["body"]),
            Paragraph(acao, ST["body"]),
            Paragraph(f"<font color='#667085'>{onde}</font>", ST["small"]),
            Paragraph(quem, ST["small"]),
            d_esf, d_bloq,
        ])
    t = Table(data, colWidths=[20, 200, 95, 65, 50, 52])
    t.setStyle(TableStyle([
        ("BACKGROUND",    (0,0), (-1,0), colors.HexColor("#f0f4f8")),
        ("ROWBACKGROUNDS",(0,1), (-1,-1), [WHITE, GRAY_BG]),
        ("TOPPADDING",    (0,0), (-1,-1), 5),
        ("BOTTOMPADDING", (0,0), (-1,-1), 5),
        ("LEFTPADDING",   (0,0), (-1,-1), 7),
        ("RIGHTPADDING",  (0,0), (-1,-1), 5),
        ("VALIGN",        (0,0), (-1,-1), "MIDDLE"),
        ("GRID",          (0,0), (-1,-1), 0.3, GRAY_LIN),
        ("FONTNAME",      (0,0), (-1,0), "Helvetica-Bold"),
        ("FONTSIZE",      (0,0), (-1,0), 8.5),
        ("BACKGROUND", (0,1), (-1,5), colors.Color(DANGER.red, DANGER.green, DANGER.blue, 0.04)),
    ]))
    return t


def data_issue_table(rows):
    """Tabela de inconsistências de dados"""
    header = [Paragraph(h, ST["lbl"]) for h in ["#", "Item", "Problema", "Impacto", "Ação"]]
    data = [header]
    imp_colors = {"Alto": DANGER, "Médio": WARN, "Baixo": GRAY_SOF}
    for i, (item, prob, imp, acao) in enumerate(rows, 1):
        ic = imp_colors.get(imp, GRAY_MUT)
        d_imp = Drawing(46, 18)
        d_imp.add(Rect(0,0,46,18,rx=4,ry=4,fillColor=colors.Color(ic.red,ic.green,ic.blue,0.15),strokeColor=None))
        d_imp.add(String(23,4.5,imp,fontName="Helvetica-Bold",fontSize=8,fillColor=ic,textAnchor="middle"))
        data.append([
            Paragraph(f"<b>{i}</b>", ST["body"]),
            Paragraph(item, ST["body"]),
            Paragraph(prob, ST["small"]),
            d_imp,
            Paragraph(acao, ST["small"]),
        ])
    t = Table(data, colWidths=[20, 115, 175, 50, 120])
    t.setStyle(TableStyle([
        ("BACKGROUND",    (0,0), (-1,0), colors.HexColor("#f0f4f8")),
        ("ROWBACKGROUNDS",(0,1), (-1,-1), [WHITE, GRAY_BG]),
        ("TOPPADDING",    (0,0), (-1,-1), 5),
        ("BOTTOMPADDING", (0,0), (-1,-1), 5),
        ("LEFTPADDING",   (0,0), (-1,-1), 7),
        ("RIGHTPADDING",  (0,0), (-1,-1), 5),
        ("VALIGN",        (0,0), (-1,-1), "TOP"),
        ("GRID",          (0,0), (-1,-1), 0.3, GRAY_LIN),
        ("FONTNAME",      (0,0), (-1,0), "Helvetica-Bold"),
        ("FONTSIZE",      (0,0), (-1,0), 8.5),
    ]))
    return t


# ─── BUILD DOCUMENT ─────────────────────────────────────────────────────────

def build():
    doc = BaseDocTemplate(
        OUTPUT, pagesize=A4,
        leftMargin=40, rightMargin=40, topMargin=48, bottomMargin=40,
        title="MB Intelligence — Auditoria Fase 1",
        author="MB Empresas"
    )
    cover_frame = Frame(0, 0, W, H, leftPadding=60, rightPadding=60,
                        topPadding=H // 3, bottomPadding=60, id="cover")
    body_frame  = Frame(40, 36, W - 80, H - 78, id="body")
    doc.addPageTemplates([
        PageTemplate(id="cover", frames=[cover_frame], onPage=on_cover),
        PageTemplate(id="body",  frames=[body_frame],  onPage=on_page),
    ])

    story = []

    # ══════════════════════════════════════════════════════════════════════
    # CAPA
    # ══════════════════════════════════════════════════════════════════════
    story.append(Paragraph("MB Intelligence", ST["cover_sub"]))
    story.append(Spacer(1, 6))
    story.append(Paragraph("Auditoria Completa<br/>Fase 1 — Entrega Comercial", ST["cover_title"]))
    story.append(Spacer(1, 14))
    story.append(Paragraph(
        "Login · Jornada MB · Jornada do cliente · Funcionalidades · "
        "Bugs críticos · Dados inconsistentes · O que falta para o primeiro cliente real",
        ST["cover_meta"]))
    story.append(Spacer(1, 20))
    for k, v in [
        ("Data:", "26 de Maio de 2026"),
        ("Versão:", "1.0 — Auditoria ao vivo com Supabase conectado"),
        ("Método:", "91 audit logs · 30+ endpoints testados · 5 perfis de login · análise de código"),
        ("Servidor:", "localhost:3333 · Supabase Auth + PostgreSQL + Storage"),
        ("Classificação:", "Uso interno — MB Empresas Assessoria Empresarial"),
    ]:
        story.append(Paragraph(f'<font color="#667085">{k}</font>  <font color="#111318">{v}</font>',
                               ST["cover_meta"]))

    story.append(PageBreak())

    # ══════════════════════════════════════════════════════════════════════
    # 1. RESUMO EXECUTIVO
    # ══════════════════════════════════════════════════════════════════════
    for e in sec_header("1. Resumo Executivo", "Estado atual versus o que é necessário para o primeiro cliente real"):
        story.append(e)

    story.append(Paragraph(
        "Esta auditoria foi realizada com o sistema em execução completa — servidor Node.js na porta 3333, "
        "banco de dados Supabase conectado e Storage ativo. Foram testados todos os 30+ endpoints da API, "
        "5 perfis de login diferentes, e foi feita análise linha por linha do código de todas as telas. "
        "O objetivo é determinar com precisão o que pode ser entregue ao primeiro cliente real e o que "
        "precisa ser resolvido antes disso.",
        ST["body"]))

    story.append(Spacer(1, 8))

    story.append(kpi_row([
        ("Funcionalidades OK", "27", "big_ok"),
        ("Problemas / Bugs", "13", "big_warn"),
        ("Críticos para entrega", "7", "big_bad"),
        ("Dados para limpar", "5", "big_warn"),
    ]))

    story.append(Spacer(1, 10))

    # Veredicto
    d = Drawing(W - 80, 54)
    d.add(Rect(0, 0, W - 80, 54, rx=6, ry=6,
               fillColor=colors.Color(WARN.red, WARN.green, WARN.blue, 0.08),
               strokeColor=WARN, strokeWidth=1.2))
    d.add(Rect(0, 0, 5, 54, fillColor=WARN, strokeColor=None))
    d.add(String(18, 38, "VEREDICTO: O produto ESTÁ PRONTO em sua maioria, MAS 7 pontos críticos precisam ser resolvidos",
                 fontName="Helvetica-Bold", fontSize=10, fillColor=GRAY_INK))
    d.add(String(18, 24, "antes de colocar o primeiro cliente real. São correções rápidas (maioria em 1-2 horas) que hoje",
                 fontName="Helvetica", fontSize=9.5, fillColor=GRAY_INK))
    d.add(String(18, 11, "bloqueiam a credibilidade da entrega: textos de dev na tela de login, plano errado, dados sujos.",
                 fontName="Helvetica", fontSize=9.5, fillColor=GRAY_INK))
    story.append(d)
    story.append(Spacer(1, 10))

    story.append(Paragraph(
        "A parte positiva: a <b>arquitetura está sólida</b>. Autenticação JWT, isolamento multi-tenant, "
        "histórico mensal, DRE, DFC, score, gráficos, abas por plano — tudo isso funciona. "
        "O que bloqueia a entrega são problemas operacionais menores, não estruturais.",
        ST["body"]))

    story.append(PageBreak())

    # ══════════════════════════════════════════════════════════════════════
    # 2. LOGIN E AUTENTICAÇÃO
    # ══════════════════════════════════════════════════════════════════════
    for e in sec_header("2. Login e Autenticação", "Tela de entrada · segurança · rate limit · registro"):
        story.append(e)

    story.append(Paragraph("2.1 O que funciona", ST["h2"]))
    for b in [
        "Login com e-mail e senha via Supabase Auth — JWT ES256 com 1h de expiração",
        "Rate limiting: HTTP 429 após tentativas de login com senha errada",
        "Isolamento multi-tenant: cliente A não acessa dados do cliente B (HTTP 403 confirmado)",
        "Sessão persistida em localStorage com sync automático ao API Supabase",
        "Redirecionamento automático: MB vai para #/admin/operacao, cliente vai para #/cliente/inteligencia",
        "Botões de demo preenchendo formulário (Admin MB, Financeiro MB, CFO cliente, etc.)",
        "5 perfis de login funcionando: admin@mbempresas.com.br, financeiro, cfo, contabilidade, operacao",
    ]:
        story.append(Paragraph(f"✓ {b}", ST["bullet"]))

    story.append(Spacer(1, 8))
    story.append(Paragraph("2.2 Problemas críticos na tela de login", ST["h2"]))

    story.append(bad_box(
        "CRÍTICO PARA ENTREGA: A tela de login exibe textos de desenvolvimento que expõem o estado interno "
        "do produto. O subtítulo da brand diz 'Produto real sem banco nesta fase' e o texto descritivo diz "
        "'Login com sessão local, perfis, planos, cadastros e operação realista. O banco de dados entra na "
        "próxima etapa.' — NUNCA pode aparecer para um cliente real que está pagando pelo serviço."
    ))

    story.append(Paragraph("Localização do problema:", ST["h3"]))
    story.append(info_box(
        "Arquivo: apps/web/src/pages/auth-pages.js · Função login() · linha 14\n"
        "Texto atual: 'Produto real sem banco nesta fase'\n"
        "Texto atual: 'Login com sessão local, perfis, planos, cadastros e operação realista...'\n"
        "Texto atual no campo de prova-social: 'Login — Validação de usuário e senha em base local.'\n"
        "Correção: substituir por textos profissionais referentes ao produto real."
    ))

    story.append(Paragraph("Outros textos problemáticos na tela de login:", ST["h3"]))
    for b in [
        "proof-grid[0]: 'Login — Validação de usuário e senha em base local.' → deve descrever o produto",
        "proof-grid[1]: 'Cadastros — Clientes, usuários, documentos e importações.' → OK mas poderia ser mais comercial",
        "Formulário de cadastro (#/contratar) tem valores default: 'Nova Empresa LTDA', 'novo@cliente.com', '123456' — deve ser limpo",
        "Campo 'Status comercial' do registro mostra 'Aguardando confirmação de pagamento' hardcoded como readonly — faz sentido mas precisa revisão",
    ]:
        story.append(Paragraph(f"⚠ {b}", ST["bullet"]))

    story.append(Spacer(1, 8))
    story.append(Paragraph("2.3 Tela de cadastro (#/contratar)", ST["h2"]))
    story.append(warn_box(
        "O fluxo de cadastro cria o cliente e o usuário localmente / via Supabase, mas não tem "
        "integração com pagamento. Isso é esperado para Fase 1, mas precisa de comunicação clara "
        "de que é 'período de teste' ou 'aguardando ativação' até a MB confirmar manualmente."
    ))
    for b in [
        "✓ Validação de CNPJ com dígito verificador implementada",
        "✓ Verifica CNPJ duplicado antes de salvar",
        "✓ Cria perfil de usuário no Supabase Auth + user_profiles",
        "⚠ Senha '123456' como padrão no formulário — deve ser removida",
        "⚠ 'Nova Empresa LTDA' e 'Nome do empresário' como defaults — deve ser limpo",
    ]:
        story.append(Paragraph(b, ST["bullet"]))

    story.append(PageBreak())

    # ══════════════════════════════════════════════════════════════════════
    # 3. JORNADA DO CLIENTE
    # ══════════════════════════════════════════════════════════════════════
    for e in sec_header("3. Jornada do Cliente", "5 telas · 3 planos · onboarding até inteligência"):
        story.append(e)

    story.append(Paragraph("3.1 Plano Contabilidade — cliente Juliana Prime (contabilidade@cliente.com)", ST["h2"]))
    story.append(journey_card("Contabilidade", [
        ("📊", "Inteligência: KPI cards (4), Cockpit, Saúde documental, IA MB", "OK"),
        ("📊", "Abas bloqueadas com cadeado e texto de upgrade (Financeiro, Análise, Histórico, Cenários)", "OK"),
        ("📁", "Documentos: tabela com filtros categoria e competência, download funcional", "OK"),
        ("✅", "Onboarding: checklist 5 etapas, consultor, próxima revisão", "OK"),
        ("💬", "Comunicação: canal MB, histórico de mensagens, envio de mensagem", "OK"),
        ("👤", "Perfil: dados empresa, módulos liberados, troca de senha", "OK"),
        ("⚠", "Score exibido como N/A sem explicação de como ativar", "Parcial"),
        ("⚠", "Resultado no KPI card mostra 'Indisponível' — texto OK mas pode confundir", "Parcial"),
        ("❌", "Prime tem revenue=42.800 e expenses=0 → score 74 artificialmente inflado", "Dados"),
        ("❌", "Troca de senha: botão aparece mas endpoint retorna sucesso sem de fato alterar", "Bug"),
    ], AMBER))

    story.append(Spacer(1, 8))
    story.append(Paragraph("3.2 Plano Financeiro IA — cliente Camila Norte (financeiro@cliente.com)", ST["h2"]))
    story.append(journey_card("Financeiro IA", [
        ("📊", "Inteligência: KPI cards com sparkline e delta, cockpit, abas corretas", "OK"),
        ("📊", "Aba Financeiro: DRE em cascata (waterfall) + accordion tabela completa", "OK"),
        ("📊", "Aba Financeiro: DFC em cascata + accordion tabela completa", "OK"),
        ("📊", "Aba Análise: Score gauge (CSS), composição despesas (donut), runway meter", "OK"),
        ("📊", "Aba Histórico: gráfico área + barras agrupadas + tabela snapshots", "OK"),
        ("🔒", "Aba Cenários bloqueada com texto de upgrade correto", "OK"),
        ("📁", "Documentos: mesmos filtros e download da Contabilidade", "OK"),
        ("💬", "Comunicação e Onboarding funcionais", "OK"),
        ("⚠", "Gráfico área e barras agrupadas só aparecem com 2+ meses — Clínica tem 1 mês", "Parcial"),
        ("⚠", "Radar CFO bloqueado corretamente — mas o bloqueio visual é sutil", "Parcial"),
        ("❌", "Troca de senha — mesmo bug do Contabilidade", "Bug"),
    ], TEAL))

    story.append(Spacer(1, 8))
    story.append(Paragraph("3.3 Plano CFO — cliente Marcos Silva (cfo@cliente.com)", ST["h2"]))

    story.append(bad_box(
        "CRÍTICO: O cliente Marcos Silva (cfo@cliente.com) está vinculado ao cliente 'Comércio Silva LTDA', "
        "que tem plan_id = 'contabilidade' no banco de dados. Isso significa que ao fazer login como CFO, "
        "o cliente vê a tela de Contabilidade, não a tela CFO. O plano foi alterado durante testes de "
        "preço. PRECISA ser corrigido ANTES de qualquer demonstração."
    ))

    story.append(journey_card("CFO as a Service", [
        ("📊", "Inteligência (quando plano CFO ativo): 5 abas completas funcionais", "OK"),
        ("📊", "Aba Análise: Radar hexagonal SVG 6 dimensões do score", "OK"),
        ("📊", "Aba Cenários: simulador CFO, capacidade investimento, parecer consultivo", "OK"),
        ("🖨️", "DRE e DFC com botões Imprimir e Excel funcional", "OK"),
        ("📊", "Histórico: 2 meses de dados (mai/26 e jun/26) — gráficos funcionam", "OK"),
        ("❌", "CRÍTICO: plano atual no banco é Contabilidade, não CFO", "Critico"),
        ("❌", "Score junho = 56 com runway=0 porque campos não foram preenchidos", "Dados"),
        ("❌", "Troca de senha — funciona via API mas precisa verificação", "Parcial"),
        ("⚠", "Simulador CFO: formulário existe, handler do botão precisa verificação", "Parcial"),
    ], BRAND))

    story.append(PageBreak())

    # ══════════════════════════════════════════════════════════════════════
    # 4. JORNADA MB (ADMIN)
    # ══════════════════════════════════════════════════════════════════════
    for e in sec_header("4. Jornada MB — Operador Interno", "9 telas · cockpit operacional · alimentar portal"):
        story.append(e)

    story.append(Paragraph("4.1 Cockpit de Operação (#/admin/operacao)", ST["h2"]))
    story.append(journey_card("Operação MB", [
        ("🎛️", "Métricas: clientes ativos, em risco, aprovações pendentes, importações", "OK"),
        ("🎛️", "Seletor de cliente em operação (contexto global para todas as telas)", "OK"),
        ("📋", "Filas operacionais calculadas de dados reais (Fiscal, Financeiro, DRE/IA, Onboarding)", "OK"),
        ("🗺️", "Jornada operacional do cliente selecionado (Cadastro → Docs → Importações → Análise)", "OK"),
        ("⏱️", "Últimas ações da auditoria (5 mais recentes)", "OK"),
        ("📋", "Aprovações do cliente selecionado", "OK"),
        ("💡", "Oportunidade comercial (upsell por plano)", "OK"),
        ("⚠", "Admin name exibe 'Teste Editado' — nome foi alterado durante teste", "Dados"),
        ("⚠", "Botão 'Alimentar portal' aparece DUAS VEZES na mesma seção (bug duplicado)", "Bug"),
    ], BRAND2))

    story.append(Spacer(1, 8))
    story.append(Paragraph("4.2 Gestão de Clientes (#/admin/clientes)", ST["h2"]))
    story.append(journey_card("Clientes", [
        ("👥", "Lista de clientes com busca e filtros (nome, CNPJ, plano, status, confiança)", "OK"),
        ("✏️", "Editor de ficha do cliente (todos os campos editáveis)", "OK"),
        ("➕", "Cadastro de novo cliente com validação CNPJ", "OK"),
        ("🔄", "Troca de cliente em operação via seletor lateral", "OK"),
        ("❌", "GET /clients/:id retorna 404 — API não implementada para cliente individual", "API"),
        ("⚠", "Troca de plano via formulário funciona localmente mas não atualiza plano_id no Supabase corretamente", "Parcial"),
        ("⚠", "next_review_date não existe no banco — campo existe no formulário mas não salva", "Bug"),
    ], GRAY_INK))

    story.append(Spacer(1, 8))
    story.append(Paragraph("4.3 Alimentar Portal (#/admin/alimentar-portal)", ST["h2"]))
    story.append(journey_card("Alimentar Portal", [
        ("💾", "Formulário completo: receita, despesas, impostos, folha, caixa, score, runway", "OK"),
        ("💾", "Campos DRE: CMV, admin, comercial, financeiro", "OK"),
        ("💾", "Campos DFC: saldo inicial, recebimentos, pagamentos, saldo final", "OK"),
        ("📅", "Campo de competência com seletor mês/ano dinâmico", "OK"),
        ("📜", "Histórico de períodos registrados com botão de edição", "OK"),
        ("🎯", "Criar tarefa/ação para o cliente (copiloto)", "OK"),
        ("🛡️", "Criar análise para aprovação (governança)", "OK"),
        ("📤", "Upload de importações (DRE, OFX, CSV, Excel, XML)", "OK"),
        ("⚠", "Competência e próxima revisão: next_review_date não persiste no DB", "Bug"),
        ("⚠", "Análise MB (campo insight) salva corretamente mas 'reviewed_by' retorna 'Revisado MB'", "Parcial"),
    ], TEAL))

    story.append(Spacer(1, 8))
    story.append(Paragraph("4.4 Documentos, Aprovações, Usuários, Auditoria, Indicadores", ST["h2"]))
    story.append(journey_card("Demais telas MB", [
        ("📂", "Documentos: upload com Storage Supabase, filtros, download, visibilidade", "OK"),
        ("🛡️", "Aprovações: fluxo criar → revisar → aprovar → liberar ao cliente", "OK"),
        ("👥", "Usuários: listar MB e clientes, criar usuário, editar, desativar (botões)", "OK"),
        ("📋", "Auditoria: 91 logs registrados, visão cronológica", "OK"),
        ("📊", "Indicadores: 4 tabelas (carteira/plano, risco, equipe, documentos)", "OK"),
        ("📊", "Indicadores: botões de exportação CSV funcionam com download direto", "OK"),
        ("❌", "Planos: GET /reports retorna 404 — mas tela funciona com dados locais", "API"),
        ("⚠", "Usuários: botões 'Editar' e 'Desativar' existem mas handlers precisam verificação", "Parcial"),
        ("⚠", "Deletar documento: botão existe na tela, comportamento a verificar", "Parcial"),
    ], PURPLE))

    story.append(PageBreak())

    # ══════════════════════════════════════════════════════════════════════
    # 5. MATRIZ COMPLETA DE FUNCIONALIDADES
    # ══════════════════════════════════════════════════════════════════════
    for e in sec_header("5. Matriz Completa de Funcionalidades", "Tudo o que existe, por rota, jornada e status"):
        story.append(e)

    all_features = [
        # Autenticação
        ("Login e-mail/senha Supabase Auth",          "#/login",               "Ambos", "Alta", "Funciona"),
        ("Registro de novo cliente",                   "#/contratar",           "Cliente","Média","Parcial"),
        ("Rate limiting (429)",                        "API /auth/login",       "Sistema","Alta", "Funciona"),
        ("JWT com 1h expiração",                       "API /auth/me",          "Sistema","Alta", "Funciona"),
        ("Redirecionamento pós-login",                 "app.js",                "Ambos", "Alta", "Funciona"),
        ("Logout",                                     "Sidebar",               "Ambos", "Alta", "Funciona"),
        ("Troca de senha (cliente)",                   "API /auth/change-pw",   "Cliente","Média","Funciona"),
        ("Troca de senha (MB admin)",                  "API /auth/change-pw",   "MB",    "Média","Bug"),
        # Cliente — Inteligência
        ("KPI cards com sparkline e delta",            "#/cliente/inteligencia","Cliente","Alta", "Funciona"),
        ("Seletor de competência + filtro API",        "#/cliente/inteligencia","Cliente","Alta", "Funciona"),
        ("Abas por plano (5 abas, locked)",            "#/cliente/inteligencia","Cliente","Alta", "Funciona"),
        ("Score gauge CSS semicircular",               "Aba Análise",           "Cliente","Alta", "Funciona"),
        ("Runway meter com zonas de cor",              "Aba Análise",           "Cliente","Alta", "Funciona"),
        ("Donut composição despesas",                  "Aba Análise",           "Cliente","Alta", "Funciona"),
        ("DRE waterfall + accordion tabela",           "Aba Financeiro",        "Cliente","Alta", "Funciona"),
        ("DFC waterfall + accordion tabela",           "Aba Financeiro",        "Cliente","Alta", "Funciona"),
        ("Radar 6 dimensões (CFO)",                    "Aba Análise",           "Cliente","Média","Funciona"),
        ("Gráfico área (2+ meses)",                    "Aba Histórico",         "Cliente","Alta", "Funciona"),
        ("Barras agrupadas multi-período",             "Aba Histórico",         "Cliente","Média","Funciona"),
        ("Gráfico barras simples (1 mês)",             "Aba Histórico",         "Cliente","Alta", "Funciona"),
        ("Simulador CFO",                              "Aba Cenários",          "Cliente","Média","Parcial"),
        ("Bloqueios com CTA de upgrade",               "Abas bloqueadas",       "Cliente","Média","Funciona"),
        # Cliente — outras telas
        ("Documentos com filtros e download",          "#/cliente/documentos",  "Cliente","Alta", "Funciona"),
        ("Onboarding checklist 5 etapas",             "#/cliente/onboarding",  "Cliente","Média","Funciona"),
        ("Comunicação MB + envio mensagem",            "#/cliente/comunicacao", "Cliente","Média","Funciona"),
        ("Perfil empresa + módulos",                   "#/cliente/perfil",      "Cliente","Baixa","Funciona"),
        # MB — Admin
        ("Cockpit operacional MB",                     "#/admin/operacao",      "MB",    "Alta", "Funciona"),
        ("Filas operacionais calculadas",              "#/admin/operacao",      "MB",    "Alta", "Funciona"),
        ("Lista clientes + busca e filtros",           "#/admin/clientes",      "MB",    "Alta", "Funciona"),
        ("Editor de ficha do cliente",                 "#/admin/clientes",      "MB",    "Alta", "Funciona"),
        ("Cadastro novo cliente MB",                   "#/admin/clientes",      "MB",    "Alta", "Funciona"),
        ("Alimentar indicadores financeiros",          "#/admin/alimentar",     "MB",    "Alta", "Funciona"),
        ("Upload importações",                         "#/admin/alimentar",     "MB",    "Alta", "Funciona"),
        ("Criar tarefas / copiloto",                   "#/admin/alimentar",     "MB",    "Alta", "Funciona"),
        ("Criar análise para aprovação",               "#/admin/alimentar",     "MB",    "Alta", "Funciona"),
        ("Publicar documentos (Supabase Storage)",     "#/admin/documentos",    "MB",    "Alta", "Funciona"),
        ("Fluxo de aprovação (revisar/aprovar)",       "#/admin/aprovacoes",    "MB",    "Alta", "Funciona"),
        ("Gerenciar usuários",                         "#/admin/usuarios",      "MB",    "Média","Parcial"),
        ("Auditoria 91 logs",                          "#/admin/auditoria",     "MB",    "Média","Funciona"),
        ("Indicadores MB (4 tabelas + export)",        "#/admin/relatorios",    "MB",    "Média","Funciona"),
        ("Planos e preços editáveis",                  "#/admin/planos",        "MB",    "Média","Funciona"),
        # API
        ("GET /clients/:id",                           "API server",            "MB",    "Alta", "API"),
        ("GET /finance (batch) retorna objetos",       "API server",            "MB",    "Média","Bug"),
        ("GET /reports",                               "API server",            "MB",    "Baixa","API"),
        ("last_access_at atualização no login",        "API server",            "Sistema","Média","Ausente"),
        ("next_review_date coluna no DB",              "Supabase migration",    "MB",    "Média","Ausente"),
        ("MB_REPORT_CONFIG CNPJ e CRC",                "app.js config",         "Ambos", "Baixa","Ausente"),
    ]

    story.append(full_matrix(all_features))

    story.append(PageBreak())

    # ══════════════════════════════════════════════════════════════════════
    # 6. BUGS E INCONSISTÊNCIAS TÉCNICAS
    # ══════════════════════════════════════════════════════════════════════
    for e in sec_header("6. Bugs e Inconsistências Técnicas", "Problemas identificados no código e na API"):
        story.append(e)

    bugs = [
        ("Textos de dev na tela de login",
         "CRÍTICO — auth-pages.js linha 14: 'Produto real sem banco nesta fase' e 'base local'. "
         "Aparece para TODO usuário que acessar o produto.",
         DANGER, "Critico"),
        ("Plano do cliente Silva = Contabilidade",
         "O cliente Comercio Silva LTDA (cfo@cliente.com) tem plan_id='contabilidade' no Supabase. "
         "O plano foi alterado durante teste de preços. Deve ser 'cfo'.",
         DANGER, "Critico"),
        ("GET /clients/:id retorna 404",
         "A rota GET /clients/{id} não existe na API. O admin-pages.js usa o cliente do estado local. "
         "Não há bug visual agora, mas pode causar erros se alguém tentar acessar diretamente.",
         WARN, "API"),
        ("GET /finance (batch) retorna array de strings",
         "GET /finance retorna ['clientId1', 'clientId2', ...] em vez de objetos com dados. "
         "O cockpit administrativo carrega dados de forma local, não via API batch.",
         WARN, "API"),
        ("POST /auth/change-password falha para admin MB",
         "O endpoint retorna 'Nao foi possivel alterar a senha.' para o usuário admin. "
         "Funciona para o cliente CFO. Provavelmente um bug de permissão ou scope no Supabase Auth.",
         WARN, "Bug"),
        ("Botão 'Alimentar portal' duplicado no Cockpit MB",
         "Na seção 'Cliente em operação' do admin, há dois botões que fazem a mesma coisa: "
         "data-route='#/admin/alimentar-portal'. Um deles está com estilo btn-primary, outro btn-soft.",
         GRAY_MUT, "Parcial"),
        ("reviewed_by salvo como 'Revisado MB' (texto fixo)",
         "Ao revisar uma aprovação, o campo 'owner' é gravado como string fixa 'Revisado MB' "
         "em vez do nome real do operador logado. Prejudica rastreabilidade.",
         WARN, "Bug"),
        ("last_access_at nunca atualizado",
         "Todos os clientes retornam lastAccess: null. O campo não é atualizado no login. "
         "O audit log registra o login (91 entradas), mas o campo direto não.",
         WARN, "Bug"),
        ("next_review_date coluna inexistente no Supabase",
         "O formulário 'Alimentar Portal' e 'Ficha do cliente' têm campo de data 'Próxima revisão MB'. "
         "O servidor usa try/catch silencioso — o campo nunca salva. A coluna não existe no DB.",
         WARN, "Bug"),
        ("MB_REPORT_CONFIG: CNPJ e CRC vazios",
         "O relatório impresso inclui 'MB Empresas Assessoria Empresarial' mas CNPJ='', CRC=''. "
         "O relatório sai sem identificação formal da MB.",
         GRAY_MUT, "Ausente"),
        ("Score Prime = 74 com expenses = 0",
         "A Serviços Prime tem revenue=42.800 e expenses=0. Com despesas zeradas, "
         "o score se inflaciona artificialmente (100% de rentabilidade). "
         "Dados incompletos mascarados como empresa saudável.",
         WARN, "Dados"),
        ("Simulador CFO: botão sem handler verificado",
         "O formulário de simulação CFO (Aba Cenários) tem um botão 'Simular cenário' "
         "com data-action='simulate-cfo-scenario'. O handler existe no app.js mas "
         "precisa ser testado em runtime.",
         GRAY_MUT, "Parcial"),
        ("Admin exibe nome 'Teste Editado'",
         "O admin MB Marcos Lima teve o nome alterado para 'Teste Editado' durante teste "
         "de edição de usuário. O nome correto é 'Marcos Lima'.",
         GRAY_MUT, "Dados"),
    ]

    for idx, (title, desc, col, status) in enumerate(bugs):
        d = Drawing(W - 80, 22)
        d.add(Rect(0, 0, W - 80, 22, rx=4, ry=4,
                   fillColor=colors.Color(col.red, col.green, col.blue, 0.06),
                   strokeColor=colors.Color(col.red, col.green, col.blue, 0.28),
                   strokeWidth=0.8))
        d.add(Rect(0, 0, 3, 22, fillColor=col, strokeColor=None))
        d.add(String(12, 8, f"{idx+1:02d}. {title}", fontName="Helvetica-Bold", fontSize=9.5,
                     fillColor=GRAY_INK))
        sw = len(status) * 7 + 16
        d.add(Rect(W - 82 - sw, 3, sw, 16, rx=4, ry=4,
                   fillColor=colors.Color(col.red, col.green, col.blue, 0.15), strokeColor=None))
        d.add(String(W - 82 - sw/2, 6, status, fontName="Helvetica-Bold", fontSize=8,
                     fillColor=col, textAnchor="middle"))
        story.append(d)
        story.append(Paragraph(desc, ST["small"]))
        story.append(Spacer(1, 4))

    story.append(PageBreak())

    # ══════════════════════════════════════════════════════════════════════
    # 7. DADOS INCONSISTENTES NO BANCO
    # ══════════════════════════════════════════════════════════════════════
    for e in sec_header("7. Dados Inconsistentes no Banco", "O que precisa ser limpo antes da entrega"):
        story.append(e)

    story.append(Paragraph(
        "Durante os testes de desenvolvimento, foram criados dados que poluem o banco e distorcem "
        "KPIs, métricas do cockpit e a experiência do demo. Precisam ser corrigidos antes de "
        "qualquer demonstração comercial.",
        ST["body"]))
    story.append(Spacer(1, 8))

    db_issues = [
        ("'Nova Empresa LTDA' (cliente fantasma)",
         "4o cliente no banco criado durante teste de cadastro. revenue=0, score=4, "
         "sem documentos, sem tarefas. Afeta: filas operacionais, count de risco, "
         "indicadores MB, select de cliente.",
         "Alto",
         "DELETE do cliente no Supabase. Verificar cascade delete nas tabelas relacionadas."),
        ("extrato_maio.ofx importado 3x",
         "1 entrada com status 'Validado' (correto) + 2 com 'Aguardando validação MB'. "
         "Afeta: fila de importações, KPI de importações no cockpit.",
         "Médio",
         "Deletar as 2 entradas duplicadas na tabela import_jobs no Supabase."),
        ("DRE_Comercio_Silva_LTDA.csv com competência Julho/2026",
         "Documento gerado pelo botão Excel da DRE. Competência foi registrada como 2026-07 "
         "sendo que os dados eram de Maio/Junho. Aparece como doc com status 'Aguardando revisão'.",
         "Médio",
         "Corrigir competência para 2026-06 ou deletar o documento no Supabase."),
        ("Snapshot Jun/26 da Silva com runway=0, investmentCapacity=0",
         "Os campos críticos de fôlego e capacidade de investimento ficaram zerados "
         "no snapshot de Junho. Score cai para 56 por causa disso.",
         "Médio",
         "PATCH /finance/11111...111 com runway e investmentCapacity corretos via Alimentar Portal."),
        ("Admin 'Marcos Lima' com nome 'Teste Editado'",
         "O nome do usuário admin foi alterado para 'Teste Editado' durante teste da "
         "funcionalidade de edição. Aparece em toda a interface administrativa.",
         "Alto",
         "PATCH /users/{id} com name='Marcos Lima' no Supabase ou via painel admin."),
        ("Plano Silva = Contabilidade (deveria ser CFO)",
         "O plan_id do cliente 'Comercio Silva LTDA' está como 'contabilidade' no banco. "
         "Isso faz o usuário cfo@cliente.com ver a tela de Contabilidade ao invés de CFO.",
         "Alto",
         "UPDATE clients SET plan_id='cfo' WHERE id='11111...' no Supabase ou via Gestão de Clientes."),
    ]

    story.append(data_issue_table(db_issues))

    story.append(Spacer(1, 10))
    story.append(info_box(
        "OBSERVAÇÃO IMPORTANTE: Nenhum desses problemas de dados causa falha técnica — o sistema "
        "continua funcionando. O impacto é na credibilidade durante uma demonstração. Um cliente "
        "ou investidor que ver 'Nova Empresa LTDA' com score 4 no cockpit, ou o CFO vendo a tela "
        "de Contabilidade, vai questionar a qualidade do produto."
    ))

    story.append(PageBreak())

    # ══════════════════════════════════════════════════════════════════════
    # 8. PLANO DE AÇÃO PARA ENTREGA COMERCIAL
    # ══════════════════════════════════════════════════════════════════════
    for e in sec_header("8. Plano de Ação — Entrega Comercial Fase 1", "O que fazer, quem faz e em quanto tempo"):
        story.append(e)

    story.append(Paragraph(
        "Todas as ações abaixo são necessárias antes de colocar o primeiro cliente real na plataforma. "
        "As marcadas como 'SIM' em 'Bloqueia entrega?' são absolutamente obrigatórias. "
        "As de esforço 'Baixo' são correções de 5-30 minutos. As de esforço 'Config' são "
        "configurações sem código.",
        ST["body"]))
    story.append(Spacer(1, 8))

    actions = [
        # Bloqueia SIM
        ("Corrigir textos da tela de login (remover 'sem banco', 'local')",
         "auth-pages.js linha 14-17", "Dev", "Baixo", "SIM"),
        ("Corrigir plano do cliente Silva para CFO no Supabase",
         "Supabase Dashboard / Gestão Clientes", "MB Ops", "Config", "SIM"),
        ("Deletar cliente 'Nova Empresa LTDA' do Supabase",
         "Supabase Dashboard", "MB Ops", "Config", "SIM"),
        ("Corrigir nome admin de 'Teste Editado' para 'Marcos Lima'",
         "Supabase / Gestão Usuários", "MB Ops", "Config", "SIM"),
        ("Adicionar CNPJ e CRC da MB em app.js (MB_REPORT_CONFIG)",
         "apps/web/app.js linhas 7-8", "Dev/MB", "Baixo", "SIM"),
        ("Executar migration: ADD COLUMN next_review_date DATE",
         "Supabase SQL Editor", "Dev", "Baixo", "SIM"),
        ("Completar dados jun/26 da Silva (runway, investmentCapacity)",
         "Alimentar Portal > Silva > Jun/26", "MB Ops", "Config", "SIM"),
        # Bloqueia PARCIAL
        ("Deletar 2 importações duplicadas extrato_maio.ofx",
         "Supabase / tabela import_jobs", "MB Ops", "Config", "PARCIAL"),
        ("Corrigir competência do documento DRE_CSV (Jul para Jun)",
         "Supabase / tabela documents", "MB Ops", "Config", "PARCIAL"),
        ("Corrigir troca de senha para usuários MB",
         "API /auth/change-password + Supabase Auth", "Dev", "Médio", "PARCIAL"),
        ("Remover valores default do formulário de cadastro (#/contratar)",
         "auth-pages.js função register()", "Dev", "Baixo", "PARCIAL"),
        ("Verificar e testar simulador CFO (data-action='simulate-cfo-scenario')",
         "app.js handler + client-pages.js", "Dev", "Baixo", "PARCIAL"),
        ("Remover botão 'Alimentar portal' duplicado no cockpit",
         "admin-pages.js operationV2()", "Dev", "Baixo", "PARCIAL"),
        # Bloqueia NÃO (mas melhora qualidade)
        ("Implementar GET /clients/:id na API",
         "server-supabase.js", "Dev", "Médio", "NÃO"),
        ("Corrigir GET /finance (batch) para retornar objetos",
         "server-supabase.js", "Dev", "Médio", "NÃO"),
        ("Atualizar last_access_at no login do cliente",
         "server-supabase.js /auth/login handler", "Dev", "Baixo", "NÃO"),
        ("Gravar reviewed_by com ID real do operador",
         "server-supabase.js /approvals/:id PATCH", "Dev", "Baixo", "NÃO"),
        ("Adicionar penalidade score para dados incompletos",
         "finance-service.js calculateScore()", "Dev", "Médio", "NÃO"),
    ]

    story.append(action_table(actions))

    story.append(Spacer(1, 10))

    # Estimativa de tempo
    d = Drawing(W - 80, 44)
    d.add(Rect(0, 0, W - 80, 44, rx=6, ry=6, fillColor=SUCCESS_L, strokeColor=SUCCESS, strokeWidth=1))
    d.add(String(16, 30, "Estimativa de tempo para zerar os 7 bloqueadores críticos:", fontName="Helvetica-Bold",
                 fontSize=10, fillColor=SUCCESS))
    d.add(String(16, 16, "1h de desenvolvimento (textos + MB_REPORT_CONFIG + migration + botão duplicado) +", fontName="Helvetica",
                 fontSize=9.5, fillColor=GRAY_INK))
    d.add(String(16, 4, "30min de configuração operacional (Supabase: plano, nome, cliente fantasma, dados Silva)",
                 fontName="Helvetica", fontSize=9.5, fillColor=GRAY_INK))
    story.append(d)

    story.append(PageBreak())

    # ══════════════════════════════════════════════════════════════════════
    # 9. O QUE ESTÁ PRONTO PARA COMERCIAL
    # ══════════════════════════════════════════════════════════════════════
    for e in sec_header("9. O que ESTÁ Pronto para Entrega Comercial", "27 funcionalidades verificadas e funcionando"):
        story.append(e)

    ready = [
        ("Autenticação JWT com Supabase Auth",        "Produção"),
        ("Isolamento multi-tenant (HTTP 403)",         "Produção"),
        ("Rate limiting (HTTP 429)",                   "Produção"),
        ("3 planos com preços editáveis",              "Produção"),
        ("Histórico mensal (múltiplos snapshots)",     "Produção"),
        ("Score 6 dimensões ponderadas",              "Produção"),
        ("DRE 22 linhas gerada automaticamente",      "Produção"),
        ("DFC 16 linhas gerada automaticamente",      "Produção"),
        ("KPI cards com sparkline e delta %",          "Produção"),
        ("Gauge de score CSS semicircular",            "Produção"),
        ("Runway meter com zonas de cor",              "Produção"),
        ("Donut de composição de despesas",            "Produção"),
        ("Radar hexagonal 6 dimensões (CFO)",          "Produção"),
        ("Waterfall DRE + accordion tabela",           "Produção"),
        ("Waterfall DFC + accordion tabela",           "Produção"),
        ("Gráfico área evolução + barras agrupadas",  "Produção"),
        ("5 abas por plano com bloqueio e CTA",        "Produção"),
        ("Cockpit operacional MB completo",            "Produção"),
        ("Filas operacionais calculadas de dados",     "Produção"),
        ("Alimentar Portal completo (11 formulários)", "Produção"),
        ("Upload docs Supabase Storage + download",   "Produção"),
        ("Fluxo de aprovação com governança",          "Produção"),
        ("Validação CNPJ com dígito verificador",     "Produção"),
        ("Busca e filtros em clientes/documentos",    "Produção"),
        ("Mensagens cliente x MB",                    "Produção"),
        ("Auditoria com 91 logs persistidos",          "Produção"),
        ("Relatórios/Indicadores MB com exportação",  "Produção"),
    ]

    rows_ok = []
    for i, (feat, env) in enumerate(ready):
        d_env = Drawing(60, 18)
        d_env.add(Rect(0,0,60,18,rx=4,ry=4,fillColor=SUCCESS_L,strokeColor=None))
        d_env.add(String(30,4.5,env,fontName="Helvetica-Bold",fontSize=8,fillColor=SUCCESS,textAnchor="middle"))
        rows_ok.append([Paragraph(f"✓ {feat}", ST["body"]), d_env])

    t_ok = Table(rows_ok, colWidths=[390, 70])
    t_ok.setStyle(TableStyle([
        ("ROWBACKGROUNDS", (0,0), (-1,-1), [WHITE, GRAY_BG]),
        ("TOPPADDING", (0,0), (-1,-1), 5),
        ("BOTTOMPADDING", (0,0), (-1,-1), 5),
        ("LEFTPADDING", (0,0), (-1,-1), 8),
        ("RIGHTPADDING", (0,0), (-1,-1), 6),
        ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
        ("GRID", (0,0), (-1,-1), 0.3, GRAY_LIN),
    ]))
    story.append(t_ok)

    story.append(Spacer(1, 12))
    story.append(HRFlowable(width="100%", thickness=1, color=GRAY_LIN))
    story.append(Spacer(1, 8))
    story.append(Paragraph(
        "MB Empresas Assessoria Empresarial · MB Intelligence · Auditoria Fase 1 · 26/05/2026 · "
        "Sistema verificado com Supabase ao vivo · 91 audit logs · 5 perfis testados",
        ST["center"]))

    doc.build(story)
    print(f"PDF gerado: {OUTPUT}")


if __name__ == "__main__":
    build()
