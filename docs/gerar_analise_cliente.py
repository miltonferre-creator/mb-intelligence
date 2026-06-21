# -*- coding: utf-8 -*-
"""
MB Intelligence — Análise Crítica: Visão do Cliente, Qualidade dos Dados,
DRE Profissional, Fluxo de Caixa Completo e Relatórios com Layout MB
"""

from reportlab.platypus import (
    BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer, Table,
    TableStyle, HRFlowable, KeepTogether, PageBreak
)
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT, TA_JUSTIFY
import os

# ─── Paleta MB ───────────────────────────────────────────────────────────────
RED_DARK   = colors.HexColor("#5b070b")
RED_LIGHT  = colors.HexColor("#8f121b")
GRAPHITE   = colors.HexColor("#171a21")
GRAPHITE2  = colors.HexColor("#252a36")
SILVER     = colors.HexColor("#e7ebf0")
OFFWHITE   = colors.HexColor("#f5f6f8")
GREEN      = colors.HexColor("#12a879")
AMBER      = colors.HexColor("#d97706")
BLUE       = colors.HexColor("#1d4ed8")
PURPLE     = colors.HexColor("#7c3aed")
WHITE      = colors.white
TEXT_DARK  = colors.HexColor("#111318")
TEXT_MID   = colors.HexColor("#3d4351")
TEXT_LIGHT = colors.HexColor("#667085")
ORANGE     = colors.HexColor("#ea580c")

W, H = A4

def hx(c):
    return '#%02x%02x%02x' % (int(c.red*255), int(c.green*255), int(c.blue*255))

def build_styles():
    base = getSampleStyleSheet()
    def S(name, parent="Normal", **kw):
        return ParagraphStyle(name, parent=base[parent], **kw)
    return {
        "cover_eyebrow": S("cover_eyebrow", fontSize=10, textColor=colors.HexColor("#aab4c4"),
                           fontName="Helvetica", leading=14),
        "cover_title":   S("cover_title", fontSize=29, textColor=WHITE,
                           fontName="Helvetica-Bold", leading=36, spaceAfter=8),
        "cover_sub":     S("cover_sub", fontSize=12, textColor=SILVER,
                           fontName="Helvetica", leading=17, spaceAfter=6),
        "cover_body":    S("cover_body", fontSize=9, textColor=colors.HexColor("#aab4c4"),
                           fontName="Helvetica", leading=13),
        "h1":   S("h1", fontSize=17, textColor=WHITE, fontName="Helvetica-Bold",
                   leading=22, spaceBefore=4, spaceAfter=8),
        "h2":   S("h2", fontSize=12, textColor=RED_LIGHT, fontName="Helvetica-Bold",
                   leading=16, spaceBefore=14, spaceAfter=4),
        "h3":   S("h3", fontSize=10.5, textColor=TEXT_DARK, fontName="Helvetica-Bold",
                   leading=14, spaceBefore=10, spaceAfter=4),
        "h3w":  S("h3w", fontSize=10.5, textColor=WHITE, fontName="Helvetica-Bold",
                   leading=14, spaceBefore=4, spaceAfter=4),
        "body": S("body", fontSize=9, textColor=TEXT_MID, fontName="Helvetica",
                   leading=14, spaceAfter=4, alignment=TA_JUSTIFY),
        "body_small": S("body_small", fontSize=7.5, textColor=TEXT_LIGHT,
                        fontName="Helvetica", leading=11, spaceAfter=3),
        "bullet": S("bullet", fontSize=9, textColor=TEXT_MID, fontName="Helvetica",
                    leading=13, leftIndent=10, firstLineIndent=-10, spaceAfter=3),
        "critical": S("critical", fontSize=9, textColor=RED_DARK, fontName="Helvetica-Bold",
                       leading=13, leftIndent=10, firstLineIndent=-10, spaceAfter=3),
        "code":  S("code", fontSize=7.5, textColor=colors.HexColor("#0f172a"),
                    backColor=colors.HexColor("#f1f5f9"), fontName="Courier",
                    leading=11, leftIndent=8, rightIndent=8, spaceAfter=4),
        "tbl_hdr":  S("tbl_hdr", fontSize=8, textColor=WHITE, fontName="Helvetica-Bold",
                       leading=11, alignment=TA_CENTER),
        "tbl_hdr_l":S("tbl_hdr_l", fontSize=8, textColor=WHITE, fontName="Helvetica-Bold",
                       leading=11, alignment=TA_LEFT),
        "tbl_cell": S("tbl_cell", fontSize=8, textColor=TEXT_DARK, fontName="Helvetica", leading=11),
        "tbl_cell_r":S("tbl_cell_r",fontSize=8,textColor=TEXT_DARK,fontName="Helvetica",
                        leading=11, alignment=TA_RIGHT),
        "tbl_bold": S("tbl_bold", fontSize=8, textColor=TEXT_DARK, fontName="Helvetica-Bold", leading=11),
        "tbl_red":  S("tbl_red", fontSize=8, textColor=RED_LIGHT, fontName="Helvetica-Bold", leading=11),
        "tbl_grn":  S("tbl_grn", fontSize=8, textColor=GREEN, fontName="Helvetica-Bold", leading=11),
    }

# ─── Helpers ─────────────────────────────────────────────────────────────────
def section_bar(title, color=RED_DARK, mlr=18):
    bw = W - 2*mlr*mm
    tbl = Table([[Paragraph(title, ParagraphStyle("sh1", fontSize=17, textColor=WHITE,
                   fontName="Helvetica-Bold", leading=22))]], colWidths=[bw])
    tbl.setStyle(TableStyle([
        ("BACKGROUND",    (0,0),(-1,-1), color),
        ("LEFTPADDING",   (0,0),(-1,-1), 10),
        ("RIGHTPADDING",  (0,0),(-1,-1), 10),
        ("TOPPADDING",    (0,0),(-1,-1), 7),
        ("BOTTOMPADDING", (0,0),(-1,-1), 7),
    ]))
    return tbl

def subsection(title, color=GRAPHITE2, mlr=18):
    bw = W - 2*mlr*mm
    tbl = Table([[Paragraph(title, ParagraphStyle("ssh", fontSize=10, textColor=WHITE,
                   fontName="Helvetica-Bold", leading=14))]], colWidths=[bw])
    tbl.setStyle(TableStyle([
        ("BACKGROUND",    (0,0),(-1,-1), color),
        ("LEFTPADDING",   (0,0),(-1,-1), 8),
        ("RIGHTPADDING",  (0,0),(-1,-1), 8),
        ("TOPPADDING",    (0,0),(-1,-1), 5),
        ("BOTTOMPADDING", (0,0),(-1,-1), 5),
    ]))
    return tbl

def card_border(paragraphs_list, color=AMBER, mlr=18, pad=8):
    bw = W - 2*mlr*mm
    content = [[p] for p in paragraphs_list]
    data = [[item] for sublist in [[p] for p in paragraphs_list] for item in [sublist[0]]]
    # flatten
    tbl = Table([[Paragraph("", ParagraphStyle("x"))]]) if not paragraphs_list else Table(
        [[p] for p in paragraphs_list], colWidths=[bw - 3])
    tbl.setStyle(TableStyle([
        ("LEFTPADDING",  (0,0),(-1,-1), pad),
        ("RIGHTPADDING", (0,0),(-1,-1), pad),
        ("TOPPADDING",   (0,0),(-1,-1), 5),
        ("BOTTOMPADDING",(0,0),(-1,-1), 5),
        ("BACKGROUND",   (0,0),(-1,-1), OFFWHITE),
        ("LINEBEFORETABLE",(0,0),(0,-1), 4, color),
    ]))
    return tbl

def data_table(ST, headers, rows, col_widths, hdr_color=GRAPHITE, alt=True):
    data = [[Paragraph(h, ST["tbl_hdr"]) for h in headers]]
    for i, row in enumerate(rows):
        bg = OFFWHITE if (alt and i%2==1) else WHITE
        cells = []
        for c in row:
            if isinstance(c, Paragraph):
                cells.append(c)
            else:
                cells.append(Paragraph(str(c), ST["tbl_cell"]))
        data.append(cells)
    tbl = Table(data, colWidths=col_widths)
    tbl.setStyle(TableStyle([
        ("BACKGROUND",     (0,0),(-1,0),  hdr_color),
        ("ROWBACKGROUNDS", (0,1),(-1,-1), [WHITE, OFFWHITE] if alt else [WHITE]),
        ("GRID",           (0,0),(-1,-1), 0.4, SILVER),
        ("LEFTPADDING",    (0,0),(-1,-1), 5),
        ("RIGHTPADDING",   (0,0),(-1,-1), 5),
        ("TOPPADDING",     (0,0),(-1,-1), 4),
        ("BOTTOMPADDING",  (0,0),(-1,-1), 4),
        ("VALIGN",         (0,0),(-1,-1), "MIDDLE"),
    ]))
    return tbl

