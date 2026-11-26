#!/usr/bin/env python3
"""Hand-author ORIGINAL anthropomorphic animal SVGs — species must be instantly readable.

Cast (fresh, not reused): pika, aardvark (+ worker/tired/grad outfits), walrus,
kinkajou, binturong. Silhouettes and colours must differ strongly.
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


def paws(y=710, spread=70, color="#c4a07a", flat=False):
    if flat:  # walrus flippers
        return f'''
  <ellipse cx="{300 - spread}" cy="{y}" rx="40" ry="14" fill="{color}"/>
  <ellipse cx="{300 + spread}" cy="{y}" rx="40" ry="14" fill="{color}"/>'''
    return f'''
  <ellipse cx="{300 - spread}" cy="{y}" rx="28" ry="16" fill="{color}"/>
  <ellipse cx="{300 + spread}" cy="{y}" rx="28" ry="16" fill="{color}"/>'''


def arm(side, raise_arm, color="#c4a07a", flipper=False):
    x = 190 if side == "L" else 410
    if flipper:
        y1, y2 = 480, 420 if raise_arm else 560
        return f'''
  <ellipse cx="{x}" cy="{(y1 + y2) / 2}" rx="34" ry="{abs(y2 - y1) / 2 + 8}" fill="{color}"/>
  <ellipse cx="{x + (-20 if side == 'L' else 20)}" cy="{y2}" rx="28" ry="18" fill="{color}"/>'''
    tip = 120 if raise_arm else 40
    y1, y2 = 470, 470 - tip if raise_arm else 560
    hand_y = y2 - 10
    return f'''
  <ellipse cx="{x}" cy="{(y1 + y2) / 2}" rx="22" ry="{abs(y2 - y1) / 2 + 10}" fill="{color}"/>
  <ellipse cx="{x + (-18 if side == 'L' and raise_arm else 18 if side == 'R' and raise_arm else 0)}" cy="{hand_y}" rx="20" ry="16" fill="{color}"/>'''


# ---------- PIKA: tiny round ears, VERY round compact body, warm sand ----------
def pika(pose="neutral"):
    m = {"neutral": "smile", "talk": "open", "point": "o", "wow": "open"}[pose]
    raise_r = pose in ("point", "wow")
    return svg(f'''
  <!-- very round chunky body -->
  <ellipse cx="300" cy="560" rx="130" ry="120" fill="#d4a878"/>
  <ellipse cx="300" cy="540" rx="110" ry="90" fill="#e0b888"/>
  <!-- green hoodie -->
  <path d="M200,470 Q300,430 400,470 L415,640 Q300,675 185,640 Z" fill="#5a6a58"/>
  <path d="M228,495 Q300,460 372,495 L378,620 Q300,650 222,620 Z" fill="#6a7a68"/>
  <ellipse cx="300" cy="465" rx="65" ry="24" fill="#4a5848"/>
  <!-- oversized round head -->
  <ellipse cx="300" cy="300" rx="145" ry="130" fill="#e8c090"/>
  <ellipse cx="300" cy="320" rx="115" ry="100" fill="#f0d0a0"/>
  <!-- TINY round ears (pika hallmark) -->
  <ellipse cx="200" cy="195" rx="22" ry="24" fill="#d4a878"/>
  <ellipse cx="400" cy="195" rx="22" ry="24" fill="#d4a878"/>
  <ellipse cx="200" cy="198" rx="10" ry="12" fill="#f0c8b0"/>
  <ellipse cx="400" cy="198" rx="10" ry="12" fill="#f0c8b0"/>
  <!-- short blunt muzzle -->
  <ellipse cx="300" cy="355" rx="42" ry="28" fill="#f8ecd8"/>
  <ellipse cx="300" cy="345" rx="12" ry="9" fill="#2a2118"/>
  <!-- headset -->
  <path d="M165,255 Q300,160 435,255" fill="none" stroke="#2a3038" stroke-width="16" stroke-linecap="round"/>
  <rect x="140" y="260" width="44" height="72" rx="12" fill="#3a4048"/>
  <rect x="416" y="260" width="44" height="72" rx="12" fill="#3a4048"/>
  <path d="M184,315 Q250,365 300,360" fill="none" stroke="#2a3038" stroke-width="8" stroke-linecap="round"/>
  <rect x="285" y="352" width="36" height="22" rx="8" fill="#4a5058"/>
  <!-- round shades -->
  <circle cx="262" cy="290" r="28" fill="#1a2428" opacity=".9"/>
  <circle cx="338" cy="290" r="28" fill="#1a2428" opacity=".9"/>
  <path d="M290,290 H310" stroke="#6a7a68" stroke-width="5"/>
  {eyes(300, 280, gap=38, look=3 if pose == 'point' else 0)}
  {mouth(m, 300, 395)}
  {arm('L', False, '#e8c090')}
  {arm('R', raise_r, '#e8c090')}
  {paws(color='#d4a878', spread=75)}
''')


# ---------- AARDVARK: long tubular snout, long upright ears, arched back, grey-brown ----------
def aardvark_base(pose, outfit):
    m = {"neutral": "smile", "talk": "open", "point": "o", "wow": "open"}[pose]
    raise_r = pose in ("point", "wow")
    fur, fur2 = "#9a7a58", "#ae8a68"
    body = f'''
  <!-- arched back hump -->
  <ellipse cx="300" cy="575" rx="118" ry="115" fill="{fur}"/>
  <ellipse cx="300" cy="500" rx="105" ry="70" fill="{fur2}"/>'''
    if outfit == "hoodie":
        clothes = f'''
  <path d="M205,455 Q300,420 395,455 L408,645 Q300,675 192,645 Z" fill="#3a4858"/>
  <path d="M230,480 Q300,448 370,480 L375,625 Q300,650 225,625 Z" fill="#4a5868"/>
  <ellipse cx="300" cy="450" rx="70" ry="26" fill="#2a3848"/>'''
        hat = f'''
  <path d="M175,215 Q300,105 425,215 Q300,190 175,215 Z" fill="#6b8f6a"/>
  <ellipse cx="300" cy="195" rx="118" ry="38" fill="#5a7f5a"/>
  <ellipse cx="300" cy="140" rx="22" ry="18" fill="#7a9f7a"/>'''
    elif outfit == "worker":
        clothes = f'''
  <path d="M210,455 Q300,425 390,455 L400,640 Q300,670 200,640 Z" fill="#c4a35a"/>
  <path d="M235,480 Q300,450 365,480 L370,620 Q300,645 230,620 Z" fill="#2a3848"/>
  <rect x="250" y="500" width="20" height="90" fill="#c4a35a"/>
  <rect x="330" y="500" width="20" height="90" fill="#c4a35a"/>'''
        hat = f'''
  <ellipse cx="300" cy="185" rx="145" ry="26" fill="#c4a35a"/>
  <ellipse cx="300" cy="158" rx="115" ry="50" fill="#e0c070"/>
  <ellipse cx="300" cy="138" rx="70" ry="20" fill="#d0b060"/>
  <rect x="288" y="100" width="24" height="28" rx="4" fill="#8a7030"/>'''
    elif outfit == "tired":
        clothes = f'''
  <path d="M205,455 Q300,420 395,455 L408,645 Q300,675 192,645 Z" fill="#4a4038"/>
  <path d="M230,480 Q300,448 370,480 L375,625 Q300,650 225,625 Z" fill="#5a5048"/>
  <ellipse cx="300" cy="450" rx="70" ry="26" fill="#3a3028"/>
  <!-- beard under snout -->
  <ellipse cx="300" cy="470" rx="55" ry="35" fill="#6a5040"/>'''
        hat = f'''
  <path d="M175,215 Q300,110 425,215 Q300,190 175,215 Z" fill="#5a4030"/>
  <ellipse cx="300" cy="195" rx="115" ry="36" fill="#4a3020"/>
  <ellipse cx="320" cy="145" rx="20" ry="16" fill="#6a5040"/>
  <!-- coffee L -->
  <rect x="125" y="520" width="50" height="60" rx="6" fill="#ebe4dc"/>
  <rect x="130" y="525" width="40" height="15" fill="#5a4030"/>
  <path d="M175,540 Q195,550 175,570" fill="none" stroke="#c4a35a" stroke-width="6"/>'''
    else:  # grad
        clothes = f'''
  <path d="M200,450 Q300,415 400,450 L415,660 Q300,690 185,660 Z" fill="#2a3038"/>
  <path d="M225,480 Q300,445 375,480 L385,640 Q300,665 215,640 Z" fill="#3a4048"/>
  <path d="M195,470 L410,610 L385,640 L170,500 Z" fill="#e0c070"/>
  <rect x="400" y="500" width="70" height="50" rx="4" fill="#ebe4dc" transform="rotate(-15 435 525)"/>
  <rect x="410" y="510" width="50" height="8" fill="#c4a35a" transform="rotate(-15 435 514)"/>'''
        hat = f'''
  <rect x="175" y="140" width="250" height="28" rx="2" fill="#1a2028"/>
  <path d="M300,140 L175,140 L300,85 L425,140 Z" fill="#2a3038"/>
  <rect x="295" y="85" width="10" height="55" fill="#c4a35a"/>
  <path d="M300,140 Q360,185 380,225" fill="none" stroke="#c4a35a" stroke-width="6"/>
  <rect x="370" y="220" width="24" height="18" fill="#c45848"/>'''

    # LONG upright ears (poke ABOVE hats) + LONG tubular snout
    head = f'''
  <!-- head -->
  <ellipse cx="300" cy="270" rx="120" ry="100" fill="{fur2}"/>
  <ellipse cx="300" cy="285" rx="95" ry="80" fill="#be9870"/>
  <!-- LONG tubular snout pointing forward/down -->
  <ellipse cx="300" cy="355" rx="38" ry="55" fill="#ae8a68"/>
  <ellipse cx="300" cy="410" rx="32" ry="40" fill="#9a7a58"/>
  <ellipse cx="300" cy="445" rx="26" ry="22" fill="#8a6a48"/>
  <ellipse cx="300" cy="458" rx="16" ry="10" fill="#2a2118"/>
  {hat}
  <!-- long upright ears drawn AFTER hat so tips stay visible -->
  <ellipse cx="175" cy="120" rx="26" ry="78" fill="{fur}"/>
  <ellipse cx="425" cy="120" rx="26" ry="78" fill="{fur}"/>
  <ellipse cx="175" cy="115" rx="11" ry="48" fill="#e8b4a0"/>
  <ellipse cx="425" cy="115" rx="11" ry="48" fill="#e8b4a0"/>
  <!-- shades on face above snout -->
  <rect x="228" y="255" width="58" height="36" rx="10" fill="#1a2428" opacity=".92"/>
  <rect x="314" y="255" width="58" height="36" rx="10" fill="#1a2428" opacity=".92"/>
  <path d="M286,273 H314" stroke="#6b8f6a" stroke-width="5"/>
  {eyes(300, 265, gap=42, look=2 if pose == 'point' else 0)}
  {mouth(m, 300, 430)}
  {arm('L', False, fur2)}
  {arm('R', raise_r, fur2)}
  {paws(color=fur)}
'''
    return svg(body + clothes + head)


def aardvark(pose="neutral"):
    return aardvark_base(pose, "hoodie")


def worker(pose="neutral"):
    return aardvark_base(pose, "worker")


def tired(pose="neutral"):
    return aardvark_base(pose, "tired")


def grad(pose="neutral"):
    return aardvark_base(pose, "grad")


# ---------- WALRUS: tusks, whiskers, flippers, blubbery grey ----------
def walrus(pose="neutral"):
    m = {"neutral": "smile", "talk": "open", "point": "o", "wow": "open"}[pose]
    raise_r = pose in ("point", "wow")
    return svg(f'''
  <!-- blubbery wide body -->
  <ellipse cx="300" cy="570" rx="150" ry="130" fill="#8a8078"/>
  <ellipse cx="300" cy="545" rx="130" ry="100" fill="#9a9088"/>
  <!-- captain jacket -->
  <path d="M195,470 Q300,430 405,470 L418,645 Q300,680 182,645 Z" fill="#3a4858"/>
  <path d="M222,495 Q300,455 378,495 L385,625 Q300,655 215,625 Z" fill="#4a5868"/>
  <rect x="278" y="510" width="44" height="85" fill="#c4a35a"/>
  <!-- round massive head -->
  <ellipse cx="300" cy="295" rx="155" ry="135" fill="#b0a498"/>
  <ellipse cx="300" cy="315" rx="125" ry="105" fill="#c0b4a8"/>
  <!-- whisker pads -->
  <ellipse cx="230" cy="360" rx="35" ry="28" fill="#a89888"/>
  <ellipse cx="370" cy="360" rx="35" ry="28" fill="#a89888"/>
  <!-- whiskers -->
  <path d="M200,360 L150,350" stroke="#2a2118" stroke-width="3"/>
  <path d="M200,370 L145,375" stroke="#2a2118" stroke-width="3"/>
  <path d="M200,380 L155,395" stroke="#2a2118" stroke-width="3"/>
  <path d="M400,360 L450,350" stroke="#2a2118" stroke-width="3"/>
  <path d="M400,370 L455,375" stroke="#2a2118" stroke-width="3"/>
  <path d="M400,380 L445,395" stroke="#2a2118" stroke-width="3"/>
  <!-- TUSKS -->
  <path d="M260,375 Q250,480 265,500 Q275,490 270,380 Z" fill="#f4f0ea"/>
  <path d="M340,375 Q350,480 335,500 Q325,490 330,380 Z" fill="#f4f0ea"/>
  <ellipse cx="300" cy="350" rx="36" ry="24" fill="#908070"/>
  <ellipse cx="300" cy="340" rx="14" ry="10" fill="#2a2118"/>
  <!-- tiny ear nubs -->
  <ellipse cx="160" cy="245" rx="16" ry="22" fill="#9a9088"/>
  <ellipse cx="440" cy="245" rx="16" ry="22" fill="#9a9088"/>
  <!-- captain hat -->
  <ellipse cx="300" cy="185" rx="135" ry="22" fill="#2a3038"/>
  <rect x="205" y="118" width="190" height="72" rx="8" fill="#3a4858"/>
  <rect x="205" y="145" width="190" height="18" fill="#c4a35a"/>
  <ellipse cx="300" cy="118" rx="48" ry="12" fill="#2a3038"/>
  <!-- shades -->
  <circle cx="258" cy="285" r="28" fill="#1a2428" opacity=".9"/>
  <circle cx="342" cy="285" r="28" fill="#1a2428" opacity=".9"/>
  <path d="M286,285 H314" stroke="#c4a35a" stroke-width="4"/>
  {eyes(300, 280, gap=42, look=-2 if pose == 'wow' else 0)}
  {mouth(m, 300, 410)}
  {arm('L', False, '#c0b4a8', flipper=True)}
  {arm('R', raise_r, '#c0b4a8', flipper=True)}
  {paws(color='#8a8078', spread=85, flat=True)}
''')


# ---------- KINKAJOU: round face, small round ears, LONG prehensile tail, golden ----------
def kinkajou(pose="neutral"):
    m = {"neutral": "smile", "talk": "open", "point": "o", "wow": "open"}[pose]
    raise_r = pose in ("point", "wow")
    return svg(f'''
  <!-- long prehensile tail curling up (species key) -->
  <path d="M410,620 Q480,560 470,420 Q460,320 420,280 Q400,260 410,300 Q430,360 420,480 Q410,560 380,600"
        fill="none" stroke="#c49050" stroke-width="28" stroke-linecap="round"/>
  <path d="M410,620 Q480,560 470,420 Q460,320 420,280 Q400,260 410,300 Q430,360 420,480 Q410,560 380,600"
        fill="none" stroke="#d8a860" stroke-width="16" stroke-linecap="round"/>
  <!-- golden body -->
  <ellipse cx="300" cy="560" rx="108" ry="125" fill="#c49050"/>
  <ellipse cx="300" cy="535" rx="90" ry="95" fill="#d8a860"/>
  <!-- blue TESTER tee -->
  <path d="M210,460 Q300,425 390,460 L400,645 Q300,675 200,645 Z" fill="#4a6a88"/>
  <path d="M235,485 Q300,455 365,485 L370,625 Q300,650 230,625 Z" fill="#5a7a98"/>
  <rect x="245" y="520" width="110" height="28" rx="4" fill="#ebe4dc"/>
  <text x="300" y="540" text-anchor="middle" font-size="16" font-family="sans-serif" font-weight="700" fill="#2a2118">TESTER</text>
  <!-- round golden face -->
  <ellipse cx="300" cy="290" rx="128" ry="118" fill="#e0b870"/>
  <ellipse cx="300" cy="310" rx="100" ry="90" fill="#ecc880"/>
  <!-- small round ears -->
  <ellipse cx="185" cy="200" rx="28" ry="30" fill="#c49050"/>
  <ellipse cx="415" cy="200" rx="28" ry="30" fill="#c49050"/>
  <ellipse cx="185" cy="205" rx="12" ry="14" fill="#f0c8a0"/>
  <ellipse cx="415" cy="205" rx="12" ry="14" fill="#f0c8a0"/>
  <ellipse cx="300" cy="348" rx="40" ry="26" fill="#f4e8d8"/>
  <ellipse cx="300" cy="338" rx="12" ry="9" fill="#2a2118"/>
  <!-- TESTER cap -->
  <ellipse cx="300" cy="200" rx="120" ry="26" fill="#2a3848"/>
  <path d="M190,205 Q300,135 410,205 Z" fill="#3a4858"/>
  <rect x="235" y="168" width="130" height="22" rx="4" fill="#c4a35a"/>
  <!-- clipboard L -->
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
  {arm('L', False, '#ecc880')}
  {arm('R', raise_r, '#ecc880')}
  {paws(color='#c49050')}
''')


# ---------- BINTURONG: shaggy dark fur, tufted ears, LONG bushy tail ----------
def binturong(pose="neutral"):
    m = {"neutral": "smile", "talk": "open", "point": "o", "wow": "open"}[pose]
    raise_r = pose in ("point", "wow")
    return svg(f'''
  <!-- long bushy tail (species key) -->
  <path d="M400,640 Q500,580 510,400 Q515,280 460,220"
        fill="none" stroke="#3a2e28" stroke-width="42" stroke-linecap="round"/>
  <path d="M400,640 Q500,580 510,400 Q515,280 460,220"
        fill="none" stroke="#5a4838" stroke-width="26" stroke-linecap="round"/>
  <ellipse cx="455" cy="210" rx="28" ry="22" fill="#4a3830"/>
  <!-- shaggy dark body -->
  <ellipse cx="300" cy="560" rx="125" ry="128" fill="#4a3830"/>
  <ellipse cx="300" cy="535" rx="105" ry="100" fill="#5a4838"/>
  <!-- shaggy fur tufts on sides -->
  <path d="M180,500 Q150,540 175,600" fill="none" stroke="#3a2e28" stroke-width="18" stroke-linecap="round"/>
  <path d="M420,500 Q450,540 425,600" fill="none" stroke="#3a2e28" stroke-width="18" stroke-linecap="round"/>
  <!-- shirt + red tie -->
  <path d="M205,455 Q300,420 395,455 L408,645 Q300,675 192,645 Z" fill="#ebe4dc"/>
  <path d="M285,470 L315,470 L330,620 L270,620 Z" fill="#c45848"/>
  <path d="M300,470 L315,490 L300,510 L285,490 Z" fill="#a03830"/>
  <!-- dark shaggy head -->
  <ellipse cx="300" cy="285" rx="138" ry="120" fill="#5a4838"/>
  <ellipse cx="300" cy="305" rx="108" ry="92" fill="#6a5848"/>
  <!-- tufted ears -->
  <ellipse cx="170" cy="185" rx="34" ry="48" fill="#4a3830"/>
  <ellipse cx="430" cy="185" rx="34" ry="48" fill="#4a3830"/>
  <path d="M170,145 L160,110 L180,140 Z" fill="#3a2e28"/>
  <path d="M430,145 L440,110 L420,140 Z" fill="#3a2e28"/>
  <ellipse cx="170" cy="195" rx="12" ry="20" fill="#7a6858"/>
  <ellipse cx="430" cy="195" rx="12" ry="20" fill="#7a6858"/>
  <!-- muzzle -->
  <ellipse cx="300" cy="350" rx="48" ry="32" fill="#9a8878"/>
  <ellipse cx="300" cy="340" rx="14" ry="10" fill="#2a2118"/>
  <!-- inspector visor -->
  <ellipse cx="300" cy="195" rx="140" ry="22" fill="#2a3038"/>
  <path d="M170,205 Q300,145 430,205" fill="none" stroke="#3a4858" stroke-width="26" stroke-linecap="round"/>
  <rect x="175" y="210" width="250" height="26" rx="4" fill="#1a2428" opacity=".5"/>
  <!-- red-frame shades -->
  <rect x="228" y="265" width="58" height="38" rx="8" fill="#1a2428" opacity=".9"/>
  <rect x="314" y="265" width="58" height="38" rx="8" fill="#1a2428" opacity=".9"/>
  <path d="M286,284 H314" stroke="#c45848" stroke-width="5"/>
  <!-- stamp -->
  <rect x="400" y="{420 if raise_r else 530}" width="50" height="40" rx="4" fill="#c45848"/>
  <rect x="415" y="{400 if raise_r else 510}" width="20" height="30" rx="3" fill="#8a3030"/>
  {eyes(300, 275, gap=42, look=2 if pose == 'point' else 0)}
  {mouth(m, 300, 390)}
  {arm('L', False, '#6a5848')}
  {arm('R', raise_r, '#6a5848')}
  {paws(color='#4a3830')}
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
