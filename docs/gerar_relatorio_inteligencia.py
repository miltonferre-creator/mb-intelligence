# -*- coding: utf-8 -*-
"""
MB Intelligence — Análise Crítica: Menu Inteligência
Relatório com análise por plano, problemas, redesign e mockups de gráficos
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm, cm
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT, TA_JUSTIFY
from reportlab.platypus import (
    BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer,
    Table, TableStyle, HRFlowable, KeepTogether, PageBreak
)
from reportlab.graphics.shapes import (
    Drawing, Rect, Circle, Line, Wedge, Polygon, PolyLine, String,
    Group, Path, getArcPoints
)
from reportlab.graphics import renderPDF
from reportlab.graphics.charts.barcharts import VerticalBarChart
from reportlab.graphics.charts.linecharts import HorizontalLineChart
from reportlab.graphics.charts.piecharts import Pie
from reportlab.graphics.widgets.markers import makeMarker
import math

W, H = A4
BRAND    = colors.HexColor("#5b070b")
BRAND2   = colors.HexColor("#8f121b")
BRAND3   = colors.HexColor("#c53b43")
GRAY_INK = colors.HexColor("#111318")
GRAY_MUT = colors.HexColor("#667085")
GRAY_SOF = colors.HexColor("#8b94a3")
GRAY_LIN = colors.HexColor("#dfe4ea")
GRAY_BG  = colors.HexColor("#f5f6f8")
GRAY_SUR = colors.HexColor("#ffffff")
SUCCESS  = colors.HexColor("#12805c")
SUCCESS_L= colors.HexColor("#dcfce7")
WARN     = colors.HexColor("#b7791f")
WARN_L   = colors.HexColor("#fef3c7")
DANGER   = colors.HexColor("#b42318")
DANGER_L = colors.HexColor("#fee2e2")
INFO     = colors.HexColor("#2563eb")
INFO_L   = colors.HexColor("#dbeafe")
TEAL     = colors.HexColor("#0f766e")
TEAL_L   = colors.HexColor("#ccfbf1")
AMBER    = colors.HexColor("#d97706")
AMBER_L  = colors.HexColor("#fef9c3")
BLUE     = colors.HexColor("#1d4ed8")
BLUE_L   = colors.HexColor("#eff6ff")
PURPLE   = colors.HexColor("#7c3aed")
PURPLE_L = colors.HexColor("#ede9fe")

OUTPUT = r"C:\MB EMPRESAS\MB_Intelligence_Produto_Final\docs\MB_Inteligencia_Analise_Redesign.pdf"


# ─── ESTILOS ────────────────────────────────────────────────────────────────

def make_styles():
    base = getSampleStyleSheet()

    def s(name, **kw):
        return ParagraphStyle(name, **kw)

    return {
        "cover_title": s("cover_title",
            fontName="Helvetica-Bold", fontSize=36, leading=42,
            textColor=colors.white, alignment=TA_LEFT, spaceAfter=6),
        "cover_sub": s("cover_sub",
            fontName="Helvetica", fontSize=15, leading=22,
            textColor=colors.HexColor("#f1a0a5"), alignment=TA_LEFT, spaceAfter=4),
        "cover_meta": s("cover_meta",
            fontName="Helvetica", fontSize=11, leading=16,
            textColor=colors.HexColor("#d4d8e0"), alignment=TA_LEFT),

        "h1": s("h1",
            fontName="Helvetica-Bold", fontSize=20, leading=26,
            textColor=BRAND, spaceBefore=18, spaceAfter=10,
            borderPadding=(0,0,4,0)),
        "h2": s("h2",
            fontName="Helvetica-Bold", fontSize=14, leading=19,
            textColor=GRAY_INK, spaceBefore=14, spaceAfter=6),
        "h3": s("h3",
            fontName="Helvetica-Bold", fontSize=11, leading=15,
            textColor=GRAY_INK, spaceBefore=10, spaceAfter=4),
        "body": s("body",
            fontName="Helvetica", fontSize=10, leading=16,
            textColor=GRAY_INK, spaceAfter=6, alignment=TA_JUSTIFY),
        "body_small": s("body_small",
            fontName="Helvetica", fontSize=9, leading=14,
            textColor=GRAY_MUT, spaceAfter=4),
        "label": s("label",
            fontName="Helvetica-Bold", fontSize=9, leading=13,
            textColor=GRAY_MUT, spaceAfter=2),
        "caption": s("caption",
            fontName="Helvetica-Oblique", fontSize=9, leading=13,
            textColor=GRAY_SOF, spaceAfter=8, alignment=TA_CENTER),
        "bullet": s("bullet",
            fontName="Helvetica", fontSize=10, leading=16,
            textColor=GRAY_INK, leftIndent=14, spaceAfter=3),
        "tag_ok": s("tag_ok",
            fontName="Helvetica-Bold", fontSize=9, leading=13,
            textColor=SUCCESS, spaceAfter=2),
        "tag_warn": s("tag_warn",
            fontName="Helvetica-Bold", fontSize=9, leading=13,
            textColor=WARN, spaceAfter=2),
        "tag_bad": s("tag_bad",
            fontName="Helvetica-Bold", fontSize=9, leading=13,
            textColor=DANGER, spaceAfter=2),
        "tag_info": s("tag_info",
            fontName="Helvetica-Bold", fontSize=9, leading=13,
            textColor=INFO, spaceAfter=2),
        "number_big": s("number_big",
            fontName="Helvetica-Bold", fontSize=28, leading=34,
            textColor=BRAND, alignment=TA_CENTER),
        "number_label": s("number_label",
            fontName="Helvetica", fontSize=9, leading=13,
            textColor=GRAY_MUT, alignment=TA_CENTER),
    }


ST = make_styles()


# ─── PAGE TEMPLATES ─────────────────────────────────────────────────────────

def on_cover(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(colors.HexColor("#0c0d10"))
    canvas.rect(0, 0, W, H, fill=1, stroke=0)
    # gradiente lateral vermelho
    for i in range(60):
        alpha = 0.18 * (1 - i / 60)
        canvas.setFillColorRGB(0.56, 0.04, 0.07, alpha)
        canvas.rect(0, H * 0.3 - i * 6, W * 0.5 + i * 4, H * 0.7, fill=1, stroke=0)
    # marca d'água texto
    canvas.setFont("Helvetica-Bold", 110)
    canvas.setFillColorRGB(1, 1, 1, 0.04)
    canvas.drawString(-10, H * 0.18, "MB")
    # barra inferior vermelha
    canvas.setFillColor(BRAND)
    canvas.rect(0, 0, W, 6, fill=1, stroke=0)
    # linha lateral
    canvas.setFillColor(BRAND3)
    canvas.rect(42, 80, 3, H - 160, fill=1, stroke=0)
    canvas.restoreState()


def on_page(canvas, doc):
    canvas.saveState()
    # barra topo
    canvas.setFillColor(BRAND)
    canvas.rect(0, H - 6, W, 6, fill=1, stroke=0)
    # barra rodapé
    canvas.setFillColor(GRAY_LIN)
    canvas.rect(0, 0, W, 1, fill=1, stroke=0)
    # texto rodapé
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(GRAY_SOF)
    canvas.drawString(40, 14, "MB Intelligence — Análise do Menu Inteligência · Confidencial")
    canvas.drawRightString(W - 40, 14, f"Página {doc.page}")
    canvas.restoreState()


# ─── HELPERS VISUAIS ────────────────────────────────────────────────────────

def badge(text, color=BRAND, bg=None, w=None):
    if bg is None:
        # lighten
        r, g, b = color.red, color.green, color.blue
        bg = colors.Color(0.85 + r * 0.15, 0.85 + g * 0.15, 0.85 + b * 0.15)
    d_w = w or (len(text) * 7 + 16)
    d = Drawing(d_w, 18)
    d.add(Rect(0, 0, d_w, 18, rx=4, ry=4, fillColor=bg, strokeColor=None))
    d.add(String(d_w/2, 5, text, fontName="Helvetica-Bold", fontSize=8,
                 fillColor=color, textAnchor="middle"))
    return d


def section_header(title, subtitle="", color=BRAND):
    elems = []
    d = Drawing(W - 80, 36)
    d.add(Rect(0, 0, W - 80, 36, rx=6, ry=6,
               fillColor=colors.Color(color.red, color.green, color.blue, 0.07),
               strokeColor=colors.Color(color.red, color.green, color.blue, 0.25),
               strokeWidth=1))
    d.add(Rect(0, 0, 4, 36, rx=2, ry=2, fillColor=color, strokeColor=None))
    d.add(String(14, 22, title, fontName="Helvetica-Bold", fontSize=13,
                 fillColor=color))
    if subtitle:
        d.add(String(14, 10, subtitle, fontName="Helvetica", fontSize=9,
                     fillColor=GRAY_MUT))
    elems.append(d)
    elems.append(Spacer(1, 8))
    return elems


def info_box(text, color=INFO, bg=INFO_L, icon=""):
    prefix = f"{icon}  " if icon else ""
    style = ParagraphStyle("ib", fontName="Helvetica", fontSize=9.5, leading=15,
                           textColor=colors.Color(color.red*0.7, color.green*0.7, color.blue*0.7),
                           backColor=bg, borderColor=color,
                           borderWidth=0.5, borderPadding=10,
                           borderRadius=6, spaceAfter=8)
    return Paragraph(prefix + text, style)


def warn_box(text):
    return info_box(text, WARN, WARN_L, "⚠")


def ok_box(text):
    return info_box(text, SUCCESS, SUCCESS_L, "✓")


def bad_box(text):
    return info_box(text, DANGER, DANGER_L, "✗")


def plan_pill(plan):
    colors_map = {
        "Contabilidade": (AMBER, AMBER_L),
        "Financeiro IA": (TEAL, TEAL_L),
        "CFO as a Service": (BRAND, colors.HexColor("#fce7e8")),
    }
    c, bg = colors_map.get(plan, (GRAY_MUT, GRAY_BG))
    d = Drawing(130, 22)
    d.add(Rect(0, 0, 130, 22, rx=11, ry=11, fillColor=bg, strokeColor=c, strokeWidth=1))
    d.add(String(65, 6, plan, fontName="Helvetica-Bold", fontSize=9,
                 fillColor=c, textAnchor="middle"))
    return d


def two_col_table(rows, col_widths=(180, 280)):
    data = []
    for label, val in rows:
        data.append([
            Paragraph(label, ST["label"]),
            Paragraph(val, ST["body"])
        ])
    t = Table(data, colWidths=col_widths)
    t.setStyle(TableStyle([
        ("VALIGN", (0,0), (-1,-1), "TOP"),
        ("ROWBACKGROUNDS", (0,0), (-1,-1), [colors.white, GRAY_BG]),
        ("TOPPADDING", (0,0), (-1,-1), 6),
        ("BOTTOMPADDING", (0,0), (-1,-1), 6),
        ("LEFTPADDING", (0,0), (-1,-1), 8),
        ("RIGHTPADDING", (0,0), (-1,-1), 8),
        ("GRID", (0,0), (-1,-1), 0.3, GRAY_LIN),
        ("ROUNDEDCORNERS", [4]),
    ]))
    return t


def status_table(rows):
    """Tabela com colunas: Componente | Situação Atual | Status"""
    header = [
        Paragraph("<b>Componente</b>", ST["label"]),
        Paragraph("<b>Situação atual</b>", ST["label"]),
        Paragraph("<b>Status</b>", ST["label"]),
    ]
    data = [header]
    status_colors = {
        "OK": (SUCCESS, SUCCESS_L),
        "Parcial": (WARN, WARN_L),
        "Problema": (DANGER, DANGER_L),
        "Ausente": (GRAY_SOF, GRAY_BG),
        "Crítico": (DANGER, DANGER_L),
    }
    for comp, desc, status in rows:
        sc, sl = status_colors.get(status, (GRAY_MUT, GRAY_BG))
        badge_d = Drawing(70, 18)
        badge_d.add(Rect(0, 0, 70, 18, rx=4, ry=4, fillColor=sl, strokeColor=None))
        badge_d.add(String(35, 5, status, fontName="Helvetica-Bold", fontSize=8,
                           fillColor=sc, textAnchor="middle"))
        data.append([
            Paragraph(comp, ST["body"]),
            Paragraph(desc, ST["body_small"]),
            badge_d,
        ])
    t = Table(data, colWidths=[150, 240, 72])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,0), colors.HexColor("#f0f4f8")),
        ("ROWBACKGROUNDS", (0,1), (-1,-1), [colors.white, GRAY_BG]),
        ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
        ("TOPPADDING", (0,0), (-1,-1), 7),
        ("BOTTOMPADDING", (0,0), (-1,-1), 7),
        ("LEFTPADDING", (0,0), (-1,-1), 8),
        ("RIGHTPADDING", (0,0), (-1,-1), 8),
        ("GRID", (0,0), (-1,-1), 0.3, GRAY_LIN),
        ("FONTNAME", (0,0), (-1,0), "Helvetica-Bold"),
        ("FONTSIZE", (0,0), (-1,0), 9),
    ]))
    return t


# ─── MOCKUPS DE GRÁFICOS ────────────────────────────────────────────────────

def arc_polyline(cx, cy, radius, start_deg, end_deg, steps=32):
    """Retorna PolyLine de um arco (start → end em graus, sentido anti-horário)"""
    pts = []
    for i in range(steps + 1):
        a = math.radians(start_deg + (end_deg - start_deg) * i / steps)
        pts += [cx + radius * math.cos(a), cy + radius * math.sin(a)]
    return pts


def arc_band_polygon(cx, cy, r_out, r_in, start_deg, end_deg, steps=32):
    """Polígono em forma de anel entre r_in e r_out para um setor angular"""
    pts_out = []
    pts_in = []
    for i in range(steps + 1):
        a = math.radians(start_deg + (end_deg - start_deg) * i / steps)
        pts_out.append((cx + r_out * math.cos(a), cy + r_out * math.sin(a)))
        pts_in.append((cx + r_in * math.cos(a), cy + r_in * math.sin(a)))
    all_pts = pts_out + list(reversed(pts_in))
    flat = [c for p in all_pts for c in p]
    return flat


def mockup_gauge(title, value=74, max_val=100, subtitle="MB Financial Score"):
    """Gauge semicircular para score usando Polygon (anel) em vez de Arc"""
    dw, dh = 320, 185
    d = Drawing(dw, dh)
    d.add(Rect(0, 0, dw, dh, rx=8, ry=8, fillColor=GRAY_BG, strokeColor=GRAY_LIN, strokeWidth=1))

    cx, cy, r_out, r_in = dw // 2, 80, 72, 52

    # Zonas de fundo (semicírculo 180°→0°)
    zones = [
        (180, 120, DANGER_L,  DANGER),   # 0–33%: vermelho
        (120,  60, WARN_L,    WARN),      # 33–67%: amarelo
        (60,    0, SUCCESS_L, SUCCESS),   # 67–100%: verde
    ]
    for start, end, bg, _ in zones:
        pts = arc_band_polygon(cx, cy, r_out, r_in, start, end, steps=20)
        d.add(Polygon(pts, fillColor=bg, strokeColor=GRAY_SUR, strokeWidth=0.8))

    # Arco de valor (de 180° até o ângulo correspondente)
    pct = min(max(value / max_val, 0), 1)
    val_end = 180 - 180 * pct
    val_color = SUCCESS if pct >= 0.75 else (WARN if pct >= 0.5 else DANGER)
    pts_val = arc_band_polygon(cx, cy, r_out - 2, r_in + 2, 180, val_end, steps=24)
    d.add(Polygon(pts_val, fillColor=val_color, strokeColor=None))

    # Ponteiro
    angle_rad = math.radians(val_end)
    px = cx + (r_in - 4) * math.cos(angle_rad)
    py = cy + (r_in - 4) * math.sin(angle_rad)
    d.add(Line(cx, cy, px, py, strokeColor=GRAY_INK, strokeWidth=2.5))
    d.add(Circle(cx, cy, 5, fillColor=GRAY_INK, strokeColor=None))

    # Centro branco (para dar o efeito de gauge)
    d.add(Circle(cx, cy, r_in - 2, fillColor=GRAY_BG, strokeColor=None))

    # Valor central
    d.add(String(cx, cy + 24, str(value), fontName="Helvetica-Bold", fontSize=28,
                 fillColor=val_color, textAnchor="middle"))
    d.add(String(cx, cy + 9, f"/{max_val}", fontName="Helvetica", fontSize=12,
                 fillColor=GRAY_MUT, textAnchor="middle"))
    d.add(String(cx, 20, subtitle, fontName="Helvetica", fontSize=9,
                 fillColor=GRAY_MUT, textAnchor="middle"))

    # Labels das zonas
    d.add(String(cx - r_out - 4, cy - 4, "0", fontName="Helvetica", fontSize=8,
                 fillColor=GRAY_SOF, textAnchor="end"))
    d.add(String(cx + r_out + 4, cy - 4, "100", fontName="Helvetica", fontSize=8,
                 fillColor=GRAY_SOF, textAnchor="start"))

    # Título
    d.add(String(dw / 2, dh - 8, title, fontName="Helvetica-Bold", fontSize=10,
                 fillColor=GRAY_INK, textAnchor="middle"))
    return d


def mockup_area_chart(title="Receita x Despesas — Evolução 6 meses"):
    """Gráfico de área com fill gradiente"""
    dw, dh = 460, 200
    d = Drawing(dw, dh)
    d.add(Rect(0, 0, dw, dh, rx=8, ry=8, fillColor=GRAY_BG,
               strokeColor=GRAY_LIN, strokeWidth=1))

    months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"]
    revenues = [185, 198, 172, 210, 225, 240]
    expenses = [142, 155, 148, 163, 152, 178]

    pad_l, pad_r, pad_t, pad_b = 50, 20, 30, 35
    chart_w = dw - pad_l - pad_r
    chart_h = dh - pad_t - pad_b

    max_v = max(revenues) * 1.1
    n = len(months)

    def xp(i): return pad_l + (i / (n - 1)) * chart_w
    def yp(v): return pad_b + (v / max_v) * chart_h

    # Grid horizontal
    for i in range(4):
        yg = pad_b + (i / 3) * chart_h
        d.add(Line(pad_l, yg, dw - pad_r, yg, strokeColor=GRAY_LIN, strokeWidth=0.5))
        val = int(max_v * i / 3)
        d.add(String(pad_l - 4, yg - 4, f"{val}", fontName="Helvetica", fontSize=8,
                     fillColor=GRAY_SOF, textAnchor="end"))

    # Área receita (azul transparente)
    rx_pts = [pad_l, pad_b] + [c for i, v in enumerate(revenues) for c in (xp(i), yp(v))] + [xp(n-1), pad_b]
    poly_rev = Polygon(rx_pts, fillColor=colors.Color(0.11, 0.30, 0.85, 0.15),
                       strokeColor=None)
    d.add(poly_rev)
    # Linha receita
    rev_pts = [c for i, v in enumerate(revenues) for c in (xp(i), yp(v))]
    d.add(PolyLine(rev_pts, strokeColor=BLUE, strokeWidth=2.5))

    # Área despesas (âmbar transparente)
    ex_pts = [pad_l, pad_b] + [c for i, v in enumerate(expenses) for c in (xp(i), yp(v))] + [xp(n-1), pad_b]
    poly_exp = Polygon(ex_pts, fillColor=colors.Color(0.85, 0.47, 0.02, 0.15),
                       strokeColor=None)
    d.add(poly_exp)
    # Linha despesas
    exp_pts = [c for i, v in enumerate(expenses) for c in (xp(i), yp(v))]
    d.add(PolyLine(exp_pts, strokeColor=AMBER, strokeWidth=2.5))

    # Pontos
    for i, v in enumerate(revenues):
        d.add(Circle(xp(i), yp(v), 4, fillColor=BLUE, strokeColor=GRAY_SUR, strokeWidth=1.5))
    for i, v in enumerate(expenses):
        d.add(Circle(xp(i), yp(v), 4, fillColor=AMBER, strokeColor=GRAY_SUR, strokeWidth=1.5))

    # Rótulos do eixo X
    for i, m in enumerate(months):
        d.add(String(xp(i), pad_b - 14, m, fontName="Helvetica", fontSize=8,
                     fillColor=GRAY_MUT, textAnchor="middle"))

    # Legenda
    lx = pad_l
    d.add(Rect(lx, dh - 22, 10, 10, fillColor=BLUE, strokeColor=None))
    d.add(String(lx + 14, dh - 22, "Receita", fontName="Helvetica", fontSize=8, fillColor=GRAY_INK))
    d.add(Rect(lx + 80, dh - 22, 10, 10, fillColor=AMBER, strokeColor=None))
    d.add(String(lx + 94, dh - 22, "Despesas", fontName="Helvetica", fontSize=8, fillColor=GRAY_INK))

    # Título
    d.add(String(dw / 2, dh - 10, title, fontName="Helvetica-Bold", fontSize=9.5,
                 fillColor=GRAY_INK, textAnchor="middle"))
    return d


def mockup_waterfall_dre(title="DRE — Cascata Gerencial"):
    """Waterfall chart para DRE"""
    dw, dh = 460, 200
    d = Drawing(dw, dh)
    d.add(Rect(0, 0, dw, dh, rx=8, ry=8, fillColor=GRAY_BG,
               strokeColor=GRAY_LIN, strokeWidth=1))

    items = [
        ("Rec. Bruta", 195000, "base"),
        ("(-) Impostos", -19500, "neg"),
        ("Rec. Líquida", 175500, "subtotal"),
        ("(-) CMV", -52650, "neg"),
        ("Lucro Bruto", 122850, "subtotal"),
        ("(-) Desp. Op.", -78000, "neg"),
        ("EBITDA", 44850, "subtotal"),
        ("(-) Fin.", -3900, "neg"),
        ("Lucro Líq.", 40950, "total"),
    ]

    pad_l, pad_r, pad_t, pad_b = 12, 12, 28, 30
    chart_w = dw - pad_l - pad_r
    chart_h = dh - pad_t - pad_b
    n = len(items)
    bar_w = (chart_w / n) * 0.68
    gap = chart_w / n

    max_v = max(v for _, v, t in items if t in ("base", "subtotal", "total")) * 1.1

    def yp(v): return pad_b + (v / max_v) * chart_h
    def ys(v): return (abs(v) / max_v) * chart_h

    running = 0
    for i, (label, value, typ) in enumerate(items):
        cx = pad_l + i * gap + gap / 2
        x0 = cx - bar_w / 2

        if typ == "base":
            col = BLUE
            y0 = pad_b
            bh = ys(value)
            running = value
        elif typ == "neg":
            col = DANGER
            y0 = yp(running + value)
            bh = ys(value)
            running += value
        elif typ == "subtotal":
            col = TEAL
            y0 = pad_b
            bh = ys(running)
        elif typ == "total":
            col = BRAND
            y0 = pad_b
            bh = ys(running)
        else:
            col = GRAY_MUT
            y0 = pad_b
            bh = ys(abs(value))

        d.add(Rect(x0, y0, bar_w, bh, fillColor=col, strokeColor=None, rx=2, ry=2))
        val_k = abs(value) // 1000
        d.add(String(cx, y0 + bh + 3, f"{val_k}k", fontName="Helvetica-Bold", fontSize=7,
                     fillColor=col, textAnchor="middle"))

        short = label[:8]
        d.add(String(cx, pad_b - 14, short, fontName="Helvetica", fontSize=7.5,
                     fillColor=GRAY_MUT, textAnchor="middle"))

    # Eixo X
    d.add(Line(pad_l, pad_b, dw - pad_r, pad_b, strokeColor=GRAY_LIN, strokeWidth=0.8))

    # Legenda
    lx = 14
    for col, lbl in [(BLUE, "Base"), (TEAL, "Subtotal"), (DANGER, "Deducao"), (BRAND, "Resultado")]:
        d.add(Rect(lx, dh - 20, 8, 8, fillColor=col, strokeColor=None))
        d.add(String(lx + 12, dh - 20, lbl, fontName="Helvetica", fontSize=7, fillColor=GRAY_INK))
        lx += 72

    d.add(String(dw / 2, dh - 10, title, fontName="Helvetica-Bold", fontSize=9.5,
                 fillColor=GRAY_INK, textAnchor="middle"))
    return d


def mockup_donut_expense(title="Composicao das Despesas"):
    """Donut chart para composição de despesas"""
    dw, dh = 280, 200
    d = Drawing(dw, dh)
    d.add(Rect(0, 0, dw, dh, rx=8, ry=8, fillColor=GRAY_BG,
               strokeColor=GRAY_LIN, strokeWidth=1))

    cx, cy, r_out, r_in = 100, 95, 68, 42
    segs = [
        ("Folha", 35, TEAL),
        ("Impostos", 18, BLUE),
        ("Admin.", 30, AMBER),
        ("CMV", 17, BRAND3),
    ]

    total = sum(v for _, v, _ in segs)
    start = 90
    for label, pct, col in segs:
        sweep = 360 * pct / total
        w = Wedge(cx, cy, r_out, start, start - sweep, fillColor=col, strokeColor=GRAY_SUR, strokeWidth=1.5)
        d.add(w)
        # Buraco central
        mid_a = math.radians(start - sweep / 2)
        lx = cx + (r_out + 12) * math.cos(mid_a)
        ly = cy + (r_out + 12) * math.sin(mid_a)
        d.add(String(lx, ly - 4, f"{pct}%", fontName="Helvetica-Bold", fontSize=8,
                     fillColor=col, textAnchor="middle"))
        start -= sweep

    # Buraco do donut
    d.add(Circle(cx, cy, r_in, fillColor=GRAY_BG, strokeColor=None))
    d.add(String(cx, cy + 8, "100%", fontName="Helvetica-Bold", fontSize=11,
                 fillColor=GRAY_INK, textAnchor="middle"))
    d.add(String(cx, cy - 6, "Receita", fontName="Helvetica", fontSize=8,
                 fillColor=GRAY_MUT, textAnchor="middle"))

    # Legenda lateral
    lx, ly = 185, 155
    for label, pct, col in segs:
        d.add(Rect(lx, ly, 10, 10, fillColor=col, strokeColor=None))
        d.add(String(lx + 14, ly, label, fontName="Helvetica", fontSize=8, fillColor=GRAY_INK))
        ly -= 18

    d.add(String(dw / 2, dh - 10, title, fontName="Helvetica-Bold", fontSize=9,
                 fillColor=GRAY_INK, textAnchor="middle"))
    return d


def mockup_radar_score(title="Score — Radar 6 Dimensoes"):
    """Radar hexagonal para as 6 dimensões do score"""
    dw, dh = 300, 220
    d = Drawing(dw, dh)
    d.add(Rect(0, 0, dw, dh, rx=8, ry=8, fillColor=GRAY_BG,
               strokeColor=GRAY_LIN, strokeWidth=1))

    cx, cy, r = dw // 2 - 10, dh // 2 + 8, 70
    labels = ["Liquidez", "Rentab.", "Eficienc.", "Folha", "Impostos", "Cap. Giro"]
    scores = [40, 95, 62, 88, 100, 75]
    n = len(labels)

    def pt(i, radius):
        a = math.radians(90 - i * 360 / n)
        return cx + radius * math.cos(a), cy + radius * math.sin(a)

    # Círculos de fundo
    for level in [0.25, 0.5, 0.75, 1.0]:
        pts = []
        for i in range(n):
            pts += list(pt(i, r * level))
        pts += pts[:2]
        d.add(PolyLine(pts, strokeColor=GRAY_LIN, strokeWidth=0.8))

    # Spokes
    for i in range(n):
        px, py = pt(i, r)
        d.add(Line(cx, cy, px, py, strokeColor=GRAY_LIN, strokeWidth=0.8))

    # Polígono de dados
    data_pts = []
    for i, sc in enumerate(scores):
        px, py = pt(i, r * sc / 100)
        data_pts += [px, py]
    data_pts += data_pts[:2]
    d.add(Polygon(data_pts,
                  fillColor=colors.Color(BRAND.red, BRAND.green, BRAND.blue, 0.2),
                  strokeColor=BRAND, strokeWidth=2))
    for i, sc in enumerate(scores):
        px, py = pt(i, r * sc / 100)
        d.add(Circle(px, py, 3.5, fillColor=BRAND, strokeColor=GRAY_SUR, strokeWidth=1))

    # Labels
    for i, lbl in enumerate(labels):
        px, py = pt(i, r + 14)
        col = SUCCESS if scores[i] >= 75 else (WARN if scores[i] >= 50 else DANGER)
        d.add(String(px, py - 4, lbl, fontName="Helvetica-Bold", fontSize=8,
                     fillColor=col, textAnchor="middle"))

    d.add(String(dw / 2, dh - 10, title, fontName="Helvetica-Bold", fontSize=9,
                 fillColor=GRAY_INK, textAnchor="middle"))
    return d


def mockup_kpi_cards(title="KPIs com Tendencia e Comparativo"):
    """KPI cards com seta de tendência"""
    dw, dh = 460, 130
    d = Drawing(dw, dh)
    d.add(Rect(0, 0, dw, dh, rx=8, ry=8, fillColor=GRAY_BG,
               strokeColor=GRAY_LIN, strokeWidth=1))

    kpis = [
        ("Faturamento", "R$195k", "+12%", True, BLUE),
        ("Resultado", "R$40,9k", "+8%", True, SUCCESS),
        ("Score MB", "74/100", "-6 pts", False, WARN),
        ("Folego", "38 dias", "+5 dias", True, TEAL),
    ]
    card_w = (dw - 20) / 4
    for i, (label, value, delta, up, col) in enumerate(kpis):
        x = 10 + i * card_w
        d.add(Rect(x + 2, 10, card_w - 8, dh - 20, rx=6, ry=6,
                   fillColor=GRAY_SUR, strokeColor=GRAY_LIN, strokeWidth=0.8))
        d.add(Rect(x + 2, 10, card_w - 8, 4, rx=2, ry=2, fillColor=col, strokeColor=None))
        d.add(String(x + (card_w / 2), 80, label, fontName="Helvetica", fontSize=8,
                     fillColor=GRAY_MUT, textAnchor="middle"))
        d.add(String(x + (card_w / 2), 56, value, fontName="Helvetica-Bold", fontSize=14,
                     fillColor=GRAY_INK, textAnchor="middle"))
        arrow_col = SUCCESS if up else DANGER
        arrow = "↑" if up else "↓"
        d.add(String(x + (card_w / 2), 36, f"{arrow} {delta} vs mês ant.",
                     fontName="Helvetica-Bold", fontSize=8,
                     fillColor=arrow_col, textAnchor="middle"))

    d.add(String(dw / 2, dh - 8, title, fontName="Helvetica-Bold", fontSize=9,
                 fillColor=GRAY_INK, textAnchor="middle"))
    return d


def mockup_runway_gauge(title="Folego de Caixa — Indicador Visual"):
    """Indicador visual de runway com zonas de cor"""
    dw, dh = 280, 120
    d = Drawing(dw, dh)
    d.add(Rect(0, 0, dw, dh, rx=8, ry=8, fillColor=GRAY_BG,
               strokeColor=GRAY_LIN, strokeWidth=1))

    # Barra de fundo com zonas
    bx, by, bw, bh = 30, 42, 220, 28
    # Zona vermelha 0-15 dias (0-25%)
    d.add(Rect(bx, by, bw * 0.25, bh, rx=4, ry=4, fillColor=DANGER_L, strokeColor=None))
    # Zona amarela 15-45 dias (25-75%)
    d.add(Rect(bx + bw * 0.25, by, bw * 0.5, bh, fillColor=WARN_L, strokeColor=None))
    # Zona verde 45+ dias (75-100%)
    d.add(Rect(bx + bw * 0.75, by, bw * 0.25, bh, rx=4, ry=4, fillColor=SUCCESS_L, strokeColor=None))

    # Indicadores de zona
    for x, lbl, col in [(bx + bw * 0.12, "Crítico", DANGER),
                         (bx + bw * 0.50, "Atenção", WARN),
                         (bx + bw * 0.87, "Saudável", SUCCESS)]:
        d.add(String(x, by + 10, lbl, fontName="Helvetica-Bold", fontSize=7,
                     fillColor=col, textAnchor="middle"))

    # Valor atual (38 dias = ~63%)
    pct = min(38 / 60, 1.0)
    needle_x = bx + bw * pct
    d.add(Rect(needle_x - 2, by - 8, 4, bh + 10, rx=2, ry=2,
               fillColor=WARN, strokeColor=GRAY_SUR, strokeWidth=1))
    d.add(String(needle_x, by + bh + 6, "38d", fontName="Helvetica-Bold", fontSize=9,
                 fillColor=WARN, textAnchor="middle"))

    # Labels eixo
    for x, lbl in [(bx, "0d"), (bx + bw * 0.25, "15d"), (bx + bw * 0.75, "45d"), (bx + bw, "60d+")]:
        d.add(String(x, by - 12, lbl, fontName="Helvetica", fontSize=7.5,
                     fillColor=GRAY_SOF, textAnchor="middle"))

    d.add(String(dw / 2, dh - 8, title, fontName="Helvetica-Bold", fontSize=9,
                 fillColor=GRAY_INK, textAnchor="middle"))
    return d


def mockup_cashflow_waterfall(title="DFC — Waterfall de Caixa"):
    """Waterfall para fluxo de caixa"""
    dw, dh = 460, 200
    d = Drawing(dw, dh)
    d.add(Rect(0, 0, dw, dh, rx=8, ry=8, fillColor=GRAY_BG,
               strokeColor=GRAY_LIN, strokeWidth=1))

    items = [
        ("Saldo Ini.", 85000, "base"),
        ("Recebimentos", +195000, "pos"),
        ("Fornecedores", -128000, "neg"),
        ("Impostos", -19500, "neg"),
        ("Investimentos", -12000, "neg"),
        ("Emprestimos", +18000, "pos"),
        ("Saldo Final", 138500, "total"),
    ]

    pad_l, pad_r, pad_t, pad_b = 14, 14, 28, 35
    chart_w = dw - pad_l - pad_r
    chart_h = dh - pad_t - pad_b
    n = len(items)
    bar_w = (chart_w / n) * 0.66
    gap = chart_w / n

    max_running = 0
    running = 0
    for _, v, t in items:
        if t == "base":
            running = v
        elif t in ("pos", "neg"):
            running += v
        max_running = max(max_running, abs(running))

    max_v = max_running * 1.15

    def yp(v): return pad_b + (v / max_v) * chart_h

    running = 0
    for i, (label, value, typ) in enumerate(items):
        cx_bar = pad_l + i * gap + gap / 2
        x0 = cx_bar - bar_w / 2

        if typ == "base":
            col = BLUE
            y0 = pad_b
            bh = (value / max_v) * chart_h
            running = value
        elif typ == "pos":
            col = SUCCESS
            y0 = yp(running)
            bh = (value / max_v) * chart_h
            running += value
        elif typ == "neg":
            col = DANGER
            y0 = yp(running + value)
            bh = abs(value / max_v) * chart_h
            running += value
        elif typ == "total":
            col = BRAND
            y0 = pad_b
            bh = yp(running) - pad_b

        d.add(Rect(x0, y0, bar_w, bh, fillColor=col, strokeColor=None, rx=2, ry=2))
        val_k = abs(value) // 1000
        d.add(String(cx_bar, y0 + bh + 3, f"{val_k}k", fontName="Helvetica-Bold", fontSize=7,
                     fillColor=col, textAnchor="middle"))

        # Linha de conexão entre barras
        if i > 0 and i < n - 1:
            connector_y = y0 + (bh if typ != "neg" else 0)
            d.add(Line(x0 - (gap - bar_w) / 2 - 4, connector_y,
                       x0, connector_y, strokeColor=GRAY_LIN, strokeWidth=0.8, strokeDashArray=[2, 2]))

        short_label = label[:9]
        d.add(String(cx_bar, pad_b - 18, short_label, fontName="Helvetica", fontSize=7.5,
                     fillColor=GRAY_MUT, textAnchor="middle"))

    d.add(Line(pad_l, pad_b, dw - pad_r, pad_b, strokeColor=GRAY_LIN, strokeWidth=0.8))

    # Legenda
    lx = 16
    for col, lbl in [(BLUE, "Base"), (SUCCESS, "Entrada"), (DANGER, "Saida"), (BRAND, "Saldo Final")]:
        d.add(Rect(lx, dh - 20, 8, 8, fillColor=col, strokeColor=None))
        d.add(String(lx + 12, dh - 20, lbl, fontName="Helvetica", fontSize=7, fillColor=GRAY_INK))
        lx += 70

    d.add(String(dw / 2, dh - 10, title, fontName="Helvetica-Bold", fontSize=9.5,
                 fillColor=GRAY_INK, textAnchor="middle"))
    return d


def mockup_multi_period_bars(title="Comparativo 6 meses — Receita / Despesas / Resultado"):
    """Barras agrupadas para comparativo mensal"""
    dw, dh = 460, 200
    d = Drawing(dw, dh)
    d.add(Rect(0, 0, dw, dh, rx=8, ry=8, fillColor=GRAY_BG,
               strokeColor=GRAY_LIN, strokeWidth=1))

    months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"]
    revenues = [185, 198, 172, 210, 225, 240]
    expenses = [142, 155, 148, 163, 152, 178]
    results  = [43,  43,  24,  47,  73,  62]

    pad_l, pad_r, pad_t, pad_b = 50, 16, 28, 35
    chart_w = dw - pad_l - pad_r
    chart_h = dh - pad_t - pad_b

    max_v = max(revenues) * 1.12
    n = len(months)
    group_w = chart_w / n
    bar_w = group_w * 0.25

    def yp(v): return (v / max_v) * chart_h

    # Grid
    for lvl in range(5):
        yg = pad_b + (lvl / 4) * chart_h
        val = int(max_v * lvl / 4)
        d.add(Line(pad_l, yg, dw - pad_r, yg, strokeColor=GRAY_LIN, strokeWidth=0.5))
        d.add(String(pad_l - 4, yg - 4, f"{val}", fontName="Helvetica", fontSize=7.5,
                     fillColor=GRAY_SOF, textAnchor="end"))

    for i, m in enumerate(months):
        gx = pad_l + i * group_w + group_w * 0.1
        # Receita (azul)
        bh = yp(revenues[i])
        d.add(Rect(gx, pad_b, bar_w, bh, fillColor=BLUE, strokeColor=None, rx=2, ry=2))
        # Despesas (âmbar)
        bh2 = yp(expenses[i])
        d.add(Rect(gx + bar_w + 2, pad_b, bar_w, bh2, fillColor=AMBER, strokeColor=None, rx=2, ry=2))
        # Resultado (verde)
        bh3 = yp(results[i])
        col_r = SUCCESS if results[i] >= 0 else DANGER
        d.add(Rect(gx + bar_w * 2 + 4, pad_b, bar_w, bh3, fillColor=col_r, strokeColor=None, rx=2, ry=2))
        # Label mês
        d.add(String(gx + group_w * 0.35, pad_b - 14, m, fontName="Helvetica", fontSize=8,
                     fillColor=GRAY_MUT, textAnchor="middle"))

    d.add(Line(pad_l, pad_b, dw - pad_r, pad_b, strokeColor=GRAY_LIN, strokeWidth=0.8))

    # Legenda
    lx = pad_l
    for col, lbl in [(BLUE, "Receita"), (AMBER, "Despesas"), (SUCCESS, "Resultado")]:
        d.add(Rect(lx, dh - 20, 10, 10, fillColor=col, strokeColor=None))
        d.add(String(lx + 14, dh - 20, lbl, fontName="Helvetica", fontSize=8, fillColor=GRAY_INK))
        lx += 90

    d.add(String(dw / 2, dh - 10, title, fontName="Helvetica-Bold", fontSize=9.5,
                 fillColor=GRAY_INK, textAnchor="middle"))
    return d


def mockup_sparklines(title="Sparklines em Cartoes de KPI"):
    """Mini sparklines dentro de cartões"""
    dw, dh = 460, 90
    d = Drawing(dw, dh)
    d.add(Rect(0, 0, dw, dh, rx=8, ry=8, fillColor=GRAY_BG,
               strokeColor=GRAY_LIN, strokeWidth=1))

    cards = [
        ("Faturamento", [172, 185, 180, 198, 210, 225, 240], "R$240k", BLUE),
        ("Score MB", [65, 68, 72, 70, 74, 74, 74], "74", TEAL),
        ("Margem %", [22, 20, 14, 22, 32, 26, 26], "26%", SUCCESS),
        ("Folego (dias)", [28, 32, 25, 35, 38, 38, 38], "38d", WARN),
    ]

    card_w = (dw - 16) / 4
    for i, (label, series, current, col) in enumerate(cards):
        cx = 8 + i * card_w
        d.add(Rect(cx, 8, card_w - 6, dh - 16, rx=6, ry=6,
                   fillColor=GRAY_SUR, strokeColor=GRAY_LIN, strokeWidth=0.6))
        # Sparkline
        n = len(series)
        s_x = cx + 6
        s_w = card_w - 14
        s_y = 18
        s_h = 28
        mn, mx = min(series), max(series)
        rng = mx - mn or 1
        def sp_x(j): return s_x + (j / (n-1)) * s_w
        def sp_y(v): return s_y + ((v - mn) / rng) * s_h
        sp_pts = [c for j, v in enumerate(series) for c in (sp_x(j), sp_y(v))]
        d.add(PolyLine(sp_pts, strokeColor=col, strokeWidth=1.8))
        # Ponto final
        d.add(Circle(sp_x(n-1), sp_y(series[-1]), 3, fillColor=col, strokeColor=GRAY_SUR, strokeWidth=1))
        # Valor e label
        d.add(String(cx + (card_w - 6) / 2, 55, current, fontName="Helvetica-Bold", fontSize=12,
                     fillColor=GRAY_INK, textAnchor="middle"))
        d.add(String(cx + (card_w - 6) / 2, 68, label, fontName="Helvetica", fontSize=8,
                     fillColor=GRAY_MUT, textAnchor="middle"))

    d.add(String(dw / 2, dh - 6, title, fontName="Helvetica-Bold", fontSize=9,
                 fillColor=GRAY_INK, textAnchor="middle"))
    return d


def mockup_nav_tabs(title="Navegacao por Abas no Menu Inteligencia"):
    """Mockup da navegação em abas"""
    dw, dh = 460, 80
    d = Drawing(dw, dh)
    d.add(Rect(0, 0, dw, dh, rx=8, ry=8, fillColor=GRAY_BG,
               strokeColor=GRAY_LIN, strokeWidth=1))

    tabs = [
        ("Visao Geral", True),
        ("Financeiro", False),
        ("Analise", False),
        ("Historico", False),
        ("Cenarios", False),
    ]
    tab_w = dw / len(tabs)
    for i, (lbl, active) in enumerate(tabs):
        x = i * tab_w
        if active:
            d.add(Rect(x, 0, tab_w, dh, fillColor=GRAY_SUR, strokeColor=GRAY_LIN, strokeWidth=0.5))
            d.add(Rect(x, 0, tab_w, 4, fillColor=BRAND, strokeColor=None))
            fc = BRAND
            fn = "Helvetica-Bold"
        else:
            d.add(Rect(x, 0, tab_w, dh, fillColor=GRAY_BG, strokeColor=GRAY_LIN, strokeWidth=0.3))
            fc = GRAY_SOF
            fn = "Helvetica"
        d.add(String(x + tab_w / 2, dh / 2 - 5, lbl, fontName=fn, fontSize=9,
                     fillColor=fc, textAnchor="middle"))

    d.add(String(dw / 2, dh - 8, title, fontName="Helvetica-Bold", fontSize=9,
                 fillColor=GRAY_INK, textAnchor="middle"))
    return d


def side_by_side_drawings(d1, d2, spacing=10):
    """Coloca dois drawings lado a lado em uma tabela"""
    t = Table([[d1, d2]], colWidths=[d1.width + spacing/2, d2.width + spacing/2])
    t.setStyle(TableStyle([
        ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
        ("LEFTPADDING", (0,0), (-1,-1), 0),
        ("RIGHTPADDING", (0,0), (-1,-1), 0),
        ("TOPPADDING", (0,0), (-1,-1), 0),
        ("BOTTOMPADDING", (0,0), (-1,-1), 0),
    ]))
    return t


# ─── CONSTRUÇÃO DO DOCUMENTO ────────────────────────────────────────────────

def build_document():
    doc = BaseDocTemplate(
        OUTPUT,
        pagesize=A4,
        leftMargin=40, rightMargin=40, topMargin=50, bottomMargin=40,
        title="MB Intelligence — Análise Menu Inteligência",
        author="MB Empresas"
    )

    cover_frame = Frame(0, 0, W, H, leftPadding=60, rightPadding=60,
                        topPadding=H // 3, bottomPadding=60, id="cover")
    body_frame  = Frame(40, 36, W - 80, H - 80, id="body")

    doc.addPageTemplates([
        PageTemplate(id="cover", frames=[cover_frame], onPage=on_cover),
        PageTemplate(id="body",  frames=[body_frame],  onPage=on_page),
    ])

    story = []

    # ═══ CAPA ════════════════════════════════════════════════════════════════

    story.append(Paragraph("MB Intelligence", ST["cover_sub"]))
    story.append(Spacer(1, 8))
    story.append(Paragraph("Análise Crítica<br/>Menu Inteligência", ST["cover_title"]))
    story.append(Spacer(1, 14))
    story.append(Paragraph(
        "Diagnóstico por plano · Problemas identificados · Redesign moderno · Modelos de gráficos · Navegação tela a tela",
        ST["cover_meta"]))
    story.append(Spacer(1, 18))

    capa_meta = [
        ["Data:", "Maio de 2026"],
        ["Versão:", "1.0 — Análise completa"],
        ["Escopo:", "Menu Inteligência (3 planos) · client-pages.js · ui.js · finance-service.js"],
        ["Classificação:", "Uso interno — MB Empresas Assessoria Empresarial"],
    ]
    for k, v in capa_meta:
        story.append(Paragraph(f'<font color="#8b94a3">{k}</font>  <font color="#d4d8e0">{v}</font>', ST["cover_meta"]))

    story.append(PageBreak())

    # ═══ CORPO DO DOCUMENTO ══════════════════════════════════════════════════
    # Muda para template body
    story.append(Paragraph("<!-- switch -->", ParagraphStyle("_sw", fontSize=0, leading=0)))

    # ─── 1. RESUMO EXECUTIVO ─────────────────────────────────────────────────

    for e in section_header("1. Resumo Executivo", "Estado atual do menu Inteligência e criticidade das mudanças"):
        story.append(e)

    story.append(Paragraph(
        "O menu Inteligência é a tela central do MB Intelligence — é onde o cliente enxerga o valor real "
        "que o produto entrega. Após análise completa do código (<b>client-pages.js</b>, <b>ui.js</b>, "
        "<b>finance-service.js</b>) e observação do comportamento em runtime, este relatório documenta "
        "o que está funcionando, o que está incompleto e como transformar a tela no diferencial "
        "competitivo que ela precisa ser.",
        ST["body"]))
    story.append(Spacer(1, 6))

    # Números de impacto
    impact_data = [
        [Paragraph("3", ST["number_big"]), Paragraph("2", ST["number_big"]),
         Paragraph("9", ST["number_big"]), Paragraph("12", ST["number_big"])],
        [Paragraph("Planos com\nexperiência diferente", ST["number_label"]),
         Paragraph("Tipos de gráfico\natualmente ativos", ST["number_label"]),
         Paragraph("Problemas visuais\nidentificados", ST["number_label"]),
         Paragraph("Componentes\npropostos", ST["number_label"])],
    ]
    imp_table = Table(impact_data, colWidths=[115, 115, 115, 115])
    imp_table.setStyle(TableStyle([
        ("ALIGN", (0,0), (-1,-1), "CENTER"),
        ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
        ("TOPPADDING", (0,0), (-1,-1), 10),
        ("BOTTOMPADDING", (0,0), (-1,-1), 10),
        ("BACKGROUND", (0,0), (-1,-1), GRAY_BG),
        ("GRID", (0,0), (-1,-1), 0.5, GRAY_LIN),
        ("ROUNDEDCORNERS", [6]),
    ]))
    story.append(imp_table)
    story.append(Spacer(1, 12))

    story.append(Paragraph(
        "A principal fraqueza identificada é a dependência excessiva de <b>tabelas estáticas</b> para "
        "representar informações altamente visuais (DRE, DFC, Score, Evolução). O cliente de uma plataforma "
        "de inteligência financeira espera gráficos dinâmicos, comparativos e indicadores com contexto — "
        "não linhas de texto em grade. A tela atual entrega os dados corretos mas falha em transformá-los "
        "em decisões.",
        ST["body"]))

    story.append(PageBreak())

    # ─── 2. ANÁLISE POR PLANO ────────────────────────────────────────────────

    for e in section_header("2. Análise por Plano Contratado", "O que cada cliente enxerga hoje"):
        story.append(e)

    # ── 2.1 Contabilidade ──
    story.append(Paragraph("2.1 Plano Contabilidade — R$600/mês", ST["h2"]))
    story.append(plan_pill("Contabilidade"))
    story.append(Spacer(1, 6))

    story.append(status_table([
        ("Seletor de competência", "Presente e funcional — campo mês/ano para filtrar dados", "OK"),
        ("Cockpit do empresário", "Hero section com resumo MB e prioridade — funcional", "OK"),
        ("4 métricas principais", "Faturamento, Impostos, Resultado, Score exibidos em cards", "Parcial"),
        ("Gráfico de evolução", "AUSENTE — não há nenhum gráfico no plano Contabilidade", "Ausente"),
        ("Portal contábil (barras)", "CSS bars mostrando status de docs DAS/Contábil/Trabalhista", "Parcial"),
        ("Insights IA", "Lista de texto com observações da MB — sem contexto visual", "Parcial"),
        ("Comparativo mensal", "Inexistente — não há comparação com mês anterior", "Ausente"),
        ("Score breakdown", "Score exibido mas sem dimensões detalhadas para este plano", "Ausente"),
    ]))
    story.append(Spacer(1, 8))

    story.append(warn_box(
        "O plano Contabilidade é o mais básico, mas mesmo assim o cliente merece ver um mínimo de "
        "visualização. Hoje ele entra na tela de Inteligência e vê apenas barras CSS e texto. "
        "Para a MB posicionar upgrade de plano dentro do produto, é necessário mostrar o que está "
        "bloqueado — não apenas esconder a informação."
    ))

    story.append(Paragraph("Problemas críticos no Contabilidade:", ST["h3"]))
    for bullet in [
        "<b>Sem nenhum gráfico:</b> a tela parece uma planilha, não uma plataforma de inteligência.",
        "<b>Métricas sem tendência:</b> o card de Resultado diz 'Indisponível' sem explicar por quê e sem oferecer upgrade.",
        "<b>Score exibido sem contexto:</b> mostra N/A sem indicar o que o cliente precisa fazer para ter score.",
        "<b>Oportunidade de upsell perdida:</b> deveria mostrar DRE e Score 'bloqueados' com call-to-action para Financeiro IA.",
        "<b>Portal contábil sem donut:</b> as barras de DAS/Fiscal/Trabalhista poderiam ser um donut de saúde documental.",
    ]:
        story.append(Paragraph(f"• {bullet}", ST["bullet"]))

    story.append(Spacer(1, 10))

    # ── 2.2 Financeiro IA ──
    story.append(Paragraph("2.2 Plano Financeiro IA — R$1.000/mês", ST["h2"]))
    story.append(plan_pill("Financeiro IA"))
    story.append(Spacer(1, 6))

    story.append(status_table([
        ("Seletor de competência", "Funcional — filtro por mês/ano integrado à API", "OK"),
        ("Cockpit + métricas", "4 KPI cards + hero section — dados corretos", "OK"),
        ("DRE gerencial (22 linhas)", "Exibida como tabela — correto nos dados, fraco no visual", "Parcial"),
        ("DFC gerencial (16 linhas)", "Exibida como tabela — correto nos dados, fraco no visual", "Parcial"),
        ("Gráfico linha receita x despesas", "SVG manual — só aparece com 2+ meses (maioria dos clientes não vê)", "Crítico"),
        ("Score breakdown", "NÃO EXIBIDO no plano Financeiro IA — score aparece no card mas sem detalhes", "Ausente"),
        ("Composição de despesas", "AUSENTE para este plano — só está no CFO", "Ausente"),
        ("Tendência (delta vs mês anterior)", "Inexistente em todos os cards", "Ausente"),
        ("Copiloto financeiro", "Lista de tarefas — funcional mas sem priorização visual", "Parcial"),
    ]))
    story.append(Spacer(1, 8))

    story.append(bad_box(
        "CRÍTICO: O gráfico de linha SVG exige mínimo 2 meses de dados para aparecer. "
        "Para todos os clientes novos (mês 1) e para meses em que o snapshot ainda não tem "
        "comparativo, a tela mostra 'Aguardando histórico validado'. Isso significa que o plano "
        "R$1.000/mês pode não ter NENHUM gráfico por meses."
    ))

    story.append(Paragraph("Problemas críticos no Financeiro IA:", ST["h3"]))
    for bullet in [
        "<b>DRE e DFC como tabelas:</b> 22 e 16 linhas de texto em grade — o cliente não consegue ler visualmente.",
        "<b>Gráfico invisível no mês 1:</b> a principal feature visual do plano fica oculta até ter 2 meses de dados.",
        "<b>Score sem breakdown:</b> o score aparece mas as 6 dimensões (Liquidez, Rentabilidade...) não são exibidas.",
        "<b>Sem comparativo com mês anterior:</b> o card de Faturamento não mostra se cresceu ou caiu.",
        "<b>Composição de despesas ausente:</b> o cliente de Financeiro IA paga por insights que não aparecem.",
        "<b>Gráfico SVG básico:</b> sem área fill, sem animação, sem tooltip com valores exatos ao hover.",
    ]:
        story.append(Paragraph(f"• {bullet}", ST["bullet"]))

    story.append(Spacer(1, 10))

    # ── 2.3 CFO ──
    story.append(Paragraph("2.3 Plano CFO as a Service — R$2.000/mês", ST["h2"]))
    story.append(plan_pill("CFO as a Service"))
    story.append(Spacer(1, 6))

    story.append(status_table([
        ("Seletor de competência + métricas", "Funcional — dados corretos e score real", "OK"),
        ("DRE (22 linhas) com print/Excel", "Tabela com botões de impressão — dados corretos, visual fraco", "Parcial"),
        ("DFC (16 linhas) com print/Excel", "Tabela com botões de impressão — dados corretos, visual fraco", "Parcial"),
        ("Evolução executiva (gráfico linha)", "SVG manual com mesmo problema dos 2 meses mínimos", "Parcial"),
        ("Score breakdown (6 barras CSS)", "Barras horizontais para cada dimensão — funcional mas não impactante", "Parcial"),
        ("Composição despesas (barras CSS)", "Folha / Impostos / Admin / Total — barras CSS, sem donut/pizza", "Parcial"),
        ("Margem e resultado (barras CSS)", "Comparação margem atual vs meta — barras CSS", "Parcial"),
        ("Decisão de investimento (barras CSS)", "Caixa / Investimento seguro / Fôlego — barras CSS", "Parcial"),
        ("DUPLICAÇÃO: 2 gráficos de linha", "O gráfico SVG aparece DUAS vezes na tela CFO (bug de layout)", "Crítico"),
        ("Gauge circular para score", "AUSENTE — score de 74/100 merece gauge visual, não número simples", "Ausente"),
        ("Radar chart 6 dimensões", "AUSENTE — o breakdown ideal para CFO seria um radar hexagonal", "Ausente"),
        ("Sparklines nos KPI cards", "AUSENTE — nenhum card tem mini-gráfico de tendência", "Ausente"),
        ("Histórico multi-período comparativo", "AUSENTE — barras agrupadas ou linha múltipla para 6+ meses", "Ausente"),
    ]))
    story.append(Spacer(1, 8))

    story.append(bad_box(
        "O gráfico de linha SVG aparece duas vezes na tela CFO: uma vez dentro de cfoExecutiveCharts() "
        "e uma vez na seção 'charts' que é renderizada ao final. Isso é um bug real de layout que "
        "precisa ser corrigido imediatamente."
    ))

    story.append(PageBreak())

    # ─── 3. PROBLEMAS TÉCNICOS DO CÓDIGO ─────────────────────────────────────

    for e in section_header("3. Problemas Técnicos Identificados no Código", "ui.js · client-pages.js · finance-service.js"):
        story.append(e)

    probs = [
        ("lineChart() — Condição mínima de 2 meses",
         "A função retorna um empty state ('Aguardando histórico') se months.length < 2. "
         "Como a maioria dos clientes começa com 1 mês, o gráfico fica invisível. "
         "Solução: exibir gráfico de barra simples quando há 1 mês, e linha quando há 2+.",
         "Crítico"),
        ("lineChart() — Sem área fill e sem tooltip real",
         "O SVG usa apenas <polyline> — linha simples sem preenchimento. "
         "Os tooltips são <title> SVG, que não aparecem de forma visual moderna. "
         "O gráfico parece de 2012.",
         "Problema"),
        ("lineChart() — Eixo Y sem labels de valor",
         "As 4 linhas de grid horizontal não têm rótulos de valor. "
         "O cliente não sabe o que os eixos representam numericamente.",
         "Problema"),
        ("DRE: dreTable() — 22 linhas de tabela sem hierarquia visual",
         "A DRE tem 5 blocos (Receita, Custo, Despesas Op., Resultado Fin., Impostos) "
         "que são apenas separadores de texto. Não há waterfall, funil ou hierarquia visual "
         "que mostre como a receita vira lucro.",
         "Crítico"),
        ("DFC: cashBridge() — 16 linhas de tabela sem flow visual",
         "O fluxo de caixa (FCO, FCI, FCF + Consolidado) seria muito mais legível "
         "como waterfall — mostrando como o saldo inicial evolui para o saldo final.",
         "Crítico"),
        ("cfoExecutiveCharts() — Gráfico duplicado",
         "No plano CFO, MBI.ui.lineChart(data.months) aparece dentro de cfoExecutiveCharts() "
         "E também na seção 'charts' logo abaixo. O cliente CFO vê dois gráficos de linha idênticos.",
         "Crítico"),
        ("scoreBars() — 6 barras CSS para score breakdown",
         "As barras CSS horizontais para Liquidez, Rentabilidade etc. são funcionais mas "
         "não comunicam de forma executiva. Um radar hexagonal ou gauge circular "
         "seria muito mais impactante para um cliente de R$2.000/mês.",
         "Problema"),
        ("metric() — Sem delta vs período anterior",
         "Os cards de KPI (Faturamento, Resultado, Score, Impostos) não mostram "
         "comparativo com o mês anterior. O cliente não sabe se a empresa evoluiu ou regrediu.",
         "Crítico"),
        ("expenseCompositionBars() — CSS bars sem contexto visual",
         "A composição de despesas (Folha, Impostos, Admin, Total) é exibida "
         "como barras CSS básicas. Um donut chart seria mais intuitivo e moderno.",
         "Problema"),
        ("Sem animação de entrada nos elementos",
         "Todos os elementos aparecem instantaneamente sem nenhuma transição. "
         "Uma entrada suave em CSS (fadeIn + translate) tornaria a experiência "
         "mais premium e moderna.",
         "Problema"),
    ]

    for i, (title, desc, severity) in enumerate(probs):
        sev_color = DANGER if severity == "Crítico" else WARN
        sev_bg = DANGER_L if severity == "Crítico" else WARN_L
        d = Drawing(W - 80, 20)
        d.add(Rect(0, 0, W - 80, 20, rx=4, ry=4,
                   fillColor=colors.Color(sev_color.red, sev_color.green, sev_color.blue, 0.06),
                   strokeColor=colors.Color(sev_color.red, sev_color.green, sev_color.blue, 0.3),
                   strokeWidth=0.8))
        d.add(Rect(0, 0, 3, 20, fillColor=sev_color, strokeColor=None))
        num = str(i + 1).zfill(2)
        d.add(String(14, 6, f"{num}. {title}", fontName="Helvetica-Bold", fontSize=9.5,
                     fillColor=GRAY_INK))
        sev_x = W - 122
        d.add(Rect(sev_x, 2, 70, 16, rx=4, ry=4, fillColor=sev_bg, strokeColor=None))
        d.add(String(sev_x + 35, 5, severity, fontName="Helvetica-Bold", fontSize=8,
                     fillColor=sev_color, textAnchor="middle"))
        story.append(d)
        story.append(Paragraph(desc, ST["body_small"]))
        story.append(Spacer(1, 4))

    story.append(PageBreak())

    # ─── 4. PROPOSTA DE REDESIGN POR PLANO ───────────────────────────────────

    for e in section_header("4. Proposta de Redesign", "O que construir para cada plano"):
        story.append(e)

    story.append(Paragraph(
        "A proposta a seguir organiza a tela de Inteligência em <b>seções modulares</b> com componentes "
        "visuais ricos. Cada plano acessa um subconjunto dessas seções, com os planos superiores "
        "desbloqueando mais camadas de análise. Isso cria uma progressão natural que incentiva upgrade.",
        ST["body"]))

    # ── Princípios de design ──
    story.append(Paragraph("Princípios do redesign:", ST["h3"]))
    principles = [
        ("Dados viram decisão", "Cada número deve ter contexto: tendência, benchmark e recomendação."),
        ("Progressão de plano visível", "Clientes de planos menores veem o que existe nos planos maiores — bloqueado com explicação de upgrade."),
        ("Um insight por seção", "Cada bloco visual termina com uma frase da IA MB explicando o que aquele dado significa."),
        ("Gráficos como linguagem primária", "A tabela é a alternativa, não a apresentação principal. Gráfico primeiro, tabela no detalhe."),
        ("Responsividade e velocidade", "Tela carregada de uma vez com CSS animations staggered — nada de 'carregando'."),
    ]
    for name, desc in principles:
        story.append(Paragraph(f"<b>{name}:</b> {desc}", ST["bullet"]))

    story.append(Spacer(1, 10))

    # ── 4.1 Estrutura por plano ──
    story.append(Paragraph("4.1 Estrutura de seções por plano", ST["h2"]))

    plan_structure = [
        ["Seção / Componente", "Contabilidade", "Financeiro IA", "CFO"],
        ["KPI cards com sparkline e delta", "4 básicos", "4 + trend", "4 + trend + score"],
        ["Seletor de competência", "✓", "✓", "✓"],
        ["Cockpit do empresário", "✓", "✓", "✓ executivo"],
        ["Gauge de score (circular)", "Bloqueado", "✓ simplificado", "✓ completo"],
        ["Radar 6 dimensões do score", "–", "Bloqueado", "✓"],
        ["Gráfico área (receita x despesas)", "–", "✓ 1 ou 2+ meses", "✓ ampliado"],
        ["Barras agrupadas multi-período", "–", "✓ últimos 3 meses", "✓ últimos 12 meses"],
        ["Donut composição de despesas", "–", "✓", "✓ detalhado"],
        ["DRE como waterfall", "–", "✓ simplificado", "✓ completo + print"],
        ["DFC como waterfall", "–", "✓ simplificado", "✓ completo + print"],
        ["Indicador de fôlego (runway)", "–", "✓", "✓ + meta MB"],
        ["Cartão de capacidade de invest.", "–", "–", "✓"],
        ["Copiloto / tarefas priorizadas", "✓ simples", "✓ completo", "✓ + CFO insights"],
        ["Saúde documental (donut)", "✓", "✓", "✓"],
        ["Navegação por abas", "–", "2 abas", "5 abas"],
        ["Exportação (PDF/Excel)", "–", "✓", "✓ + parecer"],
    ]
    ps_table = Table(plan_structure, colWidths=[190, 88, 88, 88])
    ps_table.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,0), BRAND),
        ("TEXTCOLOR", (0,0), (-1,0), colors.white),
        ("FONTNAME", (0,0), (-1,0), "Helvetica-Bold"),
        ("FONTSIZE", (0,0), (-1,-1), 8.5),
        ("ROWBACKGROUNDS", (0,1), (-1,-1), [colors.white, GRAY_BG]),
        ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
        ("TOPPADDING", (0,0), (-1,-1), 5),
        ("BOTTOMPADDING", (0,0), (-1,-1), 5),
        ("LEFTPADDING", (0,0), (-1,-1), 7),
        ("RIGHTPADDING", (0,0), (-1,-1), 7),
        ("GRID", (0,0), (-1,-1), 0.3, GRAY_LIN),
        # Colorir colunas
        ("BACKGROUND", (1,1), (1,-1), colors.Color(AMBER.red, AMBER.green, AMBER.blue, 0.04)),
        ("BACKGROUND", (2,1), (2,-1), colors.Color(TEAL.red, TEAL.green, TEAL.blue, 0.04)),
        ("BACKGROUND", (3,1), (3,-1), colors.Color(BRAND.red, BRAND.green, BRAND.blue, 0.04)),
        ("FONTNAME", (0,1), (0,-1), "Helvetica-Bold"),
    ]))
    story.append(ps_table)

    story.append(PageBreak())

    # ─── 5. MODELOS DE GRÁFICOS (MOCKUPS VISUAIS) ────────────────────────────

    for e in section_header("5. Modelos de Gráficos — Mockups Visuais", "Propostas concretas com esboços"):
        story.append(e)

    story.append(Paragraph(
        "Cada mockup abaixo representa um componente visual proposto para o menu Inteligência. "
        "Os dados são ilustrativos mas com proporções reais do sistema.",
        ST["body"]))
    story.append(Spacer(1, 8))

    # 5.1 KPI cards com sparkline
    story.append(Paragraph("5.1 KPI Cards com Sparkline e Delta", ST["h2"]))
    story.append(mockup_sparklines())
    story.append(Paragraph(
        "Cada cartão de KPI exibe: (1) mini-gráfico sparkline com os últimos 7 pontos de dados, "
        "(2) valor atual em destaque, (3) variação percentual vs mês anterior com seta colorida. "
        "Disponível para todos os planos — a diferença é o número de KPIs exibidos.",
        ST["caption"]))
    story.append(Spacer(1, 4))

    story.append(Paragraph(
        "<b>Implementação:</b> o serviço <code>finance-service.js</code> já tem "
        "<code>listPeriods(clientId)</code> retornando todos os snapshots históricos. "
        "Basta calcular delta = (atual - anterior) / anterior para cada KPI.",
        ST["body_small"]))
    story.append(Spacer(1, 10))

    # 5.2 Gauge de score
    story.append(Paragraph("5.2 Gauge Semicircular — MB Financial Score", ST["h2"]))
    story.append(side_by_side_drawings(
        mockup_gauge("Score Financeiro", 74, 100, "MB Financial Score"),
        mockup_gauge("Score Operacional", 58, 100, "Score Operacional"),
        spacing=16
    ))
    story.append(Paragraph(
        "O gauge semicircular substitui o número simples '74/100' por uma representação visual "
        "imediata do estado financeiro. Zonas: vermelho (0–49 Risco), amarelo (50–74 Atenção), "
        "verde (75–100 Saudável). O ponteiro indica a posição exata.",
        ST["caption"]))
    story.append(Spacer(1, 10))

    # 5.3 Área chart
    story.append(Paragraph("5.3 Gráfico de Área — Evolução Receita x Despesas", ST["h2"]))
    story.append(mockup_area_chart())
    story.append(Paragraph(
        "Substitui o SVG atual de polylines por um gráfico de área com preenchimento semitransparente. "
        "Mostra claramente quando a lacuna entre receita e despesas está crescendo (sinal positivo) "
        "ou se estreitando (alerta). Deve funcionar com 1 mês (barra simples) ou 2+ meses (área).",
        ST["caption"]))
    story.append(Spacer(1, 10))

    # 5.4 Barras agrupadas
    story.append(Paragraph("5.4 Barras Agrupadas — Comparativo Multi-Período", ST["h2"]))
    story.append(mockup_multi_period_bars())
    story.append(Paragraph(
        "Alternativa ao gráfico de linha para comparar até 12 meses. Cada grupo tem 3 barras: "
        "Receita (azul), Despesas (âmbar) e Resultado (verde/vermelho). Ideal para o plano CFO "
        "ver sazonalidade e tendências de longo prazo.",
        ST["caption"]))
    story.append(Spacer(1, 10))

    story.append(PageBreak())

    # 5.5 Radar score
    story.append(Paragraph("5.5 Radar Hexagonal — 6 Dimensões do Score", ST["h2"]))
    story.append(side_by_side_drawings(
        mockup_radar_score(),
        mockup_donut_expense(),
        spacing=10
    ))
    story.append(Paragraph(
        "Esquerda: Radar hexagonal para o score CFO — mostra visualmente quais dimensões "
        "estão fortes (perto da borda) e quais precisam de atenção (perto do centro). "
        "Direita: Donut de composição de despesas — Folha / Impostos / Admin / CMV em porcentagem da receita.",
        ST["caption"]))
    story.append(Spacer(1, 10))

    # 5.6 Waterfall DRE
    story.append(Paragraph("5.6 DRE — Waterfall (Cascata Gerencial)", ST["h2"]))
    story.append(mockup_waterfall_dre())
    story.append(Paragraph(
        "O waterfall transforma a DRE de 22 linhas de tabela em uma narrativa visual: "
        "como a Receita Bruta vai se transformando em Lucro Líquido por meio de "
        "deduções (vermelho), subtotais (verde) e resultado final (vinho MB). "
        "A tabela completa permanece disponível em accordion abaixo ou no botão Excel.",
        ST["caption"]))
    story.append(Spacer(1, 10))

    # 5.7 DFC waterfall
    story.append(Paragraph("5.7 DFC — Waterfall de Caixa", ST["h2"]))
    story.append(mockup_cashflow_waterfall())
    story.append(Paragraph(
        "O fluxo de caixa como waterfall mostra visualmente o caminho do saldo: "
        "Saldo Inicial → Recebimentos (+) → Pagamentos (-) → Impostos (-) → Saldo Final. "
        "O cliente entende em segundos se o caixa cresceu, caiu e por qual motivo.",
        ST["caption"]))
    story.append(Spacer(1, 10))

    # 5.8 Runway gauge
    story.append(Paragraph("5.8 Indicador de Fôlego de Caixa (Runway)", ST["h2"]))
    story.append(mockup_runway_gauge())
    story.append(Paragraph(
        "Barra horizontal com 3 zonas de cor: vermelho (menos de 15 dias — crítico), "
        "amarelo (15–45 dias — atenção), verde (mais de 45 dias — saudável). "
        "O ponteiro mostra os dias atuais com valor exato. "
        "Disponível para Financeiro IA e CFO.",
        ST["caption"]))

    story.append(PageBreak())

    # ─── 6. NAVEGAÇÃO TELA A TELA ─────────────────────────────────────────────

    for e in section_header("6. Navegação Tela a Tela", "Proposta de navegação dentro do menu Inteligência"):
        story.append(e)

    story.append(Paragraph(
        "A tela atual é uma <b>página única longa</b> com scroll. Para a quantidade de "
        "informação que precisamos entregar (especialmente no CFO), o ideal é organizar "
        "em abas dentro da tela de Inteligência:",
        ST["body"]))

    story.append(Spacer(1, 8))
    story.append(mockup_nav_tabs())
    story.append(Paragraph("Proposta de navegação em abas dentro da tela Inteligência", ST["caption"]))
    story.append(Spacer(1, 10))

    # Descrição de cada aba
    tabs_desc = [
        ("Visão Geral", "Todos os planos",
         "Seletor de competência · Cockpit do empresário · KPI cards com sparkline e delta · "
         "Insight IA principal · Prioridade MB · Saúde documental",
         BLUE, INFO_L),
        ("Financeiro", "Financeiro IA + CFO",
         "DRE como waterfall (+ accordion com tabela completa) · DFC como waterfall "
         "(+ accordion com tabela) · Botões de impressão e exportação Excel",
         TEAL, TEAL_L),
        ("Análise", "Financeiro IA + CFO",
         "Score gauge · Radar 6 dimensões (CFO) · Composição de despesas (donut) · "
         "Indicador de fôlego · Margem vs meta MB · Capacidade de investimento",
         BRAND, colors.HexColor("#fce7e8")),
        ("Histórico", "Financeiro IA + CFO",
         "Gráfico área evolução 6–12 meses · Barras agrupadas comparativo mensal · "
         "Tabela de snapshots históricos · Mini-análise de tendência IA",
         PURPLE, PURPLE_L),
        ("Cenários", "CFO",
         "Simulador de margem · Projeção de faturamento · Alertas de tendência · "
         "Recomendações consultivas MB CFO · Exportação de parecer",
         AMBER, AMBER_L),
    ]

    for tab, plans, desc, col, bg in tabs_desc:
        d = Drawing(W - 80, 60)
        d.add(Rect(0, 0, W - 80, 60, rx=6, ry=6, fillColor=bg, strokeColor=col, strokeWidth=0.8))
        d.add(Rect(0, 0, 4, 60, fillColor=col, strokeColor=None))
        d.add(String(16, 44, tab, fontName="Helvetica-Bold", fontSize=11, fillColor=col))
        plan_tag_w = len(plans) * 7 + 16
        d.add(Rect(W - 96, 40, plan_tag_w, 16, rx=4, ry=4,
                   fillColor=colors.Color(col.red, col.green, col.blue, 0.15), strokeColor=None))
        d.add(String(W - 96 + plan_tag_w/2, 45, plans, fontName="Helvetica-Bold", fontSize=8,
                     fillColor=col, textAnchor="middle"))
        # Descrição em múltiplas linhas — dividir por ponto central
        parts = desc.split(" · ")
        lines = []
        cur = ""
        for p in parts:
            test = cur + (" · " if cur else "") + p
            if len(test) > 90:
                lines.append(cur)
                cur = p
            else:
                cur = test
        if cur:
            lines.append(cur)
        y_off = 30
        for line in lines[:2]:
            d.add(String(16, y_off, line, fontName="Helvetica", fontSize=8, fillColor=GRAY_INK))
            y_off -= 13
        story.append(d)
        story.append(Spacer(1, 5))

    story.append(Spacer(1, 10))

    # Comportamento das abas por plano
    story.append(Paragraph("Comportamento das abas por plano:", ST["h3"]))
    story.append(Paragraph(
        "• <b>Contabilidade:</b> apenas a aba Visão Geral disponível. As outras abas aparecem "
        "bloqueadas com cadeado e mensagem de upgrade.",
        ST["bullet"]))
    story.append(Paragraph(
        "• <b>Financeiro IA:</b> Visão Geral + Financeiro + Análise (parcial) + Histórico. "
        "A aba Cenários aparece bloqueada.",
        ST["bullet"]))
    story.append(Paragraph(
        "• <b>CFO:</b> todas as 5 abas desbloqueadas. Cenários inclui exportação de parecer MB.",
        ST["bullet"]))

    story.append(PageBreak())

    # ─── 7. DESCRIÇÃO DAS ANIMAÇÕES E MICROINTERAÇÕES ────────────────────────

    for e in section_header("7. Animações e Microinterações", "O que faz a tela parecer viva e premium"):
        story.append(e)

    anims = [
        ("Entrada dos KPI cards (stagger)", "Os 4 cards entram em sequência com delay de 80ms cada: fadeIn + translateY(12px → 0). Duração: 300ms. Curva: ease-out."),
        ("Score gauge (fill animation)", "O arco do gauge se preenche de 0 até o valor real em 800ms com ease-in-out. O número no centro faz count-up animado."),
        ("Barras de progresso", "Cada barra CSS vai de 0% até o valor em 600ms com delay escalonado. Já existe a var --value, basta adicionar transition na folha de estilo."),
        ("Gráfico de área (draw animation)", "As polylines do SVG usam stroke-dashoffset para simular desenho da linha. 1000ms com ease-in-out."),
        ("Waterfall DRE/DFC", "Cada barra do waterfall aparece de baixo para cima com delay proporcional à posição. Leitura se torna uma narrativa sequencial."),
        ("Hover nos pontos do gráfico", "Ao passar o mouse em um ponto do gráfico, exibir tooltip com: mês, receita, despesas, resultado, margem. Posicionamento relativo ao ponto."),
        ("Donut chart", "O donut se preenche setor por setor em 800ms. Centro exibe o total animado."),
        ("Radar chart", "O polígono de dados cresce de 0 até o tamanho real em 1000ms."),
        ("Toast de 'dados atualizados'", "Após troca de competência ou atualização, exibir toast verde por 3s informando qual mês foi carregado."),
    ]

    for name, desc in anims:
        d = Drawing(W - 80, 22)
        d.add(Rect(0, 0, W - 80, 22, rx=4, ry=4, fillColor=PURPLE_L, strokeColor=None))
        d.add(Rect(0, 0, 3, 22, fillColor=PURPLE, strokeColor=None))
        d.add(String(14, 7, name, fontName="Helvetica-Bold", fontSize=9.5, fillColor=PURPLE))
        story.append(d)
        story.append(Paragraph(desc, ST["body_small"]))
        story.append(Spacer(1, 3))

    story.append(Spacer(1, 6))
    story.append(ok_box(
        "Todas as animações listadas são realizáveis apenas com CSS3 (transition, @keyframes) "
        "e JavaScript vanilla — sem nenhuma biblioteca externa. O sistema já usa Lucide Icons "
        "e CSS customizado, então a complexidade de implementação é baixa."
    ))

    story.append(PageBreak())

    # ─── 8. PRIORIZAÇÃO ──────────────────────────────────────────────────────

    for e in section_header("8. Priorização de Implementação", "O que fazer primeiro para máximo impacto"):
        story.append(e)

    prio_data = [
        ["#", "Entrega", "Impacto", "Esforço", "Planos", "Semana"],
        ["1", "Corrigir gráfico duplicado no CFO", "Alto", "Baixo", "CFO", "1"],
        ["2", "Gráfico de área (com 1 ou 2+ meses)", "Alto", "Médio", "Fin+CFO", "1"],
        ["3", "KPI cards com delta vs mês anterior", "Alto", "Médio", "Todos", "1"],
        ["4", "Indicador runway (barra colorida)", "Alto", "Baixo", "Fin+CFO", "1"],
        ["5", "CSS animations (entrada stagger + barras)", "Médio", "Baixo", "Todos", "1"],
        ["6", "Score gauge semicircular", "Alto", "Médio", "Fin+CFO", "2"],
        ["7", "DRE waterfall (+ accordion tabela)", "Alto", "Alto", "Fin+CFO", "2"],
        ["8", "DFC waterfall (+ accordion tabela)", "Alto", "Alto", "Fin+CFO", "2"],
        ["9", "Donut composição de despesas", "Médio", "Médio", "Fin+CFO", "2"],
        ["10", "Navegação em abas", "Alto", "Alto", "Todos", "3"],
        ["11", "Radar 6 dimensões score", "Médio", "Alto", "CFO", "3"],
        ["12", "Sparklines nos cards", "Médio", "Médio", "Todos", "3"],
        ["13", "Tooltips hover nos gráficos", "Médio", "Médio", "Todos", "3"],
        ["14", "Abas bloqueadas com upgrade CTA", "Alto", "Médio", "Contab.", "4"],
        ["15", "Barras agrupadas multi-período", "Médio", "Médio", "CFO", "4"],
        ["16", "Aba Cenários + simulador", "Alto", "Muito alto", "CFO", "5+"],
    ]

    impact_colors = {"Alto": SUCCESS, "Médio": WARN, "Muito alto": BRAND}
    effort_colors = {"Baixo": SUCCESS, "Médio": WARN, "Alto": DANGER, "Muito alto": DANGER}

    prio_table_data = []
    for i, row in enumerate(prio_data):
        if i == 0:
            formatted = [Paragraph(f"<b>{cell}</b>", ST["label"]) for cell in row]
        else:
            num, task, impact, effort, plans_col, week = row
            imp_col = impact_colors.get(impact, GRAY_MUT)
            eff_col = effort_colors.get(effort, GRAY_MUT)
            formatted = [
                Paragraph(f"<b>{num}</b>", ST["body"]),
                Paragraph(task, ST["body"]),
                Paragraph(f"<font color='#{int(imp_col.red*255):02x}{int(imp_col.green*255):02x}{int(imp_col.blue*255):02x}'><b>{impact}</b></font>", ST["body"]),
                Paragraph(f"<font color='#{int(eff_col.red*255):02x}{int(eff_col.green*255):02x}{int(eff_col.blue*255):02x}'><b>{effort}</b></font>", ST["body"]),
                Paragraph(plans_col, ST["body"]),
                Paragraph(f"<b>S{week}</b>", ST["body"]),
            ]
        prio_table_data.append(formatted)

    prio_t = Table(prio_table_data, colWidths=[22, 195, 55, 55, 70, 35])
    prio_t.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,0), colors.HexColor("#f0f4f8")),
        ("ROWBACKGROUNDS", (0,1), (-1,-1), [colors.white, GRAY_BG]),
        ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
        ("TOPPADDING", (0,0), (-1,-1), 5),
        ("BOTTOMPADDING", (0,0), (-1,-1), 5),
        ("LEFTPADDING", (0,0), (-1,-1), 7),
        ("RIGHTPADDING", (0,0), (-1,-1), 7),
        ("GRID", (0,0), (-1,-1), 0.3, GRAY_LIN),
        # Destacar S1 (crítico)
        ("BACKGROUND", (0,1), (-1,5), colors.Color(DANGER.red, DANGER.green, DANGER.blue, 0.04)),
    ]))
    story.append(prio_t)

    story.append(Spacer(1, 10))

    story.append(info_box(
        "As entregas da Semana 1 (itens 1–5) podem ser realizadas com alterações apenas em "
        "client-pages.js e ui.js, sem mudanças na API ou no banco de dados. "
        "São as de menor risco e maior retorno imediato de percepção de qualidade.",
        INFO, INFO_L
    ))

    story.append(Spacer(1, 6))

    # ─── 9. RECOMENDAÇÕES FINAIS ──────────────────────────────────────────────

    for e in section_header("9. Recomendações Finais", "Conclusao e proximo passo"):
        story.append(e)

    recs = [
        ("O menu Inteligência é o coração do produto — não uma tela auxiliar.",
         "Todo investimento feito aqui se converte diretamente em percepção de valor, retenção e upgrade de plano. "
         "A qualidade dessa tela define o que o cliente conta para outros empreendedores sobre o produto."),
        ("A arquitetura de dados está pronta — falta apenas a camada visual.",
         "O finance-service.js já retorna DRE, DFC, score, breakdown, histórico e competences. "
         "Os dados corretos existem. O trabalho é transformá-los em gráficos modernos."),
        ("Começar pelos quick wins da Semana 1 antes de qualquer funcionalidade nova.",
         "Corrigir o gráfico duplicado, adicionar delta nos cards e implementar a barra de runway "
         "entregam impacto visual imediato com horas de desenvolvimento."),
        ("Implementar as abas como passo estrutural da Semana 3.",
         "A navegação por abas é o que permite escalar o conteúdo sem tornar a tela infinitamente longa. "
         "Sem abas, cada nova feature aumenta a fadiga de scroll do cliente."),
        ("Usar a progressão de plano como upsell passivo.",
         "O cliente de Contabilidade que vê o radar de score 'bloqueado' e entende o que está perdendo "
         "é um lead muito mais quente do que qualquer e-mail de marketing."),
    ]

    for i, (title, body) in enumerate(recs):
        KeepTogether_block = []
        d = Drawing(W - 80, 22)
        d.add(Rect(0, 0, W - 80, 22, rx=4, ry=4,
                   fillColor=colors.Color(BRAND.red, BRAND.green, BRAND.blue, 0.06),
                   strokeColor=None))
        d.add(Rect(0, 0, 3, 22, fillColor=BRAND, strokeColor=None))
        d.add(String(14, 7, f"{i+1}. {title}", fontName="Helvetica-Bold", fontSize=9.5, fillColor=GRAY_INK))
        KeepTogether_block.append(d)
        KeepTogether_block.append(Paragraph(body, ST["body_small"]))
        KeepTogether_block.append(Spacer(1, 6))
        story.append(KeepTogether(KeepTogether_block))

    story.append(Spacer(1, 14))
    story.append(HRFlowable(width="100%", thickness=1, color=GRAY_LIN))
    story.append(Spacer(1, 8))
    story.append(Paragraph(
        "MB Empresas Assessoria Empresarial · MB Intelligence · Análise do Menu Inteligência · Maio/2026",
        ParagraphStyle("footer_text", fontName="Helvetica", fontSize=9, leading=13,
                       textColor=GRAY_SOF, alignment=TA_CENTER)
    ))

    # ─── BUILD ────────────────────────────────────────────────────────────────

    # Fix: o primeiro frame é cover, os demais são body
    doc.build(story)
    print(f"PDF gerado: {OUTPUT}")


if __name__ == "__main__":
    build_document()
