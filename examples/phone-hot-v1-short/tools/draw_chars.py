#!/usr/bin/env python3
"""Hand-author ORIGINAL anthropomorphic animal SVGs — species must be instantly readable.

Cast (fresh, not reused): coati, numbat, yak, gecko (+ chip racing outfit), arctic fox.
Silhouettes and colours must differ strongly — never the same round bear.
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
    if kind == "frown":
        return f'<path d="M{cx - 16},{cy + 8} Q{cx},{cy - 4} {cx + 16},{cy + 8}" fill="none" stroke="#3a2a24" stroke-width="5" stroke-linecap="round"/>'
    return f'<path d="M{cx - 14},{cy + 2} Q{cx},{cy + 8} {cx + 14},{cy + 2}" fill="none" stroke="#3a2a24" stroke-width="4" stroke-linecap="round"/>'


def paws(y=710, spread=70, color="#c4a07a"):
    return f'''
  <ellipse cx="{300 - spread}" cy="{y}" rx="28" ry="16" fill="{color}"/>
  <ellipse cx="{300 + spread}" cy="{y}" rx="28" ry="16" fill="{color}"/>'''


def arm(side, raise_arm, color="#c4a07a"):
    x = 190 if side == "L" else 410
    tip = 120 if raise_arm else 40
    y1, y2 = 470, 470 - tip if raise_arm else 560
    hand_y = y2 - 10
    return f'''
  <ellipse cx="{x}" cy="{(y1 + y2) / 2}" rx="22" ry="{abs(y2 - y1) / 2 + 10}" fill="{color}"/>
  <ellipse cx="{x + (-18 if side == 'L' and raise_arm else 18 if side == 'R' and raise_arm else 0)}" cy="{hand_y}" rx="20" ry="16" fill="{color}"/>'''


# ---------- COATI: long tapered snout, tall thin ears, RINGED TAIL upright ----------
def coati(pose="neutral"):
    m = {"neutral": "smile", "talk": "open", "point": "o", "wow": "open"}[pose]
    raise_r = pose in ("point", "wow")
    fur, fur2, cream = "#8a5a38", "#a07048", "#e8d0b0"
    # ringed tail curling UP high behind — unmistakable coati signal
    rings = ""
    for i, (rx, ry, rr) in enumerate([
        (430, 580, 32), (455, 520, 30), (475, 455, 28), (485, 390, 26),
        (480, 330, 24), (455, 280, 22), (420, 245, 18),
    ]):
        col = "#5a3020" if i % 2 == 0 else cream
        rings += f'<ellipse cx="{rx}" cy="{ry}" rx="{rr}" ry="{rr - 8}" fill="{col}"/>'
    return svg(f'''
  <!-- ringed coati tail -->
  {rings}
  <!-- chunky body -->
  <ellipse cx="300" cy="560" rx="120" ry="115" fill="{fur}"/>
  <ellipse cx="300" cy="540" rx="100" ry="85" fill="{fur2}"/>
  <!-- teal hoodie -->
  <path d="M205,470 Q300,430 395,470 L410,640 Q300,675 190,640 Z" fill="#3a6a68"/>
  <path d="M230,495 Q300,460 370,495 L378,620 Q300,650 222,620 Z" fill="#4a7a78"/>
  <ellipse cx="300" cy="465" rx="62" ry="22" fill="#2a5858"/>
  <!-- oversized head -->
  <ellipse cx="300" cy="275" rx="125" ry="110" fill="{fur2}"/>
  <ellipse cx="300" cy="295" rx="100" ry="88" fill="#b88858"/>
  <!-- EXTRA LONG tapered snout (coati hallmark) -->
  <ellipse cx="300" cy="360" rx="42" ry="50" fill="{cream}"/>
  <ellipse cx="300" cy="415" rx="30" ry="42" fill="#d8c098"/>
  <ellipse cx="300" cy="455" rx="20" ry="22" fill="#c8b088"/>
  <ellipse cx="300" cy="470" rx="14" ry="10" fill="#2a2118"/>
  <!-- tall THIN coati ears (not kangaroo-wide) -->
  <ellipse cx="190" cy="160" rx="14" ry="50" fill="{fur}"/>
  <ellipse cx="410" cy="160" rx="14" ry="50" fill="{fur}"/>
  <ellipse cx="190" cy="155" rx="6" ry="28" fill="#e8b4a0"/>
  <ellipse cx="410" cy="155" rx="6" ry="28" fill="#e8b4a0"/>
  <!-- dark eye mask band -->
  <ellipse cx="255" cy="280" rx="42" ry="22" fill="#5a3828" opacity=".55"/>
  <ellipse cx="345" cy="280" rx="42" ry="22" fill="#5a3828" opacity=".55"/>
  <!-- gaming headset -->
  <path d="M170,250 Q300,155 430,250" fill="none" stroke="#2a3038" stroke-width="16" stroke-linecap="round"/>
  <rect x="145" y="255" width="42" height="68" rx="12" fill="#3a4048"/>
  <rect x="413" y="255" width="42" height="68" rx="12" fill="#3a4048"/>
  <path d="M187,310 Q250,360 300,355" fill="none" stroke="#2a3038" stroke-width="8" stroke-linecap="round"/>
  <rect x="285" y="348" width="34" height="20" rx="7" fill="#4a5058"/>
  <!-- round shades -->
  <circle cx="260" cy="285" r="26" fill="#1a2428" opacity=".92"/>
  <circle cx="340" cy="285" r="26" fill="#1a2428" opacity=".92"/>
  <path d="M286,285 H314" stroke="#4a7a78" stroke-width="5"/>
  {eyes(300, 275, gap=40, look=3 if pose == 'point' else 0)}
  {mouth(m, 300, 400)}
  {arm('L', False, fur2)}
  {arm('R', raise_r, fur2)}
  {paws(color=fur, spread=72)}
  <!-- phone prop when pointing/wow -->
  {"<rect x='420' y='330' width='48' height='80' rx='8' fill='#2a3038'/><rect x='424' y='336' width='40' height='60' rx='4' fill='#c45848'/>" if raise_r else ""}
''')


# ---------- NUMBAT: pointed snout, upright ears, bold BACK STRIPES, bushy tail ----------
def numbat(pose="neutral"):
    m = {"neutral": "smile", "talk": "open", "point": "o", "wow": "open"}[pose]
    raise_r = pose in ("point", "wow")
    fur, cream = "#c48848", "#f0d8b0"
    stripes = ""
    for i, y in enumerate(range(480, 620, 18)):
        stripes += f'<path d="M190,{y} Q300,{y - 8} 410,{y}" fill="none" stroke="#3a2818" stroke-width="10" stroke-linecap="round" opacity=".85"/>'
    return svg(f'''
  <!-- bushy STRIPED tail (numbat hallmark) -->
  <ellipse cx="460" cy="540" rx="58" ry="100" fill="{fur}"/>
  <path d="M430,480 Q460,470 490,480" fill="none" stroke="#3a2818" stroke-width="12"/>
  <path d="M425,520 Q460,510 495,520" fill="none" stroke="#3a2818" stroke-width="12"/>
  <path d="M428,560 Q460,550 492,560" fill="none" stroke="#3a2818" stroke-width="12"/>
  <path d="M435,600 Q460,590 485,600" fill="none" stroke="#3a2818" stroke-width="12"/>
  <ellipse cx="300" cy="560" rx="118" ry="112" fill="{fur}"/>
  {stripes}
  <!-- white lab coat (open so side stripes show) -->
  <path d="M230,460 Q300,425 370,460 L385,650 Q300,675 215,650 Z" fill="#ebe4dc"/>
  <path d="M250,485 Q300,458 350,485 L358,625 Q300,648 242,625 Z" fill="#f8f4ee"/>
  <path d="M300,460 L300,640" stroke="#d0c8c0" stroke-width="4"/>
  <ellipse cx="270" cy="520" rx="10" ry="10" fill="#c45848"/>
  <ellipse cx="330" cy="540" rx="10" ry="10" fill="#4a8a98"/>
  <!-- head with face stripes -->
  <ellipse cx="300" cy="285" rx="125" ry="110" fill="{fur}"/>
  <ellipse cx="300" cy="305" rx="100" ry="88" fill="#d49858"/>
  <path d="M220,250 Q260,240 280,280" fill="none" stroke="#3a2818" stroke-width="8"/>
  <path d="M380,250 Q340,240 320,280" fill="none" stroke="#3a2818" stroke-width="8"/>
  <path d="M230,300 Q265,295 285,330" fill="none" stroke="#3a2818" stroke-width="7"/>
  <path d="M370,300 Q335,295 315,330" fill="none" stroke="#3a2818" stroke-width="7"/>
  <!-- pointed snout -->
  <ellipse cx="300" cy="370" rx="40" ry="48" fill="{cream}"/>
  <ellipse cx="300" cy="410" rx="22" ry="20" fill="#e8d0b0"/>
  <ellipse cx="300" cy="425" rx="12" ry="9" fill="#2a2118"/>
  <!-- upright pointed ears -->
  <ellipse cx="200" cy="175" rx="24" ry="52" fill="{fur}"/>
  <ellipse cx="400" cy="175" rx="24" ry="52" fill="{fur}"/>
  <ellipse cx="200" cy="170" rx="10" ry="28" fill="#e8b4a0"/>
  <ellipse cx="400" cy="170" rx="10" ry="28" fill="#e8b4a0"/>
  <!-- inventor goggles on forehead -->
  <ellipse cx="255" cy="210" rx="38" ry="28" fill="none" stroke="#4a5058" stroke-width="10"/>
  <ellipse cx="345" cy="210" rx="38" ry="28" fill="none" stroke="#4a5058" stroke-width="10"/>
  <path d="M293,210 H307" stroke="#4a5058" stroke-width="8"/>
  <ellipse cx="255" cy="210" rx="22" ry="16" fill="#8ab8c8" opacity=".45"/>
  <ellipse cx="345" cy="210" rx="22" ry="16" fill="#8ab8c8" opacity=".45"/>
  <!-- strap -->
  <path d="M175,220 Q300,250 425,220" fill="none" stroke="#3a4048" stroke-width="8"/>
  {eyes(300, 275, gap=38, look=2 if pose == 'point' else 0)}
  {mouth(m, 300, 390)}
  {arm('L', False, fur)}
  {arm('R', raise_r, fur)}
  {paws(color='#a07040', spread=70)}
  <!-- tiny desk fan when pointing -->
  {"<ellipse cx='445' cy='350' rx='36' ry='36' fill='#6a7a88'/><ellipse cx='445' cy='350' rx='28' ry='28' fill='#c8d4d8'/><rect x='438' y='386' width='14' height='40' fill='#5a6a78'/><rect x='420' y='420' width='50' height='12' rx='3' fill='#4a5a68'/>" if raise_r else ""}
''')


# ---------- YAK: huge curved horns, shaggy fringe, bulky body, hard hat ----------
def yak(pose="neutral"):
    m = {"neutral": "smile", "talk": "open", "point": "o", "wow": "open"}[pose]
    raise_r = pose in ("point", "wow")
    fur, dark = "#5a4838", "#3a3028"
    return svg(f'''
  <!-- bulky shaggy body -->
  <ellipse cx="300" cy="560" rx="145" ry="125" fill="{fur}"/>
  <ellipse cx="300" cy="545" rx="120" ry="100" fill="#6a5848"/>
  <!-- shaggy fringe tufts -->
  <ellipse cx="220" cy="500" rx="40" ry="70" fill="{dark}" opacity=".5"/>
  <ellipse cx="380" cy="500" rx="40" ry="70" fill="{dark}" opacity=".5"/>
  <ellipse cx="300" cy="620" rx="100" ry="40" fill="{dark}" opacity=".4"/>
  <!-- orange hi-vis / work vest -->
  <path d="M210,455 Q300,420 390,455 L402,640 Q300,670 198,640 Z" fill="#c47838"/>
  <path d="M235,480 Q300,450 365,480 L370,620 Q300,645 230,620 Z" fill="#2a3848"/>
  <rect x="248" y="500" width="22" height="95" fill="#e0c070"/>
  <rect x="330" y="500" width="22" height="95" fill="#e0c070"/>
  <!-- massive head -->
  <ellipse cx="300" cy="280" rx="140" ry="120" fill="{fur}"/>
  <ellipse cx="300" cy="300" rx="115" ry="95" fill="#6a5848"/>
  <!-- shaggy bangs -->
  <path d="M180,240 Q220,160 260,230 Q300,150 340,230 Q380,160 420,240" fill="{dark}"/>
  <!-- hard hat first -->
  <ellipse cx="300" cy="175" rx="140" ry="26" fill="#c4a35a"/>
  <ellipse cx="300" cy="148" rx="115" ry="45" fill="#e0c070"/>
  <ellipse cx="300" cy="128" rx="65" ry="16" fill="#d0b060"/>
  <rect x="288" y="100" width="24" height="24" rx="4" fill="#8a7030"/>
  <!-- HUGE thick curved horns OUTSIDE hat (yak hallmark) -->
  <path d="M170,185 Q100,60 40,130 Q30,180 55,200 Q90,220 165,200 Z" fill="#e8d4a0" stroke="#8a7030" stroke-width="6"/>
  <path d="M430,185 Q500,60 560,130 Q570,180 545,200 Q510,220 435,200 Z" fill="#e8d4a0" stroke="#8a7030" stroke-width="6"/>
  <ellipse cx="55" cy="155" rx="28" ry="32" fill="#d8c098"/>
  <ellipse cx="545" cy="155" rx="28" ry="32" fill="#d8c098"/>
  <ellipse cx="48" cy="145" rx="10" ry="12" fill="#8a7030"/>
  <ellipse cx="552" cy="145" rx="10" ry="12" fill="#8a7030"/>
  <!-- broad muzzle -->
  <ellipse cx="300" cy="360" rx="55" ry="40" fill="#c8b090"/>
  <ellipse cx="300" cy="350" rx="14" ry="10" fill="#2a2118"/>
  <!-- safety shades -->
  <rect x="230" y="265" width="55" height="34" rx="8" fill="#1a3028" opacity=".9"/>
  <rect x="315" y="265" width="55" height="34" rx="8" fill="#1a3028" opacity=".9"/>
  <path d="M285,282 H315" stroke="#c4a35a" stroke-width="5"/>
  {eyes(300, 260, gap=42, look=2 if pose == 'point' else 0)}
  {mouth(m, 300, 395)}
  {arm('L', False, '#6a5848')}
  {arm('R', raise_r, '#6a5848')}
  {paws(color=fur, spread=85)}
  <!-- gasket / seal tool -->
  {"<rect x='415' y='340' width='70' height='28' rx='6' fill='#4a8a98'/><text x='450' y='360' text-anchor='middle' font-size='12' fill='#f0e6d0' font-family='sans-serif'>SEAL</text>" if raise_r else ""}
''')


# ---------- GECKO (developer): sticky toe pads, spotted skin, beanie + shades ----------
def gecko(pose="neutral"):
    m = {"neutral": "smile", "talk": "open", "point": "o", "wow": "open"}[pose]
    raise_r = pose in ("point", "wow")
    skin, spot = "#6a9848", "#3a6030"
    spots = ""
    for cx, cy, r in [(250, 300, 12), (340, 290, 10), (280, 340, 8), (330, 350, 11),
                      (240, 520, 14), (360, 540, 12), (300, 580, 10)]:
        spots += f'<ellipse cx="{cx}" cy="{cy}" rx="{r}" ry="{r * 0.8}" fill="{spot}" opacity=".55"/>'
    return svg(f'''
  <!-- long gecko tail -->
  <path d="M400,560 Q480,520 500,420 Q510,360 470,340" fill="none" stroke="{skin}" stroke-width="36" stroke-linecap="round"/>
  <path d="M400,560 Q480,520 500,420 Q510,360 470,340" fill="none" stroke="{spot}" stroke-width="12" stroke-linecap="round" opacity=".4"/>
  <ellipse cx="300" cy="555" rx="115" ry="110" fill="{skin}"/>
  {spots}
  <!-- purple hoodie / beanie look -->
  <path d="M208,465 Q300,430 392,465 L405,640 Q300,670 195,640 Z" fill="#5a4a78"/>
  <path d="M232,490 Q300,458 368,490 L372,620 Q300,645 228,620 Z" fill="#6a5a88"/>
  <ellipse cx="300" cy="460" rx="60" ry="22" fill="#4a3a68"/>
  <!-- big rounded head -->
  <ellipse cx="300" cy="290" rx="135" ry="120" fill="{skin}"/>
  <ellipse cx="300" cy="310" rx="110" ry="95" fill="#7aa858"/>
  <!-- lidless big gecko eyes under shades -->
  <!-- short blunt snout -->
  <ellipse cx="300" cy="370" rx="38" ry="28" fill="#c8d898"/>
  <ellipse cx="300" cy="362" rx="10" ry="8" fill="#2a2118"/>
  <!-- tiny ear bumps -->
  <ellipse cx="185" cy="230" rx="16" ry="20" fill="{skin}"/>
  <ellipse cx="415" cy="230" rx="16" ry="20" fill="{skin}"/>
  <!-- knit beanie -->
  <path d="M175,220 Q300,100 425,220 Q300,195 175,220 Z" fill="#3a4858"/>
  <ellipse cx="300" cy="200" rx="118" ry="36" fill="#2a3848"/>
  <ellipse cx="320" cy="145" rx="18" ry="14" fill="#4a5868"/>
  <!-- shades -->
  <rect x="228" y="268" width="58" height="36" rx="10" fill="#1a2428" opacity=".92"/>
  <rect x="314" y="268" width="58" height="36" rx="10" fill="#1a2428" opacity=".92"/>
  <path d="M286,286 H314" stroke="#6a5a88" stroke-width="5"/>
  {eyes(300, 275, gap=42, look=2 if pose == 'point' else 0)}
  {mouth(m, 300, 400)}
  {arm('L', False, skin)}
  {arm('R', raise_r, skin)}
  <!-- sticky toe-pad feet -->
  <ellipse cx="230" cy="710" rx="32" ry="14" fill="{skin}"/>
  <ellipse cx="370" cy="710" rx="32" ry="14" fill="{skin}"/>
  <ellipse cx="215" cy="705" rx="8" ry="6" fill="#c8d898"/>
  <ellipse cx="230" cy="702" rx="8" ry="6" fill="#c8d898"/>
  <ellipse cx="245" cy="705" rx="8" ry="6" fill="#c8d898"/>
  <ellipse cx="355" cy="705" rx="8" ry="6" fill="#c8d898"/>
  <ellipse cx="370" cy="702" rx="8" ry="6" fill="#c8d898"/>
  <ellipse cx="385" cy="705" rx="8" ry="6" fill="#c8d898"/>
''')


# ---------- CHIP (gecko in racing suit): tiny, helmet, SAFE MODE vibe ----------
def chip(pose="neutral"):
    m = {"neutral": "smile", "talk": "open", "point": "o", "wow": "open"}[pose]
    raise_r = pose in ("point", "wow")
    skin = "#6a9848"
    return svg(f'''
  <!-- racing suit body -->
  <ellipse cx="300" cy="560" rx="110" ry="105" fill="#c45848"/>
  <ellipse cx="300" cy="540" rx="90" ry="80" fill="#d46858"/>
  <path d="M240,480 L300,560 L360,480" fill="#ebe4dc"/>
  <rect x="270" y="500" width="60" height="18" rx="4" fill="#2a3038"/>
  <text x="300" y="514" text-anchor="middle" font-size="11" fill="#e0c070" font-family="sans-serif">CPU</text>
  <!-- head -->
  <ellipse cx="300" cy="295" rx="120" ry="110" fill="{skin}"/>
  <ellipse cx="300" cy="315" rx="95" ry="88" fill="#7aa858"/>
  <ellipse cx="300" cy="370" rx="34" ry="26" fill="#c8d898"/>
  <ellipse cx="300" cy="362" rx="9" ry="7" fill="#2a2118"/>
  <ellipse cx="190" cy="235" rx="14" ry="18" fill="{skin}"/>
  <ellipse cx="410" cy="235" rx="14" ry="18" fill="{skin}"/>
  <!-- racing helmet -->
  <ellipse cx="300" cy="220" rx="125" ry="70" fill="#2a3848"/>
  <ellipse cx="300" cy="200" rx="100" ry="45" fill="#3a4858"/>
  <path d="M200,230 Q300,280 400,230" fill="#1a2428" opacity=".5"/>
  <rect x="270" y="175" width="60" height="14" rx="3" fill="#c45848"/>
  <!-- goggles -->
  <ellipse cx="255" cy="270" rx="32" ry="22" fill="#8ab8c8" opacity=".7"/>
  <ellipse cx="345" cy="270" rx="32" ry="22" fill="#8ab8c8" opacity=".7"/>
  <path d="M287,270 H313" stroke="#2a3848" stroke-width="6"/>
  {eyes(300, 275, gap=40, look=3 if pose == 'point' else 0)}
  {mouth(m if pose != 'wow' else 'frown', 300, 395)}
  {arm('L', False, skin)}
  {arm('R', raise_r, skin)}
  <ellipse cx="230" cy="710" rx="28" ry="14" fill="{skin}"/>
  <ellipse cx="370" cy="710" rx="28" ry="14" fill="{skin}"/>
  <!-- SAFE MODE placard when pointing -->
  {"<rect x='400' y='320' width='110' height='40' rx='6' fill='#2a3228'/><rect x='404' y='324' width='102' height='32' rx='4' fill='#c45848'/><text x='450' y='346' text-anchor='middle' font-size='12' fill='#f0e6d0' font-family='sans-serif' font-weight='bold'>SAFE MODE</text>" if raise_r else ""}
''')


# ---------- ARCTIC FOX: white/cream fur, black nose tip, winter hat + scarf ----------
def fox(pose="neutral"):
    m = {"neutral": "smile", "talk": "open", "point": "o", "wow": "open"}[pose]
    raise_r = pose in ("point", "wow")
    fur, cream = "#e8e0d4", "#f8f4ee"
    return svg(f'''
  <!-- fluffy fox tail (white with tip) -->
  <ellipse cx="450" cy="520" rx="50" ry="95" fill="{fur}"/>
  <ellipse cx="460" cy="455" rx="28" ry="40" fill="#2a2118"/>
  <ellipse cx="300" cy="555" rx="125" ry="115" fill="{fur}"/>
  <ellipse cx="300" cy="535" rx="105" ry="90" fill="{cream}"/>
  <!-- cozy sweater -->
  <path d="M205,465 Q300,425 395,465 L408,645 Q300,675 192,645 Z" fill="#8a4a48"/>
  <path d="M228,490 Q300,455 372,490 L378,625 Q300,650 222,625 Z" fill="#9a5a58"/>
  <ellipse cx="300" cy="460" rx="65" ry="24" fill="#7a3a38"/>
  <!-- round white head -->
  <ellipse cx="300" cy="290" rx="135" ry="120" fill="{fur}"/>
  <ellipse cx="300" cy="310" rx="110" ry="95" fill="{cream}"/>
  <!-- tapered fox muzzle -->
  <ellipse cx="300" cy="365" rx="42" ry="32" fill="#f8f4ee"/>
  <ellipse cx="300" cy="355" rx="12" ry="10" fill="#2a2118"/>
  <!-- pointed fox ears (black tips) -->
  <path d="M190,220 L160,120 L240,200 Z" fill="{fur}"/>
  <path d="M410,220 L440,120 L360,200 Z" fill="{fur}"/>
  <path d="M190,200 L170,140 L215,190 Z" fill="#2a2118"/>
  <path d="M410,200 L430,140 L385,190 Z" fill="#2a2118"/>
  <path d="M195,195 L180,150 L220,185 Z" fill="#e8b4a0"/>
  <path d="M405,195 L420,150 L380,185 Z" fill="#e8b4a0"/>
  <!-- winter hat -->
  <path d="M175,215 Q300,105 425,215 Q300,190 175,215 Z" fill="#4a6a78"/>
  <ellipse cx="300" cy="195" rx="120" ry="34" fill="#3a5a68"/>
  <ellipse cx="300" cy="195" rx="125" ry="18" fill="#ebe4dc"/>
  <ellipse cx="420" cy="230" rx="22" ry="22" fill="#ebe4dc"/>
  <!-- scarf -->
  <path d="M200,450 Q300,490 400,450" fill="none" stroke="#c45848" stroke-width="28" stroke-linecap="round"/>
  <path d="M360,460 Q390,560 370,620" fill="none" stroke="#c45848" stroke-width="22" stroke-linecap="round"/>
  <path d="M360,460 Q390,560 370,620" fill="none" stroke="#e0c070" stroke-width="8" stroke-linecap="round"/>
  <!-- soft eyes (no heavy shades — cosy look) -->
  {eyes(300, 285, gap=40, r=8, look=2 if pose == 'point' else 0)}
  {mouth(m, 300, 400)}
  {arm('L', False, fur)}
  {arm('R', raise_r, fur)}
  {paws(color=fur, spread=75)}
  <!-- glowing phone as hand warmer held at chest/paws -->
  <rect x="255" y="505" width="90" height="130" rx="12" fill="#2a3038"/>
  <rect x="262" y="515" width="76" height="100" rx="6" fill="#e08040"/>
  <rect x="270" y="525" width="16" height="16" rx="3" fill="#f0e6d0"/>
  <rect x="292" y="525" width="16" height="16" rx="3" fill="#f0e6d0"/>
  <rect x="314" y="525" width="16" height="16" rx="3" fill="#f0e6d0"/>
  <rect x="270" y="548" width="16" height="16" rx="3" fill="#f0e6d0"/>
  <rect x="292" y="548" width="16" height="16" rx="3" fill="#f0e6d0"/>
  <rect x="314" y="548" width="16" height="16" rx="3" fill="#f0e6d0"/>
''')


CHARS = {
    "coati": coati,
    "numbat": numbat,
    "yak": yak,
    "gecko": gecko,
    "chip": chip,
    "fox": fox,
}
POSES = ["neutral", "talk", "point", "wow"]


def main():
    for name, fn in CHARS.items():
        for pose in POSES:
            s = fn(pose)
            svg_path = OUT / f"{name}-{pose}.svg"
            png_path = OUT / f"{name}-{pose}.png"
            svg_path.write_text(s)
            cairosvg.svg2png(bytestring=s.encode("utf-8"), write_to=str(png_path),
                             output_width=W, output_height=H)
            print("wrote", png_path.name)


if __name__ == "__main__":
    main()