def kpi_strip(ST, items, mlr=18):
    bw = W - 2*mlr*mm
    cw = bw / len(items)
    cells = []
    for label, value, color in items:
        inner = Table([
            [Paragraph(value, ParagraphStyle("kv", fontSize=15, textColor=color,
                fontName="Helvetica-Bold", leading=19, alignment=TA_CENTER))],
            [Paragraph(label, ParagraphStyle("kl", fontSize=7.5, textColor=TEXT_LIGHT,
                fontName="Helvetica", leading=10, alignment=TA_CENTER))]
        ], colWidths=[cw-6])
        inner.setStyle(TableStyle([
            ("BACKGROUND", (0,0),(-1,-1), OFFWHITE),
            ("TOPPADDING", (0,0),(-1,-1), 8),
            ("BOTTOMPADDING",(0,0),(-1,-1), 8),
            ("LINEBELOWTABLE",(0,-1),(-1,-1), 2, color),
            ("ALIGN",(0,0),(-1,-1),"CENTER"),
        ]))
        cells.append(inner)
    row_tbl = Table([cells], colWidths=[cw]*len(items))
    row_tbl.setStyle(TableStyle([("LEFTPADDING",(0,0),(-1,-1),3),("RIGHTPADDING",(0,0),(-1,-1),3)]))
    return row_tbl

def bi(text, ST, icon="[OK]", color=GREEN):
    return Paragraph(f'<font color="{hx(color)}"><b>{icon}</b></font> {text}', ST["bullet"])

def ok(text, ST):  return bi(text, ST, "[OK]", GREEN)
def wa(text, ST):  return bi(text, ST, "[!]",  AMBER)
def er(text, ST):  return bi(text, ST, "[X]",  RED_LIGHT)
def cr(text, ST):  return bi(text, ST, "[!!]", RED_DARK)
def ii(text, ST):  return bi(text, ST, "[i]",  BLUE)
def sp(n=6): return Spacer(1, n)
def hr(c=SILVER): return HRFlowable(width="100%", thickness=0.5, color=c, spaceAfter=5, spaceBefore=5)

