#!/usr/bin/env python3
"""Hand-author original anthropomorphic animal SVGs (V1 style) and rasterize to PNG.

Species intentionally NOT reused from prior Shorts
(quokka, red panda, axolotl, pangolin, lemur, capybara, wombat, hedgehog,
ferret, sugar glider, otter, beaver, alpaca, chinchilla, meerkat, fennec,
raccoon, wallaby, puffin, tortoise, tapir, flamingo, armadillo, platypus).

Cast: shiba (gamer), okapi (factory), narwhal (gold master), badger (bug fixer),
mandrill (cert inspector), coast (shiba + soda coaster), grad (shiba graduate).
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


# ---------- Shiba (excited gamer): headset + hoodie + sealed game case ----------
def shiba(pose="neutral"):
    m = {"neutral": "smile", "talk": "open", "point": "o", "wow": "open"}[pose]
    raise_r = pose in ("point", "wow")
    return svg(f'''
  <ellipse cx="300" cy="560" rx="118" ry="130" fill="#d8a878"/>
  <!-- hoodie -->
  <path d="M205,460 Q300,420 395,460 L410,650 Q300,680 190,650 Z" fill="#4a6a88"/>
  <path d="M230,485 Q300,450 370,485 L375,630 Q300,655 225,630 Z" fill="#5a7a98"/>
  <path d="M270,500 Q300,520 330,500" fill="none" stroke="#2a3848" stroke-width="6"/>
  <ellipse cx="300" cy="455" rx="70" ry="28" fill="#3a5468"/>
  <!-- sealed game case (L hand) -->
  <rect x="120" y="500" width="78" height="100" rx="6" fill="#2a3848"/>
  <rect x="128" y="510" width="62" height="70" rx="4" fill="#3a5868"/>
  <rect x="140" y="530" width="38" height="10" rx="2" fill="#c4a35a"/>
  <rect x="145" y="550" width="28" height="6" rx="2" fill="#8ab0c0"/>
  <rect x="150" y="565" width="20" height="6" rx="2" fill="#6b8f6a"/>
  <!-- head -->
  <ellipse cx="300" cy="290" rx="135" ry="120" fill="#e0b888"/>
  <ellipse cx="300" cy="310" rx="105" ry="90" fill="#e8c898"/>
  <!-- shiba cheeks + muzzle -->
  <ellipse cx="230" cy="320" rx="28" ry="20" fill="#f0a090" opacity=".55"/>
  <ellipse cx="370" cy="320" rx="28" ry="20" fill="#f0a090" opacity=".55"/>
  <ellipse cx="300" cy="345" rx="48" ry="32" fill="#f4e8d8"/>
  <ellipse cx="300" cy="335" rx="16" ry="12" fill="#2a2118"/>
  <!-- pointed shiba ears -->
  <path d="M175,210 L155,110 L230,195 Z" fill="#d8a878"/>
  <path d="M425,210 L445,110 L370,195 Z" fill="#d8a878"/>
  <path d="M180,205 L168,130 L220,190 Z" fill="#f0c0a8"/>
  <path d="M420,205 L432,130 L380,190 Z" fill="#f0c0a8"/>
  <!-- gaming headset -->
  <path d="M170,250 Q300,160 430,250" fill="none" stroke="#2a3038" stroke-width="16" stroke-linecap="round"/>
  <rect x="145" y="255" width="42" height="70" rx="12" fill="#3a4048"/>
  <rect x="413" y="255" width="42" height="70" rx="12" fill="#3a4048"/>
  <rect x="150" y="265" width="32" height="50" rx="8" fill="#1a2028"/>
  <rect x="418" y="265" width="32" height="50" rx="8" fill="#1a2028"/>
  <path d="M187,310 Q250,360 300,355" fill="none" stroke="#2a3038" stroke-width="8" stroke-linecap="round"/>
  <rect x="285" y="348" width="36" height="22" rx="8" fill="#4a5058"/>
  <!-- round gamer shades -->
  <circle cx="262" cy="285" r="28" fill="#1a2428" opacity=".9"/>
  <circle cx="338" cy="285" r="28" fill="#1a2428" opacity=".9"/>
  <path d="M290,285 H310" stroke="#5a7a98" stroke-width="5"/>
  <circle cx="252" cy="278" r="6" fill="#8ab" opacity=".3"/>
  <circle cx="328" cy="278" r="6" fill="#8ab" opacity=".3"/>
  {eyes(300, 275, gap=38, look=3 if pose == 'point' else 0)}
  {mouth(m, 300, 385)}
  {arm('L', False, '#e0b888')}
  {arm('R', raise_r, '#e0b888')}
  {paws(color='#d8a878')}
''')


# ---------- Okapi (factory worker): hard hat + safety vest ----------
def okapi(pose="neutral"):
    m = {"neutral": "smile", "talk": "open", "point": "o", "wow": "open"}[pose]
    raise_r = pose in ("point", "wow")
    return svg(f'''
  <ellipse cx="300" cy="560" rx="120" ry="132" fill="#6a5240"/>
  <!-- zebra-stripe haunches hint -->
  <path d="M360,520 Q400,560 380,640" fill="none" stroke="#ebe4dc" stroke-width="10"/>
  <path d="M380,500 Q420,550 400,630" fill="none" stroke="#ebe4dc" stroke-width="8"/>
  <path d="M220,520 Q180,560 200,640" fill="none" stroke="#ebe4dc" stroke-width="10"/>
  <!-- safety vest -->
  <path d="M210,455 Q300,425 390,455 L400,640 Q300,670 200,640 Z" fill="#c4a35a"/>
  <path d="M235,480 Q300,450 365,480 L370,620 Q300,645 230,620 Z" fill="#2a3848"/>
  <rect x="250" y="500" width="20" height="90" fill="#c4a35a"/>
  <rect x="330" y="500" width="20" height="90" fill="#c4a35a"/>
  <!-- head -->
  <ellipse cx="300" cy="285" rx="130" ry="118" fill="#8a6a50"/>
  <ellipse cx="300" cy="305" rx="100" ry="88" fill="#9a7a60"/>
  <ellipse cx="300" cy="340" rx="42" ry="28" fill="#5a4030"/>
  <ellipse cx="300" cy="330" rx="14" ry="10" fill="#2a2118"/>
  <!-- okapi ears + forehead stripes -->
  <ellipse cx="185" cy="195" rx="28" ry="40" fill="#7a5a40"/>
  <ellipse cx="415" cy="195" rx="28" ry="40" fill="#7a5a40"/>
  <ellipse cx="185" cy="200" rx="12" ry="20" fill="#e8b4a0"/>
  <ellipse cx="415" cy="200" rx="12" ry="20" fill="#e8b4a0"/>
  <path d="M250,210 Q270,240 255,270" fill="none" stroke="#ebe4dc" stroke-width="7"/>
  <path d="M350,210 Q330,240 345,270" fill="none" stroke="#ebe4dc" stroke-width="7"/>
  <path d="M280,200 Q300,230 280,265" fill="none" stroke="#ebe4dc" stroke-width="6"/>
  <path d="M320,200 Q300,230 320,265" fill="none" stroke="#ebe4dc" stroke-width="6"/>
  <!-- yellow hard hat (dome + brim) -->
  <ellipse cx="300" cy="200" rx="145" ry="28" fill="#c4a35a"/>
  <ellipse cx="300" cy="175" rx="115" ry="55" fill="#e0c070"/>
  <ellipse cx="300" cy="155" rx="70" ry="22" fill="#d0b060"/>
  <rect x="288" y="118" width="24" height="28" rx="4" fill="#8a7030"/>
  <!-- safety shades -->
  <rect x="230" y="260" width="55" height="40" rx="10" fill="#1a3038" opacity=".9"/>
  <rect x="315" y="260" width="55" height="40" rx="10" fill="#1a3038" opacity=".9"/>
  <path d="M285,280 H315" stroke="#c4a35a" stroke-width="5"/>
  {eyes(300, 275, gap=40, look=2 if pose == 'point' else 0)}
  {mouth(m, 300, 385)}
  {arm('L', False, '#9a7a60')}
  {arm('R', raise_r, '#9a7a60')}
  {paws(color='#5a4030')}
''')


# ---------- Narwhal (gold master): gold sash + medal ----------
def narwhal(pose="neutral"):
    m = {"neutral": "smile", "talk": "open", "point": "o", "wow": "open"}[pose]
    raise_r = pose in ("point", "wow")
    return svg(f'''
  <ellipse cx="300" cy="565" rx="125" ry="128" fill="#8ab0c0"/>
  <!-- studio hoodie -->
  <path d="M205,460 Q300,425 395,460 L405,645 Q300,675 195,645 Z" fill="#3a4858"/>
  <path d="M230,485 Q300,450 370,485 L375,625 Q300,650 225,625 Z" fill="#4a5868"/>
  <!-- GOLD MASTER sash across body -->
  <path d="M195,470 L410,610 L385,640 L170,500 Z" fill="#e0c070"/>
  <path d="M205,485 L390,610" fill="none" stroke="#c4a35a" stroke-width="3"/>
  <rect x="240" y="520" width="70" height="14" rx="3" fill="#2a2118" transform="rotate(-32 275 527)"/>
  <rect x="255" y="545" width="55" height="10" rx="2" fill="#2a2118" transform="rotate(-32 282 550)"/>
  <!-- medal -->
  <circle cx="255" cy="500" r="26" fill="#e8d080"/>
  <circle cx="255" cy="500" r="18" fill="#c4a35a"/>
  <path d="M255,485 L262,500 L255,515 L248,500 Z" fill="#f4f0ea"/>
  <!-- head (rounded whale) -->
  <ellipse cx="300" cy="285" rx="140" ry="120" fill="#a8c8d4"/>
  <ellipse cx="300" cy="305" rx="110" ry="92" fill="#b8d4e0"/>
  <!-- narwhal tusk -->
  <path d="M300,175 L310,40 L290,40 Z" fill="#f4f0ea"/>
  <path d="M295,160 L305,55" fill="none" stroke="#d8d0c0" stroke-width="3"/>
  <!-- small ears / flipper nubs -->
  <ellipse cx="175" cy="250" rx="22" ry="30" fill="#8ab0c0"/>
  <ellipse cx="425" cy="250" rx="22" ry="30" fill="#8ab0c0"/>
  <!-- soft muzzle -->
  <ellipse cx="300" cy="345" rx="50" ry="30" fill="#d8e8f0"/>
  <ellipse cx="290" cy="340" rx="6" ry="5" fill="#2a2118"/>
  <ellipse cx="310" cy="340" rx="6" ry="5" fill="#2a2118"/>
  <!-- gold-rimmed shades -->
  <circle cx="260" cy="280" r="28" fill="#1a2428" opacity=".9"/>
  <circle cx="340" cy="280" r="28" fill="#1a2428" opacity=".9"/>
  <path d="M288,280 H312" stroke="#e0c070" stroke-width="5"/>
  <circle cx="250" cy="272" r="6" fill="#e0c070" opacity=".35"/>
  <!-- tiny gold crown hat -->
  <path d="M240,195 L255,155 L275,185 L300,145 L325,185 L345,155 L360,195 Z" fill="#e0c070"/>
  <ellipse cx="300" cy="195" rx="65" ry="12" fill="#c4a35a"/>
  {eyes(300, 270, gap=40, look=3 if pose == 'point' else 0)}
  {mouth(m, 300, 390)}
  {arm('L', False, '#a8c8d4')}
  {arm('R', raise_r, '#a8c8d4')}
  {paws(color='#8ab0c0')}
''')


# ---------- Badger (bug fixer): beanie + fly swatter ----------
def badger(pose="neutral"):
    m = {"neutral": "smile", "talk": "open", "point": "o", "wow": "open"}[pose]
    raise_r = pose in ("point", "wow")
    return svg(f'''
  <ellipse cx="300" cy="560" rx="118" ry="130" fill="#4a4850"/>
  <!-- coder tee -->
  <path d="M210,460 Q300,425 390,460 L400,640 Q300,670 200,640 Z" fill="#6b8f6a"/>
  <path d="M235,485 Q300,455 365,485 L370,620 Q300,645 230,620 Z" fill="#7a9f7a"/>
  <text x="255" y="545" font-family="sans-serif" font-size="22" font-weight="700" fill="#f0e6d0">FIX</text>
  <!-- head with badger stripes -->
  <ellipse cx="300" cy="290" rx="135" ry="120" fill="#ebe4dc"/>
  <ellipse cx="300" cy="310" rx="105" ry="90" fill="#f4f0ea"/>
  <path d="M220,220 Q260,300 240,360 Q210,300 220,220 Z" fill="#2a2828"/>
  <path d="M380,220 Q340,300 360,360 Q390,300 380,220 Z" fill="#2a2828"/>
  <ellipse cx="300" cy="345" rx="42" ry="28" fill="#d8d0c8"/>
  <ellipse cx="300" cy="335" rx="14" ry="10" fill="#2a2118"/>
  <!-- round ears -->
  <ellipse cx="185" cy="200" rx="26" ry="32" fill="#4a4850"/>
  <ellipse cx="415" cy="200" rx="26" ry="32" fill="#4a4850"/>
  <ellipse cx="185" cy="205" rx="12" ry="16" fill="#e8b4a0"/>
  <ellipse cx="415" cy="205" rx="12" ry="16" fill="#e8b4a0"/>
  <!-- knit beanie -->
  <ellipse cx="300" cy="195" rx="120" ry="30" fill="#c45848"/>
  <path d="M190,200 Q300,120 410,200" fill="#d46858"/>
  <circle cx="300" cy="125" r="16" fill="#ebe4dc"/>
  <!-- round bug-hunter shades -->
  <circle cx="255" cy="280" r="26" fill="#1a2428" opacity=".88"/>
  <circle cx="345" cy="280" r="26" fill="#1a2428" opacity=".88"/>
  <path d="M281,280 H319" stroke="#6b8f6a" stroke-width="4"/>
  <!-- fly swatter (raised) -->
  <rect x="430" y="220" width="10" height="160" rx="3" fill="#5a4030"/>
  <rect x="405" y="175" width="60" height="55" rx="8" fill="#3a4858"/>
  <path d="M415,185 H455 M415,200 H455 M415,215 H455 M420,180 V220 M435,180 V220 M450,180 V220" stroke="#8ab0c0" stroke-width="2"/>
  {eyes(300, 275, gap=45, look=4 if pose == 'point' else 0)}
  {mouth(m, 300, 390)}
  {arm('L', False, '#ebe4dc')}
  {arm('R', raise_r, '#ebe4dc')}
  {paws(color='#4a4850')}
''')


# ---------- Mandrill (cert inspector): visor + clipboard + stamp ----------
def mandrill(pose="neutral"):
    m = {"neutral": "smile", "talk": "open", "point": "o", "wow": "open"}[pose]
    raise_r = pose in ("point", "wow")
    return svg(f'''
  <ellipse cx="300" cy="560" rx="120" ry="132" fill="#6a5a48"/>
  <!-- inspector coat -->
  <path d="M205,455 Q300,420 395,455 L405,645 Q300,675 195,645 Z" fill="#ebe4dc"/>
  <path d="M230,480 Q300,445 370,480 L375,625 Q300,650 225,625 Z" fill="#f4f0ea"/>
  <rect x="290" y="500" width="20" height="110" fill="#c45848"/>
  <!-- clipboard -->
  <rect x="115" y="490" width="80" height="105" rx="6" fill="#d8c8a0"/>
  <rect x="125" y="505" width="60" height="8" rx="2" fill="#2a2118"/>
  <rect x="125" y="522" width="50" height="6" rx="2" fill="#6b8f6a"/>
  <rect x="125" y="536" width="55" height="6" rx="2" fill="#c45848"/>
  <rect x="125" y="550" width="40" height="6" rx="2" fill="#4a8a98"/>
  <!-- red stamp -->
  <rect x="420" y="500" width="55" height="70" rx="6" fill="#c45848"/>
  <rect x="428" y="510" width="40" height="12" rx="2" fill="#f4f0ea"/>
  <text x="430" y="555" font-family="sans-serif" font-size="11" font-weight="700" fill="#f4f0ea">FAIL</text>
  <!-- head with colorful mandrill face -->
  <ellipse cx="300" cy="290" rx="135" ry="120" fill="#8a7a68"/>
  <ellipse cx="300" cy="310" rx="105" ry="90" fill="#9a8a78"/>
  <!-- mandrill snout: red nose + short blue side ridges (not tear streaks) -->
  <ellipse cx="300" cy="345" rx="55" ry="48" fill="#c45848"/>
  <ellipse cx="255" cy="330" rx="28" ry="22" fill="#4a8a98"/>
  <ellipse cx="345" cy="330" rx="28" ry="22" fill="#4a8a98"/>
  <ellipse cx="245" cy="345" rx="18" ry="14" fill="#3a7a88"/>
  <ellipse cx="355" cy="345" rx="18" ry="14" fill="#3a7a88"/>
  <ellipse cx="300" cy="365" rx="22" ry="14" fill="#2a2118"/>
  <!-- ears -->
  <ellipse cx="175" cy="230" rx="28" ry="34" fill="#7a6a58"/>
  <ellipse cx="425" cy="230" rx="28" ry="34" fill="#7a6a58"/>
  <ellipse cx="175" cy="235" rx="12" ry="16" fill="#e8b4a0"/>
  <ellipse cx="425" cy="235" rx="12" ry="16" fill="#e8b4a0"/>
  <!-- inspector visor hat -->
  <ellipse cx="300" cy="185" rx="130" ry="28" fill="#2a3848"/>
  <path d="M180,195 Q300,125 420,195" fill="#3a4858"/>
  <rect x="175" y="200" width="250" height="22" rx="4" fill="#1a2838"/>
  <rect x="190" y="204" width="220" height="14" rx="3" fill="#4a8a98" opacity=".55"/>
  <!-- rectangular inspector shades -->
  <rect x="228" y="262" width="58" height="36" rx="6" fill="#1a2428" opacity=".92"/>
  <rect x="314" y="262" width="58" height="36" rx="6" fill="#1a2428" opacity=".92"/>
  <path d="M286,280 H314" stroke="#c45848" stroke-width="4"/>
  {eyes(300, 275, gap=42, look=2 if pose == 'point' else 0)}
  {mouth(m, 300, 400)}
  {arm('L', False, '#9a8a78')}
  {arm('R', raise_r, '#9a8a78')}
  {paws(color='#6a5a48')}
''')


# ---------- Coast (shiba as coaster gag): casual tee, disc under soda ----------
def coast(pose="neutral"):
    m = {"neutral": "smile", "talk": "open", "point": "o", "wow": "open"}[pose]
    raise_r = pose in ("point", "wow")
    return svg(f'''
  <ellipse cx="300" cy="560" rx="118" ry="130" fill="#d8a878"/>
  <!-- casual tee -->
  <path d="M210,460 Q300,425 390,460 L400,640 Q300,670 200,640 Z" fill="#a87890"/>
  <path d="M235,485 Q300,450 365,485 L370,620 Q300,645 230,620 Z" fill="#b888a0"/>
  <!-- disc coaster + soda (held forward) -->
  <ellipse cx="150" cy="580" rx="48" ry="14" fill="#4a8a98"/>
  <ellipse cx="150" cy="575" rx="40" ry="10" fill="#6aa8b8"/>
  <ellipse cx="150" cy="572" rx="10" ry="10" fill="#c4a35a"/>
  <rect x="132" y="500" width="36" height="72" rx="8" fill="#c45848"/>
  <ellipse cx="150" cy="500" rx="18" ry="8" fill="#d46858"/>
  <rect x="145" y="470" width="10" height="35" rx="3" fill="#ebe4dc"/>
  <!-- head -->
  <ellipse cx="300" cy="290" rx="135" ry="120" fill="#e0b888"/>
  <ellipse cx="300" cy="310" rx="105" ry="90" fill="#e8c898"/>
  <ellipse cx="230" cy="320" rx="28" ry="20" fill="#f0a090" opacity=".55"/>
  <ellipse cx="370" cy="320" rx="28" ry="20" fill="#f0a090" opacity=".55"/>
  <ellipse cx="300" cy="345" rx="48" ry="32" fill="#f4e8d8"/>
  <ellipse cx="300" cy="335" rx="16" ry="12" fill="#2a2118"/>
  <path d="M175,210 L155,110 L230,195 Z" fill="#d8a878"/>
  <path d="M425,210 L445,110 L370,195 Z" fill="#d8a878"/>
  <path d="M180,205 L168,130 L220,190 Z" fill="#f0c0a8"/>
  <path d="M420,205 L432,130 L380,190 Z" fill="#f0c0a8"/>
  <!-- backwards cap -->
  <ellipse cx="300" cy="195" rx="120" ry="28" fill="#3a4858"/>
  <path d="M190,205 Q300,135 410,205" fill="#4a5868"/>
  <ellipse cx="200" cy="210" rx="55" ry="14" fill="#2a3848"/>
  <!-- chill shades -->
  <circle cx="262" cy="285" r="28" fill="#1a2428" opacity=".9"/>
  <circle cx="338" cy="285" r="28" fill="#1a2428" opacity=".9"/>
  <path d="M290,285 H310" stroke="#a87890" stroke-width="5"/>
  {eyes(300, 275, gap=38, look=0)}
  {mouth(m, 300, 385)}
  {arm('L', False, '#e0b888')}
  {arm('R', raise_r, '#e0b888')}
  {paws(color='#d8a878')}
''')


# ---------- Grad (shiba graduate): mortarboard + sash ----------
def grad(pose="neutral"):
    m = {"neutral": "smile", "talk": "open", "point": "o", "wow": "open"}[pose]
    raise_r = pose in ("point", "wow", "talk")
    return svg(f'''
  <ellipse cx="300" cy="560" rx="118" ry="130" fill="#d8a878"/>
  <!-- gown -->
  <path d="M200,455 Q300,415 400,455 L415,655 Q300,690 185,655 Z" fill="#2a3038"/>
  <path d="M225,480 Q300,445 375,480 L385,635 Q300,665 215,635 Z" fill="#3a4048"/>
  <!-- sash -->
  <path d="M220,470 L380,620 L360,640 L200,490 Z" fill="#c4a35a"/>
  <!-- diploma -->
  <rect x="420" y="480" width="28" height="100" rx="4" fill="#f4f0ea" transform="rotate(15 434 530)"/>
  <rect x="424" y="490" width="20" height="8" fill="#c45848" transform="rotate(15 434 494)"/>
  <!-- head -->
  <ellipse cx="300" cy="295" rx="135" ry="118" fill="#e0b888"/>
  <ellipse cx="300" cy="315" rx="105" ry="88" fill="#e8c898"/>
  <ellipse cx="230" cy="325" rx="28" ry="20" fill="#f0a090" opacity=".55"/>
  <ellipse cx="370" cy="325" rx="28" ry="20" fill="#f0a090" opacity=".55"/>
  <ellipse cx="300" cy="350" rx="48" ry="30" fill="#f4e8d8"/>
  <ellipse cx="300" cy="340" rx="16" ry="12" fill="#2a2118"/>
  <path d="M175,215 L155,115 L230,200 Z" fill="#d8a878"/>
  <path d="M425,215 L445,115 L370,200 Z" fill="#d8a878"/>
  <!-- mortarboard -->
  <rect x="195" y="145" width="210" height="22" rx="2" fill="#1a1c20"/>
  <path d="M200,155 L300,95 L400,155 Z" fill="#2a3038"/>
  <rect x="285" y="155" width="30" height="45" fill="#1a1c20"/>
  <path d="M315,160 Q380,200 360,260" fill="none" stroke="#c4a35a" stroke-width="5"/>
  <rect x="350" y="255" width="28" height="18" rx="2" fill="#c4a35a"/>
  <!-- proud shades -->
  <circle cx="262" cy="290" r="28" fill="#1a2428" opacity=".9"/>
  <circle cx="338" cy="290" r="28" fill="#1a2428" opacity=".9"/>
  <path d="M290,290 H310" stroke="#c4a35a" stroke-width="5"/>
  {eyes(300, 280, gap=38, look=3 if pose == 'point' else 0)}
  {mouth(m, 300, 390)}
  {arm('L', False, '#e0b888')}
  {arm('R', raise_r, '#e0b888')}
  {paws(color='#d8a878')}
''')


CHARS = {
    "shiba": shiba,
    "okapi": okapi,
    "narwhal": narwhal,
    "badger": badger,
    "mandrill": mandrill,
    "coast": coast,
    "grad": grad,
}
POSES = ("neutral", "talk", "point", "wow")


def main():
    for name, fn in CHARS.items():
        for pose in POSES:
            body = fn(pose)
            svg_path = OUT / f"{name}-{pose}.svg"
            png_path = OUT / f"{name}-{pose}.png"
            svg_path.write_text(body)
            cairosvg.svg2png(bytestring=body.encode("utf-8"), write_to=str(png_path),
                             output_width=600, output_height=800)
            print("wrote", png_path.name)


if __name__ == "__main__":
    main()
