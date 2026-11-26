#!/usr/bin/env python3
"""Hand-author original anthropomorphic animal SVGs (V1 style) and rasterize to PNG.

Species intentionally NOT reused from prior Shorts
(quokka, red panda, axolotl, pangolin, lemur, capybara, wombat, hedgehog,
ferret, sugar glider, otter, beaver, alpaca, chinchilla, meerkat, fennec,
raccoon, wallaby, puffin, tortoise, tapir, flamingo, armadillo, platypus,
shiba, okapi, narwhal, badger, mandrill).

Cast: pika (gamer), aardvark (bug-fixing developer), worker (aardvark hard-hat),
walrus (boat captain), kinkajou (QA), binturong (cert), tired (bearded year-10),
grad (graduation).
"""
from pathlib import Path
import cairosvg

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "chars"
OUT.mkdir(parents=True, exist_ok=True)

W, H = 600, 800


def svg(body: str) -> str:
    return f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">
{body}
</svg>'''


def eyes(cx, cy, gap=34, r=7, look=0):
    return f'''
  <ellipse cx="{cx - gap}" cy="{cy}" rx="{r}" ry="{r + 1}" fill="#2a2118"/>
  <ellipse cx="{cx + gap}" cy="{cy}" rx="{r}" ry="{r + 1}" fill="#2a2118"/>
  <ellipse cx="{cx - gap + look}" cy="{cy - 2}" rx="2.2" ry="2.2" fill="#f7f0e4" opacity=".85"/>
  <ellipse cx="{cx + gap + look}" cy="{cy - 2}" rx="2.2" ry="2.2" fill="#f7f0e4" opacity=".85"/>'''


def mouth(kind, cx, cy):
    if kind == "open":
        return f'<ellipse cx="{cx}" cy="{cy}" rx="16" ry="14" fill="#3a2a24"/><ellipse cx="{cx}" cy="{cy + 4}" rx="10" ry="6" fill="#c47a7a"/>'
    if kind == "smile":
        return f'<path d="M{cx - 18},{cy} Q{cx},{cy + 16} {cx + 18},{cy}" fill="none" stroke="#3a2a24" stroke-width="5" stroke-linecap="round"/>'
    if kind == "o":
        return f'<ellipse cx="{cx}" cy="{cy}" rx="11" ry="13" fill="#3a2a24"/>'
    return f'<path d="M{cx - 14},{cy + 2} Q{cx},{cy + 8} {cx + 14},{cy + 2}" fill="none" stroke="#3a2a24" stroke-width="4" stroke-linecap="round"/>'


def paws(y=710, spread=70, color="#c4a07a"):
    return f'''
  <ellipse cx="{300 - spread}" cy="{y}" rx="28" ry="16" fill="{color}"/>
  <ellipse cx="{300 + spread}" cy="{y}" rx="28" ry="16" fill="{color}"/>
  <ellipse cx="{300 - spread}" cy="{y - 4}" rx="18" ry="8" fill="#000" opacity=".08"/>
  <ellipse cx="{300 + spread}" cy="{y - 4}" rx="18" ry="8" fill="#000" opacity=".08"/>'''


def arm(side, raise_arm, color="#c4a07a"):
    x = 190 if side == "L" else 410
    tip = 120 if raise_arm else 40
    y1, y2 = 470, 470 - tip if raise_arm else 560
    hand_y = y2 - 10
    return f'''
  <ellipse cx="{x}" cy="{(y1 + y2) / 2}" rx="22" ry="{abs(y2 - y1) / 2 + 10}" fill="{color}"/>
  <ellipse cx="{x + (-18 if side == 'L' and raise_arm else 18 if side == 'R' and raise_arm else 0)}" cy="{hand_y}" rx="20" ry="16" fill="{color}"/>'''


# ---------- Pika (puzzled gamer): headset + hoodie + shades ----------
def pika(pose="neutral"):
    m = {"neutral": "smile", "talk": "open", "point": "o", "wow": "open"}[pose]
    raise_r = pose in ("point", "wow")
    return svg(f'''
  <ellipse cx="300" cy="560" rx="115" ry="128" fill="#c8a078"/>
  <!-- hoodie -->
  <path d="M205,460 Q300,420 395,460 L410,650 Q300,680 190,650 Z" fill="#5a6a58"/>
  <path d="M230,485 Q300,450 370,485 L375,630 Q300,655 225,630 Z" fill="#6a7a68"/>
  <path d="M270,500 Q300,520 330,500" fill="none" stroke="#2a3830" stroke-width="6"/>
  <ellipse cx="300" cy="455" rx="68" ry="26" fill="#4a5848"/>
  <!-- round pika head + short rounded ears -->
  <ellipse cx="300" cy="290" rx="132" ry="118" fill="#d8b088"/>
  <ellipse cx="300" cy="310" rx="102" ry="88" fill="#e0c098"/>
  <ellipse cx="185" cy="200" rx="32" ry="42" fill="#d0a880"/>
  <ellipse cx="415" cy="200" rx="32" ry="42" fill="#d0a880"/>
  <ellipse cx="185" cy="205" rx="14" ry="22" fill="#f0c8b0"/>
  <ellipse cx="415" cy="205" rx="14" ry="22" fill="#f0c8b0"/>
  <!-- soft muzzle -->
  <ellipse cx="300" cy="348" rx="46" ry="30" fill="#f4e8d8"/>
  <ellipse cx="300" cy="338" rx="14" ry="10" fill="#2a2118"/>
  <!-- gaming headset -->
  <path d="M170,250 Q300,165 430,250" fill="none" stroke="#2a3038" stroke-width="16" stroke-linecap="round"/>
  <rect x="145" y="255" width="42" height="70" rx="12" fill="#3a4048"/>
  <rect x="413" y="255" width="42" height="70" rx="12" fill="#3a4048"/>
  <rect x="150" y="265" width="32" height="50" rx="8" fill="#1a2028"/>
  <rect x="418" y="265" width="32" height="50" rx="8" fill="#1a2028"/>
  <path d="M187,310 Q250,360 300,355" fill="none" stroke="#2a3038" stroke-width="8" stroke-linecap="round"/>
  <rect x="285" y="348" width="36" height="22" rx="8" fill="#4a5058"/>
  <!-- round shades -->
  <circle cx="262" cy="285" r="28" fill="#1a2428" opacity=".9"/>
  <circle cx="338" cy="285" r="28" fill="#1a2428" opacity=".9"/>
  <path d="M290,285 H310" stroke="#6a7a68" stroke-width="5"/>
  {eyes(300, 275, gap=38, look=3 if pose == 'point' else 0)}
  {mouth(m, 300, 385)}
  {arm('L', False, '#d8b088')}
  {arm('R', raise_r, '#d8b088')}
  {paws(color='#c8a078')}
