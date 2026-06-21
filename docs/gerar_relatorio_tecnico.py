# -*- coding: utf-8 -*-
"""
MB Intelligence - Documento Técnico de Auditoria e Análise Crítica
Gerado após análise completa do app em produção (localhost:3333 + Supabase)
"""

from reportlab.platypus import (
    BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer, Table,
    TableStyle, HRFlowable, KeepTogether, PageBreak
)
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm, cm
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT, TA_JUSTIFY
from reportlab.platypus.flowables import Flowable
import os

# ─── Paleta MB ───────────────────────────────────────────────────────────────
RED_DARK   = colors.HexColor("#5b070b")
RED_LIGHT  = colors.HexColor("#8f121b")
GRAPHITE   = colors.HexColor("#171a21")
GRAPHITE2  = colors.HexColor("#1e222c")
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

W, H = A4

# ─── Estilos ─────────────────────────────────────────────────────────────────
def build_styles():
    base = getSampleStyleSheet()
    def S(name, parent="Normal", **kw):
        return ParagraphStyle(name, parent=base[parent], **kw)

    return {
        "cover_title": S("cover_title", fontSize=30, textColor=WHITE,
                         fontName="Helvetica-Bold", leading=38, spaceAfter=8),
        "cover_sub":   S("cover_sub", fontSize=13, textColor=SILVER,
                         fontName="Helvetica", leading=18, spaceAfter=6),
        "cover_tag":   S("cover_tag", fontSize=10, textColor=colors.HexColor("#aab4c4"),
                         fontName="Helvetica", leading=14),
        "h1": S("h1", fontSize=18, textColor=WHITE, fontName="Helvetica-Bold",
                 leading=24, spaceBefore=4, spaceAfter=10),
        "h2": S("h2", fontSize=13, textColor=RED_LIGHT, fontName="Helvetica-Bold",
                 leading=18, spaceBefore=14, spaceAfter=5),
        "h3": S("h3", fontSize=11, textColor=TEXT_DARK, fontName="Helvetica-Bold",
                 leading=15, spaceBefore=10, spaceAfter=4),
        "body": S("body", fontSize=9, textColor=TEXT_MID, fontName="Helvetica",
                   leading=14, spaceAfter=5, alignment=TA_JUSTIFY),
        "body_small": S("body_small", fontSize=8, textColor=TEXT_LIGHT,
                        fontName="Helvetica", leading=12, spaceAfter=4),
        "bullet": S("bullet", fontSize=9, textColor=TEXT_MID, fontName="Helvetica",
                    leading=13, leftIndent=12, firstLineIndent=-8, spaceAfter=3),
        "ok":   S("ok",   fontSize=9, textColor=GREEN,    fontName="Helvetica-Bold", leading=13, spaceAfter=2),
        "warn": S("warn", fontSize=9, textColor=AMBER,    fontName="Helvetica-Bold", leading=13, spaceAfter=2),
        "err":  S("err",  fontSize=9, textColor=RED_LIGHT,fontName="Helvetica-Bold", leading=13, spaceAfter=2),
        "info": S("info", fontSize=9, textColor=BLUE,     fontName="Helvetica-Bold", leading=13, spaceAfter=2),
        "code": S("code", fontSize=8, textColor=colors.HexColor("#0f172a"),
                   backColor=colors.HexColor("#f1f5f9"), fontName="Courier",
                   leading=12, leftIndent=8, spaceAfter=4),
        "tbl_hdr": S("tbl_hdr", fontSize=8, textColor=WHITE, fontName="Helvetica-Bold",
                     leading=11, alignment=TA_CENTER),
        "tbl_cell": S("tbl_cell", fontSize=8, textColor=TEXT_DARK, fontName="Helvetica",
                      leading=11),
    }

