# -*- coding: utf-8 -*-
"""Build the MB Intelligence presentation deck (16:9)."""
import os
from pptx import Presentation
from pptx.util import Inches as I, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
from pptx.oxml.ns import qn

A = os.path.join(os.path.dirname(__file__), "..", "assets")
def asset(n): return os.path.abspath(os.path.join(A, n))

# ---- palette ----
BRAND  = RGBColor(0x5B,0x07,0x0B)
BRAND2 = RGBColor(0x8F,0x12,0x1B)
ACCENT = RGBColor(0xE3,0x27,0x32)
INK    = RGBColor(0x14,0x15,0x1B)
GRAPH  = RGBColor(0x24,0x26,0x2D)
DARK   = RGBColor(0x10,0x11,0x16)
MUTED  = RGBColor(0x5B,0x65,0x73)
SOFT   = RGBColor(0x8A,0x93,0xA2)
LINE   = RGBColor(0xE4,0xE7,0xED)
SURF   = RGBColor(0xF7,0xF8,0xFA)
WHITE  = RGBColor(0xFF,0xFF,0xFF)
CREAMW = RGBColor(0xF0,0xD6,0xD8)
SUCC   = RGBColor(0x12,0x80,0x5C)
DANG   = RGBColor(0xB4,0x23,0x18)
TEAL   = RGBColor(0x0F,0x76,0x6E)
BLUE   = RGBColor(0x1D,0x4E,0xD8)
AMBER  = RGBColor(0xB7,0x79,0x1F)
F = "Calibri"

prs = Presentation()
prs.slide_width  = I(13.333)
prs.slide_height = I(7.5)
SW, SH = 13.333, 7.5
BLANK = prs.slide_layouts[6]

def slide(bg=WHITE):
    s = prs.slides.add_slide(BLANK)
    r = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0,0, prs.slide_width, prs.slide_height)
    r.fill.solid(); r.fill.fore_color.rgb = bg; r.line.fill.background()
    r.shadow.inherit = False
    return s

def _set_radius(sh, val):
    try: sh.adjustments[0] = val
    except Exception: pass

def rect(s,l,t,w,h, fill=None, line=None, lw=1.0, radius=None, shadow=False):
    shape = MSO_SHAPE.ROUNDED_RECTANGLE if radius is not None else MSO_SHAPE.RECTANGLE
    sp = s.shapes.add_shape(shape, I(l),I(t),I(w),I(h))
    if radius is not None: _set_radius(sp, radius)
    if fill is None: sp.fill.background()
    else: sp.fill.solid(); sp.fill.fore_color.rgb = fill
    if line is None: sp.line.fill.background()
    else: sp.line.color.rgb = line; sp.line.width = Pt(lw)
    sp.shadow.inherit = False
    if shadow: _shadow(sp)
    return sp

def _shadow(sp):
    spPr = sp._element.spPr
    el = spPr.makeelement(qn('a:effectLst'), {})
    sh = el.makeelement(qn('a:outerShdw'), {'blurRad':'180000','dist':'90000','dir':'5400000','rotWithShape':'0'})
    clr = sh.makeelement(qn('a:srgbClr'), {'val':'10131A'})
    alpha = clr.makeelement(qn('a:alpha'), {'val':'22000'}); clr.append(alpha)
    sh.append(clr); el.append(sh); spPr.append(el)

def text(s,l,t,w,h, runs, size=14, color=INK, bold=False, align=PP_ALIGN.LEFT,
         anchor=MSO_ANCHOR.TOP, font=F, sp_after=4, line_spacing=1.0, wrap=True):
    """runs: str OR list of paragraphs; each paragraph str OR list of (txt,size,color,bold,font) tuples."""
    tb = s.shapes.add_textbox(I(l),I(t),I(w),I(h)); tf = tb.text_frame
    tf.word_wrap = wrap
    tf.vertical_anchor = anchor
    for m in (tf.margin_left, ): pass
    tf.margin_left=0; tf.margin_right=0; tf.margin_top=0; tf.margin_bottom=0
    paras = runs if isinstance(runs, list) else [runs]
    for i,p in enumerate(paras):
        para = tf.paragraphs[0] if i==0 else tf.add_paragraph()
        para.alignment = align; para.space_after = Pt(sp_after); para.space_before = Pt(0)
        para.line_spacing = line_spacing
        chunks = p if isinstance(p, list) else [(p,size,color,bold,font)]
        for c in chunks:
            txt = c[0]; csize = c[1] if len(c)>1 and c[1] else size
            ccol = c[2] if len(c)>2 and c[2] else color
            cbold = c[3] if len(c)>3 and c[3] is not None else bold
            cfont = c[4] if len(c)>4 and c[4] else font
            r = para.add_run(); r.text = txt
            r.font.size = Pt(csize); r.font.color.rgb = ccol; r.font.bold = cbold; r.font.name = cfont
    return tb