''')


# ---------- Aardvark (developer): beanie + hoodie + shades ----------
def aardvark(pose="neutral"):
    m = {"neutral": "smile", "talk": "open", "point": "o", "wow": "open"}[pose]
    raise_r = pose in ("point", "wow")
    return svg(f'''
  <ellipse cx="300" cy="560" rx="120" ry="130" fill="#8a6a48"/>
  <!-- hoodie -->
  <path d="M205,455 Q300,420 395,455 L408,645 Q300,675 192,645 Z" fill="#3a4858"/>
  <path d="M230,480 Q300,448 370,480 L375,625 Q300,650 225,625 Z" fill="#4a5868"/>
  <ellipse cx="300" cy="450" rx="70" ry="26" fill="#2a3848"/>
  <!-- long tubular snout (aardvark) -->
  <ellipse cx="300" cy="285" rx="128" ry="115" fill="#a87850"/>
  <ellipse cx="300" cy="305" rx="100" ry="88" fill="#b88860"/>
  <ellipse cx="175" cy="210" rx="26" ry="36" fill="#9a6840"/>
  <ellipse cx="425" cy="210" rx="26" ry="36" fill="#9a6840"/>
  <ellipse cx="175" cy="215" rx="10" ry="18" fill="#e8b4a0"/>
  <ellipse cx="425" cy="215" rx="10" ry="18" fill="#e8b4a0"/>
  <ellipse cx="300" cy="360" rx="55" ry="38" fill="#c89870"/>
  <ellipse cx="300" cy="375" rx="38" ry="28" fill="#b88860"/>
  <ellipse cx="300" cy="390" rx="18" ry="12" fill="#2a2118"/>
  <!-- knit beanie -->
  <path d="M175,230 Q300,120 425,230 Q300,200 175,230 Z" fill="#6b8f6a"/>
  <ellipse cx="300" cy="210" rx="120" ry="40" fill="#5a7f5a"/>
  <ellipse cx="300" cy="155" rx="22" ry="18" fill="#7a9f7a"/>
  <!-- shades -->
  <rect x="228" y="268" width="58" height="38" rx="10" fill="#1a2428" opacity=".92"/>
  <rect x="314" y="268" width="58" height="38" rx="10" fill="#1a2428" opacity=".92"/>
  <path d="M286,287 H314" stroke="#6b8f6a" stroke-width="5"/>
  {eyes(300, 280, gap=42, look=2 if pose == 'point' else 0)}
  {mouth(m, 300, 420)}
  {arm('L', False, '#b88860')}
  {arm('R', raise_r, '#b88860')}
  {paws(color='#8a6a48')}