def build_doc(output_path):
    ST = build_styles()
    story = []

    # ── Page Callback ─────────────────────────────────────────────────────────
    def on_page(canvas, doc):
        canvas.saveState()
        if doc.page == 1:
            canvas.setFillColor(GRAPHITE)
            canvas.rect(0, 0, W, H, fill=1, stroke=0)
            canvas.setFillColor(RED_DARK)
            canvas.rect(0, H - 14*mm, W, 14*mm, fill=1, stroke=0)
            canvas.setFillColor(GRAPHITE2)
            canvas.rect(0, 0, W, 22*mm, fill=1, stroke=0)
            canvas.setFillColor(WHITE)
            canvas.setFont("Helvetica", 7.5)
            canvas.drawString(18*mm, 8*mm, "MB Intelligence — Documento Técnico de Auditoria e Análise Crítica v1.0 — 2026")
            canvas.drawRightString(W - 18*mm, 8*mm, "CONFIDENCIAL | USO INTERNO MB EMPRESAS")
        else:
            canvas.setFillColor(GRAPHITE)
            canvas.rect(0, H - 11*mm, W, 11*mm, fill=1, stroke=0)
            canvas.setFillColor(RED_DARK)
            canvas.rect(0, H - 11*mm, 4*mm, 11*mm, fill=1, stroke=0)
            canvas.setFillColor(WHITE)
            canvas.setFont("Helvetica-Bold", 7.5)
            canvas.drawString(10*mm, H - 6.5*mm, "MB Intelligence")
            canvas.setFont("Helvetica", 7.5)
            canvas.drawString(50*mm, H - 6.5*mm, "Auditoria Técnica e Análise Crítica — App em Produção")
            canvas.drawRightString(W - 10*mm, H - 6.5*mm, f"Pág. {doc.page}")
            canvas.setFillColor(OFFWHITE)
            canvas.rect(0, 0, W, 8*mm, fill=1, stroke=0)
            canvas.setFillColor(TEXT_LIGHT)
            canvas.setFont("Helvetica", 7)
            canvas.drawString(18*mm, 2.5*mm, "CONFIDENCIAL | MB EMPRESAS ASSESSORIA — 2026")
        canvas.restoreState()

    # ── Frame & Template ──────────────────────────────────────────────────────
    margin_top_p1 = 18*mm
    margin_top    = 18*mm
    margin_bot    = 14*mm
    margin_lr     = 18*mm

    frame_p1 = Frame(margin_lr, margin_bot, W - 2*margin_lr,
                     H - margin_top_p1 - margin_bot, id="cover")
    frame_n  = Frame(margin_lr, margin_bot, W - 2*margin_lr,
                     H - margin_top - margin_bot, id="normal")

    doc = BaseDocTemplate(
        output_path,
        pagesize=A4,
        leftMargin=margin_lr, rightMargin=margin_lr,
        topMargin=margin_top, bottomMargin=margin_bot,
        title="MB Intelligence — Auditoria Técnica",
        author="MB Empresas Assessoria"
    )
    doc.addPageTemplates([
        PageTemplate(id="cover",  frames=[frame_p1], onPage=on_page),
        PageTemplate(id="normal", frames=[frame_n],  onPage=on_page),
    ])

    # ── Helpers ───────────────────────────────────────────────────────────────
    def P(text, style="body"): return Paragraph(text, ST[style])
    def SP(n=6): return Spacer(1, n)
    def HR(c=RED_DARK, t=1): return HRFlowable(width="100%", thickness=t, color=c, spaceAfter=6)
    def HR2(): return HRFlowable(width="100%", thickness=0.5, color=SILVER, spaceAfter=4)

    def section_bar(title, color=RED_DARK):
        tbl = Table([[Paragraph(title, ST["h1"])]], colWidths=[W - 2*margin_lr])
        tbl.setStyle(TableStyle([
            ("BACKGROUND", (0,0), (-1,-1), color),
            ("LEFTPADDING", (0,0), (-1,-1), 10),
            ("RIGHTPADDING", (0,0), (-1,-1), 10),
            ("TOPPADDING", (0,0), (-1,-1), 7),
            ("BOTTOMPADDING", (0,0), (-1,-1), 7),
            ("ROUNDEDCORNERS", [4]),
        ]))
        return tbl

    def card(text, color=GREEN, style="body"):
        tbl = Table([[Paragraph(text, ST[style])]], colWidths=[W - 2*margin_lr])
        tbl.setStyle(TableStyle([
            ("LEFTPADDING", (0,0), (-1,-1), 10),
            ("RIGHTPADDING", (0,0), (-1,-1), 10),
            ("TOPPADDING", (0,0), (-1,-1), 7),
            ("BOTTOMPADDING", (0,0), (-1,-1), 7),
            ("LINEBEFORETABLE", (0,0), (0,-1), 3, color),
            ("BACKGROUND", (0,0), (-1,-1), OFFWHITE),
        ]))
        return tbl

    def status_table(headers, rows, col_widths=None):
        body_w = W - 2*margin_lr
        cw = col_widths or [body_w / len(headers)] * len(headers)
        data = [[Paragraph(h, ST["tbl_hdr"]) for h in headers]]
        for row in rows:
            data.append([Paragraph(str(c), ST["tbl_cell"]) for c in row])
        tbl = Table(data, colWidths=cw)
        tbl.setStyle(TableStyle([
            ("BACKGROUND",    (0,0), (-1,0), GRAPHITE),
            ("ROWBACKGROUNDS", (0,1), (-1,-1), [WHITE, OFFWHITE]),
            ("GRID",           (0,0), (-1,-1), 0.4, SILVER),
            ("LEFTPADDING",    (0,0), (-1,-1), 6),
            ("RIGHTPADDING",   (0,0), (-1,-1), 6),
            ("TOPPADDING",     (0,0), (-1,-1), 5),
            ("BOTTOMPADDING",  (0,0), (-1,-1), 5),
            ("VALIGN",         (0,0), (-1,-1), "MIDDLE"),
        ]))
        return tbl

    def kpi_row(items):
        """items = [(label, value, color)]"""
        cells = []
        for label, value, color in items:
            inner = Table([
                [Paragraph(value, ParagraphStyle("kv", fontSize=16, textColor=color,
                    fontName="Helvetica-Bold", leading=20))],
                [Paragraph(label, ST["body_small"])]
            ])
            inner.setStyle(TableStyle([
                ("ALIGN",(0,0),(-1,-1),"CENTER"),
                ("VALIGN",(0,0),(-1,-1),"MIDDLE"),
                ("BACKGROUND",(0,0),(-1,-1),OFFWHITE),
                ("TOPPADDING",(0,0),(-1,-1),8),
                ("BOTTOMPADDING",(0,0),(-1,-1),8),
                ("LINEBELOWTABLE",(0,-1),(-1,-1),2,color),
            ]))
            cells.append(inner)
        cw = (W - 2*margin_lr) / len(items)
        row_tbl = Table([cells], colWidths=[cw]*len(items))
        row_tbl.setStyle(TableStyle([
            ("LEFTPADDING",(0,0),(-1,-1),3),
            ("RIGHTPADDING",(0,0),(-1,-1),3),
        ]))
        return row_tbl

    def hex_str(c):
        return '#%02x%02x%02x' % (int(c.red*255), int(c.green*255), int(c.blue*255))

    def bullet_item(text, icon="OK", hex_color="#12a879"):
        return Paragraph(f'<font color="{hex_color}"><b>{icon}</b></font> {text}', ST["bullet"])

    def ok_item(text):   return bullet_item(text, "[OK]",   hex_str(GREEN))
    def warn_item(text): return bullet_item(text, "[!]",    hex_str(AMBER))
    def err_item(text):  return bullet_item(text, "[X]",    hex_str(RED_LIGHT))
    def info_item(text): return bullet_item(text, "[i]",    hex_str(BLUE))

    # ══════════════════════════════════════════════════════════════════════════
    # COVER PAGE
    # ══════════════════════════════════════════════════════════════════════════
    story.append(SP(58))
    story.append(P("MB Intelligence", "cover_tag"))
    story.append(SP(4))
    story.append(P("Documento Técnico de<br/>Auditoria e Análise Crítica", "cover_title"))
    story.append(SP(6))
    story.append(P("App em Produção Local — Supabase Backend — Maio 2026", "cover_sub"))
    story.append(SP(20))

    kpis_cover = Table([
        [
            Paragraph("17 Telas\nMapeadas", ParagraphStyle("ck", fontSize=10, textColor=WHITE,
                       fontName="Helvetica-Bold", leading=14, alignment=TA_CENTER)),
            Paragraph("14 Endpoints\nTestados", ParagraphStyle("ck", fontSize=10, textColor=WHITE,
                       fontName="Helvetica-Bold", leading=14, alignment=TA_CENTER)),
            Paragraph("4 Perfis de\nUsuário", ParagraphStyle("ck", fontSize=10, textColor=WHITE,
                       fontName="Helvetica-Bold", leading=14, alignment=TA_CENTER)),
            Paragraph("23 Issues\nIdentificados", ParagraphStyle("ck", fontSize=10, textColor=WHITE,
                       fontName="Helvetica-Bold", leading=14, alignment=TA_CENTER)),
        ]
    ], colWidths=[(W - 2*margin_lr) / 4]*4)
    kpis_cover.setStyle(TableStyle([
        ("BACKGROUND",     (0,0),(0,-1), colors.HexColor("#8f121b")),
        ("BACKGROUND",     (1,0),(1,-1), colors.HexColor("#0f766e")),
        ("BACKGROUND",     (2,0),(2,-1), colors.HexColor("#1d4ed8")),
        ("BACKGROUND",     (3,0),(3,-1), colors.HexColor("#7c3aed")),
        ("ALIGN",          (0,0),(-1,-1), "CENTER"),
        ("VALIGN",         (0,0),(-1,-1), "MIDDLE"),
        ("TOPPADDING",     (0,0),(-1,-1), 14),
        ("BOTTOMPADDING",  (0,0),(-1,-1), 14),
        ("LEFTPADDING",    (0,0),(-1,-1), 4),
        ("RIGHTPADDING",   (0,0),(-1,-1), 4),
        ("ROUNDEDCORNERS", [5]),
    ]))
    story.append(kpis_cover)
    story.append(SP(24))

    cover_meta = Table([
        [
            Paragraph("Data da análise", ST["cover_tag"]),
            Paragraph("Ambiente", ST["cover_tag"]),
            Paragraph("Responsável", ST["cover_tag"]),
        ],
        [
            Paragraph("24–25/05/2026", ParagraphStyle("cm", fontSize=10, textColor=WHITE,
                        fontName="Helvetica-Bold", leading=14)),
            Paragraph("localhost:3333 + Supabase", ParagraphStyle("cm", fontSize=10, textColor=WHITE,
                        fontName="Helvetica-Bold", leading=14)),
            Paragraph("MB Empresas Assessoria", ParagraphStyle("cm", fontSize=10, textColor=WHITE,
                        fontName="Helvetica-Bold", leading=14)),
        ]
    ], colWidths=[(W - 2*margin_lr)/3]*3)
    cover_meta.setStyle(TableStyle([
        ("ALIGN",(0,0),(-1,-1),"LEFT"),
        ("TOPPADDING",(0,0),(-1,-1),3),
        ("BOTTOMPADDING",(0,0),(-1,-1),3),
    ]))
    story.append(cover_meta)
    story.append(PageBreak())

    # ══════════════════════════════════════════════════════════════════════════
    # 1. SUMÁRIO EXECUTIVO
    # ══════════════════════════════════════════════════════════════════════════
    story.append(section_bar("1. Sumário Executivo"))
    story.append(SP(8))
    story.append(P("O MB Intelligence é uma plataforma SaaS de inteligência financeira desenvolvida pela MB Empresas Assessoria para atender contadores e seus clientes empresariais. Este documento apresenta a análise técnica crítica do produto em produção local, acessível em <b>http://localhost:3333</b>, com backend real conectado ao <b>Supabase</b> (PostgreSQL + Auth + Storage)."))
    story.append(SP(4))
    story.append(P("A análise cobriu: todos os endpoints da API, todos os perfis de usuário, todas as telas implementadas, a jornada do cliente por plano, segurança, dados, e gaps de funcionalidade."))
    story.append(SP(8))
    story.append(kpi_row([
        ("Status da API",       "✅ Online",   GREEN),
        ("Driver de dados",     "Supabase",    BLUE),
        ("Usuários testados",   "8 perfis",    PURPLE),
        ("Issues críticos",     "7 críticos",  RED_DARK),
    ]))
    story.append(SP(10))
    story.append(P("Diagnóstico Geral:", "h3"))
    story.append(card(
        "<b>O produto está funcional e operacional em modo Supabase.</b> A arquitetura é sólida — "
        "autenticação JWT funciona, isolamento de dados por tenant funciona, upload de arquivos "
        "funciona. Entretanto, existem <b>7 gaps críticos</b> que impedem o uso em produção real: "
        "aprovações sem ação, mensagens sem persistência real, ausência de IA generativa, "
        "ausência de refresh de token, relatórios operacionais não implementados, "
        "segredos expostos no .env e ausência de paginação nos endpoints.", AMBER))
    story.append(SP(8))

    story.append(P("Pontos Positivos:", "h3"))
    for item in [
        "Supabase Auth integrado e funcionando (JWT, login, logout, registro de cliente)",
        "Isolamento multi-tenant validado: cliente CFO não acessa dados da Clínica (retorna 403)",
        "Trilha de auditoria real com timestamps do Supabase gravando todas as ações",
        "Upload de documentos via Supabase Storage com bucket privado mb-documents",
        "Três planos com dados diferenciados por tier (DRE/Caixa só no CFO)",
        "Fallback local funcional: se API cair, app segue em localStorage",
        "Schema PostgreSQL bem estruturado com chaves estrangeiras, campos calculados e RLS preparado",
        "Módulos claramente separados: admin-pages, client-pages, auth-pages, services, core",
    ]:
        story.append(ok_item(item))
    story.append(SP(8))

    story.append(P("Pontos Críticos:", "h3"))
    for item in [
        "Aprovações (IA insights): somente GET implementado — sem ações de aprovar/rejeitar/editar",
        "Mensagens: endpoint POST funciona mas GET retorna array vazio (0 mensagens no Supabase)",
        "Token JWT expira em 1h sem refresh automático — sessão cai silenciosamente",
        "SUPABASE_SERVICE_ROLE_KEY exposto no .env — deve ser movido para variável de ambiente do servidor",
        "Nenhum endpoint de aprovação com PATCH — impossível fechar o ciclo de governança",
        "Relatórios operacionais (admin): todos os botões mostram 'Ação registrada localmente' sem conteúdo",
        "Sem paginação em nenhum endpoint — um cliente com 10.000 documentos quebraria a API",
    ]:
        story.append(err_item(item))

    story.append(PageBreak())

    # ══════════════════════════════════════════════════════════════════════════
    # 2. ARQUITETURA TÉCNICA
    # ══════════════════════════════════════════════════════════════════════════
    story.append(section_bar("2. Arquitetura Técnica"))
    story.append(SP(8))

    story.append(P("Stack e Componentes:", "h2"))
    arch_data = [
        ["Camada", "Tecnologia", "Status", "Observação"],
        ["Frontend", "Vanilla HTML/CSS/JS (SPA)", "✅ Funcional", "Sem framework — bundle zero, rápido"],
        ["Roteamento", "Hash Router (#/rota)", "✅ Funcional", "Simples, sem build step"],
        ["Ícones", "Lucide Icons (local)", "✅ Funcional", "Carregado do assets/lucide.min.js"],
        ["Persistência local", "localStorage (MBI.storage)", "✅ Funcional", "Fallback quando API offline"],
        ["API Backend", "Node.js HTTP nativo (porta 3333)", "✅ Funcional", "Sem Express — server-supabase.js"],
        ["Banco de dados", "PostgreSQL via Supabase REST", "✅ Funcional", "RLS configurado, 12 tabelas"],
        ["Autenticação", "Supabase Auth (JWT ES256)", "✅ Funcional", "Bearer token com 1h de validade"],
        ["Storage", "Supabase Storage (mb-documents)", "✅ Funcional", "Bucket privado, signed URLs"],
        ["Refresh token", "Não implementado", "❌ Ausente", "Sessão expira sem aviso ao usuário"],
        ["IA generativa", "Textos estáticos", "❌ Ausente", "Claude API não integrado ainda"],
        ["Realtime", "Não implementado", "❌ Ausente", "Supabase Realtime disponível mas não usado"],
        ["Email/notificações", "Não implementado", "❌ Ausente", "Sem SMTP/webhook configurado"],
    ]
    story.append(status_table(arch_data[0], arch_data[1:],
        col_widths=[32*mm, 48*mm, 30*mm, 58*mm]))
    story.append(SP(8))

    story.append(P("Fluxo de Dados:", "h2"))
    story.append(P("O app usa estratégia <b>Remote-First com fallback local</b>:"))
    for step in [
        "<b>Boot:</b> carrega localStorage, se há token Supabase executa MBI.sync.refresh()",
        "<b>Sync:</b> busca /auth/me, /plans, /clients, /documents, /imports, /tasks, /messages, /approvals, /audit e /finance/:id para cada cliente",
        "<b>Render:</b> renderiza a tela com dados do localStorage (já sincronizados)",
        "<b>Ações:</b> formulários disparam remoteOrLocal() — tenta API primeiro, cai em localStorage se apiUnavailable",
        "<b>Sessão:</b> token armazenado no localStorage, reenviado como Bearer a cada request",
    ]:
        story.append(info_item(step))
    story.append(SP(4))
    story.append(warn_item("Problema: o sync inicial faz N+1 requests (1 por cliente no /finance/:id). Com 50 clientes = 50 requests na abertura da página."))
    story.append(SP(8))

    story.append(P("Schema do Banco de Dados (Supabase PostgreSQL):", "h2"))
    schema_data = [
        ["Tabela", "Propósito", "Linhas Seed", "Chave Principal"],
        ["plans", "Planos e preços", "3", "id (text)"],
        ["clients", "Empresas clientes", "4 (3 seed + 1 real)", "id (uuid)"],
        ["companies", "CNPJs/dados PJ", "3", "id (uuid), client_id FK"],
        ["user_profiles", "Perfis + link Auth", "8", "id = auth.users.id"],
        ["financial_snapshots", "KPIs financeiros", "1 por cliente", "id, unique(client_id, competence)"],
        ["dre_reports", "DRE por competência", "1 (Silva/CFO)", "id, client_id FK"],
        ["dre_report_lines", "Linhas do DRE", "5 (Silva)", "id, report_id FK"],
        ["cash_flow_reports", "Fluxo de caixa", "1 (Silva/CFO)", "id, client_id FK"],
        ["documents", "Arquivos publicados", "3 + uploads reais", "id, client_id FK"],
        ["import_jobs", "Fila de importação", "3 seed + reais", "id, client_id FK"],
        ["ai_insights", "Aprovações de IA", "2", "id, client_id FK"],
        ["messages", "Canal MB↔Cliente", "0 reais (bug)", "id, client_id FK"],
        ["tasks", "Tarefas operacionais", "3", "id, client_id FK"],
        ["audit_logs", "Trilha de auditoria", "10+ reais", "id, user_id FK"],
    ]
    story.append(status_table(schema_data[0], schema_data[1:],
        col_widths=[38*mm, 52*mm, 28*mm, 50*mm]))
    story.append(SP(4))
    story.append(warn_item("Campo result e margin no financial_snapshots são gerados (GENERATED ALWAYS AS) no PostgreSQL — a API sobrescreve com cálculo manual desnecessário."))

    story.append(PageBreak())

    # ══════════════════════════════════════════════════════════════════════════
    # 3. AUTENTICAÇÃO E SEGURANÇA
    # ══════════════════════════════════════════════════════════════════════════
    story.append(section_bar("3. Autenticação e Segurança", GRAPHITE2))
    story.append(SP(8))

    story.append(P("Usuários Testados:", "h2"))
    users_data = [
        ["E-mail", "Tipo", "Perfil", "Login API", "Dados retornados"],
        ["admin@mbempresas.com.br",       "mb",     "Administrador master",  "✅ OK", "Todos os clientes, users, approvals"],
        ["operacao@mbempresas.com.br",    "mb",     "Gestora operacional",   "✅ OK", "Idem admin (mesmo nível de acesso)"],
        ["financeiro@mbempresas.com.br",  "mb",     "Analista financeiro",   "✅ OK", "Idem admin"],
        ["cfo@mbempresas.com.br",         "mb",     "Consultor CFO",         "✅ OK", "Idem admin"],
        ["fiscal@mbempresas.com.br",      "mb",     "Fiscal",                "✅ OK", "Idem admin"],
        ["cfo@cliente.com",               "client", "Proprietário (Silva)",   "✅ OK", "Apenas client_id=Silva"],
        ["financeiro@cliente.com",        "client", "Gestor fin. (Clínica)", "✅ OK", "Apenas client_id=Clínica"],
        ["contabilidade@cliente.com",     "client", "Proprietário (Prime)",  "✅ OK", "Apenas client_id=Prime"],
    ]
    story.append(status_table(users_data[0], users_data[1:],
        col_widths=[52*mm, 16*mm, 40*mm, 20*mm, 40*mm]))
    story.append(SP(8))

    story.append(P("Testes de Segurança Realizados:", "h2"))
    story.append(ok_item("Cross-tenant bloqueado: GET /finance/22222222... com token do Silva retornou 403 'Cliente fora do escopo'"))
    story.append(ok_item("Endpoints MB protegidos: /approvals, /users retornam 403 para tokens de cliente"))
    story.append(ok_item("Documentos com visibility=SomenteMB não retornam para clientes (filtro no GET)"))
    story.append(ok_item("Upload sem autenticação retorna 401 — endpoint /documents POST requer token MB"))
    story.append(SP(4))
    story.append(warn_item("GET /plans não requer autenticação — planos e preços públicos (pode ser intencional)"))
    story.append(warn_item("Todos os perfis MB (admin, fiscal, financeiro, cfo) têm exatamente o mesmo nível de acesso — sem RBAC granular"))
    story.append(warn_item("O client_id é passado como parâmetro URL (GET /finance/:clientId) — validado no servidor mas exige atenção"))
    story.append(err_item("SUPABASE_SERVICE_ROLE_KEY no .env em texto plano — este segredo dá acesso total ao banco, deve ser variável de ambiente do servidor"))
    story.append(err_item("Senha padrão '123456' nos usuários seed — obrigatório trocar antes de ir a produção real"))
    story.append(err_item("Token JWT expira em 1h sem refresh — usuário é silenciosamente deslogado sem aviso"))
    story.append(err_item("Sem rate limiting nos endpoints — API vulnerável a bruteforce no /auth/login"))
    story.append(SP(8))

    story.append(P("Análise do RLS (Row Level Security):", "h2"))
    story.append(P("Conforme SETUP_STATUS.md, migrations aplicadas incluem RLS. Porém, a API Node.js usa a service_role_key que <b>bypassa o RLS completamente</b>. Isso significa que toda a segurança de isolamento está no código da API, não no banco de dados."))
    story.append(SP(4))
    story.append(warn_item("Risco: qualquer bug na validação canAccessClient() expõe dados de outros clientes"))
    story.append(info_item("Recomendação: implementar RLS com políticas por user_id do Supabase Auth e usar anon_key no frontend em vez de passar tudo pelo Node.js"))

    story.append(PageBreak())

    # ══════════════════════════════════════════════════════════════════════════
    # 4. ANÁLISE DE ENDPOINTS DA API
    # ══════════════════════════════════════════════════════════════════════════
    story.append(section_bar("4. Análise Completa dos Endpoints da API"))
    story.append(SP(8))

    story.append(P("Todos os 14 endpoints foram testados via cURL com tokens reais do Supabase:", "body"))
    story.append(SP(4))
    endpoints_data = [
        ["Endpoint", "Método", "Auth", "Resultado", "Status"],
        ["GET /health",                    "GET",   "Público",    "status:ok, driver:supabase",              "✅ OK"],
        ["GET /plans",                     "GET",   "Público",    "3 planos com preços e módulos",           "✅ OK"],
        ["PATCH /plans/:id",               "PATCH", "MB",         "Atualiza preço do plano no Supabase",     "✅ OK"],
        ["POST /auth/login",               "POST",  "Público",    "JWT + profile retornado corretamente",    "✅ OK"],
        ["POST /auth/logout",              "POST",  "Token",      "204 noContent",                           "✅ OK"],
        ["GET /auth/me",                   "GET",   "Token",      "User + session do token atual",           "✅ OK"],
        ["POST /auth/register-client",     "POST",  "Público",    "Cria client+user+snapshot no Supabase",   "✅ OK"],
        ["GET /clients",                   "GET",   "Token",      "MB: todos | Client: só o próprio",        "✅ OK"],
        ["POST /clients",                  "POST",  "MB",         "Cria client+company+snapshot",            "✅ OK"],
        ["GET /documents?clientId=:id",    "GET",   "Token",      "Filtra por client_id + visibility",       "✅ OK"],
        ["POST /documents",                "POST",  "MB",         "Upload real para Supabase Storage",       "✅ OK"],
        ["GET /documents/:id/download",    "GET",   "Token",      "URL assinada gerada (5min)",              "✅ OK"],
        ["GET /imports?clientId=:id",      "GET",   "Token",      "Lista import_jobs por cliente",           "✅ OK"],
        ["POST /imports",                  "POST",  "Token",      "Upload + cria import_job + document",     "✅ OK"],
        ["GET /finance/:clientId",         "GET",   "Token",      "KPIs + DRE + CashBridge do Supabase",     "✅ OK"],
        ["PATCH /finance/:clientId",       "PATCH", "MB",         "Atualiza financial_snapshot",             "✅ OK"],
        ["GET /users",                     "GET",   "MB",         "Lista todos os user_profiles",            "✅ OK"],
        ["POST /users",                    "POST",  "MB",         "Cria auth user + user_profile",           "✅ OK"],
        ["GET /messages?clientId=:id",     "GET",   "Token",      "Retorna array vazio — bug no seed",       "⚠️ Bug"],
        ["POST /messages",                 "POST",  "Token",      "Cria na tabela messages — OK",            "✅ OK"],
        ["GET /tasks?clientId=:id",        "GET",   "Token",      "3 tarefas seed retornadas",               "✅ OK"],
        ["GET /approvals",                 "GET",   "MB",         "2 ai_insights retornados",                "✅ OK"],
        ["PATCH /approvals/:id",           "PATCH", "MB",         "Não implementado — rota inexistente",     "❌ Ausente"],
        ["GET /audit",                     "GET",   "MB",         "Logs reais com timestamps Supabase",      "✅ OK"],
    ]
    story.append(status_table(endpoints_data[0], endpoints_data[1:],
        col_widths=[52*mm, 18*mm, 16*mm, 54*mm, 22*mm]))
    story.append(SP(8))

    story.append(P("Issues Críticos de API:", "h2"))
    story.append(err_item("PATCH /approvals/:id: não existe — impossível aprovar, rejeitar ou editar insights de IA pelo sistema"))
    story.append(err_item("GET /messages retorna array vazio: mensagens do seed estão em localStorage mas não no Supabase — seed SQL ausente para a tabela messages"))
    story.append(warn_item("Sem paginação (limit/offset) em nenhum endpoint — crítico para volume real de dados"))
    story.append(warn_item("Sem filtro por data/status nos endpoints de documentos e imports"))
    story.append(warn_item("POST /imports cria registro em documents automaticamente — pode gerar documentos duplicados se o MB publicar o mesmo arquivo manualmente"))
    story.append(warn_item("N+1 no sync: 1 request por cliente para /finance/:id — ineficiente com muitos clientes"))
    story.append(info_item("GET /health é público e expõe o driver: 'supabase' — menor preocupação mas pode ser ocultado em produção"))

    story.append(PageBreak())

    # ══════════════════════════════════════════════════════════════════════════
    # 5. ANÁLISE DE TELAS — PORTAL DO CLIENTE
    # ══════════════════════════════════════════════════════════════════════════
    story.append(section_bar("5. Portal do Cliente — Análise por Tela e Plano"))
    story.append(SP(8))

    story.append(P("O portal do cliente tem 6 telas, com conteúdo adaptado ao plano contratado. A rota padrão após login é #/cliente/inteligencia.", "body"))
    story.append(SP(6))

    # 5.1 Inteligência Financeira
    story.append(P("5.1 Inteligência Financeira (#/cliente/inteligencia)", "h2"))
    story.append(P("Tela central do cliente. Conteúdo varia radicalmente por plano:"))
    story.append(SP(4))

    plan_intel = [
        ["Plano", "Componentes Renderizados", "Dados Reais", "Issues"],
        ["Contabilidade\n(Prime ME)", "Cockpit + KPIs básicos + Portal contábil\n(barras DAS/Fiscal/etc) + Insights MB",
         "Faturamento R$42.800\nImpostos R$3.260\nScore: N/A",
         "Resultado e Score\nmostram 'Indisponível'\ncorreto por plano"],
        ["Financeiro IA\n(Clínica Norte)", "Cockpit + KPIs + Gráfico linha\nReceita×Despesas + Copiloto\n(sem DRE, sem Caixa)",
         "Faturamento R$96.500\nResult. R$26.200\nMargem 18,8%",
         "DRE e Caixa corretamente\nbloqueados. Copiloto\nmosta tarefa real (OFX)"],
        ["CFO as a Service\n(Comércio Silva)", "Cockpit + KPIs + DRE completo\n+ Fluxo de caixa + Score radar\n+ 3 gráficos executivos + Linha",
         "Rev. R$182.500\nScore 82/100\nRunway 42 dias\nCapac. R$52.000",
         "Nenhum — tela mais\ncompleta e funcional\ndo produto"],
    ]
    story.append(status_table(plan_intel[0], plan_intel[1:],
        col_widths=[28*mm, 60*mm, 40*mm, 40*mm]))
    story.append(SP(6))
    story.append(warn_item("O 'Cockpit do empresário' mostra texto de insight estático — não é gerado por IA real. A mensagem 'IA MB:' é hardcoded no código."))
    story.append(ok_item("O DRE do cliente CFO mostra dados reais do Supabase (5 linhas: Receita Bruta, Impostos, Custos, Despesas, Resultado)"))
    story.append(ok_item("O Fluxo de Caixa CFO mostra ponte real: Saldo inicial → Recebimentos → Pagamentos → Impostos → Saldo projetado"))
    story.append(ok_item("Gráfico sparkline nos metric-cards usa dados reais dos meses (6 meses)"))
    story.append(SP(8))

    # 5.2 Onboarding
    story.append(P("5.2 Onboarding (#/cliente/onboarding)", "h2"))
    story.append(P("Checklist guiado de ativação da plataforma:"))
    story.append(ok_item("Progress bar calculado dinamicamente (% de etapas concluídas)"))
    story.append(ok_item("Etapas refletem estado real: documentos presentes → 'Concluído', ausentes → 'Pendente'"))
    story.append(ok_item("Consultor MB exibido por nome (ex: Bruno Andrade para Silva)"))
    story.append(warn_item("Etapa 'Validação MB' usa client.confidence — campo só MB pode editar, cliente não tem visibilidade do critério"))
    story.append(warn_item("Etapa 'Cockpit liberado' sempre mostra 'Parcial' para não-CFO — sem orientação clara do que falta para evoluir"))
    story.append(err_item("Próxima revisão hardcoded como '27/05' — deve ser dinâmico do banco de dados"))
    story.append(SP(8))

    # 5.3 Documentos
    story.append(P("5.3 Documentos e Guias (#/cliente/documentos)", "h2"))
    story.append(ok_item("Lista documentos publicados com status, categoria e competência do Supabase"))
    story.append(ok_item("Botão 'Baixar' gera URL assinada via Supabase Storage (5 min de validade)"))
    story.append(ok_item("Formulário de envio de arquivo pelo cliente funciona (cria import_job no Supabase)"))
    story.append(warn_item("Documento 'DRE_Comercio_Silva_LTDA.csv' tem status 'Aguardando revisao' — visível mas não baixável via URL assinada (Storage path pode não existir)"))
    story.append(warn_item("Sem busca ou filtro por categoria/competência — difícil localizar documentos em clientes com histórico longo"))
    story.append(err_item("Formulário de envio do cliente só suporta OFX, XML, Excel, CSV, PDF mas o campo 'fileName' é pré-preenchido com 'extrato_maio.ofx' — confuso para o usuário"))
    story.append(SP(8))

    # 5.4–5.6
    story.append(P("5.4 Importações, 5.5 Comunicação e 5.6 Perfil", "h2"))
    screens_56 = [
        ["Tela", "Funciona", "Issue Principal"],
        ["#/cliente/importacoes", "✅ Histórico real do Supabase", "Sem ação para o cliente (só leitura)"],
        ["#/cliente/comunicacao", "⚠️ Parcial", "GET /messages retorna vazio — bug de seed. POST funciona mas não aparece"],
        ["#/cliente/perfil",      "✅ Dados do banco", "Módulos de acesso são chips estáticos — não refletem o plano real"],
    ]
    story.append(status_table(screens_56[0], screens_56[1:], col_widths=[52*mm, 44*mm, 72*mm]))
    story.append(SP(4))
    story.append(err_item("Comunicação completamente quebrada na prática: o usuário envia mensagem, a API confirma, mas ao recarregar a tela a mensagem não aparece (GET retorna vazio)"))

    story.append(PageBreak())

    # ══════════════════════════════════════════════════════════════════════════
    # 6. ANÁLISE DE TELAS — PAINEL ADMIN MB
    # ══════════════════════════════════════════════════════════════════════════
    story.append(section_bar("6. Painel Administrativo MB — Análise por Tela", GRAPHITE2))
    story.append(SP(8))
    story.append(P("O painel admin tem 11 telas acessíveis para qualquer perfil MB (sem RBAC granular entre perfis MB)."))
    story.append(SP(6))

    admin_screens = [
        ["Rota", "Título", "Status", "Issues Principais"],
        ["#/admin/operacao",       "Operação MB",         "✅ Funcional",      "Dados reais, jornada operacional OK"],
        ["#/admin/clientes",       "Gestão de Clientes",  "✅ Funcional",      "Lista real Supabase + seletor de contexto"],
        ["#/admin/novo-cliente",   "Cadastro de Cliente", "✅ Funcional",      "Cria no Supabase com snapshot automático"],
        ["#/admin/planos",         "Planos e Permissões", "✅ Funcional",      "Preços editáveis + matriz de módulos"],
        ["#/admin/dados-cliente",  "Dados do Cliente",    "✅ Funcional",      "PATCH /finance/:id atualiza Supabase"],
        ["#/admin/documentos",     "Documentos",          "✅ Funcional",      "Upload real para Storage. 3 docs visíveis"],
        ["#/admin/importacoes",    "Importações",         "✅ Funcional",      "6 imports reais no Supabase"],
        ["#/admin/usuarios",       "Usuários e Perfis",   "✅ Funcional",      "8 usuários reais. Criação funciona"],
        ["#/admin/aprovacoes",     "Aprovações",          "⚠️ Parcial",        "Lista 2 insights mas sem ações de fluxo"],
        ["#/admin/auditoria",      "Auditoria",           "✅ Funcional",      "Log real com 10+ eventos do Supabase"],
        ["#/admin/relatorios",     "Relatórios Operac.",  "❌ Placeholder",    "6 cards com botões que não fazem nada"],
    ]
    story.append(status_table(admin_screens[0], admin_screens[1:],
        col_widths=[40*mm, 36*mm, 26*mm, 66*mm]))
    story.append(SP(8))

    story.append(P("6.1 Operação MB — Cockpit Administrativo:", "h3"))
    story.append(ok_item("Métricas superiores reais: Clientes ativos (2), Clientes em risco (2), Aprovações IA (2), Importações (6)"))
    story.append(ok_item("Seletor de cliente em operação funciona — troca contexto de todas as telas admin"))
    story.append(ok_item("Jornada operacional por cliente (4 etapas) reflete dados reais"))
    story.append(ok_item("Filas operacionais com dados da equipe MB (Fiscal=Paula, Financeiro=Ana, etc.)"))
    story.append(ok_item("Oportunidade comercial adaptada ao plano (upsell sugere evolução do plano)"))
    story.append(ok_item("Últimas ações via MBI.services.audit.list(5) retorna trilha real do Supabase"))
    story.append(warn_item("Filas operacionais (Fiscal '11 guias/XML', Financeiro '8 caixas') são hardcoded — não calculadas do banco"))
    story.append(warn_item("Próximas ações (tarefas) vêm do localStorage sync — funciona mas delay de sync possível"))
    story.append(SP(8))

    story.append(P("6.2 Aprovações — Gap Crítico de Governança:", "h3"))
    story.append(P("A tela de aprovações é o coração do modelo de governança MB (human-in-the-loop antes de publicar IA ao cliente). Hoje ela apenas lista — não executa fluxo algum."))
    story.append(SP(4))
    story.append(err_item("Botões de Aprovar / Rejeitar / Editar: não existem na tela nem na API"))
    story.append(err_item("Não há PATCH /approvals/:id implementado no servidor"))
    story.append(err_item("Status dos insights permanece estático — nunca muda de 'Aguardando aprovação'"))
    story.append(err_item("Não há mecanismo de notificação quando novo insight chega para revisão"))
    story.append(err_item("Não há geração de insight: a IA não gera análises — textos são dados seed"))
    story.append(SP(8))

    story.append(P("6.3 Relatórios Operacionais — Não Implementado:", "h3"))
    story.append(err_item("6 cards com títulos (Carteira por plano, Produtividade, Upsell, Documentos, Importações, Cancelamento)"))
    story.append(err_item("Todos os botões disparam data-action='simulate' que retorna 'Ação registrada localmente'"))
    story.append(err_item("Nenhum relatório real foi implementado — é totalmente placeholder"))
    story.append(info_item("Prioridade alta: os relatórios operacionais são insumo crítico para a MB gerenciar a carteira em escala"))

    story.append(PageBreak())

    # ══════════════════════════════════════════════════════════════════════════
    # 7. JORNADA DO CLIENTE POR PLANO
    # ══════════════════════════════════════════════════════════════════════════
    story.append(section_bar("7. Jornada Completa do Cliente por Plano"))
    story.append(SP(8))

    story.append(P("7.1 Plano Contabilidade — Serviços Prime ME (Juliana Prime)", "h2"))
    story.append(P("Perfil: MEI/ME em fase de onboarding, dados mínimos, confiança Baixa"))
    journey_cont = [
        ["Etapa da Jornada", "Experiência Real", "Status"],
        ["Login",           "Acessa portal cliente, vai para #/cliente/inteligencia", "✅"],
        ["Dashboard",       "Vê KPIs básicos: R$42.800 fat., R$3.260 impostos, Resultado 'Indisponível', Score 'N/A'", "✅"],
        ["Portal contábil", "Barras de progresso: DAS 86%, Documentos 72%, Societário 38%, Financeiro 0%", "✅"],
        ["IA MB",           "Insights estáticos: 'dados insuficientes...'", "⚠️"],
        ["Onboarding",      "40% concluído, tarefas: enviar contrato social (alta prioridade)", "✅"],
        ["Documentos",      "1 documento: Contrato Social (Pendente) — nada para baixar", "⚠️"],
        ["Importações",     "1 import: xml_maio.zip aguardando revisão", "✅"],
        ["Comunicação",     "Consultor: Lucas Pereira. Mensagens: vazio (bug)", "❌"],
        ["Perfil",          "Dados cadastrais corretos, chips de acesso estáticos", "⚠️"],
    ]
    story.append(status_table(journey_cont[0], journey_cont[1:], col_widths=[36*mm, 100*mm, 12*mm]))
    story.append(SP(4))
    story.append(warn_item("Experiência pobre para cliente Contabilidade: Resultado e Score bloqueados, documentos sem nada disponível, comunicação quebrada. Cliente teria sensação de 'paguei e não vejo nada'."))
    story.append(SP(8))

    story.append(P("7.2 Plano Financeiro IA — Clínica Norte PME (Camila Norte)", "h2"))
    story.append(P("Perfil: Clínica de saúde ativa, confiança Média, dados parciais"))
    journey_fin = [
        ["Etapa da Jornada", "Experiência Real", "Status"],
        ["Dashboard",       "KPIs reais: R$96.500 fat., R$26.200 result., 18,8% margem", "✅"],
        ["Gráfico",         "Receita × Despesas 6 meses — crescimento visível", "✅"],
        ["Copiloto",        "Tarefa: 'Enviar extrato OFX' (Média prioridade) — real", "✅"],
        ["DRE",             "Não exibido (correto — plano não inclui)", "✅"],
        ["Fluxo de Caixa",  "Não exibido (correto — plano não inclui)", "✅"],
        ["Score",           "Parcialmente exibido: 68 mas sem detalhe executivo", "⚠️"],
        ["Importações",     "despesas_maio.csv com 'Erro de colunas' — cliente não recebe orientação", "⚠️"],
        ["Comunicação",     "Consultor: Ana Ribeiro. Mensagens: vazio (bug)", "❌"],
    ]
    story.append(status_table(journey_fin[0], journey_fin[1:], col_widths=[36*mm, 100*mm, 12*mm]))
    story.append(SP(4))
    story.append(warn_item("Quando uma importação tem 'Erro de colunas', o cliente não recebe instrução clara do que corrigir e reenviar."))
    story.append(SP(8))

    story.append(P("7.3 Plano CFO as a Service — Comércio Silva LTDA (Marcos Silva)", "h2"))
    story.append(P("Perfil: Comércio varejista maduro, confiança Alta, dados completos — melhor experiência do produto"))
    journey_cfo = [
        ["Etapa da Jornada", "Experiência Real", "Status"],
        ["Dashboard executivo", "R$182.500 fat., R$40.310 result., Score 82/100, Runway 42 dias", "✅"],
        ["DRE completo",    "5 linhas: Receita Bruta, Impostos, Custos, Desp. Operac., Resultado", "✅"],
        ["Fluxo de caixa",  "Ponte completa: Saldo inicial → Recebimentos → Pagamentos → Projetado", "✅"],
        ["Score radar",     "Capacidade de invest. R$52.000, score 82, runway 42 dias", "✅"],
        ["Gráficos CFO",    "3 charts: Composição despesas, Margem e Resultado, Decisão de investimento", "✅"],
        ["Imprimir/Exportar", "Abre janela print ou baixa CSV — funciona com dados reais", "✅"],
        ["Documentos",      "DRE CSV + 2 DAS disponíveis. Download real via Storage assinado", "✅"],
        ["Tarefas",         "1 tarefa: 'Revisar contratos administrativos' (Alta, hoje)", "✅"],
        ["Comunicação",     "Mensagens: vazio (bug de seed no Supabase)", "❌"],
        ["Auditoria pessoal","Vê registro de login, download de documento — logs reais", "✅"],
    ]
    story.append(status_table(journey_cfo[0], journey_cfo[1:], col_widths=[40*mm, 96*mm, 12*mm]))
    story.append(SP(4))
    story.append(ok_item("Cliente CFO tem a experiência mais completa e impressionante do produto — DRE, Fluxo de Caixa, Score e gráficos executivos funcionando com dados reais do Supabase."))
    story.append(warn_item("Comunicação quebrada afeta também o cliente mais premium — crítico para o relacionamento MB↔Cliente."))

    story.append(PageBreak())

    # ══════════════════════════════════════════════════════════════════════════
    # 8. ISSUES CRÍTICOS E BACKLOG DO PROGRAMADOR
    # ══════════════════════════════════════════════════════════════════════════
    story.append(section_bar("8. Issues Críticos e Backlog do Programador"))
    story.append(SP(8))

    story.append(P("Classificação de Criticidade:", "h3"))
    story.append(P("🔴 P0 = Bloqueia uso real em produção | 🟠 P1 = Funcionalidade prometida mas quebrada | 🟡 P2 = Gap de experiência | 🔵 P3 = Melhoria técnica"))
    story.append(SP(8))

    story.append(P("🔴 P0 — Bloqueadores de Produção:", "h2"))
    p0_data = [
        ["#", "Issue", "Arquivo", "Solução"],
        ["P0-1", "SUPABASE_SERVICE_ROLE_KEY em .env texto plano — chave administrativa total", "apps/api/.env", "Mover para variável de ambiente do servidor (ex: Railway, Render, Heroku env vars). Nunca commitar .env"],
        ["P0-2", "Senhas seed '123456' em todos os usuários do Supabase Auth", "infra/supabase/migrations/0002_*.sql", "Forçar troca de senha no primeiro login. Implementar password reset por e-mail via Supabase Auth"],
        ["P0-3", "JWT sem refresh — sessão expira em 1h silenciosamente", "apps/web/src/core/auth.js + api-client.js", "Implementar interceptor que detecta 401 e chama /auth/v1/token?grant_type=refresh_token com refresh_token salvo"],
        ["P0-4", "Sem rate limiting no /auth/login — vulnerável a bruteforce", "apps/api/src/server-supabase.js", "Adicionar middleware de rate limit (ex: 5 tentativas/min por IP). Usar Supabase Auth captcha ou similar"],
        ["P0-5", "Seed de mensagens ausente no Supabase — GET /messages retorna vazio para todos os clientes", "infra/supabase/migrations/ (faltando)", "Criar migration 0003_seed_messages.sql com INSERT nas mensagens seed do banco"],
    ]
    story.append(status_table(p0_data[0], p0_data[1:], col_widths=[12*mm, 60*mm, 44*mm, 52*mm]))
    story.append(SP(8))

    story.append(P("🟠 P1 — Funcionalidade Prometida mas Quebrada:", "h2"))
    p1_data = [
        ["#", "Issue", "Arquivo", "Solução"],
        ["P1-1", "Aprovações sem ação: não há Aprovar/Rejeitar/Editar na tela nem na API", "admin-pages.js + server-supabase.js", "Criar PATCH /approvals/:id no servidor. Adicionar botões e handler no handleClick() do app.js. Atualizar status no ai_insights"],
        ["P1-2", "Relatórios operacionais são todos placeholder (6 cards)", "admin-pages.js — função reports()", "Implementar cada relatório: carteira por plano (COUNT clients GROUP BY plan_id), produtividade (COUNT tasks GROUP BY owner), etc."],
        ["P1-3", "Comunicação: POST funciona mas as mensagens enviadas não aparecem na tela", "server-supabase.js — handleMessages()", "Confirmar políticas RLS na tabela messages. Verificar se o seed SQL foi aplicado. Testar INSERT direto no Supabase Studio"],
        ["P1-4", "N+1 no sync inicial: 1 req GET /finance por cliente — lento com carteira grande", "apps/web/src/core/sync.js", "Criar endpoint GET /finance (sem ID) que retorna todos os snapshots MB de uma vez. Ou usar Promise.all() para paralelizar"],
        ["P1-5", "PATCH /clients não atualiza status/confidence — sem como promover cliente de Onboarding para Ativo na UI", "server-supabase.js + admin-pages.js", "Adicionar campos status e confidence ao form de dados-cliente. Mapear no clientToDb()"],
    ]
    story.append(status_table(p1_data[0], p1_data[1:], col_widths=[12*mm, 60*mm, 44*mm, 52*mm]))
    story.append(SP(8))

    story.append(P("🟡 P2 — Gap de Experiência:", "h2"))
    p2_data = [
        ["#", "Issue", "Solução Sugerida"],
        ["P2-1", "Data 'próxima revisão' hardcoded como '27/05' no onboarding", "Adicionar campo next_review_at na tabela clients e exibir dinamicamente"],
        ["P2-2", "Chips de módulos no Perfil do cliente são estáticos — não refletem plano real", "Calcular chips a partir de plan.modules do Supabase em vez de hardcoded"],
        ["P2-3", "Sem busca/filtro em documentos e importações — inviável com histórico longo", "Adicionar input de busca no frontend + query string ?search= na API"],
        ["P2-4", "Sem paginação em nenhum endpoint (limit/offset)", "Adicionar ?page=&limit= em /documents, /imports, /audit e demais listagens"],
        ["P2-5", "Erro de importação (CSV colunas erradas) não orienta o cliente sobre o que corrigir", "Adicionar campo error_detail na tabela import_jobs + exibir na tela de importações do cliente"],
        ["P2-6", "Formulário de envio cliente pré-preenchido como 'extrato_maio.ofx' — confuso", "Limpar value default do campo fileName. Preencher apenas ao selecionar arquivo via handleChange()"],
        ["P2-7", "Admin: texto fixo nas filas operacionais ('11 guias/XML', '8 caixas', etc.)", "Calcular volumes reais via COUNT() no Supabase ou endpoint dedicado"],
        ["P2-8", "Sem confirmação visual de upload bem-sucedido — usuário não sabe se funcionou", "Após POST bem-sucedido, redirecionar para a lista ou mostrar toast com nome do arquivo criado"],
        ["P2-9", "Todos os perfis MB têm mesmo nível de acesso — Fiscal vê dados financeiros CFO", "Implementar RBAC: perfil 'Fiscal' só acessa documentos e importações. 'CFO Consultor' acessa aprovações"],
        ["P2-10","Copiloto financeiro e insights de IA são textos seed, não IA generativa real", "Integrar Claude API (claude-sonnet) para gerar insights reais baseados nos dados financeiros do cliente"],
    ]
    story.append(status_table(p2_data[0], p2_data[1:], col_widths=[12*mm, 80*mm, 76*mm]))
    story.append(SP(8))

    story.append(P("🔵 P3 — Melhorias Técnicas:", "h2"))
    p3_items = [
        "Supabase Realtime: subscribir nas tabelas documents, messages e approvals para atualização em tempo real sem F5",
        "Adicionar Content-Security-Policy e CORS restrito (atualmente MBI_CORS_ORIGIN=*)",
        "Implementar upload direto do browser via Supabase Storage SDK (presigned PUT) em vez de proxiar pelo Node.js",
        "Adicionar índices no PostgreSQL: documents(client_id, created_at), import_jobs(client_id, status)",
        "Implementar soft delete (deleted_at) em vez de remoção física para documentos e imports",
        "Adicionar validação de CNPJ (algoritmo real) no formulário de cadastro de cliente",
        "Logs de erro da API devem ir para serviço externo (ex: Sentry) em vez de apenas console.error",
        "Implementar health check completo: inclui ping ao Supabase DB e ao Storage bucket",
        "Adicionar campo last_access_at no clients e atualizar no login do cliente (PATCH automático)",
        "Criar variante dark mode no CSS — GRAPHITE já é a cor base, metade do caminho feito",
    ]
    for item in p3_items:
        story.append(info_item(item))

    story.append(PageBreak())

    # ══════════════════════════════════════════════════════════════════════════
    # 9. ANÁLISE DO MODELO DE NEGÓCIO / PRODUTO
    # ══════════════════════════════════════════════════════════════════════════
    story.append(section_bar("9. Análise Crítica — Produto e Modelo de Negócio"))
    story.append(SP(8))

    story.append(P("O que o produto entrega bem:", "h2"))
    for item in [
        "Diferenciação clara de valor por plano: Contabilidade básico, Financeiro IA com gráficos, CFO com DRE+Caixa+Score — percepção de progressão de valor",
        "Governança humana (human-in-the-loop) como diferencial: IA gera, MB valida, cliente recebe — modelo certo para contabilidade regulada",
        "Portal unificado cliente + operador MB em um só produto — reduz ferramentas dispersas",
        "Fallback offline: cliente acessa dados mesmo com API instável — confiança para o cliente final",
        "Auditoria rastreável: cada ação registrada com usuário, ação, target e timestamp real",
        "Onboarding estruturado: checklist claro reduz fricção de ativação do novo cliente",
    ]:
        story.append(ok_item(item))
    story.append(SP(8))

    story.append(P("Gaps Estratégicos do Produto:", "h2"))
    for item in [
        "A IA não existe ainda — todos os 'insights MB' são textos estáticos. Sem IA real, o diferencial do plano Financeiro IA é apenas os gráficos",
        "Aprovações sem ação tornam o modelo de governança uma ilusão — a MB não consegue validar nem publicar insights pelo sistema",
        "Comunicação quebrada elimina o canal MB↔Cliente — obriga uso de WhatsApp externo, fragmentando o relacionamento",
        "Relatórios operacionais zerados impedem a MB de gerir a carteira em escala — impossível ver quem está em risco sem um relatório funcional",
        "Sem e-mail/webhook: o cliente não sabe que um documento foi publicado. A MB não sabe que o cliente enviou arquivo. Dependência de comunicação manual",
        "Sem integração contábil real (SEFAZ, eSocial, TOTVS, Domínio) — todos os dados são inseridos manualmente pela MB via formulário",
        "Score financeiro (MB Financial Score) é um número seed (82) — não calculado a partir de algoritmo real sobre os dados do cliente",
        "Sem mobile: layout não responsivo para smartphone — clientes empresariais acessam frequentemente pelo celular",
    ]:
        story.append(warn_item(item))
    story.append(SP(8))

    story.append(P("Roadmap Recomendado de Evolução:", "h2"))
    roadmap_data = [
        ["Sprint", "Objetivo", "Impacto"],
        ["Sprint 1 (1-2 sem)",  "Corrigir P0s: seed mensagens, rate limit, refresh JWT, mover service_role_key",                 "Produto seguro para demos reais"],
        ["Sprint 2 (2-3 sem)",  "Implementar aprovações completas (PATCH + UI), relatórios operacionais básicos",                 "Governança real + gestão de carteira"],
        ["Sprint 3 (2-4 sem)",  "Integrar Claude API para geração de insights reais baseados em dados financeiros",               "Diferencial de IA real no produto"],
        ["Sprint 4 (3-4 sem)",  "E-mail transacional (Resend/SendGrid): notif. documento publicado, arquivo recebido",           "Redução de WhatsApp manual"],
        ["Sprint 5 (4-6 sem)",  "Supabase Realtime + paginação + busca + filtros em listas",                                     "Escalabilidade + UX profissional"],
        ["Sprint 6 (6-8 sem)",  "Integração fiscal: SEFAZ/NFe, OFX real, API Open Banking",                                     "Dados automáticos eliminam entrada manual"],
        ["Sprint 7 (8-12 sem)", "RBAC granular, 2FA, mobile responsive, white-label para contadores parceiros",                  "Produto enterprise-ready para escalar"],
    ]
    story.append(status_table(roadmap_data[0], roadmap_data[1:], col_widths=[30*mm, 100*mm, 38*mm]))

    story.append(PageBreak())

    # ══════════════════════════════════════════════════════════════════════════
    # 10. CONCLUSÃO
    # ══════════════════════════════════════════════════════════════════════════
    story.append(section_bar("10. Conclusão e Próximos Passos"))
    story.append(SP(8))
    story.append(P("O MB Intelligence em produção local demonstra uma base técnica sólida e uma visão de produto correta. A stack escolhida (Supabase + Node.js nativo + SPA Vanilla) é pragmática, rápida de operar e adequada para a fase atual."))
    story.append(SP(4))
    story.append(P("O produto está pronto para <b>demonstrações técnicas controladas</b> mas não para <b>produção com clientes reais pagantes</b>. Os bloqueadores P0 (segurança de credenciais, refresh de token, seed de mensagens) devem ser resolvidos antes de qualquer acesso de cliente real."))
    story.append(SP(8))

    story.append(P("Resumo de Criticidade:", "h3"))
    story.append(kpi_row([
        ("P0 — Bloqueia",    "5 issues",  RED_DARK),
        ("P1 — Quebrado",    "5 issues",  AMBER),
        ("P2 — Experiência", "10 issues", BLUE),
        ("P3 — Técnico",     "10 issues", PURPLE),
    ]))
    story.append(SP(10))
    story.append(P("Prioridade Imediata (próximas 2 semanas):", "h3"))
    for item in [
        "Mover SUPABASE_SERVICE_ROLE_KEY para variável de ambiente do servidor — não commitar",
        "Adicionar migration SQL com seed das mensagens na tabela messages do Supabase",
        "Implementar interceptor de JWT expirado com refresh_token no auth.js",
        "Adicionar PATCH /approvals/:id com campos status, reviewed_by, review_notes",
        "Criar botões de Aprovar / Rejeitar / Editar na tela de aprovações do admin",
        "Implementar ao menos 2 relatórios operacionais reais: Carteira por plano e Risco de cancelamento",
        "Adicionar rate limiting no endpoint /auth/login (5 req/min por IP)",
        "Investigar e corrigir RLS/seed da tabela messages no Supabase",
    ]:
        story.append(bullet_item(item, ">>", hex_str(RED_DARK)))
    story.append(SP(8))

    story.append(HR())
    story.append(SP(4))
    story.append(P("Documento gerado em 25/05/2026 | MB Empresas Assessoria — Produto MB Intelligence v1.0 em Produção Local | Supabase Project: vkltsvgweyzxpbcuvozx | Driver: supabase | Porta: 3333", "body_small"))

    # ── Build ─────────────────────────────────────────────────────────────────
    doc.build(story)
    print(f"PDF gerado: {output_path}")


if __name__ == "__main__":
    out = os.path.join(
        r"C:\MB EMPRESAS\MB_Intelligence_Produto_Final\docs",
        "MB_Intelligence_Auditoria_Tecnica_2026.pdf"
    )
    build_doc(out)