def pic(s, path, l, t, w=None, h=None, border=None, bw=1.0, shadow=False):
    kw = {}
    if w is not None: kw['width']=I(w)
    if h is not None: kw['height']=I(h)
    p = s.shapes.add_picture(asset(path), I(l), I(t), **kw)
    if border is not None: p.line.color.rgb = border; p.line.width = Pt(bw)
    if shadow: _shadow(p)
    return p

def eyebrow(s, l, t, txt, color=BRAND2, w=9):
    text(s,l,t,w,0.3,[[(txt.upper(),11.5,color,True,F)]])

def shot_frame(s, img, l, t, w, label=""):
    """browser-style framed screenshot. returns bottom y."""
    ratio = 1900/2880.0
    barh = 0.28
    imgh = w*ratio
    rect(s,l,t,w,barh+imgh+0.02, fill=DARK, radius=0.035, shadow=True)
    # dots
    for i,c in enumerate([RGBColor(0xFF,0x5F,0x57),RGBColor(0xFE,0xBC,0x2E),RGBColor(0x28,0xC8,0x40)]):
        d = s.shapes.add_shape(MSO_SHAPE.OVAL, I(l+0.18+i*0.16), I(t+0.10), I(0.09),I(0.09))
        d.fill.solid(); d.fill.fore_color.rgb=c; d.line.fill.background(); d.shadow.inherit=False
    if label: text(s,l+0.75,t+0.02,w-1,barh,[[(label,9.5,SOFT,True,F)]],anchor=MSO_ANCHOR.MIDDLE)
    pic(s, img, l+0.05, t+barh, w=w-0.10)
    return t+barh+imgh

def frow(s, l, t, w, title, desc, num=None, dotcolor=BRAND2, dotbg=None):
    """feature row: small marker + bold title + description."""
    if num is not None:
        c = s.shapes.add_shape(MSO_SHAPE.OVAL, I(l),I(t),I(0.32),I(0.32))
        c.fill.solid(); c.fill.fore_color.rgb=dotcolor; c.line.fill.background(); c.shadow.inherit=False
        tf=c.text_frame; tf.margin_left=0;tf.margin_right=0;tf.margin_top=0;tf.margin_bottom=0
        p=tf.paragraphs[0]; p.alignment=PP_ALIGN.CENTER; r=p.add_run(); r.text=str(num)
        r.font.size=Pt(12); r.font.bold=True; r.font.color.rgb=WHITE; r.font.name=F
    else:
        rect(s,l+0.02,t+0.05,0.16,0.16, fill=dotcolor, radius=0.3)
    tx = l+0.46
    text(s,tx,t-0.02,w-0.46,0.9,[
        [(title,13.5,INK,True,F)],
        [(desc,11.5,MUTED,False,F)]
    ], sp_after=2, line_spacing=1.05)

def footer(s, label, n, dark=False):
    col = SOFT if not dark else RGBColor(0x9A,0xA1,0xAD)
    bcol = CREAMW if dark else BRAND2
    text(s,0.6,7.06,9,0.3,[[("MB Intelligence",10,bcol,True,F),(" · "+label,10,col,False,F)]])
    text(s,12.2,7.06,0.6,0.3,[[(f"{n:02d}",10,col,False,F)]],align=PP_ALIGN.RIGHT)

def chip(s,l,t,txt,fg,bg,bd, w=None):
    wd = w or (0.16+len(txt)*0.085)
    rect(s,l,t,wd,0.34, fill=bg, line=bd, lw=1.0, radius=0.5)
    text(s,l,t,wd,0.34,[[(txt,10.5,fg,True,F)]],align=PP_ALIGN.CENTER,anchor=MSO_ANCHOR.MIDDLE)
    return l+wd+0.12