''')


# ---------- Worker aardvark: hard hat + hi-vis ----------
def worker(pose="neutral"):
    m = {"neutral": "smile", "talk": "open", "point": "o", "wow": "open"}[pose]
    raise_r = pose in ("point", "wow")
    return svg(f'''
  <ellipse cx="300" cy="560" rx="120" ry="130" fill="#8a6a48"/>
  <!-- hi-vis vest -->
  <path d="M210,455 Q300,425 390,455 L400,640 Q300,670 200,640 Z" fill="#c4a35a"/>
  <path d="M235,480 Q300,450 365,480 L370,620 Q300,645 230,620 Z" fill="#2a3848"/>
  <rect x="250" y="500" width="20" height="90" fill="#c4a35a"/>
  <rect x="330" y="500" width="20" height="90" fill="#c4a35a"/>
  <!-- head + snout -->
  <ellipse cx="300" cy="285" rx="128" ry="115" fill="#a87850"/>
  <ellipse cx="300" cy="305" rx="100" ry="88" fill="#b88860"/>
  <ellipse cx="175" cy="215" rx="26" ry="36" fill="#9a6840"/>
  <ellipse cx="425" cy="215" rx="26" ry="36" fill="#9a6840"/>
  <ellipse cx="300" cy="360" rx="55" ry="38" fill="#c89870"/>
  <ellipse cx="300" cy="390" rx="18" ry="12" fill="#2a2118"/>
  <!-- hard hat -->
  <ellipse cx="300" cy="200" rx="145" ry="28" fill="#c4a35a"/>
  <ellipse cx="300" cy="175" rx="115" ry="55" fill="#e0c070"/>
  <ellipse cx="300" cy="155" rx="70" ry="22" fill="#d0b060"/>
  <rect x="288" y="118" width="24" height="28" rx="4" fill="#8a7030"/>
  <!-- safety shades -->
  <rect x="230" y="260" width="55" height="40" rx="10" fill="#1a3038" opacity=".9"/>
  <rect x="315" y="260" width="55" height="40" rx="10" fill="#1a3038" opacity=".9"/>
  <path d="M285,280 H315" stroke="#c4a35a" stroke-width="5"/>
  {eyes(300, 275, gap=40, look=2 if pose == 'point' else 0)}
  {mouth(m, 300, 420)}
  {arm('L', False, '#b88860')}
  {arm('R', raise_r, '#b88860')}
  {paws(color='#8a6a48')}
''')


# ---------- Walrus (boat captain) ----------
def walrus(pose="neutral"):
    m = {"neutral": "smile", "talk": "open", "point": "o", "wow": "open"}[pose]
    raise_r = pose in ("point", "wow")
    return svg(f'''
  <ellipse cx="300" cy="565" rx="130" ry="125" fill="#8a7a70"/>
  <!-- captain jacket -->
  <path d="M200,460 Q300,425 400,460 L410,645 Q300,675 190,645 Z" fill="#3a4858"/>
  <path d="M225,485 Q300,450 375,485 L380,625 Q300,650 220,625 Z" fill="#4a5868"/>
  <rect x="280" y="500" width="40" height="80" fill="#c4a35a"/>
  <!-- round walrus head -->
  <ellipse cx="300" cy="290" rx="145" ry="125" fill="#b8a090"/>
  <ellipse cx="300" cy="310" rx="115" ry="95" fill="#c8b0a0"/>
  <!-- tusks -->
  <path d="M265,360 L255,450 L275,450 Z" fill="#f4f0ea"/>
  <path d="M335,360 L345,450 L325,450 Z" fill="#f4f0ea"/>
  <ellipse cx="300" cy="350" rx="40" ry="28" fill="#a89080"/>
  <ellipse cx="300" cy="340" rx="14" ry="10" fill="#2a2118"/>
  <!-- small ears -->
  <ellipse cx="170" cy="240" rx="20" ry="28" fill="#a89080"/>
  <ellipse cx="430" cy="240" rx="20" ry="28" fill="#a89080"/>
  <!-- captain hat -->
  <ellipse cx="300" cy="195" rx="130" ry="22" fill="#2a3038"/>
  <rect x="210" y="130" width="180" height="70" rx="8" fill="#3a4858"/>
  <rect x="210" y="155" width="180" height="18" fill="#c4a35a"/>
  <ellipse cx="300" cy="130" rx="50" ry="12" fill="#2a3038"/>
  <!-- shades -->
  <circle cx="260" cy="280" r="26" fill="#1a2428" opacity=".9"/>
  <circle cx="340" cy="280" r="26" fill="#1a2428" opacity=".9"/>
  <path d="M286,280 H314" stroke="#c4a35a" stroke-width="4"/>
  {eyes(300, 275, gap=40, look=-2 if pose == 'wow' else 0)}
  {mouth(m, 300, 400)}
  {arm('L', False, '#c8b0a0')}
  {arm('R', raise_r, '#c8b0a0')}
  {paws(color='#8a7a70')}
