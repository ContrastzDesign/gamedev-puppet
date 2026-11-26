#!/usr/bin/env python3
"""Hand-author original anthropomorphic animal SVGs (V1 style) and rasterize to PNG.

Species intentionally NOT reused from prior Shorts
(quokka, red panda, axolotl, pangolin, lemur, capybara, wombat, hedgehog,
ferret, sugar glider, otter, beaver, alpaca, chinchilla, meerkat, fennec,
raccoon, wallaby, puffin, tortoise).

Cast: tapir, flamingo, armadillo, platypus — themed hats/sunglasses/outfits.
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


# ---------- Tapir (hook / museum host): sales-chart analyst — time-travel visor + clipboard ----------
def tapir(pose="neutral"):
    m = {"neutral": "smile", "talk": "open", "point": "o", "wow": "open"}[pose]
    raise_r = pose in ("point", "wow")
    return svg(f'''
  <ellipse cx="300" cy="560" rx="118" ry="130" fill="#6a6258"/>
  <!-- analyst blazer -->
  <path d="M205,460 Q300,425 395,460 L405,645 Q300,675 195,645 Z" fill="#3a4858"/>
  <path d="M225,480 Q300,450 375,480 L380,630 Q300,650 220,630 Z" fill="#4a5868"/>
  <path d="M250,505 Q300,520 350,505" fill="none" stroke="#c4a35a" stroke-width="4"/>
  <!-- chart clipboard -->
  <rect x="145" y="500" width="70" height="90" rx="6" fill="#d8c8a0"/>
  <rect x="155" y="512" width="50" height="8" rx="2" fill="#c45848"/>
  <rect x="155" y="528" width="40" height="6" rx="2" fill="#6b8f6a"/>
  <rect x="155" y="542" width="45" height="6" rx="2" fill="#4a8a98"/>
  <rect x="155" y="556" width="30" height="6" rx="2" fill="#a87890"/>
  <!-- tapir body shade (pale saddle) -->
  <ellipse cx="300" cy="600" rx="70" ry="50" fill="#ebe4dc" opacity=".7"/>
  <!-- head -->
  <ellipse cx="300" cy="290" rx="140" ry="125" fill="#7a7268"/>
  <ellipse cx="300" cy="310" rx="110" ry="95" fill="#8a8278"/>
  <!-- prominent tapir trunk/snout (species signal) -->
  <ellipse cx="300" cy="340" rx="48" ry="36" fill="#5a5248"/>
  <path d="M270,350 Q300,420 330,350 Q320,390 300,405 Q280,390 270,350 Z" fill="#4a4238"/>
  <ellipse cx="300" cy="400" rx="28" ry="18" fill="#3a3228"/>
  <ellipse cx="288" cy="402" rx="7" ry="5" fill="#2a2118"/>
  <ellipse cx="312" cy="402" rx="7" ry="5" fill="#2a2118"/>
  <!-- round ears -->
  <ellipse cx="185" cy="200" rx="30" ry="36" fill="#6a6258"/>
  <ellipse cx="415" cy="200" rx="30" ry="36" fill="#6a6258"/>
  <ellipse cx="185" cy="205" rx="14" ry="18" fill="#e8b4a0"/>
  <ellipse cx="415" cy="205" rx="14" ry="18" fill="#e8b4a0"/>
  <!-- time-travel visor hat -->
  <ellipse cx="300" cy="195" rx="130" ry="40" fill="#2a3848"/>
  <path d="M180,205 Q300,130 420,205" fill="#3a4858"/>
  <ellipse cx="300" cy="215" rx="135" ry="14" fill="#1a2838"/>
  <rect x="210" y="200" width="180" height="28" rx="8" fill="#4a8a98" opacity=".85"/>
  <rect x="220" y="206" width="40" height="16" rx="3" fill="#a0e0f0" opacity=".55"/>
  <rect x="280" y="206" width="40" height="16" rx="3" fill="#a0e0f0" opacity=".4"/>
  <rect x="340" y="206" width="40" height="16" rx="3" fill="#a0e0f0" opacity=".55"/>
  <circle cx="390" cy="175" r="10" fill="#c45848"/>
  <!-- round analyst shades -->
  <circle cx="260" cy="285" r="28" fill="#1a2428" opacity=".9"/>
  <circle cx="340" cy="285" r="28" fill="#1a2428" opacity=".9"/>
  <path d="M288,285 H312" stroke="#3a4850" stroke-width="5"/>
  <circle cx="250" cy="278" r="6" fill="#8ab" opacity=".3"/>
  <circle cx="330" cy="278" r="6" fill="#8ab" opacity=".3"/>
  {eyes(300, 275, gap=40, look=3 if pose == 'point' else 0)}
  {mouth(m, 300, 420)}
  {arm('L', False, '#8a8278')}
  {arm('R', raise_r, '#8a8278')}
  {paws(color='#6a6258')}
''')


# ---------- Flamingo (Vice City 2002): neon-80s Miami cruiser — pastel suit + shades ----------
def flamingo(pose="neutral"):
    m = {"neutral": "smile", "talk": "open", "point": "o", "wow": "open"}[pose]
    raise_r = pose in ("point", "wow")
    return svg(f'''
  <ellipse cx="300" cy="565" rx="108" ry="125" fill="#e8a0b0"/>
  <!-- pastel Miami suit -->
  <path d="M210,465 Q300,430 390,465 L400,640 Q300,670 200,640 Z" fill="#7ab8c8"/>
  <path d="M230,485 Q300,455 370,485 L375,625 Q300,645 225,625 Z" fill="#98d0dc"/>
  <rect x="275" y="520" width="50" height="8" rx="2" fill="#e8c878"/>
  <!-- flamingo neck hint under head -->
  <ellipse cx="300" cy="430" rx="28" ry="45" fill="#e8a0b0"/>
  <!-- head -->
  <ellipse cx="300" cy="280" rx="125" ry="115" fill="#f0b0c0"/>
  <ellipse cx="300" cy="300" rx="95" ry="88" fill="#f8c0d0"/>
  <!-- flamingo beak (species signal) -->
  <path d="M300,330 L220,360 L235,395 L300,370 L365,395 L380,360 Z" fill="#2a2118"/>
  <path d="M300,330 L250,350 L260,375 L300,360 L340,375 L350,350 Z" fill="#e8c878"/>
  <path d="M235,375 L365,375" stroke="#c45848" stroke-width="6"/>
  <!-- small ears / head tuft -->
  <ellipse cx="210" cy="195" rx="18" ry="24" fill="#e090a0"/>
  <ellipse cx="390" cy="195" rx="18" ry="24" fill="#e090a0"/>
  <!-- white fedora -->
  <ellipse cx="300" cy="185" rx="135" ry="28" fill="#f4f0ea"/>
  <path d="M195,190 Q300,125 405,190" fill="#ebe4dc"/>
  <ellipse cx="300" cy="200" rx="90" ry="18" fill="#d8d0c8"/>
  <ellipse cx="360" cy="210" rx="70" ry="12" fill="#f4f0ea"/>
  <!-- neon round sunglasses -->
  <circle cx="262" cy="275" r="30" fill="#2a1848" opacity=".92"/>
  <circle cx="338" cy="275" r="30" fill="#2a1848" opacity=".92"/>
  <path d="M292,275 H308" stroke="#c4a35a" stroke-width="5"/>
  <circle cx="252" cy="268" r="7" fill="#e8a0f0" opacity=".35"/>
  <circle cx="328" cy="268" r="7" fill="#e8a0f0" opacity=".35"/>
  {eyes(300, 275, gap=38, look=4 if pose == 'point' else 0)}
  {mouth(m, 300, 395) if pose != 'neutral' else ''}
  {arm('L', False, '#f0b0c0')}
  {arm('R', raise_r, '#f0b0c0')}
  <!-- pink flamingo feet -->
  {paws(color='#e07090')}
''')


# ---------- Armadillo (Guitar Hero 2007): rock star — plastic guitar + wristbands ----------
def armadillo(pose="neutral"):
    m = {"neutral": "smile", "talk": "open", "point": "o", "wow": "open"}[pose]
    raise_r = pose in ("point", "wow", "talk")
    return svg(f'''
  <!-- armored shell body with clear bands (species signal) -->
  <ellipse cx="300" cy="565" rx="140" ry="128" fill="#6a5a48"/>
  <ellipse cx="300" cy="550" rx="125" ry="110" fill="#8a7860"/>
  <path d="M185,485 Q300,430 415,485 L400,520 Q300,475 200,520 Z" fill="#a09070"/>
  <path d="M180,530 Q300,480 420,530 L405,565 Q300,520 195,565 Z" fill="#7a6a58"/>
  <path d="M185,575 Q300,530 415,575 L400,610 Q300,570 200,610 Z" fill="#a09070"/>
  <path d="M200,620 Q300,590 400,620 L380,655 Q300,630 220,655 Z" fill="#7a6a58"/>
  <!-- rock tee over shell rim -->
  <path d="M220,455 Q300,425 380,455 L385,520 Q300,500 215,520 Z" fill="#2a2838"/>
  <path d="M270,475 L300,505 L330,475 L315,520 L285,520 Z" fill="#c45848"/>
  <!-- pointed armadillo snout head -->
  <ellipse cx="300" cy="295" rx="120" ry="110" fill="#b8a080"/>
  <ellipse cx="300" cy="310" rx="95" ry="85" fill="#c8b090"/>
  <path d="M300,340 L240,380 L260,400 L300,385 L340,400 L360,380 Z" fill="#a89070"/>
  <ellipse cx="300" cy="355" rx="22" ry="14" fill="#2a2118"/>
  <ellipse cx="200" cy="215" rx="22" ry="28" fill="#8a7860"/>
  <ellipse cx="400" cy="215" rx="22" ry="28" fill="#8a7860"/>
  <!-- spiky rock hair / bandana -->
  <path d="M175,220 L210,140 L250,200 L300,125 L350,200 L390,140 L425,220" fill="#2a2838"/>
  <path d="M190,215 Q300,175 410,215" fill="#c45848"/>
  <ellipse cx="300" cy="220" rx="115" ry="16" fill="#a04038"/>
  <!-- star shades -->
  <path d="M235,270 L255,250 L275,270 L255,290 Z" fill="#1a1828" opacity=".92"/>
  <path d="M325,270 L345,250 L365,270 L345,290 Z" fill="#1a1828" opacity=".92"/>
  <path d="M275,270 H325" stroke="#c4a35a" stroke-width="4"/>
  {eyes(300, 275, gap=40, look=3 if pose == 'point' else 0)}
  {mouth(m, 300, 395)}
  <!-- wristbands -->
  <rect x="160" y="520" width="50" height="18" rx="4" fill="#c45848"/>
  <rect x="160" y="520" width="50" height="6" fill="#f0e6d0"/>
  <rect x="390" y="500" width="50" height="18" rx="4" fill="#4a8a98"/>
  <rect x="390" y="500" width="50" height="6" fill="#f0e6d0"/>
  <!-- plastic guitar controller (clear guitar silhouette) -->
  <g transform="translate(455,520) rotate(35)">
    <ellipse cx="0" cy="30" rx="42" ry="55" fill="#2a2e38"/>
    <rect x="-12" y="-110" width="24" height="120" rx="6" fill="#3a3e48"/>
    <rect x="-8" y="-100" width="16" height="8" rx="2" fill="#c45848"/>
    <rect x="-8" y="-85" width="16" height="8" rx="2" fill="#6b8f6a"/>
    <rect x="-8" y="-70" width="16" height="8" rx="2" fill="#c4a35a"/>
    <rect x="-8" y="-55" width="16" height="8" rx="2" fill="#4a8a98"/>
    <rect x="-8" y="-40" width="16" height="8" rx="2" fill="#a87890"/>
    <circle cx="-12" cy="20" r="8" fill="#c45848"/>
    <circle cx="12" cy="20" r="8" fill="#6b8f6a"/>
    <circle cx="-12" cy="40" r="8" fill="#c4a35a"/>
    <circle cx="12" cy="40" r="8" fill="#4a8a98"/>
    <rect x="-6" y="70" width="12" height="35" rx="3" fill="#1a1e28"/>
  </g>
  {arm('L', False, '#c8b090')}
  {arm('R', raise_r, '#c8b090')}
  {paws(color='#8a7860')}
''')


# ---------- Platypus (2011 finale): MW3/Skyrim duo look — soldier helmet + fantasy horn helm ----------
def platypus(pose="neutral"):
    m = {"neutral": "smile", "talk": "open", "point": "o", "wow": "open"}[pose]
    raise_r = pose in ("point", "wow")
    return svg(f'''
  <ellipse cx="300" cy="565" rx="118" ry="128" fill="#6a7a68"/>
  <!-- split outfit: left military, right fantasy robe -->
  <path d="M200,465 Q270,430 300,450 L300,650 Q250,665 195,640 Z" fill="#3a4840"/>
  <path d="M300,450 Q330,430 400,465 L405,640 Q350,665 300,650 Z" fill="#5a4868"/>
  <path d="M220,500 Q260,490 300,505" fill="none" stroke="#6b8f6a" stroke-width="5"/>
  <path d="M300,505 Q340,490 380,500" fill="none" stroke="#c4a35a" stroke-width="5"/>
  <!-- ammo pouch / spell pouch -->
  <rect x="215" y="545" width="40" height="35" rx="4" fill="#2a3830"/>
  <ellipse cx="365" cy="560" rx="22" ry="18" fill="#3a2a48"/>
  <!-- head -->
  <ellipse cx="300" cy="290" rx="130" ry="115" fill="#8a9a78"/>
  <ellipse cx="300" cy="305" rx="100" ry="88" fill="#9aaa88"/>
  <!-- wide platypus duckbill (species signal) -->
  <ellipse cx="300" cy="370" rx="95" ry="38" fill="#c4a070"/>
  <ellipse cx="300" cy="372" rx="78" ry="28" fill="#d8b888"/>
  <path d="M230,365 Q300,385 370,365" fill="none" stroke="#2a2118" stroke-width="4" opacity=".4"/>
  <ellipse cx="265" cy="375" rx="10" ry="6" fill="#2a2118" opacity=".25"/>
  <ellipse cx="335" cy="375" rx="10" ry="6" fill="#2a2118" opacity=".25"/>
  <!-- dual helmet: left soldier, right horned helm -->
  <path d="M170,225 Q240,140 300,165 L300,245 Q225,240 175,245 Z" fill="#4a5850"/>
  <path d="M300,165 Q360,140 430,225 L425,245 Q375,240 300,245 Z" fill="#6a5868"/>
  <ellipse cx="235" cy="195" rx="58" ry="24" fill="#3a4840"/>
  <rect x="205" y="205" width="60" height="20" rx="3" fill="#2a3830"/>
  <circle cx="215" cy="215" r="4" fill="#6b8f6a"/>
  <!-- fantasy horns (tall, readable) -->
  <path d="M350,175 L365,95 L385,178 Z" fill="#e8dcc0"/>
  <path d="M395,180 L420,100 L435,185 Z" fill="#e8dcc0"/>
  <ellipse cx="300" cy="225" rx="120" ry="14" fill="#2a2830" opacity=".5"/>
  <!-- sport/tactical shades -->
  <rect x="230" y="268" width="55" height="26" rx="6" fill="#1a2420" opacity=".9"/>
  <rect x="315" y="268" width="55" height="26" rx="6" fill="#1a2420" opacity=".9"/>
  <path d="M285,281 H315" stroke="#6b8f6a" stroke-width="4"/>
  {eyes(300, 275, gap=40, look=3 if pose == 'point' else 0)}
  {mouth(m, 300, 415)}
  {arm('L', False, '#9aaa88')}
  {arm('R', raise_r, '#9aaa88')}
  <!-- wide webbed feet -->
  <ellipse cx="230" cy="715" rx="40" ry="14" fill="#c4a070"/>
  <ellipse cx="370" cy="715" rx="40" ry="14" fill="#c4a070"/>
  <path d="M200,715 L215,700 L230,715 L245,700 L260,715" fill="none" stroke="#a88050" stroke-width="3"/>
  <path d="M340,715 L355,700 L370,715 L385,700 L400,715" fill="none" stroke="#a88050" stroke-width="3"/>
''')


CHARS = {
    "tapir": tapir,
    "flamingo": flamingo,
    "armadillo": armadillo,
    "platypus": platypus,
}
POSES = ("neutral", "talk", "point", "wow")


def main():
    for name, fn in CHARS.items():
        for pose in POSES:
            raw = fn(pose)
            svg_path = OUT / f"{name}-{pose}.svg"
            png_path = OUT / f"{name}-{pose}.png"
            svg_path.write_text(raw)
            cairosvg.svg2png(bytestring=raw.encode("utf-8"), write_to=str(png_path),
                             output_width=W, output_height=H)
            print(f"wrote {svg_path.name} + {png_path.name}")


if __name__ == "__main__":
    main()