# =================================================================== SLIDE 1
s = slide(DARK)
# subtle brand glow via large dark-red oval bleeding off the top-right corner
o=s.shapes.add_shape(MSO_SHAPE.OVAL, I(9.0),I(-3.0),I(7.6),I(7.6))
o.fill.solid(); o.fill.fore_color.rgb=BRAND; o.line.fill.background(); o.shadow.inherit=False
pic(s,"logo-white.png", 0.65, 0.6, w=2.6)
text(s,9.4,0.7,3.3,1.0,[[("APRESENTAÇÃO",10.5,CREAMW,True,F)],
    [("INSTITUCIONAL",10.5,CREAMW,True,F)],[("2026",10.5,RGBColor(0xD8,0xA8,0xAB),True,F)]],align=PP_ALIGN.RIGHT,line_spacing=1.3)
eyebrow(s,0.7,3.1,"Plataforma de contabilidade inteligente",RGBColor(0xE9,0xB9,0xBC))
text(s,0.68,3.5,11,1.4,[[("MB Intelligence",54,WHITE,True,F)]])
text(s,0.7,4.75,8.6,0.9,[[("A contabilidade que vira ",20,CREAMW,False,F),("inteligência",20,WHITE,True,F),
    (" para o seu negócio.",20,CREAMW,False,F)]],line_spacing=1.15)
cx=0.7
for c in ["Portal do cliente","Dashboard financeiro","Documentos & guias","Score de saúde","Acompanhamento humano"]:
    cx = chip(s,cx,5.95,c,RGBColor(0xF3,0xDA,0xDA),GRAPH,RGBColor(0x3A,0x3D,0x46))
text(s,0.7,6.85,9,0.5,[[("Documento de apresentação e manual da plataforma — referência para divulgação, site e redes sociais.",10.5,SOFT,False,F)]])

# =================================================================== SLIDE 2
s = slide(WHITE)
eyebrow(s,0.6,0.55,"O que é")
text(s,0.58,0.92,12.2,1.0,[[("Sua contabilidade e a saúde financeira",27,INK,True,F)],
    [("da empresa, no mesmo lugar.",27,INK,True,F)]],line_spacing=1.02)
text(s,0.6,2.35,7.0,2.6,[
  [("A ",13,INK),("MB Intelligence",13,INK,True),(" é a plataforma digital da ",13,INK),("MB Assessoria Empresarial",13,INK,True),(". Ela reúne, num só portal, tudo o que a sua empresa precisa.",13,INK)],
  [("Os ",13,MUTED),("documentos e guias",13,BRAND2,True),(" que a contabilidade emite e a ",13,MUTED),("leitura financeira",13,BRAND2,True),(" do negócio — quanto faturou, quanto sobrou e como está a saúde da empresa, mês a mês.",13,MUTED)],
  [("Em vez de arquivos soltos por e-mail e WhatsApp, o cliente entra num portal organizado, com a informação na linguagem do dono.",13,MUTED)],
], sp_after=10, line_spacing=1.25)
# stat callouts right
sx=8.0
stats=[("1 portal","Documentos, guias, indicadores e comunicação num único acesso."),
       ("Tempo real","Faturamento, resultado, margem e caixa por competência."),
       ("0 a 100","Um Score MB que resume a saúde financeira numa nota.")]
ty=2.3
for big,desc in stats:
    rect(s,sx,ty,4.7,1.32, fill=SURF, line=LINE, radius=0.10)
    text(s,sx+0.3,ty+0.18,4.2,0.6,[[(big,26,BRAND,True,F)]])
    text(s,sx+0.3,ty+0.74,4.15,0.5,[[(desc,11,MUTED,False,F)]],line_spacing=1.1)
    ty+=1.5
# bottom mini cards
cards=[("Portal do cliente","Início objetivo com pendências, último documento e resumo em 5 segundos."),
       ("Dashboard de inteligência","KPIs, evolução de receita e despesa, fluxo de caixa e Score de saúde."),
       ("Documentos & guias","Tudo o que a MB publica — fiscal, folha, contábil — por competência.")]