''')


# ---------- Kinkajou (QA tester): TESTER cap + clipboard ----------
def kinkajou(pose="neutral"):
    m = {"neutral": "smile", "talk": "open", "point": "o", "wow": "open"}[pose]
    raise_r = pose in ("point", "wow")
    return svg(f'''
  <ellipse cx="300" cy="560" rx="112" ry="128" fill="#c49050"/>
  <!-- tee -->
  <path d="M210,460 Q300,425 390,460 L400,645 Q300,675 200,645 Z" fill="#4a6a88"/>
  <path d="M235,485 Q300,455 365,485 L370,625 Q300,650 230,625 Z" fill="#5a7a98"/>
  <!-- TESTER text bar -->
  <rect x="245" y="520" width="110" height="28" rx="4" fill="#ebe4dc"/>
  <rect x="255" y="528" width="18" height="12" fill="#2a2118"/>
  <rect x="280" y="528" width="18" height="12" fill="#2a2118"/>
  <rect x="305" y="528" width="18" height="12" fill="#2a2118"/>
  <rect x="330" y="528" width="14" height="12" fill="#2a2118"/>
  <!-- golden-brown kinkajou head + round ears -->
  <ellipse cx="300" cy="290" rx="130" ry="118" fill="#d8a860"/>
  <ellipse cx="300" cy="310" rx="100" ry="90" fill="#e0b870"/>
  <ellipse cx="185" cy="205" rx="30" ry="34" fill="#c89850"/>
  <ellipse cx="415" cy="205" rx="30" ry="34" fill="#c89850"/>
  <ellipse cx="185" cy="210" rx="12" ry="16" fill="#f0c8a0"/>
  <ellipse cx="415" cy="210" rx="12" ry="16" fill="#f0c8a0"/>
  <ellipse cx="300" cy="345" rx="42" ry="28" fill="#f4e8d8"/>
  <ellipse cx="300" cy="335" rx="14" ry="10" fill="#2a2118"/>
  <!-- TESTER cap -->
  <ellipse cx="300" cy="205" rx="125" ry="28" fill="#2a3848"/>
  <path d="M190,210 Q300,140 410,210 Z" fill="#3a4858"/>
  <rect x="235" y="175" width="130" height="22" rx="4" fill="#c4a35a"/>
  <!-- clipboard in L hand -->
  <rect x="115" y="500" width="70" height="95" rx="4" fill="#5a4030"/>
  <rect x="122" y="512" width="56" height="75" rx="2" fill="#ebe4dc"/>
  <rect x="130" y="525" width="40" height="6" fill="#8a9a88"/>
  <rect x="130" y="540" width="36" height="6" fill="#8a9a88"/>
  <rect x="130" y="555" width="30" height="6" fill="#c45848"/>
  <!-- shades -->
  <rect x="230" y="268" width="55" height="36" rx="8" fill="#1a2428" opacity=".9"/>
  <rect x="315" y="268" width="55" height="36" rx="8" fill="#1a2428" opacity=".9"/>
  <path d="M285,286 H315" stroke="#4a6a88" stroke-width="4"/>
  {eyes(300, 275, gap=40, look=2 if pose == 'point' else 0)}
  {mouth(m, 300, 385)}
  {arm('L', False, '#e0b870')}
  {arm('R', raise_r, '#e0b870')}
  {paws(color='#c49050')}