def build_doc(output_path):
    ST = build_styles()
    story = []
    mlr = 18

    # ── Page Callback ─────────────────────────────────────────────────────
    def on_page(canvas, doc):
        canvas.saveState()
        if doc.page == 1:
            canvas.setFillColor(GRAPHITE)
            canvas.rect(0, 0, W, H, fill=1, stroke=0)
            canvas.setFillColor(RED_DARK)
            canvas.rect(0, H - 14*mm, W, 14*mm, fill=1, stroke=0)
            # Accent line left
            canvas.setFillColor(RED_LIGHT)
            canvas.rect(0, 0, 5*mm, H, fill=1, stroke=0)
            canvas.setFillColor(GRAPHITE2)
            canvas.rect(0, 0, W, 20*mm, fill=1, stroke=0)
            canvas.setFillColor(WHITE)
            canvas.setFont("Helvetica", 7)
            canvas.drawString(18*mm, 8*mm, "MB Intelligence — Análise Crítica: Visão do Cliente, Qualidade dos Dados e Relatórios Profissionais — 2026")
            canvas.drawRightString(W - 18*mm, 8*mm, "DOCUMENTO INTERNO MB EMPRESAS — CONFIDENCIAL")
        else:
            canvas.setFillColor(GRAPHITE)
            canvas.rect(0, H - 11*mm, W, 11*mm, fill=1, stroke=0)
            canvas.setFillColor(RED_DARK)
            canvas.rect(0, H - 11*mm, 4*mm, 11*mm, fill=1, stroke=0)
            canvas.setFillColor(WHITE)
            canvas.setFont("Helvetica-Bold", 7.5)
            canvas.drawString(10*mm, H - 6.5*mm, "MB Intelligence")
            canvas.setFont("Helvetica", 7.5)
            canvas.drawString(50*mm, H - 6.5*mm, "Análise Crítica — Visão do Cliente / Qualidade dos Dados")
            canvas.drawRightString(W - 10*mm, H - 6.5*mm, f"Página {doc.page}")
            canvas.setFillColor(OFFWHITE)
            canvas.rect(0, 0, W, 8*mm, fill=1, stroke=0)
            canvas.setFillColor(TEXT_LIGHT)
            canvas.setFont("Helvetica", 6.5)
            canvas.drawString(18*mm, 2.5*mm, "CONFIDENCIAL — MB Empresas Assessoria — 2026")
        canvas.restoreState()

    frame_p1 = Frame(mlr*mm, 22*mm, W - 2*mlr*mm, H - 36*mm, id="cover")
    frame_n  = Frame(mlr*mm, 10*mm, W - 2*mlr*mm, H - 22*mm, id="normal")
    doc = BaseDocTemplate(
        output_path, pagesize=A4,
        leftMargin=mlr*mm, rightMargin=mlr*mm,
        topMargin=14*mm, bottomMargin=10*mm,
        title="MB Intelligence — Análise Crítica Visão Cliente",
        author="MB Empresas Assessoria"
    )
    doc.addPageTemplates([
        PageTemplate(id="cover",  frames=[frame_p1], onPage=on_page),
        PageTemplate(id="normal", frames=[frame_n],  onPage=on_page),
    ])

    P = lambda t, s="body": Paragraph(t, ST[s])

    # ══════════════════════════════════════════════════════════════════════
    # CAPA
    # ══════════════════════════════════════════════════════════════════════
    story.append(sp(52))
    story.append(P("MB Intelligence · Análise Crítica do Produto", "cover_eyebrow"))
    story.append(sp(5))
    story.append(P("O que o empresário<br/>precisa ver — e o que<br/>o produto entrega hoje", "cover_title"))
    story.append(sp(8))
    story.append(P("Qualidade dos dados · DRE profissional · Fluxo de Caixa completo · Relatórios com layout MB · Score com metodologia", "cover_sub"))
    story.append(sp(20))

    cover_kpis = Table([[
        Paragraph("DRE atual\n5 linhas", ParagraphStyle("ck", fontSize=10, textColor=WHITE,
            fontName="Helvetica-Bold", leading=14, alignment=TA_CENTER)),
        Paragraph("DRE necessário\n15+ linhas", ParagraphStyle("ck", fontSize=10, textColor=WHITE,
            fontName="Helvetica-Bold", leading=14, alignment=TA_CENTER)),
        Paragraph("Caixa atual\n1 ponte simples", ParagraphStyle("ck", fontSize=10, textColor=WHITE,
            fontName="Helvetica-Bold", leading=14, alignment=TA_CENTER)),
        Paragraph("Caixa necessário\n3 seções (DFC)", ParagraphStyle("ck", fontSize=10, textColor=WHITE,
            fontName="Helvetica-Bold", leading=14, alignment=TA_CENTER)),
    ]], colWidths=[(W - 2*mlr*mm)/4]*4)
    cover_kpis.setStyle(TableStyle([
        ("BACKGROUND",    (0,0),(0,-1), RED_LIGHT),
        ("BACKGROUND",    (1,0),(1,-1), GREEN),
        ("BACKGROUND",    (2,0),(2,-1), ORANGE),
        ("BACKGROUND",    (3,0),(3,-1), BLUE),
        ("ALIGN",         (0,0),(-1,-1), "CENTER"),
        ("VALIGN",        (0,0),(-1,-1), "MIDDLE"),
        ("TOPPADDING",    (0,0),(-1,-1), 14),
        ("BOTTOMPADDING", (0,0),(-1,-1), 14),
        ("LEFTPADDING",   (0,0),(-1,-1), 4),
        ("RIGHTPADDING",  (0,0),(-1,-1), 4),
    ]))
    story.append(cover_kpis)
    story.append(sp(20))
    story.append(P("Data da análise: 25/05/2026  ·  Ambiente: localhost:3333 + Supabase  ·  Foco: Experiência real do empresário cliente", "cover_body"))
    story.append(PageBreak())

    # ══════════════════════════════════════════════════════════════════════
    # 1. PREMISSA: O QUE O EMPRESÁRIO PRECISA
    # ══════════════════════════════════════════════════════════════════════
    story.append(section_bar("1. Premissa — O Que o Empresário Realmente Precisa"))
    story.append(sp(8))
    story.append(P("Antes de analisar o que o produto entrega, é fundamental entender o que o <b>empresário cliente</b> da MB precisa. Ele não é contador, não é analista de TI e não quer aprender uma ferramenta. Ele quer respostas para quatro perguntas essenciais:"))
    story.append(sp(6))

    q_data = [
        ["Pergunta do Empresário", "Plano mínimo necessário", "O produto responde hoje?"],
        ["Minha empresa está dando lucro este mês?",        "Financeiro IA",     "Parcialmente — resultado numérico sem contexto"],
        ["De onde vem o meu dinheiro e para onde vai?",     "CFO as a Service",  "Parcialmente — caixa com apenas 5 linhas"],
        ["Tenho como investir agora sem correr risco?",     "CFO as a Service",  "Parcialmente — capacidade sem critério explicado"],
        ["Minha empresa está saudável financeiramente?",    "CFO as a Service",  "Fraco — Score sem metodologia transparente"],
        ["Quais são minhas obrigações fiscais do mês?",     "Contabilidade",     "Sim — DAS, guias e documentos funcionam"],
        ["O que preciso fazer para crescer com segurança?", "CFO as a Service",  "Não — insights são textos genericos e estaticos"],
        ["Posso ver o historico real dos ultimos 12 meses?","Financeiro IA",     "Nao — 4 dos 6 meses do grafico sao dados falsos"],
        ["Meu relatorio tem assinatura e e oficial?",       "CFO as a Service",  "Nao — impressao gera HTML simples sem layout MB"],
    ]
    story.append(data_table(ST, q_data[0], q_data[1:], col_widths=[74*mm, 38*mm, 56*mm]))
    story.append(sp(6))
    story.append(cr("Conclusão crítica: o produto responde bem às perguntas operacionais (fiscal, documentos) mas falha nas perguntas de gestão que justificam o preço premium dos planos Financeiro IA (R$1.200/mês) e CFO (R$2.000/mês).", ST))

    story.append(PageBreak())

    # ══════════════════════════════════════════════════════════════════════
    # 2. ALERTA CRÍTICO — DADOS FABRICADOS NOS GRÁFICOS
    # ══════════════════════════════════════════════════════════════════════
    story.append(section_bar("2. ALERTA CRÍTICO — Dados Históricos Fabricados nos Gráficos", RED_DARK))
    story.append(sp(8))
    story.append(P("Este é o problema mais sério encontrado na análise. O código do servidor (<b>server-supabase.js, linha 346</b>) revela que o gráfico de evolução financeira — apresentado ao cliente como histórico real — contém <b>dados inventados</b>:"))
    story.append(sp(6))
    story.append(P('months: [["Jan", 132, 101], ["Fev", 141, 108], ["Mar", 154, 116], ["Abr", 166, 127], ["Mai", revenue/1000, expenses/1000], ["Jun", revenue/970, expenses/970]]', "code"))
    story.append(sp(4))

    fabricated = Table([[
        Table([
            [Paragraph("Meses fabricados (hardcoded)", ParagraphStyle("x", fontSize=9, textColor=WHITE,
                fontName="Helvetica-Bold", leading=13, alignment=TA_CENTER))],
            [Paragraph("Jan · Fev · Mar · Abr", ParagraphStyle("x", fontSize=22, textColor=WHITE,
                fontName="Helvetica-Bold", leading=28, alignment=TA_CENTER))],
            [Paragraph("Valores inventados: R$132k, R$141k, R$154k, R$166k\nSem base em nenhum dado real do Supabase",
                ParagraphStyle("x", fontSize=8, textColor=colors.HexColor("#ffcccc"),
                fontName="Helvetica", leading=11, alignment=TA_CENTER))],
        ], colWidths=[80*mm], style=TableStyle([
            ("BACKGROUND",(0,0),(-1,-1), RED_DARK),
            ("TOPPADDING",(0,0),(-1,-1),8), ("BOTTOMPADDING",(0,0),(-1,-1),8),
        ])),
        Table([
            [Paragraph("Meses com dados reais", ParagraphStyle("x", fontSize=9, textColor=WHITE,
                fontName="Helvetica-Bold", leading=13, alignment=TA_CENTER))],
            [Paragraph("Mai · Jun", ParagraphStyle("x", fontSize=22, textColor=WHITE,
                fontName="Helvetica-Bold", leading=28, alignment=TA_CENTER))],
            [Paragraph("Mai = revenue/1000 (real)\nJun = revenue/970 (projeção artificial +3%)",
                ParagraphStyle("x", fontSize=8, textColor=colors.HexColor("#ccffee"),
                fontName="Helvetica", leading=11, alignment=TA_CENTER))],
        ], colWidths=[80*mm], style=TableStyle([
            ("BACKGROUND",(0,0),(-1,-1), GREEN),
            ("TOPPADDING",(0,0),(-1,-1),8), ("BOTTOMPADDING",(0,0),(-1,-1),8),
        ])),
    ]], colWidths=[80*mm, 80*mm])
    story.append(fabricated)
    story.append(sp(8))

    story.append(P("Impacto real para o cliente empresário:", "h3"))
    story.append(cr("O gráfico 'Evolução Executiva' que o cliente CFO vê mostra uma tendência de crescimento bonita — mas 4 dos 6 pontos são valores hardcoded sem qualquer relação com o histórico real da empresa.", ST))
    story.append(cr("Junho também é fictício: é apenas o valor de Maio dividido por 970 — uma projeção arbitrária de +3% sem base metodológica.", ST))
    story.append(er("Se a empresa apresentar este gráfico para um banco ou investidor, estará apresentando dados não auditáveis e potencialmente incorretos.", ST))
    story.append(er("Mês de Junho ainda não aconteceu (análise em 25/05/2026) — mostrar Jun como ponto de dados é enganoso.", ST))
    story.append(sp(6))

    story.append(P("O que deve ser corrigido:", "h3"))
    story.append(ii("Criar tabela 'monthly_snapshots' no Supabase com revenue e expenses reais por competência mensal", ST))
    story.append(ii("Gráfico deve exibir apenas meses com dados validados pela MB — não projetar ou inventar pontos", ST))
    story.append(ii("Se histórico insuficiente (<3 meses): exibir mensagem 'Aguardando dados históricos' em vez de gráfico falso", ST))
    story.append(ii("Mês corrente (ainda em andamento) deve ser marcado com linha tracejada ou badge 'Estimativa'", ST))
    story.append(ii("Implementar comparação YoY (ano anterior) quando disponível — diferencial real para o cliente", ST))

    story.append(PageBreak())

    # ══════════════════════════════════════════════════════════════════════
    # 3. ANÁLISE CRÍTICA DO DRE
    # ══════════════════════════════════════════════════════════════════════
    story.append(section_bar("3. DRE — O Que Existe vs. O Que o Cliente Precisa", GRAPHITE2))
    story.append(sp(8))
    story.append(P("O DRE atual (Demonstração do Resultado do Exercício) tem <b>apenas 5 linhas</b>. Um DRE gerencial profissional que justifique o plano CFO as a Service a R$2.000/mês precisa ter no mínimo <b>15 a 18 linhas</b> com grupos de análise, margens intermediárias e comparativos."))
    story.append(sp(8))

    # Comparativo DRE
    story.append(subsection("DRE Atual (implementado) × DRE Profissional (necessário)"))
    story.append(sp(6))

    dre_compare = [
        ["DRE Atual (5 linhas — insuficiente)", "DRE Profissional Necessário (15-18 linhas)"],
        ["1. Receita bruta — R$182.500 (100%)",
         "BLOCO 1 — RECEITA\n1. Receita Bruta de Vendas / Prestação de Serviços\n2. (-) Devoluções e Abatimentos\n3. (-) Impostos sobre Receita (ISS/ICMS/PIS/COFINS)\n= RECEITA LÍQUIDA"],
        ["2. Impostos e deduções — -R$13.880 (7,6%)",
         "BLOCO 2 — CUSTO\n4. (-) Custo das Mercadorias Vendidas (CMV)\n   ou Custo dos Serviços Prestados (CSP)\n= LUCRO BRUTO\n= Margem Bruta (%)"],
        ["3. Custos diretos — -R$72.100 (39,5%)",
         "BLOCO 3 — DESPESAS OPERACIONAIS\n5. (-) Despesas Administrativas\n6. (-) Despesas com Pessoal / Folha\n7. (-) Despesas com Vendas / Marketing\n8. (-) Depreciação e Amortização\n= EBITDA (Resultado Operacional antes Dep.)\n= EBIT (Resultado Operacional)"],
        ["4. Despesas operacionais — -R$56.210 (30,8%)",
         "BLOCO 4 — RESULTADO FINANCEIRO\n9. (+) Receitas Financeiras\n10. (-) Despesas Financeiras (juros, IOF, tarifas)\n= RESULTADO ANTES DO IR (LAIR)"],
        ["5. Resultado gerencial — R$40.310 (22,1%)",
         "BLOCO 5 — IMPOSTOS E LUCRO\n11. (-) Imposto de Renda (IR)\n12. (-) Contribuição Social (CSLL)\n= LUCRO LÍQUIDO DO EXERCÍCIO\n= Margem Líquida (%)"],
        ["— (ausente)",
         "BLOCO 6 — DISTRIBUIÇÃO\n13. (-) Reservas (legal, estatutária)\n14. Lucros disponíveis para distribuição\n= RESULTADO RETIDO"],
    ]

    bw = W - 2*mlr*mm
    tbl_dre = Table(
        [[Paragraph(r[0], ParagraphStyle("dc", fontSize=8, textColor=TEXT_DARK,
              fontName="Helvetica", leading=12)),
          Paragraph(r[1], ParagraphStyle("dc", fontSize=8, textColor=TEXT_DARK,
              fontName="Helvetica", leading=12))] for r in dre_compare],
        colWidths=[bw*0.38, bw*0.62]
    )
    tbl_dre.setStyle(TableStyle([
        ("BACKGROUND",     (0,0),(-1,0),  RED_DARK),
        ("FONTNAME",       (0,0),(-1,0),  "Helvetica-Bold"),
        ("FONTSIZE",       (0,0),(-1,0),  8),
        ("TEXTCOLOR",      (0,0),(-1,0),  WHITE),
        ("ROWBACKGROUNDS", (0,1),(-1,-1), [colors.HexColor("#fff0f0"), WHITE]),
        ("GRID",           (0,0),(-1,-1), 0.4, SILVER),
        ("LEFTPADDING",    (0,0),(-1,-1), 6),
        ("RIGHTPADDING",   (0,0),(-1,-1), 6),
        ("TOPPADDING",     (0,0),(-1,-1), 5),
        ("BOTTOMPADDING",  (0,0),(-1,-1), 5),
        ("VALIGN",         (0,0),(-1,-1), "TOP"),
        ("ALIGN",          (0,0),(0,-1),  "LEFT"),
    ]))
    story.append(tbl_dre)
    story.append(sp(8))

    story.append(P("Gaps Críticos do DRE Atual:", "h2"))
    story.append(er("Não existe separação entre CMV (Custo da Mercadoria) e Despesas Operacionais — impossível calcular Margem Bruta real", ST))
    story.append(er("Não há EBITDA — métrica mais usada por bancos, investidores e analistas para avaliar a saúde operacional", ST))
    story.append(er("Não há Resultado Financeiro — empresa com empréstimo ou aplicação não tem esse impacto refletido", ST))
    story.append(er("Não há IR/CSLL separados — Simples Nacional tem DAS mas Lucro Presumido tem IR real que deve aparecer", ST))
    story.append(er("Despesas operacionais em 1 linha só — empresário não sabe se o problema é folha, administrativo ou vendas", ST))
    story.append(wa("Porcentagens calculadas corretamente mas sem indicação da META da MB para cada linha (ex: folha deve ser < 25%)", ST))
    story.append(wa("Sem linha de variação mês anterior — empresário não sabe se melhorou ou piorou vs. mês passado", ST))
    story.append(wa("'Resultado gerencial' não é terminologia padronizada — deveria ser 'Lucro Líquido' ou 'EBIT'", ST))
    story.append(sp(6))

    story.append(P("O que o DRE CFO precisa entregar:", "h2"))
    story.append(ok("Estrutura em blocos com subtotais: Receita Líquida, Lucro Bruto, EBITDA, EBIT, LAIR, Lucro Líquido", ST))
    story.append(ok("Coluna de % sobre receita para cada linha — permite benchmarking setorial", ST))
    story.append(ok("Coluna de comparativo com mês anterior (variação R$ e %)", ST))
    story.append(ok("Coluna de comparativo com acumulado do ano (YTD)", ST))
    story.append(ok("Destaque visual para linhas de subtotal (negrito, linha separadora)", ST))
    story.append(ok("Indicadores-semáforo: verde (dentro do benchmark MB), amarelo (atenção), vermelho (acima do limite)", ST))

    story.append(PageBreak())

    # ══════════════════════════════════════════════════════════════════════
    # 4. ANÁLISE CRÍTICA DO FLUXO DE CAIXA
    # ══════════════════════════════════════════════════════════════════════
    story.append(section_bar("4. Fluxo de Caixa — O Que Existe vs. O Que o Cliente Precisa"))
    story.append(sp(8))
    story.append(P("O Fluxo de Caixa atual é uma <b>'ponte de caixa' visual com 5 barras</b>. Bonito visualmente, mas absolutamente insuficiente para gestão financeira real. A NBC T 3.8 (norma brasileira) e as melhores práticas de gestão exigem uma <b>DFC — Demonstração dos Fluxos de Caixa</b> estruturada em 3 seções."))
    story.append(sp(8))

    story.append(subsection("Fluxo de Caixa Atual (5 linhas) × DFC Profissional (3 seções, 15+ linhas)"))
    story.append(sp(6))

    cash_compare = [
        ["Atual — Ponte de Caixa (5 linhas)", "Necessário — DFC Completo (3 seções)"],
        ["1. Saldo inicial — R$60.200",
         "SECAO 1 — ATIVIDADES OPERACIONAIS (FCO)\n(+) Recebimentos de clientes\n(-) Pagamentos a fornecedores\n(-) Pagamentos de salarios e encargos\n(-) Pagamentos de impostos (DAS, FGTS, etc.)\n(-) Despesas administrativas pagas\n= Caixa Liquido das Atividades Operacionais"],
        ["2. Recebimentos — +R$126.000",
         "SECAO 2 — ATIVIDADES DE INVESTIMENTO (FCI)\n(+) Venda de ativos / equipamentos\n(-) Aquisicao de imobilizado\n(-) Compra de participacoes societarias\n= Caixa Liquido das Atividades de Investimento"],
        ["3. Pagamentos — -R$86.400",
         "SECAO 3 — ATIVIDADES DE FINANCIAMENTO (FCF)\n(+) Captacao de emprestimos e financiamentos\n(-) Amortizacao de dividas\n(-) Distribuicao de lucros / pro-labore\n= Caixa Liquido das Atividades de Financiamento"],
        ["4. Impostos — -R$15.200",
         "CONSOLIDADO\n= Variacao Liquida do Caixa (FCO + FCI + FCF)\n+ Saldo de Caixa no inicio do periodo\n= Saldo de Caixa no final do periodo\nConferencia com saldo bancario real"],
        ["5. Saldo projetado — R$84.600",
         "ANALISE ADICIONAL (diferenciais do plano CFO)\nCapital de Giro Necessario (NCG)\nCiclo Financeiro (dias)\nPrazo Medio de Recebimento (PMR)\nPrazo Medio de Pagamento (PMP)\nLiquidez Corrente e Imediata"],
    ]

    tbl_cash = Table(
        [[Paragraph(r[0], ParagraphStyle("dc", fontSize=8, textColor=TEXT_DARK,
              fontName="Helvetica", leading=12)),
          Paragraph(r[1], ParagraphStyle("dc", fontSize=8, textColor=TEXT_DARK,
              fontName="Helvetica", leading=12))] for r in cash_compare],
        colWidths=[bw*0.36, bw*0.64]
    )
    tbl_cash.setStyle(TableStyle([
        ("BACKGROUND",     (0,0),(-1,0),  GRAPHITE),
        ("FONTNAME",       (0,0),(-1,0),  "Helvetica-Bold"),
        ("FONTSIZE",       (0,0),(-1,0),  8),
        ("TEXTCOLOR",      (0,0),(-1,0),  WHITE),
        ("ROWBACKGROUNDS", (0,1),(-1,-1), [colors.HexColor("#fff8f0"), WHITE]),
        ("GRID",           (0,0),(-1,-1), 0.4, SILVER),
        ("LEFTPADDING",    (0,0),(-1,-1), 6),
        ("RIGHTPADDING",   (0,0),(-1,-1), 6),
        ("TOPPADDING",     (0,0),(-1,-1), 5),
        ("BOTTOMPADDING",  (0,0),(-1,-1), 5),
        ("VALIGN",         (0,0),(-1,-1), "TOP"),
    ]))
    story.append(tbl_cash)
    story.append(sp(8))

    story.append(P("Gaps Críticos do Fluxo de Caixa Atual:", "h2"))
    story.append(er("Não existe separação entre FCO (Operacional), FCI (Investimento) e FCF (Financiamento) — mistura tudo em 5 linhas genéricas", ST))
    story.append(er("'Pagamentos' de R$86.400 é uma linha só — empresário não sabe quanto foi para fornecedores, folha, aluguel ou dívidas", ST))
    story.append(er("Não há NCG (Necessidade de Capital de Giro) — indicador crítico para gestão do ciclo operacional", ST))
    story.append(er("Não há PMR e PMP — empresa pode ter bom lucro e caixa negativo por descasamento de prazos", ST))
    story.append(er("A ponte gráfica (barras verticais coloridas) é visualmente atraente mas dificulta leitura de valores precisos", ST))
    story.append(wa("Não há fluxo projetado (forecast) — empresário não sabe como o caixa estará no próximo mês", ST))
    story.append(wa("Não há alerta quando caixa fica abaixo da reserva mínima de 45 dias definida como meta da MB", ST))
    story.append(wa("Sem discriminação de contas bancárias — empresa com 3 bancos não consegue ver saldo consolidado", ST))
    story.append(sp(6))

    story.append(P("O que o Fluxo de Caixa CFO precisa entregar:", "h2"))
    story.append(ok("DFC em método indireto OU direto — ambos aceitos pela norma brasileira", ST))
    story.append(ok("FCO separado por tipo de pagamento (fornecedores, pessoal, impostos, outros)", ST))
    story.append(ok("Projeção dos próximos 30/60/90 dias baseada em recorrências históricas", ST))
    story.append(ok("Alerta automático: 'Seu caixa fica abaixo de 45 dias em X semanas se manter o padrão'", ST))
    story.append(ok("PMR, PMP e Ciclo Financeiro calculados automaticamente dos lançamentos", ST))
    story.append(ok("Visão consolidada multi-conta bancária", ST))

    story.append(PageBreak())

    # ══════════════════════════════════════════════════════════════════════
    # 5. ANÁLISE DO MB FINANCIAL SCORE
    # ══════════════════════════════════════════════════════════════════════
    story.append(section_bar("5. MB Financial Score — Metodologia Inexistente", GRAPHITE2))
    story.append(sp(8))
    story.append(P("O MB Financial Score é apresentado como um diferencial competitivo do produto (score 82/100 para o Comércio Silva). Porém, ao analisar o código, <b>a metodologia de cálculo simplesmente não existe</b>:"))
    story.append(sp(6))
    story.append(P("Como o score é 'calculado' hoje:", "h3"))
    story.append(P("financial_score: campo INTEGER no Supabase — preenchido manualmente pela equipe MB no formulário de 'Dados do Cliente'.", "code"))
    story.append(P("Score radar no frontend (client-pages.js):", "code"))
    story.append(P('["Geracao de caixa", Math.min(score, 100), "score/100", "teal"]\n["Margem",          Math.min(margin * 3, 100), "margem%", "blue"]\n["Reserva",         Math.min(runway, 100), "runway dias", "brand"]\n["Risco",           Math.max(100 - score, 0), "controlado", "amber"]', "code"))
    story.append(sp(4))
    story.append(er("O score é um número digitado manualmente — não calculado por nenhum algoritmo sobre os dados reais", ST))
    story.append(er("Margem*3 é uma fórmula arbitrária sem base metodológica (22,1% × 3 = 66,3% — o que isso significa?)", ST))
    story.append(er("'Risco = 100 - score' é uma tautologia — usa o mesmo número manual para derivar outro número", ST))
    story.append(er("Runway em 'dias' sendo tratado como percentual na barra de 0 a 100% (42 dias = 42%?) — matematicamente incorreto", ST))
    story.append(sp(6))

    story.append(P("O que o MB Financial Score precisa ser:", "h2"))
    story.append(P("Um score calculado automaticamente a partir de indicadores reais, ponderados, com transparência total para o cliente:"))
    story.append(sp(4))

    score_data = [
        ["Dimensão", "Indicador Base", "Peso", "Critério Verde", "Critério Vermelho"],
        ["Liquidez",        "Caixa / Despesas mensais (Runway)",      "25%", ">45 dias",      "<15 dias"],
        ["Rentabilidade",   "Margem Líquida",                         "25%", ">20%",          "<8%"],
        ["Eficiência",      "Despesas Adm / Faturamento",             "20%", "<15%",          ">30%"],
        ["Folha",           "Folha / Faturamento",                    "15%", "<22%",          ">40%"],
        ["Impostos",        "Carga tributária efetiva",               "10%", "<12% (SN)",     ">20%"],
        ["Capital de Giro", "NCG em dias de faturamento",             "5%",  "<30 dias",      ">90 dias"],
    ]
    story.append(data_table(ST, score_data[0], score_data[1:],
        col_widths=[32*mm, 52*mm, 14*mm, 28*mm, 28*mm]))
    story.append(sp(6))
    story.append(ok("Score calculado automaticamente na API quando MB salva dados financeiros validados", ST))
    story.append(ok("Cada dimensão com drill-down explicando o que contribuiu positiva e negativamente", ST))
    story.append(ok("Histórico do score (últimos 6 meses) para o cliente ver a evolução", ST))
    story.append(ok("Comparativo com benchmark do setor (ex: 'Sua margem é 22% — acima da média de 17% para comércio varejista')", ST))

    story.append(PageBreak())

    # ══════════════════════════════════════════════════════════════════════
    # 6. GRÁFICOS — O QUE EXISTE VS. O QUE FALTA
    # ══════════════════════════════════════════════════════════════════════
    story.append(section_bar("6. Gráficos e Visualizações — Diagnóstico Completo"))
    story.append(sp(8))
    story.append(P("O produto usa SVG nativo para gráficos. A biblioteca de componentes (ui.js) oferece: sparklines, linha (lineChart), barras horizontais (bars) e ponte de caixa (cashBridge). Esses são pontos de partida, não de chegada."))
    story.append(sp(6))

    charts_data = [
        ["Visualização", "Existe?", "Problema Atual", "Necessidade Real"],
        ["Linha Receita vs. Despesas",  "Sim",         "4 de 6 meses são dados falsos. Sem projeção distinta. Sem linha de margem real",
         "Apenas meses com dados reais. Linha tracejada para projeção. Linha de margem calculada"],
        ["DRE em tabela",               "Sim (5 linhas)","Sem subtotais, sem variação vs. mês anterior, sem semáforos",
         "Tabela com 15+ linhas, subtotais em negrito, % sobre receita, variacao mensal, cores semaforo"],
        ["Fluxo de caixa (ponte)",      "Sim (5 barras)","Barras verticais dificultam leitura de valores. Sem FCO/FCI/FCF",
         "Tabela DFC estruturada em 3 secoes. Grafico de waterfall para o caixa operacional"],
        ["Score radar / pizza",         "Nao",          "Apenas barras horizontais com fórmulas arbitrárias",
         "Grafico radar com 5 dimensoes calculadas + historico do score em linha"],
        ["Composição das despesas",     "Sim (barras)",  "Valores hardcoded: 'R$72 mil', 'R$39 mil' — não calculados",
         "Grafico pizza/donut com valores reais por categoria de despesa"],
        ["Margem e resultado",          "Sim (barras)",  "Meta MB hardcoded como 72 (24%) — não editavel por empresa",
         "Meta configurável por cliente. Comparativo real atual vs. meta vs. média do setor"],
        ["Capital de giro / liquidez",  "Nao",           "Ausente completamente",
         "Indicadores de NCG, PMR, PMP, liquidez corrente — essenciais para o CFO"],
        ["Projecao de caixa (30/60/90)","Nao",           "Ausente completamente",
         "Grafico de area com caixa projetado + faixa de confianca + alerta de risco"],
        ["Comparativo anual (YoY)",     "Nao",           "Ausente completamente",
         "Lado a lado: mesmo mes ano atual vs. ano anterior"],
        ["Distribuicao de receita",     "Nao",           "Ausente — empresa com multiplas fontes de receita nao consegue ver",
         "Grafico de barras empilhadas ou pizza por fonte/produto/servico"],
        ["Evolucao do score MB",        "Nao",           "Ausente — cliente nao ve progresso da saude financeira ao longo do tempo",
         "Linha do score dos ultimos 6-12 meses com marcos (acoes que impactaram)"],
    ]
    story.append(data_table(ST, charts_data[0], charts_data[1:],
        col_widths=[36*mm, 14*mm, 54*mm, 64*mm]))
    story.append(sp(6))
    story.append(wa("O produto usa apenas SVG nativo e barras CSS. Para os gráficos necessários (radar, waterfall, pizza, area com projeção), é recomendado integrar Chart.js ou ApexCharts — ambas gratuitas e leves", ST))

    story.append(PageBreak())

    # ══════════════════════════════════════════════════════════════════════
    # 7. RELATÓRIOS IMPRESSOS — LAYOUT MB E ASSINATURAS
    # ══════════════════════════════════════════════════════════════════════
    story.append(section_bar("7. Relatórios para Impressão — Layout MB e Campos de Assinatura"))
    story.append(sp(8))
    story.append(P("O cliente CFO a R$2.000/mês precisa de relatórios que ele possa apresentar ao banco, ao sócio, ao investidor ou ao contador. O que o produto entrega hoje é uma janela de impressão HTML básica sem nenhuma identidade visual da MB:"))
    story.append(sp(6))

    story.append(P("Código atual do printReport() em app.js:", "h3"))
    story.append(P("""report.document.write(`
  <header>
    <h1>${title}</h1><p>${client.name} · Relatório MB Intelligence</p>
  </header>
  <table>... linhas da DRE ...</table>
  <footer>Relatório gerado na base local do produto.</footer>
`);""", "code"))
    story.append(sp(4))
    story.append(er("Zero identidade visual: sem logo MB, sem cor da marca, sem fontes institucionais", ST))
    story.append(er("'Relatório gerado na base local do produto' no rodapé — texto interno exposto para o cliente. Precisa ser removido imediatamente", ST))
    story.append(er("Sem campos de assinatura: DRE profissional requer assinatura do contador responsável e do diretor da empresa", ST))
    story.append(er("Sem data de emissão formatada, número do documento ou código de verificação", ST))
    story.append(er("Sem CNPJ do cliente e CNPJ/CRC da MB no cabeçalho — obrigatório para relatório contábil", ST))
    story.append(er("Sem período de competência destacado (ex: 'Resultado do período: 01/05/2026 a 31/05/2026')", ST))
    story.append(wa("exportReport() gera CSV sem cabeçalho formatado — dados 'soltos' sem contexto para quem receber o arquivo", ST))
    story.append(sp(8))

    story.append(P("Layout Obrigatório para Relatório Impresso (DRE e Fluxo de Caixa):", "h2"))

    layout_sections = [
        ["Seção", "Conteúdo obrigatório", "Status atual"],
        ["Cabeçalho",
         "Logo MB (cor) | Nome da empresa cliente | CNPJ | Razão social\nTítulo do relatório (ex: DRE Gerencial — Competência Maio/2026)\nConsultor responsável | Data de emissão | Número do documento",
         "Ausente — apenas h1 e nome da empresa"],
        ["Corpo — DRE",
         "Estrutura em 5 blocos (Receita, Custo, Despesas, Financeiro, Resultado)\nNúmeros em R$ formatados (BRL) | % sobre Receita | Variação vs. mês anterior\nLinhas de subtotal destacadas (negrito + linha dupla)\nSemáforo de status por linha (verde/amarelo/vermelho)",
         "5 linhas sem agrupamento, sem variação, sem semáforo"],
        ["Corpo — Fluxo de Caixa",
         "DFC em 3 seções: FCO / FCI / FCF\nSaldo inicial e final com data\nLinha de verificação vs. extrato bancário\nTabela de análise de liquidez (PMR, PMP, NCG)",
         "5 barras sem seções sem dados detalhados"],
        ["Observação MB",
         "Caixa de texto com análise qualitativa do consultor MB\nAssinado pelo consultor responsável\nIdentificado como 'Análise MB — não constitui parecer contábil formal'",
         "Ausente"],
        ["Assinaturas",
         "CAMPO 1: ____________________________\nConsultor MB: [Nome] | CRC: [número]\nMB Empresas Assessoria CNPJ: XX.XXX.XXX/0001-XX\n\nCAMPO 2: ____________________________\nResponsável pela empresa: [Nome do cliente]\nCargo: [Proprietário/Diretor]\nData: ___/___/______",
         "Completamente ausente"],
        ["Rodapé",
         "Número da página | Total de páginas\n'Documento gerado pela plataforma MB Intelligence'\nData/hora de geração (timestamp)\nAVISO: 'Este relatório é de uso gerencial...'",
         "Rodapé genérico com texto interno exposto"],
    ]
    story.append(data_table(ST, layout_sections[0], layout_sections[1:],
        col_widths=[24*mm, 88*mm, 56*mm]))
    story.append(sp(8))

    story.append(P("Solução técnica recomendada para relatórios profissionais:", "h2"))
    story.append(ii("Opção 1 — Geração de PDF via API: criar endpoint POST /reports/dre e POST /reports/cashflow que geram PDF com ReportLab ou PDFKit (Node.js) com layout MB completo", ST))
    story.append(ii("Opção 2 — HTML para PDF via CSS Print: criar template HTML dedicado (não a mesma tela do dashboard) com @media print, logo MB em SVG, bordas de assinatura e rodapé institucional", ST))
    story.append(ii("Opção 3 — Integração Canva/Adobe Express API: para relatórios com design premium e templates editáveis pela equipe MB", ST))
    story.append(ok("Recomendação: Opção 2 (HTML+CSS Print) é a mais rápida de implementar e a que mantém tudo no frontend atual", ST))
    story.append(sp(4))
    story.append(P("Para os campos de assinatura, a solução mais segura é incluí-los no PDF gerado e exigir assinatura física (ou digital via Assinador SERPRO que já está instalado na máquina) antes de compartilhar com o cliente.", "body"))

    story.append(PageBreak())

    # ══════════════════════════════════════════════════════════════════════
    # 8. QUALIDADE DOS DADOS POR PLANO
    # ══════════════════════════════════════════════════════════════════════
    story.append(section_bar("8. Qualidade dos Dados por Plano — Diagnóstico Crítico", GRAPHITE2))
    story.append(sp(8))
    story.append(P("A qualidade dos dados que alimentam o produto determina diretamente o valor percebido pelo cliente. A análise revela problemas estruturais que comprometem a confiabilidade das informações apresentadas:"))
    story.append(sp(6))

    story.append(P("8.1 Plano Contabilidade — Serviços Prime ME (R$800/mês)", "h2"))
    cont_quality = [
        ["Dado", "Origem", "Qualidade", "Problema"],
        ["Faturamento R$42.800",    "Manual MB (formulário)",  "Baixa",   "Digitado manualmente — sem validação cruzada com NFe/SEFAZ"],
        ["Impostos R$3.260",        "Manual MB",               "Media",   "Deveria ser calculado automaticamente do DAS (Simples Nacional)"],
        ["Resultado",               "Bloqueado pelo plano",    "N/A",     "Correto bloquear — mas sem texto explicando por que e como evoluir"],
        ["Documentos (1 arquivo)",  "Upload MB",               "Alta",    "Contrato Social com status 'Pendente' — informa mas não resolve"],
        ["Histórico (barras)",      "Hardcoded",               "Falso",   "DAS 86% e Fiscal 72% sao porcentagens inventadas sem base real"],
        ["Insights",                "Texto seed",              "Inutil",  "3 insights genericos identicos para todos os clientes Contabilidade"],
    ]
    story.append(data_table(ST, cont_quality[0], cont_quality[1:],
        col_widths=[36*mm, 36*mm, 18*mm, 78*mm]))
    story.append(sp(4))
    story.append(cr("O 'Portal Contábil' exibe barras 'DAS 86%', 'Documentos fiscais 72%' — são porcentagens HARDCODED no código, sem base em nenhum dado real. Para um cliente que paga R$800/mês, isso é enganoso.", ST))
    story.append(sp(8))

    story.append(P("8.2 Plano Financeiro IA — Clínica Norte PME (R$1.200/mês)", "h2"))
    fin_quality = [
        ["Dado", "Origem", "Qualidade", "Problema"],
        ["Faturamento R$96.500",   "Manual MB",     "Media",  "Digitado — sem integração com sistema de gestão ou NFe"],
        ["Despesas R$70.300",      "Manual MB",     "Baixa",  "1 número para TODAS as despesas — folha, fornecedor, aluguel somados"],
        ["Resultado R$26.200",     "Calculado",     "Alta",   "revenue - expenses — ok matematicamente, mas base duvidosa"],
        ["Margem 18,8%",           "Calculado BD",  "Alta",   "Campo GENERATED na tabela — correto. Mas marginalmente confiável se base incorreta"],
        ["Gráfico 6 meses",        "4 meses falsos","Crítico","Jan-Abr são hardcoded: 78k, 82k, 84k, 89k — valores inventados"],
        ["DRE",                    "Ausente",       "N/A",    "Plano não inclui DRE — correto, mas cliente não entende por que paga R$1.200"],
        ["Importação CSV",         "Arquivo real",  "Inutil", "despesas_maio.csv com 'Erro de colunas' — ninguém processou, nenhum dado extraído"],
        ["Score 68",               "Manual MB",     "Baixa",  "Número digitado sem metodologia — 'score' de conveniência"],
    ]
    story.append(data_table(ST, fin_quality[0], fin_quality[1:],
        col_widths=[36*mm, 28*mm, 18*mm, 86*mm]))
    story.append(sp(4))
    story.append(cr("A importação com 'Erro de colunas' representa uma falha dupla: o arquivo veio mas nenhum dado foi extraído e nenhuma instrução foi dada ao cliente sobre como corrigir. Pagou R$1.200/mês e não obteve análise.", ST))
    story.append(sp(8))

    story.append(P("8.3 Plano CFO as a Service — Comércio Silva LTDA (R$2.000/mês)", "h2"))
    cfo_quality = [
        ["Dado", "Origem", "Qualidade", "Análise Crítica"],
        ["Faturamento R$182.500",  "Manual MB",     "Media",   "Melhor base mas ainda digitado — conferência com NFe seria ideal"],
        ["DRE (5 linhas)",         "Supabase real", "Parcial", "Estrutura pobre demais para R$2k/mês — veja Seção 3 deste documento"],
        ["Fluxo de Caixa (5 bar.)", "Supabase real","Parcial", "Dados reais mas estrutura insuficiente — veja Seção 4 deste documento"],
        ["Score 82",               "Manual MB",     "Baixa",   "Não calculado — digitado. Sem metodologia, sem drill-down"],
        ["Runway 42 dias",         "Manual MB",     "Media",   "Correto como conceito mas digitado manualmente. Deveria ser calculado: caixa / despesas_diárias"],
        ["Capacidade R$52.000",    "Manual MB",     "Baixa",   "Número arbitrário sem formula. Como foi calculado? Cliente não sabe"],
        ["Gráfico 6 meses",        "4 meses falsos","Crítico", "Jan(132k), Fev(141k), Mar(154k), Abr(166k) hardcoded. Clientes CFO percebem números suspeitos"],
        ["Gráfico composição desp.","Hardcoded",     "Falso",   "'Custos diretos 51%, R$72 mil', 'Administrativo 28%, R$39 mil' — hardcoded no client-pages.js"],
        ["Meta de margem",         "Hardcoded",     "Falso",   "Meta 24% (72/3) — hardcoded para todos os clientes CFO independente do setor"],
        ["Insights MB",            "Texto seed",    "Ruim",    "2 frases genéricas: 'Dados carregados do Supabase' e 'Dependem de validação MB' — não analisam nada"],
    ]
    story.append(data_table(ST, cfo_quality[0], cfo_quality[1:],
        col_widths=[38*mm, 28*mm, 18*mm, 84*mm]))
    story.append(sp(4))
    story.append(cr("O gráfico de 'Composição das Despesas' (custos 51%, administrativo 28%, etc.) é 100% hardcoded — não usa dados reais. Um cliente CFO experiente vai perceber que os números não batem com sua realidade.", ST))
    story.append(cr("O insight 'Dados carregados do Supabase. Análises executivas dependem de validação MB.' não é um insight — é um status técnico do sistema sendo exibido ao cliente empresário. Isso precisa ser removido imediatamente.", ST))

    story.append(PageBreak())

    # ══════════════════════════════════════════════════════════════════════
    # 9. BACKLOG ORIENTADO AO CLIENTE
    # ══════════════════════════════════════════════════════════════════════
    story.append(section_bar("9. Backlog do Programador — Orientado à Experiência do Cliente"))
    story.append(sp(8))
    story.append(P("Prioridades definidas pela pergunta: 'O que mais prejudica a percepção de valor do cliente hoje?'"))
    story.append(sp(6))

    story.append(subsection("SPRINT 1 — Corrigir o que Engana o Cliente (1-2 semanas)"))
    story.append(sp(4))
    sp1 = [
        ["#", "Tarefa", "Arquivo(s) a alterar", "Critério de conclusão"],
        ["S1-1", "Remover dados históricos hardcoded do gráfico de evolução. Exibir apenas meses com dados reais no Supabase. Mostrar 'Aguardando histórico' se menos de 2 meses",
         "server-supabase.js linha 346\nclient-pages.js > cfoExecutiveCharts()",
         "Gráfico só exibe pontos com dados reais. Sem Jan-Abr fictícios"],
        ["S1-2", "Remover 'Dados carregados do Supabase / Análises dependem de validação MB' do campo insights do cliente CFO. Substituir por texto útil baseado nos dados reais",
         "server-supabase.js > financeToApi() linha 280",
         "insights[] calculados a partir dos dados reais (margem, runway, caixa)"],
        ["S1-3", "Remover barras hardcoded na Composição de Despesas (51%, 28%) e substituir por cálculo real: custos/revenue, payroll/revenue",
         "client-pages.js > cfoExecutiveCharts() linhas 202-208",
         "Cada barra usa dados reais do financial_snapshot"],
        ["S1-4", "Remover 'DAS 86%', 'Documentos fiscais 72%' hardcoded do portal contábil",
         "client-pages.js > intelligence() linha 125",
         "Barras refletem status real de documentos por categoria"],
        ["S1-5", "Remover texto interno 'Relatório gerado na base local do produto' do printReport()",
         "apps/web/app.js linha 358",
         "Rodapé profissional com nome MB e data de emissão"],
        ["S1-6", "Corrigir Meta de margem hardcoded (72 = 24%) para valor editável por cliente",
         "client-pages.js > cfoExecutiveCharts() linha 215",
         "Meta lida do banco ou configurável pela MB por cliente"],
    ]
    story.append(data_table(ST, sp1[0], sp1[1:], col_widths=[10*mm, 74*mm, 46*mm, 38*mm]))
    story.append(sp(8))

    story.append(subsection("SPRINT 2 — DRE e Fluxo de Caixa Profissionais (2-4 semanas)"))
    story.append(sp(4))
    sp2 = [
        ["#", "Tarefa", "Impacto para o cliente"],
        ["S2-1", "Expandir schema: adicionar colunas ao financial_snapshot — gross_profit, ebitda, ebit, financial_result, income_tax, net_income. Criar migration SQL.",
         "DRE com 12+ linhas passa a ter subtotais reais"],
        ["S2-2", "Criar formulário expanded de Dados do Cliente com os novos campos em grupos (Receita, Custo, Despesas, Financeiro). Validação: lucro_bruto deve ser receita - cmv.",
         "MB alimenta dados estruturados, não 1 campo de despesas genérico"],
        ["S2-3", "Refatorar dreTable() no ui.js para renderizar DRE com 5 blocos, subtotais em negrito, linha separadora entre blocos, % sobre receita e variação vs. mês anterior.",
         "Cliente vê DRE profissional comparável ao de um contador convencional"],
        ["S2-4", "Expandir schema cash_flow_reports: adicionar campos por categoria (fornecedores, pessoal, impostos, outros operacionais, investimentos, financiamentos). Migration SQL.",
         "Fluxo de Caixa estruturado em FCO/FCI/FCF"],
        ["S2-5", "Refatorar cashBridge() para renderizar DFC em tabela com 3 seções, totais por seção, variação de caixa líquida e conferência vs. saldo bancário.",
         "Substitui as 5 barras por relatório estruturado auditável"],
        ["S2-6", "Adicionar cálculo automático de PMR, PMP e NCG na API baseado nos dados de caixa. Exibir no painel CFO como indicadores separados.",
         "Empresário entende o ciclo financeiro da empresa"],
    ]
    story.append(data_table(ST, sp2[0], sp2[1:], col_widths=[10*mm, 100*mm, 58*mm]))
    story.append(sp(8))

    story.append(subsection("SPRINT 3 — Relatórios com Layout MB e Assinaturas (2-3 semanas)"))
    story.append(sp(4))
    sp3 = [
        ["#", "Tarefa", "Resultado entregável"],
        ["S3-1", "Criar template HTML dedicado para impressão: print-dre.html e print-cashflow.html com logo MB em SVG, cabeçalho institucional (CNPJ MB + CRC), dados do cliente, competência em destaque. CSS @media print completo.",
         "Relatório impresso idêntico ao de uma consultoria financeira premium"],
        ["S3-2", "Adicionar seção de Observações do Consultor MB no relatório: textarea editável pela MB, salva no banco (campo notes no dre_reports / cash_flow_reports), aparece no impresso assinada.",
         "Análise qualitativa do consultor diferencia MB de sistemas automatizados"],
        ["S3-3", "Adicionar campos de assinatura no final do relatório impresso: Consultor MB (nome + CRC + data) e Responsável da empresa (nome + cargo + data). Linha dupla + texto legal.",
         "Relatório pode ser apresentado a bancos e investidores"],
        ["S3-4", "Adicionar número sequencial de documento e QR Code (ou código de verificação) no rodapé para rastreabilidade. Gerar hash do conteúdo para verificação de integridade.",
         "Documento auditável e verificável — diferencial de governança"],
        ["S3-5", "Criar endpoint POST /reports/dre e POST /reports/cashflow na API que retorna PDF gerado com PDFKit (Node.js). Usar template igual ao HTML mas com controle total de layout.",
         "Download de PDF nativo da plataforma — sem depender de impressão do browser"],
    ]
    story.append(data_table(ST, sp3[0], sp3[1:], col_widths=[10*mm, 108*mm, 50*mm]))
    story.append(sp(8))

    story.append(subsection("SPRINT 4 — Score MB com Metodologia Real (2-3 semanas)"))
    story.append(sp(4))
    sp4 = [
        ["#", "Tarefa", "Resultado entregável"],
        ["S4-1", "Criar função calculateScore(snapshot) na API: calcula score 0-100 com 6 dimensões ponderadas (Liquidez 25%, Rentabilidade 25%, Eficiência 20%, Folha 15%, Carga tributária 10%, Capital de Giro 5%). Chamar ao salvar/atualizar snapshot.",
         "Score calculado automaticamente, reproduzível, auditável"],
        ["S4-2", "Salvar breakdown do score no Supabase (tabela score_breakdown): 1 linha por dimensão com valor, peso, nota (0-10), status (verde/amarelo/vermelho). Histórico por competência.",
         "Drill-down mostrando o que puxou o score para cima ou baixo"],
        ["S4-3", "Criar painel de Score no portal CFO com: gráfico radar das 6 dimensões, histórico do score em linha dos últimos 6 meses, tabela de breakdown com status semáforo, texto explicativo por dimensão.",
         "Empresário entende o que o número significa e o que fazer para melhorá-lo"],
        ["S4-4", "Adicionar comparativo setorial: tabela com benchmarks por segmento (comércio, saúde, serviços, indústria). MB alimenta os benchmarks setoriais via painel admin.",
         "Cliente sabe como está vs. empresas do mesmo setor — diferencial comercial forte"],
    ]
    story.append(data_table(ST, sp4[0], sp4[1:], col_widths=[10*mm, 108*mm, 50*mm]))
    story.append(sp(8))

    story.append(subsection("SPRINT 5 — Inteligência Real e Gráficos Robustos (3-5 semanas)"))
    story.append(sp(4))
    sp5 = [
        ["#", "Tarefa", "Resultado entregável"],
        ["S5-1", "Integrar Chart.js ou ApexCharts ao frontend para substituir SVG nativo. Implementar: gráfico de área para evolução (com zona de projeção tracejada), gráfico radar para score, waterfall para DFC, donut para composição de despesas.",
         "Visualizações profissionais e interativas (hover, zoom, filtro de período)"],
        ["S5-2", "Criar tabela monthly_snapshots no Supabase para armazenar histórico real por competência. Migrar dados existentes. Endpoint GET /finance/:id/history retorna últimos 12 meses.",
         "Histórico real de 12 meses — base para gráficos confiáveis"],
        ["S5-3", "Integrar Claude API (claude-sonnet) no endpoint POST /insights/:clientId. Enviar: últimos 3 meses de KPIs + DRE + Caixa. Receber: 3 insights gerados por IA com contexto real da empresa. Salvar na tabela ai_insights com status 'Aguardando revisão MB'.",
         "Insights reais gerados por IA sobre dados reais — humano valida antes de publicar"],
        ["S5-4", "Implementar alerta de caixa: calcular data estimada em que caixa cai abaixo do runway_target. Criar notification no Supabase. Exibir no portal do cliente: 'Alerta: com base no histórico, seu caixa fica em nível de atenção em X dias.'",
         "Cliente age preventivamente — diferencial do serviço proativo da MB"],
        ["S5-5", "Implementar projeção de caixa nos próximos 30/60/90 dias com base na média móvel dos últimos 3 meses de FCO. Exibir como gráfico de área com faixa de confiança.",
         "Empresário toma decisão de investimento com visão de futuro, não só passado"],
    ]
    story.append(data_table(ST, sp5[0], sp5[1:], col_widths=[10*mm, 108*mm, 50*mm]))

    story.append(PageBreak())

    # ══════════════════════════════════════════════════════════════════════
    # 10. DIAGNÓSTICO FINAL
    # ══════════════════════════════════════════════════════════════════════
    story.append(section_bar("10. Diagnóstico Final — O Que o Produto Precisa Ser", GRAPHITE2))
    story.append(sp(8))

    story.append(P("Resumo executivo do gap entre o produto atual e o que justifica o posicionamento de preço premium:", "body"))
    story.append(sp(6))

    diag_data = [
        ["Dimensão", "Hoje (status real)", "Necessário para justificar o preço"],
        ["DRE",
         "5 linhas sem subtotais, sem comparativo, sem semáforo. Suficiente para um extrato interno, insuficiente para gestão.",
         "15-18 linhas, blocos com subtotais (Lucro Bruto, EBITDA, LAIR), % sobre receita, variação mensal, semáforo por linha."],
        ["Fluxo de Caixa",
         "Ponte visual de 5 barras. Visualmente atraente mas sem estrutura FCO/FCI/FCF, sem PMR/PMP, sem projeção.",
         "DFC estruturada em 3 seções. PMR, PMP e NCG calculados. Projeção 30/60/90 dias. Alerta de risco."],
        ["Gráficos",
         "Linha com 4 meses falsos e 2 reais. Barras com dados hardcoded. Sem gráficos interativos.",
         "Todos os gráficos com dados reais. Chart.js para radar, waterfall, donut. Histórico real de 12 meses."],
        ["MB Financial Score",
         "Número manual sem metodologia. Breakdown arbitrário. Sem histórico.",
         "Score calculado automaticamente com 6 dimensões ponderadas. Drill-down. Histórico. Benchmarking setorial."],
        ["Insights / IA",
         "Textos seed genéricos idênticos para todos os clientes. 'Dados carregados do Supabase' exibido ao cliente.",
         "Insights gerados por Claude API sobre dados reais do cliente. Validados pela MB antes de publicar."],
        ["Relatórios impressos",
         "HTML básico sem logo MB. Texto interno exposto. Sem campos de assinatura. Sem número de documento.",
         "PDF com layout MB completo. Cabeçalho institucional. Observação do consultor. Campos de assinatura. Código de verificação."],
        ["Dados históricos",
         "4 dos 6 meses no gráfico são fictícios. Composição de despesas hardcoded. Metas hardcoded.",
         "100% dos dados exibidos vêm do banco de dados real. Sem nenhum valor hardcoded em lógica de negócio."],
    ]
    story.append(data_table(ST, diag_data[0], diag_data[1:], col_widths=[28*mm, 74*mm, 66*mm],
        hdr_color=RED_DARK))
    story.append(sp(8))

    story.append(P("Veredicto Final:", "h2"))
    story.append(P("O produto tem excelente arquitetura técnica, ótimo design visual e estrutura de negócio correta. O que falta é a substância dos dados e a profundidade dos relatórios. Um cliente CFO a R$2.000/mês que conhece finanças vai perceber — na primeira semana de uso — que o DRE tem apenas 5 linhas, que o gráfico de crescimento não bate com o que ele sabe da empresa, e que o relatório para impressão não tem logotipo nem assinatura.", "body"))
    story.append(sp(4))
    story.append(P("Os Sprints 1 e 2 deste backlog precisam ser executados <b>antes de qualquer cliente real pagar pelo produto</b>. Os dados fabricados e os textos internos expostos são riscos reputacionais imediatos para a MB Empresas.", "body"))
    story.append(sp(8))
    story.append(hr(RED_DARK))
    story.append(sp(4))
    story.append(P("Documento gerado em 25/05/2026 · MB Intelligence Análise Crítica v2.0 · Foco: Experiência do Cliente / Qualidade dos Dados / Relatórios Profissionais · MB Empresas Assessoria", "body_small"))

    doc.build(story)
    print(f"PDF gerado: {output_path}")


if __name__ == "__main__":
    out = os.path.join(
        r"C:\MB EMPRESAS\MB_Intelligence_Produto_Final\docs",
        "MB_Intelligence_Analise_Critica_Cliente_2026.pdf"
    )
    build_doc(out)