cw=3.9; gap=0.31; lx=0.6
for i,(h,d) in enumerate(cards):
    x=lx+i*(cw+gap)
    rect(s,x,5.35,cw,1.35, fill=WHITE, line=LINE, radius=0.09)
    rect(s,x+0.28,5.6,0.34,0.34, fill=BRAND2, radius=0.3)
    text(s,x+0.78,5.58,cw-1,0.4,[[(h,12.5,INK,True,F)]])
    text(s,x+0.28,6.04,cw-0.55,0.6,[[(d,10.5,MUTED,False,F)]],line_spacing=1.1)
footer(s,"O que é",2)

# =================================================================== SLIDE 3
s = slide(WHITE)
eyebrow(s,0.6,0.55,"Por que existimos")
text(s,0.58,0.92,12,0.8,[[("O dono de PME decide no escuro. A gente acende a luz.",26,INK,True,F)]])
# two columns
colw=5.9
def problist(x, title, color, items, good):
    text(s,x,2.0,colw,0.4,[[(title.upper(),12,color,True,F)]])
    yy=2.5
    for t in items:
        mk = "✓" if good else "✕"
        c = s.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, I(x),I(yy),I(0.30),I(0.30)); _set_radius(c,0.3)
        c.fill.solid(); c.fill.fore_color.rgb = (SUCC if good else DANG); c.line.fill.background(); c.shadow.inherit=False
        tf=c.text_frame; tf.margin_left=0;tf.margin_right=0;tf.margin_top=0;tf.margin_bottom=0
        p=tf.paragraphs[0]; p.alignment=PP_ALIGN.CENTER; r=p.add_run(); r.text=mk; r.font.size=Pt(11); r.font.bold=True; r.font.color.rgb=WHITE; r.font.name=F
        text(s,x+0.44,yy-0.04,colw-0.5,0.8,[[(t[0],12.5,INK,True,F)],[(t[1],11,MUTED,False,F)]],sp_after=1,line_spacing=1.05)
        yy+=0.92
problist(0.6,"O problema de hoje",DANG,[
    ("Contabilidade vira só obrigação.","Guia para pagar, balanço no fim do ano. Nada que ajude a decidir."),
    ("Informação espalhada.","Documentos no e-mail, guias no WhatsApp, planilha no escritório."),
    ("Linguagem de contador.","O dono não sabe, num olhar, se o mês foi bom ou ruim."),
    ("Reação, nunca antecipação.","Os problemas aparecem quando o caixa já apertou.")],False)
problist(6.85,"A solução MB Intelligence",SUCC,[
    ("Obrigação + inteligência.","Entregamos a guia E a leitura do mês: faturou, lucrou, tem em caixa."),
    ("Tudo num portal.","Documentos, guias, indicadores e comunicação num acesso seguro."),
    ("Linguagem do dono.","Números traduzidos. Um Score de 0 a 100 resume a saúde."),
    ("Acompanhamento mensal.","Fechamento todo mês, com um consultor humano de verdade.")],True)
footer(s,"Por que existimos",3)

# =================================================================== SLIDE 4
s = slide(WHITE)
eyebrow(s,0.6,0.55,"Para quem é")
text(s,0.58,0.92,12,0.8,[[("Feita para a pequena e média empresa brasileira.",26,INK,True,F)]])
cards=[("Pequenas e médias empresas","Simples Nacional e Lucro Presumido — comércio, serviços, saúde e profissionais liberais."),
       ("Donos que querem clareza","Quem cansou de “só a guia” e quer enxergar a saúde do negócio sem virar contador."),
       ("Quem vai trocar de contador","A MB cuida de toda a migração — sem custo adicional e sem dor de cabeça.")]
cw=3.95; gap=0.34; lx=0.6
for i,(h,d) in enumerate(cards):
    x=lx+i*(cw+gap)
    rect(s,x,2.35,cw,3.2, fill=SURF, line=LINE, radius=0.07, shadow=True)
    ic = s.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, I(x+0.4),I(2.75),I(0.7),I(0.7)); _set_radius(ic,0.25)
    ic.fill.solid(); ic.fill.fore_color.rgb=GRAPH; ic.line.fill.background(); ic.shadow.inherit=False
    tf=ic.text_frame; tf.margin_left=0;tf.margin_right=0;tf.margin_top=0;tf.margin_bottom=0
    p=tf.paragraphs[0]; p.alignment=PP_ALIGN.CENTER; r=p.add_run(); r.text=str(i+1); r.font.size=Pt(24); r.font.bold=True; r.font.color.rgb=WHITE; r.font.name=F
    text(s,x+0.4,3.7,cw-0.8,0.8,[[(h,15,INK,True,F)]],line_spacing=1.0)
    text(s,x+0.4,4.55,cw-0.75,1.0,[[(d,12,MUTED,False,F)]],line_spacing=1.2)