''')


# ---------- Binturong (cert inspector): visor + tie + stamp ----------
def binturong(pose="neutral"):
    m = {"neutral": "smile", "talk": "open", "point": "o", "wow": "open"}[pose]
    raise_r = pose in ("point", "wow")
    return svg(f'''
  <ellipse cx="300" cy="560" rx="125" ry="130" fill="#5a4838"/>
  <!-- shirt + tie -->
  <path d="M205,455 Q300,420 395,455 L408,645 Q300,675 192,645 Z" fill="#ebe4dc"/>
  <path d="M285,470 L315,470 L330,620 L270,620 Z" fill="#c45848"/>
  <path d="M300,470 L315,490 L300,510 L285,490 Z" fill="#a03830"/>
  <!-- shaggy dark head -->
  <ellipse cx="300" cy="285" rx="138" ry="120" fill="#6a5848"/>
  <ellipse cx="300" cy="305" rx="108" ry="92" fill="#7a6858"/>
  <!-- tufted ears -->
  <ellipse cx="175" cy="195" rx="32" ry="40" fill="#5a4838"/>
  <ellipse cx="425" cy="195" rx="32" ry="40" fill="#5a4838"/>
  <ellipse cx="175" cy="185" rx="10" ry="16" fill="#4a3830"/>
  <ellipse cx="425" cy="185" rx="10" ry="16" fill="#4a3830"/>
  <ellipse cx="300" cy="345" rx="48" ry="32" fill="#9a8878"/>
  <ellipse cx="300" cy="335" rx="14" ry="10" fill="#2a2118"/>
  <!-- inspector visor -->
  <ellipse cx="300" cy="205" rx="140" ry="24" fill="#2a3038"/>
  <path d="M170,215 Q300,155 430,215" fill="none" stroke="#3a4858" stroke-width="28" stroke-linecap="round"/>
  <rect x="175" y="220" width="250" height="28" rx="4" fill="#1a2428" opacity=".55"/>
  <!-- red-frame shades -->
  <rect x="228" y="268" width="58" height="38" rx="8" fill="#1a2428" opacity=".9"/>
  <rect x="314" y="268" width="58" height="38" rx="8" fill="#1a2428" opacity=".9"/>
  <path d="M286,287 H314" stroke="#c45848" stroke-width="5"/>
  <!-- stamp in R hand when pointing -->
  <rect x="400" y="{420 if raise_r else 530}" width="50" height="40" rx="4" fill="#c45848"/>
  <rect x="415" y="{400 if raise_r else 510}" width="20" height="30" rx="3" fill="#8a3030"/>
  {eyes(300, 275, gap=42, look=2 if pose == 'point' else 0)}
  {mouth(m, 300, 390)}
  {arm('L', False, '#7a6858')}
  {arm('R', raise_r, '#7a6858')}
  {paws(color='#5a4838')}
''')


# ---------- Tired bearded aardvark (YEAR 10) ----------
def tired(pose="neutral"):
    m = {"neutral": "smile", "talk": "open", "point": "o", "wow": "open"}[pose]
    raise_r = pose in ("point", "wow")
    return svg(f'''
  <ellipse cx="300" cy="560" rx="120" ry="130" fill="#8a6a48"/>
  <!-- rumpled hoodie -->
  <path d="M205,455 Q300,420 395,455 L408,645 Q300,675 192,645 Z" fill="#4a4038"/>
  <path d="M230,480 Q300,448 370,480 L375,625 Q300,650 225,625 Z" fill="#5a5048"/>
  <ellipse cx="300" cy="450" rx="70" ry="26" fill="#3a3028"/>
  <!-- head -->
  <ellipse cx="300" cy="285" rx="128" ry="115" fill="#a87850"/>
  <ellipse cx="300" cy="305" rx="100" ry="88" fill="#b88860"/>
  <ellipse cx="175" cy="210" rx="26" ry="36" fill="#9a6840"/>
  <ellipse cx="425" cy="210" rx="26" ry="36" fill="#9a6840"/>
  <ellipse cx="300" cy="360" rx="55" ry="38" fill="#c89870"/>
  <ellipse cx="300" cy="390" rx="18" ry="12" fill="#2a2118"/>
  <!-- beard -->
  <ellipse cx="300" cy="420" rx="70" ry="45" fill="#6a5040"/>
  <ellipse cx="260" cy="400" rx="28" ry="30" fill="#7a6050"/>
  <ellipse cx="340" cy="400" rx="28" ry="30" fill="#7a6050"/>
  <!-- messy beanie -->
  <path d="M175,230 Q300,125 425,230 Q300,205 175,230 Z" fill="#5a4030"/>
  <ellipse cx="300" cy="210" rx="118" ry="38" fill="#4a3020"/>
  <ellipse cx="320" cy="160" rx="20" ry="16" fill="#6a5040"/>
  <!-- tired shades -->
  <rect x="228" y="268" width="58" height="38" rx="10" fill="#1a2428" opacity=".85"/>
  <rect x="314" y="268" width="58" height="38" rx="10" fill="#1a2428" opacity=".85"/>
  <path d="M286,287 H314" stroke="#8a6a48" stroke-width="4"/>
  <!-- coffee cup L -->
  <rect x="130" y="520" width="50" height="60" rx="6" fill="#ebe4dc"/>
  <rect x="135" y="525" width="40" height="15" fill="#5a4030"/>
  <path d="M180,540 Q200,550 180,570" fill="none" stroke="#c4a35a" stroke-width="6"/>
  {eyes(300, 280, gap=42, look=0)}
  {mouth(m, 300, 405)}
  {arm('L', False, '#b88860')}
  {arm('R', raise_r, '#b88860')}
  {paws(color='#8a6a48')}
