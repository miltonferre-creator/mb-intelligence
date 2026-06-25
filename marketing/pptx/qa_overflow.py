# -*- coding: utf-8 -*-
from pptx import Presentation
from pptx.util import Emu
from PIL import ImageFont
import os

REG="C:/Windows/Fonts/calibri.ttf"; BOLD="C:/Windows/Fonts/calibrib.ttf"
def font(sz,bold): return ImageFont.truetype(BOLD if bold else REG, max(int(round(sz*96/72)),1))
def text_w(s,sz,bold):
    f=font(sz,bold)
    try: return f.getlength(s)
    except: return f.getbbox(s)[2]

def wrap_lines(words_runs, box_w_px):
    # words_runs: list of (word, size, bold). Greedy wrap by total width.
    lines=1; cur=0.0
    space=text_w(" ",max((r[1] for r in words_runs),default=12),False)
    for w,sz,b in words_runs:
        ww=text_w(w,sz,b)
        add=(space if cur>0 else 0)+ww
        if cur+add>box_w_px and cur>0:
            lines+=1; cur=ww
        else:
            cur+=add
    return lines

p=Presentation("MB-Intelligence-Apresentacao.pptx")
EMU_IN=914400
issues=0
for si,slide in enumerate(p.slides,1):
    for sh in slide.shapes:
        if not sh.has_text_frame: continue
        tf=sh.text_frame
        bw=sh.width/EMU_IN*96.0; bh=sh.height/EMU_IN*96.0
        total_h=0.0
        for para in tf.paragraphs:
            runs=[(r.text, (r.font.size.pt if r.font.size else 14), bool(r.font.bold)) for r in para.runs if r.text]
            if not runs: 
                total_h+= 14*96/72*1.2; continue
            maxpt=max(r[1] for r in runs)
            # split into word-runs
            wr=[]
            for t,sz,b in runs:
                parts=t.split(" ")
                for k,pp in enumerate(parts):
                    if pp=="" and k>0: continue
                    wr.append((pp,sz,b))
            ls=(para.line_spacing or 1.0)
            if not isinstance(ls,float) and not isinstance(ls,int): ls=1.0
            lines=wrap_lines(wr,bw-2) if tf.word_wrap else 1
            lh=maxpt*96/72*1.2*ls
            sa=(para.space_after.pt if para.space_after else 0)*96/72
            total_h+=lines*lh+sa
            # single-line-expected titles wrapping:
            if lines>1 and maxpt>=20:
                # only flag if box height clearly can't hold it
                pass
        ratio=total_h/bh if bh else 0
        if total_h>bh*1.08 and bh>0:
            txt=" | ".join(r.text for para in tf.paragraphs for r in para.runs)[:70]
            print(f"[S{si}] OVERFLOW? box {bw/96:.2f}x{bh/96:.2f}in textH~{total_h/96:.2f}in  '{txt}'")
            issues+=1
print("potential overflow boxes:", issues)

# ---- geometry bounds check ----
print("\n--- bounds ---")
p2=Presentation("MB-Intelligence-Apresentacao.pptx")
SWp, SHp = 13.333, 7.5
g=0
for si,slide in enumerate(p2.slides,1):
    for sh in slide.shapes:
        try:
            l=sh.left/914400; t=sh.top/914400; w=sh.width/914400; h=sh.height/914400
        except: continue
        r=l+w; b=t+h
        if r>SWp+0.02 or b>SHp+0.02 or l<-0.02 or t<-0.02:
            print(f"[S{si}] OFF-SLIDE {sh.shape_type} L{l:.2f} T{t:.2f} R{r:.2f} B{b:.2f}")
            g+=1
        elif sh.shape_type==13 and b>6.98:  # picture into footer zone
            print(f"[S{si}] PIC near footer B{b:.2f}")
            g+=1
print("bounds issues:", g)