footer(s,"Para quem é",4)

# =================================================================== SLIDE 5 (home shot)
s = slide(WHITE)
eyebrow(s,0.6,0.5,"Funcionalidade · Portal do cliente")
text(s,0.58,0.86,12.2,0.7,[[("A empresa abre o portal e entende o mês em segundos.",24,INK,True,F)]])
b = shot_frame(s,"screen-home.png",0.6,1.7,7.2,"mb-intelligence · Início do cliente")
fx=8.05
feats=[("Pendências do mês em destaque","O que aguarda o cliente ou a MB, logo no topo."),
       ("Último documento liberado","Com selo de vencimento — nunca perca uma guia."),
       ("Resumo financeiro imediato","Faturou, resultado, em caixa e margem em 5 segundos."),
       ("Ações rápidas","Documentos, falar com a MB e dashboard num clique.")]
fy=2.05
for i,(h,d) in enumerate(feats):
    frow(s,fx,fy,4.7,h,d,num=i+1); fy+=1.12
footer(s,"Portal do cliente",5)

# =================================================================== SLIDE 6 (dashboard hero)
s = slide(WHITE)
eyebrow(s,0.6,0.5,"Funcionalidade · Dashboard de inteligência")
text(s,0.58,0.86,12.2,0.7,[[("A saúde financeira do negócio numa só tela.",24,INK,True,F)]])
shot_frame(s,"screen-dashboard.png",0.6,1.65,7.5,"mb-intelligence · Dashboard")
fx=8.35
feats=[("Indicadores-chave","Faturamento, resultado, impostos e Score, com variação mensal."),
       ("Receita × despesa × resultado","Linha temporal interativa por competência."),
       ("Score de saúde (0–100)","6 dimensões: liquidez, rentabilidade, endividamento e mais."),
       ("Leitura inteligente da MB","Um texto curto que explica o mês e o próximo passo.")]
fy=2.0
for i,(h,d) in enumerate(feats):
    frow(s,fx,fy,4.4,h,d,num=i+1); fy+=1.18
footer(s,"Dashboard de inteligência",6)

# =================================================================== SLIDE 7 (operacao)
s = slide(WHITE)
eyebrow(s,0.6,0.5,"Bastidores · A operação da MB")
text(s,0.58,0.86,12.2,0.7,[[("Por trás do portal, um fluxo de trabalho organizado.",24,INK,True,F)]])
shot_frame(s,"screen-operacao.png",0.6,1.7,7.2,"mb-intelligence · Operação MB (interno)")
fx=8.05
text(s,fx,1.95,4.7,1.1,[[("A equipe MB opera cada cliente por um painel próprio: cadastra, alimenta os dados, publica os documentos e entrega tudo no portal.",12,MUTED,False,F)]],line_spacing=1.25)
steps=[("Cadastrar & ativar","Dados validados e acesso liberado."),
       ("Alimentar & publicar","Faturamento, impostos e documentos por competência."),
       ("Entregar & acompanhar","Tudo no portal, com tarefas e prazos à vista.")]
fy=3.3
for i,(h,d) in enumerate(steps):
    frow(s,fx,fy,4.7,h,d,num=i+1); fy+=1.1
footer(s,"Operação MB",7)

