#!/usr/bin/env python3
"""Hand-author ORIGINAL anthropomorphic animal SVGs — species must be instantly readable.

Cast (fresh, not reused): hamster, koala, panda, mole, lynx.
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


# ---------- HAMSTER: chubby cheeks, tiny round ears, stubby snout, teal hoodie + headset ----------
def hamster(pose="neutral"):
    m = {"neutral": "smile", "talk": "open", "point": "o", "wow": "open"}[pose]
    raise_r = pose in ("point", "wow")
    fur, cream, cheek = "#d4a878", "#f0dcc0", "#e8b898"
    return svg(f'''
  <!-- tiny stubby hamster tail -->
  <ellipse cx="410" cy="620" rx="18" ry="12" fill="{fur}"/>
  <!-- chunky body -->
  <ellipse cx="300" cy="560" rx="118" ry="112" fill="{fur}"/>
  <ellipse cx="300" cy="540" rx="98" ry="85" fill="#e0b888"/>
  <!-- teal hoodie -->
  <path d="M205,470 Q300,430 395,470 L408,640 Q300,675 192,640 Z" fill="#3a7a78"/>
  <path d="M230,495 Q300,460 370,495 L376,620 Q300,650 224,620 Z" fill="#4a8a88"/>
  <ellipse cx="300" cy="465" rx="60" ry="22" fill="#2a6868"/>
  <ellipse cx="255" cy="530" rx="14" ry="10" fill="#2a6868" opacity=".35"/>
  <ellipse cx="345" cy="530" rx="14" ry="10" fill="#2a6868" opacity=".35"/>
  <!-- oversized round head -->
  <ellipse cx="300" cy="280" rx="130" ry="115" fill="{fur}"/>
  <ellipse cx="300" cy="300" rx="105" ry="90" fill="#e0b888"/>
  <!-- BIG chubby cheek pouches (hamster hallmark) -->
  <ellipse cx="200" cy="320" rx="48" ry="42" fill="{cheek}"/>
  <ellipse cx="400" cy="320" rx="48" ry="42" fill="{cheek}"/>
  <ellipse cx="195" cy="325" rx="28" ry="24" fill="#f0c8a8" opacity=".6"/>
  <ellipse cx="405" cy="325" rx="28" ry="24" fill="#f0c8a8" opacity=".6"/>
  <!-- short stubby snout -->
  <ellipse cx="300" cy="355" rx="36" ry="28" fill="{cream}"/>
  <ellipse cx="300" cy="348" rx="10" ry="8" fill="#2a2118"/>
  <!-- tiny ROUND hamster ears -->
  <ellipse cx="200" cy="175" rx="28" ry="26" fill="{fur}"/>
  <ellipse cx="400" cy="175" rx="28" ry="26" fill="{fur}"/>
  <ellipse cx="200" cy="175" rx="14" ry="13" fill="#e8b4a0"/>
  <ellipse cx="400" cy="175" rx="14" ry="13" fill="#e8b4a0"/>
  <!-- gaming headset -->
  <path d="M170,245 Q300,150 430,245" fill="none" stroke="#2a3038" stroke-width="16" stroke-linecap="round"/>
  <rect x="145" y="250" width="42" height="68" rx="12" fill="#3a4048"/>
  <rect x="413" y="250" width="42" height="68" rx="12" fill="#3a4048"/>
  <path d="M187,305 Q250,355 300,350" fill="none" stroke="#2a3038" stroke-width="8" stroke-linecap="round"/>
  <rect x="285" y="343" width="34" height="20" rx="7" fill="#4a5058"/>
  <!-- round sunglasses -->
  <circle cx="260" cy="280" r="26" fill="#1a2428" opacity=".92"/>
  <circle cx="340" cy="280" r="26" fill="#1a2428" opacity=".92"/>
  <path d="M286,280 H314" stroke="#4a8a88" stroke-width="5"/>
  {eyes(300, 270, gap=40, look=3 if pose == 'point' else 0)}
  {mouth(m, 300, 390)}
  {arm('L', False, fur)}
  {arm('R', raise_r, fur)}
  {paws(color=fur, spread=70)}
  <!-- laptop/console prop when pointing -->
  {"<rect x='400' y='300' width='90' height='60' rx='6' fill='#2a3038'/><rect x='408' y='308' width='74' height='42' rx='3' fill='#4a9a78'/><rect x='420' y='360' width='50' height='10' rx='2' fill='#3a4048'/>" if raise_r else ""}
''')


# ---------- KOALA: big fluffy grey ears with white inner, large black nose, coffee cardigan ----------
def koala(pose="neutral"):
    m = {"neutral": "smile", "talk": "open", "point": "o", "wow": "open"}[pose]
    raise_r = pose in ("point", "wow")
    fur, light = "#8a8a88", "#b0b0a8"
    cups = ""
    for cx, cy in [(255, 520), (320, 555), (280, 590)]:
        cups += f'''
  <ellipse cx="{cx}" cy="{cy}" rx="14" ry="10" fill="#ebe4dc"/>
  <ellipse cx="{cx}" cy="{cy - 8}" rx="10" ry="4" fill="#d8d0c8"/>
  <rect x="{cx - 3}" y="{cy - 18}" width="6" height="10" rx="1" fill="#ebe4dc"/>'''
    return svg(f'''
  <!-- no visible tail (koala) — stump hint -->
  <ellipse cx="380" cy="630" rx="14" ry="10" fill="{fur}" opacity=".5"/>
  <!-- chunky grey body -->
  <ellipse cx="300" cy="560" rx="125" ry="115" fill="{fur}"/>
  <ellipse cx="300" cy="540" rx="105" ry="90" fill="{light}"/>
  <!-- coffee-cup-print cardigan -->
  <path d="M205,465 Q300,425 395,465 L408,645 Q300,675 192,645 Z" fill="#6a5040"/>
  <path d="M228,490 Q300,455 372,490 L378,625 Q300,650 222,625 Z" fill="#7a6050"/>
  <ellipse cx="300" cy="460" rx="62" ry="22" fill="#5a4030"/>
  {cups}
  <!-- oversized grey head -->
  <ellipse cx="300" cy="285" rx="135" ry="120" fill="{fur}"/>
  <ellipse cx="300" cy="305" rx="110" ry="95" fill="{light}"/>
  <!-- LARGE black koala nose (hallmark) -->
  <ellipse cx="300" cy="350" rx="32" ry="28" fill="#2a2118"/>
  <ellipse cx="292" cy="342" rx="8" ry="6" fill="#4a4038" opacity=".5"/>
  <!-- cream muzzle under nose -->
  <ellipse cx="300" cy="385" rx="38" ry="22" fill="#d8d0c0"/>
  <!-- HUGE fluffy round ears with white inner -->
  <ellipse cx="165" cy="200" rx="55" ry="58" fill="{fur}"/>
  <ellipse cx="435" cy="200" rx="55" ry="58" fill="{fur}"/>
  <ellipse cx="165" cy="205" rx="32" ry="34" fill="#f0ece4"/>
  <ellipse cx="435" cy="205" rx="32" ry="34" fill="#f0ece4"/>
  <ellipse cx="155" cy="185" rx="18" ry="14" fill="{fur}" opacity=".45"/>
  <ellipse cx="445" cy="185" rx="18" ry="14" fill="{fur}" opacity=".45"/>
  <!-- reading glasses -->
  <ellipse cx="255" cy="285" rx="32" ry="26" fill="none" stroke="#4a5058" stroke-width="6"/>
  <ellipse cx="345" cy="285" rx="32" ry="26" fill="none" stroke="#4a5058" stroke-width="6"/>
  <path d="M287,285 H313" stroke="#4a5058" stroke-width="5"/>
  <path d="M223,280 Q180,260 155,220" fill="none" stroke="#4a5058" stroke-width="5"/>
  <path d="M377,280 Q420,260 445,220" fill="none" stroke="#4a5058" stroke-width="5"/>
  {eyes(300, 280, gap=42, look=2 if pose == 'point' else 0)}
  {mouth(m, 300, 405)}
  {arm('L', False, fur)}
  {arm('R', raise_r, fur)}
  {paws(color=fur, spread=72)}
  <!-- coffee mug prop when pointing -->
  {"<ellipse cx='450' cy='340' rx='28' ry='22' fill='#ebe4dc'/><rect x='422' y='340' width='56' height='50' rx='4' fill='#ebe4dc'/><ellipse cx='450' cy='390' rx='28' ry='10' fill='#d8d0c8'/><ellipse cx='450' cy='355' rx='18' ry='8' fill='#6a4030'/><path d='M478,355 Q500,360 498,380 Q496,395 478,390' fill='none' stroke='#ebe4dc' stroke-width='8'/>" if raise_r else ""}
''')


# ---------- PANDA: classic B/W patches, yellow hard hat, hi-vis orange vest ----------
def panda(pose="neutral"):
    m = {"neutral": "smile", "talk": "open", "point": "o", "wow": "open"}[pose]
    raise_r = pose in ("point", "wow")
    white, black = "#f0ece4", "#2a2828"
    return svg(f'''
  <!-- short panda tail -->
  <ellipse cx="400" cy="625" rx="22" ry="16" fill="{black}"/>
  <!-- white body with black limb bands -->
  <ellipse cx="300" cy="560" rx="125" ry="115" fill="{white}"/>
  <ellipse cx="300" cy="540" rx="105" ry="90" fill="#f8f4ee"/>
  <!-- black arm/leg band hints on body sides -->
  <ellipse cx="200" cy="560" rx="28" ry="55" fill="{black}"/>
  <ellipse cx="400" cy="560" rx="28" ry="55" fill="{black}"/>
  <!-- hi-vis orange vest -->
  <path d="M210,455 Q300,420 390,455 L402,640 Q300,670 198,640 Z" fill="#d47838"/>
  <path d="M235,480 Q300,450 365,480 L370,620 Q300,645 230,620 Z" fill="#2a3848"/>
  <rect x="248" y="500" width="22" height="95" fill="#e0c070"/>
  <rect x="330" y="500" width="22" height="95" fill="#e0c070"/>
  <!-- round white head -->
  <ellipse cx="300" cy="285" rx="135" ry="120" fill="{white}"/>
  <ellipse cx="300" cy="305" rx="110" ry="95" fill="#f8f4ee"/>
  <!-- classic black eye patches -->
  <ellipse cx="245" cy="285" rx="42" ry="32" fill="{black}" transform="rotate(-15 245 285)"/>
  <ellipse cx="355" cy="285" rx="42" ry="32" fill="{black}" transform="rotate(15 355 285)"/>
  <!-- round black ears -->
  <ellipse cx="185" cy="175" rx="38" ry="36" fill="{black}"/>
  <ellipse cx="415" cy="175" rx="38" ry="36" fill="{black}"/>
  <!-- blunt snout -->
  <ellipse cx="300" cy="360" rx="40" ry="30" fill="{white}"/>
  <ellipse cx="300" cy="352" rx="14" ry="11" fill="#2a2118"/>
  <!-- bright yellow construction hard hat -->
  <ellipse cx="300" cy="168" rx="128" ry="22" fill="#d4a820"/>
  <path d="M175,168 Q175,95 300,88 Q425,95 425,168 Z" fill="#f0d040"/>
  <ellipse cx="300" cy="100" rx="28" ry="10" fill="#e0c030"/>
  <rect x="292" y="78" width="16" height="22" rx="3" fill="#c4a018"/>
  <!-- hard-hat brim ridge -->
  <ellipse cx="300" cy="165" rx="120" ry="8" fill="#e8c828" opacity=".7"/>
  {eyes(300, 280, gap=48, r=7, look=2 if pose == 'point' else 0)}
  {mouth(m, 300, 400)}
  {arm('L', False, black)}
  {arm('R', raise_r, black)}
  {paws(color=black, spread=75)}
  <!-- blueprint/tablet prop when pointing -->
  {"<rect x='405' y='310' width='70' height='90' rx='6' fill='#3a4858'/><rect x='412' y='318' width='56' height='74' rx='3' fill='#8ab8c8'/><path d='M420,340 H460 M420,360 H455 M420,380 H460' stroke='#2a3848' stroke-width='3'/>" if raise_r else ""}
''')


# ---------- MOLE: pointed pink nose, tiny squinty eyes, dark velvet fur, digging paws, judge robe ----------
def mole(pose="neutral"):
    m = {"neutral": "smile", "talk": "open", "point": "o", "wow": "open"}[pose]
    raise_r = pose in ("point", "wow")
    fur, velvet = "#4a3830", "#3a2820"
    return svg(f'''
  <!-- short mole tail -->
  <ellipse cx="405" cy="630" rx="16" ry="28" fill="#c4a090"/>
  <!-- dark velvet body -->
  <ellipse cx="300" cy="560" rx="120" ry="112" fill="{fur}"/>
  <ellipse cx="300" cy="540" rx="100" ry="88" fill="{velvet}"/>
  <!-- judge robe -->
  <path d="M200,460 Q300,420 400,460 L415,655 Q300,685 185,655 Z" fill="#2a2828"/>
  <path d="M225,485 Q300,450 375,485 L385,635 Q300,660 215,635 Z" fill="#3a3838"/>
  <ellipse cx="300" cy="455" rx="58" ry="20" fill="#1a1818"/>
  <!-- white jabot / collar -->
  <ellipse cx="300" cy="480" rx="28" ry="18" fill="#ebe4dc"/>
  <ellipse cx="285" cy="500" rx="12" ry="16" fill="#ebe4dc"/>
  <ellipse cx="315" cy="500" rx="12" ry="16" fill="#ebe4dc"/>
  <ellipse cx="300" cy="518" rx="10" ry="14" fill="#ebe4dc"/>
  <!-- oversized dark head -->
  <ellipse cx="300" cy="285" rx="130" ry="115" fill="{fur}"/>
  <ellipse cx="300" cy="305" rx="105" ry="90" fill="{velvet}"/>
  <!-- pointed PINK mole nose (hallmark) -->
  <ellipse cx="300" cy="365" rx="28" ry="35" fill="#e8a090"/>
  <ellipse cx="300" cy="395" rx="18" ry="16" fill="#f0b0a0"/>
  <ellipse cx="300" cy="408" rx="10" ry="8" fill="#d48078"/>
  <!-- tiny hidden / squinty eyes -->
  <path d="M255,280 Q270,275 285,280" fill="none" stroke="#2a2118" stroke-width="5" stroke-linecap="round"/>
  <path d="M315,280 Q330,275 345,280" fill="none" stroke="#2a2118" stroke-width="5" stroke-linecap="round"/>
  <ellipse cx="270" cy="282" rx="4" ry="3" fill="#2a2118"/>
  <ellipse cx="330" cy="282" rx="4" ry="3" fill="#2a2118"/>
  <!-- tiny hidden ears under fur -->
  <ellipse cx="190" cy="200" rx="18" ry="16" fill="{fur}"/>
  <ellipse cx="410" cy="200" rx="18" ry="16" fill="{fur}"/>
  <!-- judge wig curls hint -->
  <ellipse cx="220" cy="175" rx="30" ry="28" fill="#ebe4dc"/>
  <ellipse cx="260" cy="155" rx="28" ry="26" fill="#ebe4dc"/>
  <ellipse cx="300" cy="148" rx="30" ry="28" fill="#ebe4dc"/>
  <ellipse cx="340" cy="155" rx="28" ry="26" fill="#ebe4dc"/>
  <ellipse cx="380" cy="175" rx="30" ry="28" fill="#ebe4dc"/>
  <ellipse cx="300" cy="190" rx="100" ry="30" fill="#ebe4dc"/>
  {mouth(m, 300, 430)}
  <!-- LARGE digging paws (mole hallmark) on arms -->
  {arm('L', False, fur)}
  {arm('R', raise_r, fur)}
  <!-- oversized clawed digging feet -->
  <ellipse cx="230" cy="710" rx="40" ry="18" fill="{fur}"/>
  <ellipse cx="370" cy="710" rx="40" ry="18" fill="{fur}"/>
  <ellipse cx="210" cy="702" rx="6" ry="10" fill="#c4a090"/>
  <ellipse cx="225" cy="698" rx="6" ry="10" fill="#c4a090"/>
  <ellipse cx="240" cy="698" rx="6" ry="10" fill="#c4a090"/>
  <ellipse cx="255" cy="702" rx="6" ry="10" fill="#c4a090"/>
  <ellipse cx="345" cy="702" rx="6" ry="10" fill="#c4a090"/>
  <ellipse cx="360" cy="698" rx="6" ry="10" fill="#c4a090"/>
  <ellipse cx="375" cy="698" rx="6" ry="10" fill="#c4a090"/>
  <ellipse cx="390" cy="702" rx="6" ry="10" fill="#c4a090"/>
  <!-- magnifying glass when pointing -->
  {"<circle cx='455' cy='330' r='36' fill='none' stroke='#8a7030' stroke-width='10'/><circle cx='455' cy='330' r='28' fill='#8ab8c8' opacity='.45'/><rect x='475' y='350' width='14' height='70' rx='4' fill='#8a7030' transform='rotate(35 482 385)'/>" if raise_r else ""}
''')


# ---------- LYNX: tufted black ear tips, bobbed tail, spotted flanks, referee shirt + whistle ----------
def lynx(pose="neutral"):
    m = {"neutral": "smile", "talk": "open", "point": "o", "wow": "open"}[pose]
    raise_r = pose in ("point", "wow")
    fur, cream, spot = "#c49868", "#e8d0b0", "#6a4830"
    spots = ""
    for cx, cy, r in [
        (230, 500, 10), (250, 540, 8), (220, 580, 9),
        (370, 505, 10), (350, 545, 8), (380, 580, 9),
        (280, 560, 7), (320, 590, 8),
        (240, 310, 6), (360, 305, 6), (255, 350, 5), (345, 345, 5),
    ]:
        spots += f'<ellipse cx="{cx}" cy="{cy}" rx="{r}" ry="{r * 0.7}" fill="{spot}" opacity=".55"/>'
    # flank stripes
    stripes = ""
    for y in (510, 535, 560, 585):
        stripes += f'<path d="M195,{y} Q220,{y - 6} 245,{y}" fill="none" stroke="{spot}" stroke-width="5" opacity=".5"/>'
        stripes += f'<path d="M405,{y} Q380,{y - 6} 355,{y}" fill="none" stroke="{spot}" stroke-width="5" opacity=".5"/>'
    return svg(f'''
  <!-- SHORT BOBBED lynx tail stub (hallmark) -->
  <ellipse cx="415" cy="600" rx="28" ry="22" fill="{fur}"/>
  <ellipse cx="430" cy="590" rx="16" ry="14" fill="{cream}"/>
  <ellipse cx="438" cy="582" rx="8" ry="6" fill="{spot}"/>
  <!-- spotted body -->
  <ellipse cx="300" cy="560" rx="122" ry="112" fill="{fur}"/>
  <ellipse cx="300" cy="540" rx="100" ry="88" fill="#d4a878"/>
  {spots}
  {stripes}
  <!-- black/white referee shirt -->
  <path d="M208,465 Q300,428 392,465 L405,640 Q300,670 195,640 Z" fill="#f0ece4"/>
  <path d="M232,490 Q300,458 368,490 L372,620 Q300,645 228,620 Z" fill="#f8f4ee"/>
  <!-- vertical black stripes on shirt -->
  <rect x="250" y="480" width="18" height="150" fill="#2a2828"/>
  <rect x="290" y="475" width="20" height="155" fill="#2a2828"/>
  <rect x="332" y="480" width="18" height="150" fill="#2a2828"/>
  <ellipse cx="300" cy="460" rx="60" ry="20" fill="#2a2828"/>
  <!-- ruff / cheek fluff -->
  <ellipse cx="195" cy="330" rx="40" ry="50" fill="{cream}"/>
  <ellipse cx="405" cy="330" rx="40" ry="50" fill="{cream}"/>
  <!-- oversized head -->
  <ellipse cx="300" cy="285" rx="130" ry="115" fill="{fur}"/>
  <ellipse cx="300" cy="305" rx="105" ry="90" fill="#d4a878"/>
  <!-- short muzzle -->
  <ellipse cx="300" cy="360" rx="38" ry="28" fill="{cream}"/>
  <ellipse cx="300" cy="352" rx="12" ry="9" fill="#2a2118"/>
  <!-- pointed ears with BLACK TUFTED tips (lynx hallmark) -->
  <path d="M195,210 L165,100 L245,195 Z" fill="{fur}"/>
  <path d="M405,210 L435,100 L355,195 Z" fill="{fur}"/>
  <path d="M200,195 L180,130 L225,185 Z" fill="#e8b4a0"/>
  <path d="M400,195 L420,130 L375,185 Z" fill="#e8b4a0"/>
  <!-- black tufts -->
  <path d="M165,100 L155,55 L175,95 Z" fill="#2a2118"/>
  <path d="M435,100 L445,55 L425,95 Z" fill="#2a2118"/>
  <path d="M160,80 L150,50 L170,75 Z" fill="#2a2118"/>
  <path d="M440,80 L450,50 L430,75 Z" fill="#2a2118"/>
  <!-- whistle around neck -->
  <path d="M280,455 Q300,475 320,455" fill="none" stroke="#c4a35a" stroke-width="4"/>
  <ellipse cx="300" cy="485" rx="14" ry="10" fill="#ebe4dc"/>
  <rect x="312" y="480" width="18" height="10" rx="3" fill="#c4a35a"/>
  {eyes(300, 280, gap=40, look=2 if pose == 'point' else 0)}
  {mouth(m, 300, 395)}
  {arm('L', False, fur)}
  {arm('R', raise_r, fur)}
  {paws(color=fur, spread=72)}
  <!-- whistle held up / card prop when pointing -->
  {"<rect x='420' y='300' width='55' height='70' rx='4' fill='#ebe4dc'/><rect x='426' y='308' width='43' height='54' rx='2' fill='#c45848'/><text x='447' y='342' text-anchor='middle' font-size='14' fill='#f0e6d0' font-family='sans-serif' font-weight='bold'>FOUL</text>" if raise_r else ""}
''')


CHARS = {
    "hamster": hamster,
    "koala": koala,
    "panda": panda,
    "mole": mole,
    "lynx": lynx,
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
