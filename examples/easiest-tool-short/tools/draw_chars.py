#!/usr/bin/env python3
"""Hand-author original anthropomorphic animal SVGs (V1 style) and rasterize to PNG.

Species intentionally NOT reused from prior Shorts
(quokka, red panda, axolotl, pangolin, lemur, capybara, wombat, hedgehog,
ferret, sugar glider, otter, beaver).

Cast: alpaca, chinchilla, meerkat, fennec — themed hats/sunglasses/outfits.
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


# ---------- Alpaca (hook / question): cozy maker host — soft beanie + round shades ----------
def alpaca(pose="neutral"):
    m = {"neutral": "smile", "talk": "open", "point": "o", "wow": "open"}[pose]
    raise_r = pose in ("point", "wow")
    return svg(f'''
  <ellipse cx="300" cy="565" rx="115" ry="130" fill="#d8c4a8"/>
  <!-- cream maker cardigan -->
  <path d="M205,465 Q300,430 395,465 L405,645 Q300,680 195,645 Z" fill="#c4a878"/>
  <path d="M225,485 Q300,455 375,485 L380,635 Q300,655 220,635 Z" fill="#d4bc90"/>
  <rect x="280" y="530" width="40" height="22" rx="4" fill="#8a6e48"/>
  <path d="M250,505 Q300,520 350,505" fill="none" stroke="#8a6e48" stroke-width="5"/>
  <!-- fluffy alpaca head -->
  <ellipse cx="300" cy="290" rx="150" ry="140" fill="#ead8c0"/>
  <ellipse cx="300" cy="310" rx="118" ry="105" fill="#f2e4d0"/>
  <!-- tall banana ears -->
  <ellipse cx="195" cy="160" rx="28" ry="58" fill="#d8c4a8" transform="rotate(-18 195 160)"/>
  <ellipse cx="405" cy="160" rx="28" ry="58" fill="#d8c4a8" transform="rotate(18 405 160)"/>
  <ellipse cx="195" cy="165" rx="12" ry="30" fill="#e8b4a0" transform="rotate(-18 195 165)"/>
  <ellipse cx="405" cy="165" rx="12" ry="30" fill="#e8b4a0" transform="rotate(18 405 165)"/>
  <!-- soft beanie -->
  <path d="M170,210 Q300,80 430,210" fill="#6b8f6a"/>
  <ellipse cx="300" cy="205" rx="135" ry="28" fill="#5a7a5a"/>
  <circle cx="300" cy="95" r="18" fill="#c4785a"/>
  <!-- muzzle -->
  <ellipse cx="300" cy="355" rx="48" ry="38" fill="#f7ebe0"/>
  <ellipse cx="300" cy="340" rx="14" ry="10" fill="#2a2118"/>
  {eyes(300, 275, gap=36, look=4 if pose == 'point' else 0)}
  <!-- round sunglasses -->
  <circle cx="264" cy="278" r="28" fill="#2a3028" opacity=".88"/>
  <circle cx="336" cy="278" r="28" fill="#2a3028" opacity=".88"/>
  <path d="M292,278 H308" stroke="#3a4038" stroke-width="5"/>
  <circle cx="254" cy="270" r="7" fill="#8ab" opacity=".28"/>
  <circle cx="326" cy="270" r="7" fill="#8ab" opacity=".28"/>
  {mouth(m, 300, 375)}
  {arm('L', False, '#ead8c0')}
  {arm('R', raise_r, '#ead8c0')}
  {paws(color='#d8c4a8')}
''')


# ---------- Chinchilla (Twine): librarian / storyteller — quill hat + reading glasses ----------
def chinchilla(pose="neutral"):
    m = {"neutral": "smile", "talk": "open", "point": "o", "wow": "open"}[pose]
    raise_r = pose in ("point", "wow", "talk")
    return svg(f'''
  <ellipse cx="300" cy="560" rx="110" ry="125" fill="#a8a0b0"/>
  <!-- librarian robe -->
  <path d="M210,470 Q300,435 390,470 L400,640 Q300,675 200,640 Z" fill="#5a4868"/>
  <path d="M230,490 Q300,460 370,490 L375,630 Q300,650 225,630 Z" fill="#6a5878"/>
  <rect x="270" y="540" width="60" height="8" rx="2" fill="#c4a35a"/>
  <!-- soft grey head -->
  <ellipse cx="300" cy="295" rx="145" ry="132" fill="#c8c0d0"/>
  <ellipse cx="300" cy="315" rx="112" ry="100" fill="#d8d0e0"/>
  <!-- round ears -->
  <ellipse cx="180" cy="200" rx="32" ry="36" fill="#a8a0b0"/>
  <ellipse cx="420" cy="200" rx="32" ry="36" fill="#a8a0b0"/>
  <ellipse cx="180" cy="205" rx="14" ry="16" fill="#e8b4c0"/>
  <ellipse cx="420" cy="205" rx="14" ry="16" fill="#e8b4c0"/>
  <!-- storyteller hat + quill -->
  <ellipse cx="300" cy="185" rx="120" ry="40" fill="#3a2e48"/>
  <path d="M200,190 Q300,110 400,190" fill="#4a3a58"/>
  <ellipse cx="300" cy="210" rx="130" ry="18" fill="#2a2038"/>
  <!-- quill -->
  <path d="M400,120 Q430,80 460,50" fill="none" stroke="#ead8c0" stroke-width="8" stroke-linecap="round"/>
  <path d="M455,55 L475,40 L460,70 Z" fill="#c4a35a"/>
  <ellipse cx="405" cy="125" rx="10" ry="6" fill="#8a6e48"/>
  <!-- reading glasses -->
  <circle cx="262" cy="280" r="26" fill="none" stroke="#2a2118" stroke-width="5"/>
  <circle cx="338" cy="280" r="26" fill="none" stroke="#2a2118" stroke-width="5"/>
  <path d="M288,280 H312" stroke="#2a2118" stroke-width="4"/>
  <ellipse cx="300" cy="340" rx="50" ry="34" fill="#ebe4f0"/>
  <ellipse cx="292" cy="328" rx="6" ry="5" fill="#2a2118"/>
  <ellipse cx="308" cy="328" rx="6" ry="5" fill="#2a2118"/>
  {eyes(300, 278, gap=38)}
  {mouth(m, 300, 362)}
  <!-- book under arm suggestion -->
  <rect x="155" y="520" width="48" height="60" rx="4" fill="#c4a35a"/>
  <rect x="160" y="525" width="38" height="50" rx="2" fill="#f0e6d0"/>
  {arm('L', False, '#c8c0d0')}
  {arm('R', raise_r, '#c8c0d0')}
  {paws(color='#a8a0b0')}
''')


# ---------- Meerkat (GDevelop): logic tinkerer — key badge + toolbox vest + goggles ----------
def meerkat(pose="neutral"):
    m = {"neutral": "smile", "talk": "open", "point": "o", "wow": "open"}[pose]
    raise_r = pose in ("point", "wow")
    return svg(f'''
  <ellipse cx="300" cy="555" rx="100" ry="135" fill="#c49a6a"/>
  <!-- tall tinkerer torso / vest -->
  <path d="M220,455 Q300,420 380,455 L390,640 Q300,670 210,640 Z" fill="#4a6a78"/>
  <path d="M240,475 Q300,450 360,475 L365,625 Q300,645 235,625 Z" fill="#5a7a88"/>
  <rect x="245" y="510" width="40" height="36" rx="4" fill="#c4a35a"/>
  <rect x="315" y="510" width="40" height="36" rx="4" fill="#c4785a"/>
  <!-- key badge -->
  <circle cx="300" cy="560" r="18" fill="#e0c070"/>
  <rect x="312" y="555" width="28" height="8" rx="2" fill="#e0c070"/>
  <!-- head -->
  <ellipse cx="300" cy="280" rx="130" ry="125" fill="#d8b080"/>
  <ellipse cx="300" cy="300" rx="100" ry="95" fill="#e8c898"/>
  <!-- dark eye patches (meerkat) -->
  <ellipse cx="255" cy="275" rx="32" ry="28" fill="#6a5040" opacity=".55"/>
  <ellipse cx="345" cy="275" rx="32" ry="28" fill="#6a5040" opacity=".55"/>
  <!-- ears -->
  <ellipse cx="195" cy="185" rx="24" ry="30" fill="#c49a6a"/>
  <ellipse cx="405" cy="185" rx="24" ry="30" fill="#c49a6a"/>
  <ellipse cx="195" cy="188" rx="10" ry="14" fill="#e8b4a0"/>
  <ellipse cx="405" cy="188" rx="10" ry="14" fill="#e8b4a0"/>
  <!-- goggles on forehead / worn -->
  <ellipse cx="255" cy="230" rx="34" ry="22" fill="#2a4048"/>
  <ellipse cx="345" cy="230" rx="34" ry="22" fill="#2a4048"/>
  <path d="M289,230 H311" stroke="#3a5058" stroke-width="6"/>
  <ellipse cx="255" cy="230" rx="22" ry="14" fill="#7ec8d0" opacity=".45"/>
  <ellipse cx="345" cy="230" rx="22" ry="14" fill="#7ec8d0" opacity=".45"/>
  <ellipse cx="300" cy="335" rx="42" ry="30" fill="#f0dcc0"/>
  <ellipse cx="300" cy="325" rx="10" ry="8" fill="#2a2118"/>
  {eyes(300, 275, gap=40, look=3 if pose == 'point' else 0)}
  {mouth(m, 300, 355)}
  <!-- small door prop hint in raised hand when pointing -->
  {arm('L', False, '#d8b080')}
  {arm('R', raise_r, '#d8b080')}
  {paws(color='#c49a6a')}
''')


# ---------- Fennec fox (Nilo): cheerful 3D-world explorer — big ears + portal scarf + goggles ----------
def fennec(pose="neutral"):
    m = {"neutral": "smile", "talk": "open", "point": "o", "wow": "open"}[pose]
    raise_r = pose in ("point", "wow")
    return svg(f'''
  <ellipse cx="300" cy="565" rx="108" ry="128" fill="#e0b888"/>
  <!-- teal explorer hoodie -->
  <path d="M210,470 Q300,430 390,470 L400,640 Q300,675 200,640 Z" fill="#3a7a78"/>
  <path d="M230,490 Q300,455 370,490 L375,630 Q300,650 225,630 Z" fill="#4a8a88"/>
  <path d="M250,500 Q300,520 350,500" fill="none" stroke="#2a5a58" stroke-width="6"/>
  <!-- orange portal scarf -->
  <path d="M220,475 Q300,455 380,475 L370,510 Q300,495 230,510 Z" fill="#c4785a"/>
  <path d="M360,495 Q390,560 370,620" fill="none" stroke="#c4785a" stroke-width="18" stroke-linecap="round"/>
  <!-- head -->
  <ellipse cx="300" cy="295" rx="140" ry="128" fill="#f0c898"/>
  <ellipse cx="300" cy="315" rx="110" ry="98" fill="#f8d8b0"/>
  <!-- huge fennec ears -->
  <ellipse cx="175" cy="140" rx="42" ry="90" fill="#e0b888" transform="rotate(-12 175 140)"/>
  <ellipse cx="425" cy="140" rx="42" ry="90" fill="#e0b888" transform="rotate(12 425 140)"/>
  <ellipse cx="175" cy="150" rx="18" ry="55" fill="#e8b4a0" transform="rotate(-12 175 150)"/>
  <ellipse cx="425" cy="150" rx="18" ry="55" fill="#e8b4a0" transform="rotate(12 425 150)"/>
  <!-- explorer goggles -->
  <ellipse cx="258" cy="275" rx="32" ry="26" fill="#1e3840" opacity=".9"/>
  <ellipse cx="342" cy="275" rx="32" ry="26" fill="#1e3840" opacity=".9"/>
  <path d="M290,275 H310" stroke="#2a4850" stroke-width="6"/>
  <ellipse cx="250" cy="268" rx="10" ry="8" fill="#7ec" opacity=".35"/>
  <ellipse cx="334" cy="268" rx="10" ry="8" fill="#7ec" opacity=".35"/>
  <path d="M170,250 Q300,220 430,250" fill="none" stroke="#2a4850" stroke-width="8"/>
  <ellipse cx="300" cy="340" rx="48" ry="34" fill="#f8e8d0"/>
  <ellipse cx="300" cy="328" rx="12" ry="9" fill="#2a2118"/>
  {eyes(300, 275, gap=42)}
  {mouth(m, 300, 362)}
  <!-- tiny backpack -->
  <ellipse cx="420" cy="540" rx="28" ry="40" fill="#5a6a48"/>
  <rect x="408" y="510" width="24" height="10" rx="3" fill="#3a4a30"/>
  {arm('L', False, '#f0c898')}
  {arm('R', raise_r, '#f0c898')}
  {paws(color='#e0b888')}
''')


CHARS = {
    "alpaca": alpaca,
    "chinchilla": chinchilla,
    "meerkat": meerkat,
    "fennec": fennec,
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