# =================================================================== SLIDE 8 (como funciona)
s = slide(WHITE)
eyebrow(s,0.6,0.55,"Como funciona na prática")
text(s,0.58,0.92,12,0.8,[[("Um trabalho a quatro mãos: a MB e você.",26,INK,True,F)]])
text(s,0.6,1.82,12,0.5,[[("A inteligência nasce de dados confiáveis. Por isso o trabalho é dividido com clareza.",13,MUTED,False,F)]])
# MB column
def workcol(x, badge, title, color, items, mk):
    rect(s,x,2.4,5.85,3.7, fill=SURF, line=LINE, radius=0.05, shadow=True)
    b=s.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE,I(x+0.35),I(2.7),I(0.85),I(0.6)); _set_radius(b,0.25)
    b.fill.solid(); b.fill.fore_color.rgb=color; b.line.fill.background(); b.shadow.inherit=False
    tf=b.text_frame; tf.margin_left=0;tf.margin_right=0;tf.margin_top=0;tf.margin_bottom=0
    p=tf.paragraphs[0]; p.alignment=PP_ALIGN.CENTER; r=p.add_run(); r.text=badge; r.font.size=Pt(15); r.font.bold=True; r.font.color.rgb=WHITE; r.font.name=F
    text(s,x+1.4,2.74,4,0.6,[[(title,16,INK,True,F)]],anchor=MSO_ANCHOR.MIDDLE)
    yy=3.55
    for h,d in items:
        cc=s.shapes.add_shape(MSO_SHAPE.OVAL,I(x+0.4),I(yy+0.02),I(0.26),I(0.26))
        cc.fill.solid(); cc.fill.fore_color.rgb=color; cc.line.fill.background(); cc.shadow.inherit=False
        tf=cc.text_frame; tf.margin_left=0;tf.margin_right=0;tf.margin_top=0;tf.margin_bottom=0
        p=tf.paragraphs[0]; p.alignment=PP_ALIGN.CENTER; r=p.add_run(); r.text=mk; r.font.size=Pt(9); r.font.bold=True; r.font.color.rgb=WHITE; r.font.name=F
        text(s,x+0.82,yy-0.04,4.8,0.6,[[(h,12.5,INK,True,F)],[(d,10.5,MUTED,False,F)]],sp_after=1,line_spacing=1.05)
        yy+=0.62
workcol(0.6,"MB","O que a MB faz por você",BRAND2,[
    ("Apuração de impostos e faturamento","DAS, guias e obrigações calculadas e publicadas."),
    ("Folha, fiscal e contábil","Documentos organizados por competência."),
    ("Indicadores e Score","Margem, resultado, saúde financeira e leitura."),
    ("Validação antes de publicar","Tudo revisado por gente antes de chegar a você.")],"✓")
workcol(6.9,"VC","O que você contribui",BLUE,[
    ("Despesas do negócio","O que entra e sai no dia a dia — só o dono conhece."),
    ("Extratos para conciliação","Envio do extrato bancário, direto pelo portal."),
    ("Contexto do mês","Uma venda grande, um investimento, uma sazonalidade."),
    ("Poucos minutos por mês","O portal guia o que falta. Sem planilha.")],"→")
rect(s,0.6,6.3,12.13,0.78, fill=GRAPH, radius=0.10)
text(s,0.95,6.42,11.5,0.55,[[("O resultado: ",12.5,WHITE,True,F),("dados confiáveis viram decisões melhores. Quanto melhor a informação, mais profunda é a análise que a MB devolve.",12.5,RGBColor(0xC7,0xCC,0xD6),False,F)]],anchor=MSO_ANCHOR.MIDDLE)
footer(s,"Como funciona",8,dark=False)

# =================================================================== SLIDE 9 (table)
s = slide(WHITE)
eyebrow(s,0.6,0.55,"O que nos torna diferentes")
text(s,0.58,0.92,12,0.8,[[("Contabilidade tradicional ",26,INK,True,F),("×",26,ACCENT,True,F),(" MB Intelligence",26,INK,True,F)]])
rows=[("Entrega","Guia e balanço, por e-mail","Guia + inteligência financeira num portal"),
      ("Acesso à informação","Espalhada em e-mail e WhatsApp","Tudo num só lugar, por competência"),
      ("Leitura financeira","Linguagem técnica de contador","Linguagem do dono + Score 0–100"),
      ("Visão do negócio","Fecha uma vez por ano","Dashboard atualizado todo mês"),
      ("Postura","Reativa — corre atrás do problema","Consultiva — antecipa e orienta"),
      ("Relacionamento","Contato só quando há pendência","Consultor humano e acompanhamento mensal"),
      ("Transparência","Cliente não vê o trabalho","Cliente acompanha tarefas e prazos")]
tx,ty,tw = 0.6,2.0,12.13
col=[3.0,4.4,4.73]
heads=["Critério","Contabilidade tradicional","MB Intelligence"]
# header
hx=tx
rect(s,tx,ty,tw,0.5, fill=GRAPH, radius=None)
for i,hh in enumerate(heads):
    text(s,hx+0.22,ty,col[i]-0.3,0.5,[[(hh.upper(),11,WHITE,True,F)]],anchor=MSO_ANCHOR.MIDDLE)
    hx+=col[i]