''')


# ---------- Grad aardvark ----------
def grad(pose="neutral"):
    m = {"neutral": "smile", "talk": "open", "point": "o", "wow": "open"}[pose]
    raise_r = pose in ("point", "wow")
    return svg(f'''
  <ellipse cx="300" cy="560" rx="120" ry="130" fill="#8a6a48"/>
  <!-- gown -->
  <path d="M200,450 Q300,415 400,450 L415,660 Q300,690 185,660 Z" fill="#2a3038"/>
  <path d="M225,480 Q300,445 375,480 L385,640 Q300,665 215,640 Z" fill="#3a4048"/>
  <!-- gold sash -->
  <path d="M195,470 L410,610 L385,640 L170,500 Z" fill="#e0c070"/>
  <!-- diploma -->
  <rect x="400" y="500" width="70" height="50" rx="4" fill="#ebe4dc" transform="rotate(-15 435 525)"/>
  <rect x="410" y="510" width="50" height="8" fill="#c4a35a" transform="rotate(-15 435 514)"/>
  <!-- head -->
  <ellipse cx="300" cy="285" rx="128" ry="115" fill="#a87850"/>
  <ellipse cx="300" cy="305" rx="100" ry="88" fill="#b88860"/>
  <ellipse cx="175" cy="215" rx="26" ry="36" fill="#9a6840"/>
  <ellipse cx="425" cy="215" rx="26" ry="36" fill="#9a6840"/>
  <ellipse cx="300" cy="360" rx="55" ry="38" fill="#c89870"/>
  <ellipse cx="300" cy="390" rx="18" ry="12" fill="#2a2118"/>
  <!-- mortarboard -->
  <rect x="175" y="155" width="250" height="30" rx="2" fill="#1a2028"/>
  <path d="M300,155 L175,155 L300,100 L425,155 Z" fill="#2a3038"/>
  <rect x="295" y="100" width="10" height="60" fill="#c4a35a"/>
  <path d="M300,155 Q360,200 380,240" fill="none" stroke="#c4a35a" stroke-width="6"/>
  <rect x="370" y="235" width="24" height="18" fill="#c45848"/>
  <!-- proud shades -->
  <circle cx="260" cy="280" r="26" fill="#1a2428" opacity=".9"/>
  <circle cx="340" cy="280" r="26" fill="#1a2428" opacity=".9"/>
  <path d="M286,280 H314" stroke="#e0c070" stroke-width="5"/>
  {eyes(300, 275, gap=40, look=2 if pose == 'point' else 0)}
  {mouth(m, 300, 420)}
  {arm('L', False, '#b88860')}
  {arm('R', raise_r, '#b88860')}
  {paws(color='#8a6a48')}
''')


CHARS = {
    "pika": pika,
    "aardvark": aardvark,
    "worker": worker,
    "walrus": walrus,
    "kinkajou": kinkajou,
    "binturong": binturong,
    "tired": tired,
    "grad": grad,
}
POSES = ["neutral", "talk", "point", "wow"]


def main():
    for name, fn in CHARS.items():
        for pose in POSES:
            raw = fn(pose)
            svg_path = OUT / f"{name}-{pose}.svg"
            png_path = OUT / f"{name}-{pose}.png"
            svg_path.write_text(raw)
            cairosvg.svg2png(bytestring=raw.encode("utf-8"), write_to=str(png_path),
                             output_width=W, output_height=H)
            print("wrote", png_path.name)


if __name__ == "__main__":
    main()