ry=ty+0.5; rh=0.62
for j,(crit,trad,mb) in enumerate(rows):
    if j%2==1: rect(s,tx,ry,tw,rh, fill=SURF)
    hx=tx
    text(s,hx+0.22,ry,col[0]-0.3,rh,[[(crit,11.5,INK,True,F)]],anchor=MSO_ANCHOR.MIDDLE); hx+=col[0]
    text(s,hx+0.22,ry,col[1]-0.3,rh,[[("✕  ",11,DANG,True,F),(trad,11,MUTED,False,F)]],anchor=MSO_ANCHOR.MIDDLE); hx+=col[1]
    text(s,hx+0.22,ry,col[2]-0.3,rh,[[("✓  ",11,SUCC,True,F),(mb,11,BRAND2,True,F)]],anchor=MSO_ANCHOR.MIDDLE)
    ry+=rh
rect(s,tx,ty,tw,0.5+rh*len(rows), fill=None, line=LINE, radius=None)
text(s,0.6,6.55,12,0.7,[[("Outros escritórios entregam a ",15,INK,True,F),("obrigação",15,BRAND2,True,F),
   (". A MB entrega a obrigação ",15,INK,True,F),("e a inteligência",15,BRAND2,True,F),(" para o dono crescer.",15,INK,True,F)]],line_spacing=1.1)
footer(s,"Diferenciais",9)

# =================================================================== SLIDE 10 (tech)
s = slide(DARK)
eyebrow(s,0.6,0.55,"Tecnologia & segurança",RGBColor(0xE9,0xB9,0xBC))
text(s,0.58,0.92,12,0.8,[[("Construída como software moderno — segura por padrão.",25,WHITE,True,F)]])
text(s,0.6,1.78,12,0.5,[[("Aplicação web na nuvem, sem instalação. Funciona no computador e no celular, com padrões de segurança de banco digital.",12.5,RGBColor(0xB9,0xBE,0xC9),False,F)]],line_spacing=1.2)
cards=[("Arquitetura","Aplicação web (SPA) em JavaScript com Vite. Backend serverless em Node.js, na Vercel, com CDN global e deploy contínuo."),
       ("Dados & documentos","PostgreSQL gerenciado no Supabase, isolamento por cliente (multi-tenant) com Row-Level Security. Documentos em Storage dedicado."),
       ("Segurança","Criptografia em trânsito (HTTPS/TLS), autenticação por tokens temporários, expiração de sessão, acesso por perfil e auditoria."),
       ("Privacidade & LGPD","Tratamento conforme a LGPD: finalidade definida, direito de acesso, correção e exclusão. Dados só com órgãos reguladores quando exigido.")]
cw=5.85; ch=1.62; gx=0.6; gy=2.55
for i,(h,d) in enumerate(cards):
    x=gx+(i%2)*(cw+0.33); y=gy+(i//2)*(ch+0.3)
    rect(s,x,y,cw,ch, fill=RGBColor(0x1C,0x1E,0x26), line=RGBColor(0x32,0x35,0x3F), radius=0.07)
    rect(s,x+0.3,y+0.28,0.34,0.34, fill=BRAND2, radius=0.3)
    text(s,x+0.8,y+0.26,cw-1,0.4,[[(h,14,WHITE,True,F)]])
    text(s,x+0.3,y+0.74,cw-0.55,0.8,[[(d,10.8,RGBColor(0xAA,0xB0,0xBC),False,F)]],line_spacing=1.18)
# stack chips
cx=0.6
for c in ["JavaScript · SPA","Vite","Node.js","Supabase · PostgreSQL","Row-Level Security","Vercel · CDN","HTTPS/TLS","LGPD"]:
    cx = chip(s,cx,6.55,c,RGBColor(0xF3,0xDA,0xDA),RGBColor(0x24,0x18,0x1A),RGBColor(0x4A,0x2E,0x30))
footer(s,"Tecnologia & segurança",10,dark=True)

# =================================================================== SLIDE 11 (identity)
s = slide(WHITE)
eyebrow(s,0.6,0.55,"Manual de marca")
text(s,0.58,0.92,12,0.8,[[("Identidade visual",26,INK,True,F)]])
# logo badge
text(s,0.6,1.95,5.5,0.3,[[("LOGOTIPO",11,BRAND2,True,F)]])
pic(s,"logo-badge.png",0.6,2.35,w=3.7)
text(s,0.6,3.75,5.7,1.0,[[("Monograma MB (M vermelho, B branco) + assinatura “MB Assessoria Empresarial”. Usar sobre fundos escuros ou vermelho-marca.",11,MUTED,False,F)]],line_spacing=1.2)
# typography
text(s,6.7,1.95,5.5,0.3,[[("TIPOGRAFIA",11,BRAND2,True,F)]])
rect(s,6.7,2.35,6.0,1.85, fill=SURF, line=LINE, radius=0.06)
text(s,7.0,2.55,5,0.7,[[("Inter",30,INK,True,F)]])
text(s,7.0,3.25,5.5,0.9,[[("Família única — títulos, interface e texto. Geométrica, legível e moderna.",11,MUTED,False,F)],
    [("Black · Bold · Semibold · Regular",11,GRAPH,True,F)]],sp_after=4,line_spacing=1.2)
# palette
text(s,0.6,4.5,5,0.3,[[("PALETA DE CORES",11,BRAND2,True,F)]])
sw=[("Vinho","#5B070B",BRAND),("Marca","#8F121B",BRAND2),("Claro","#C53B43",RGBColor(0xC5,0x3B,0x43)),
    ("Acento","#E32732",ACCENT),("Grafite","#14151B",INK),("Suave","#667085",RGBColor(0x66,0x70,0x85))]
px=0.6; sww=1.95
for i,(nm,hexv,col) in enumerate(sw):
    x=px+i*(sww+0.06)
    rect(s,x,4.9,sww,0.92, fill=col, radius=0.05)
    text(s,x+0.12,5.86,sww,0.45,[[(nm,10.5,INK,True,F)],[(hexv,9,SOFT,False,F)]],sp_after=0,line_spacing=1.0)
# tone of voice
text(s,0.6,6.55,12,0.6,[[("TOM DE VOZ   ",11,BRAND2,True,F),("Direto, próximo e sem jargão. Falamos com o dono, não com o contador. Sóbrio e ",11.5,MUTED,False,F),("fosco, sem brilho",11.5,INK,True,F),(" — confiança e cuidado.",11.5,MUTED,False,F)]],line_spacing=1.15)
footer(s,"Identidade visual",11)

# =================================================================== SLIDE 12 (CTA)
s = slide(DARK)
o=s.shapes.add_shape(MSO_SHAPE.OVAL, I(9.3),I(-3.0),I(7.6),I(7.6))
o.fill.solid(); o.fill.fore_color.rgb=BRAND; o.line.fill.background(); o.shadow.inherit=False
pic(s,"logo-white.png", 0.65, 0.7, w=2.6)
eyebrow(s,0.7,3.0,"Vamos começar",RGBColor(0xE9,0xB9,0xBC))
text(s,0.68,3.4,11.5,1.5,[[("Sua empresa merece enxergar",40,WHITE,True,F)],[("os próprios números.",40,WHITE,True,F)]],line_spacing=1.0)
text(s,0.7,5.05,8.2,1.1,[[("Cadastre sua empresa e, em até 48 horas, a MB ativa seu portal e orienta os próximos passos. Sem fidelidade mínima — e cuidamos da migração se você já tem contador.",14,CREAMW,False,F)]],line_spacing=1.25)
rect(s,0.7,6.15,5.4,0.85, fill=BRAND2, radius=0.16, shadow=True)
text(s,0.95,6.15,5.0,0.85,[[("Fale com a MB no WhatsApp",15,WHITE,True,F)],[("Tire dúvidas e veja uma demonstração do portal.",10.5,RGBColor(0xF3,0xD9,0xDB),False,F)]],anchor=MSO_ANCHOR.MIDDLE,sp_after=2,line_spacing=1.05)
text(s,0.7,7.06,10,0.3,[[("MB Assessoria Empresarial — contabilidade e consultoria financeira para PMEs · Plataforma MB Intelligence",9.5,SOFT,False,F)]])

out = os.path.abspath(os.path.join(os.path.dirname(__file__),"..","MB-Intelligence-Apresentacao.pptx"))
prs.save(out)
print("saved:", out, "slides:", len(prs.slides._sldIdLst))
