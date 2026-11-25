#!/usr/bin/env python3
"""Hand-author original anthropomorphic animal SVGs (V1 style) and rasterize to PNG.

Species intentionally NOT reused from gamer-sites (quokka, red panda, axolotl, pangolin, lemur).
Cast: capybara, wombat, hedgehog, ferret, sugar glider — themed hats/sunglasses/outfits.
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


# ---------- Capybara (hook / platform): safari explorer hat + round sunglasses ----------
def capybara(pose="neutral"):
    m = {"neutral": "smile", "talk": "open", "point": "o", "wow": "open"}[pose]
    raise_r = pose in ("point", "wow")
    return svg(f'''
  <ellipse cx="300" cy="565" rx="118" ry="128" fill="#b8926a"/>
  <!-- khaki explorer shirt -->
  <path d="M200,465 Q300,425 400,465 L410,645 Q300,685 190,645 Z" fill="#8a7a58"/>
  <path d="M220,480 Q300,450 380,480 L385,635 Q300,660 215,635 Z" fill="#9c8a64"/>
  <rect x="275" y="520" width="50" height="28" rx="4" fill="#6a5a40"/>
  <path d="M250,500 Q300,515 350,500" fill="none" stroke="#6a5a40" stroke-width="6"/>
  <!-- head (big round capybara) -->
  <ellipse cx="300" cy="285" rx="155" ry="138" fill="#c9a882"/>
  <ellipse cx="300" cy="305" rx="120" ry="100" fill="#d8b894"/>
  <!-- tiny round ears -->
  <ellipse cx="175" cy="195" rx="26" ry="30" fill="#b8926a"/>
  <ellipse cx="425" cy="195" rx="26" ry="30" fill="#b8926a"/>
  <ellipse cx="175" cy="198" rx="12" ry="14" fill="#e8b4a0"/>
  <ellipse cx="425" cy="198" rx="12" ry="14" fill="#e8b4a0"/>
  <!-- safari hat -->
  <ellipse cx="300" cy="195" rx="155" ry="28" fill="#8a6e48"/>
  <path d="M175,190 Q300,95 425,190" fill="#a08055"/>
  <ellipse cx="300" cy="155" rx="70" ry="18" fill="#7a6038"/>
  <path d="M230,160 Q300,145 370,160" fill="none" stroke="#6a5030" stroke-width="6"/>
  <!-- muzzle -->
  <ellipse cx="300" cy="340" rx="62" ry="42" fill="#ead4b8"/>
  <ellipse cx="288" cy="325" rx="8" ry="6" fill="#2a2118"/>
  <ellipse cx="312" cy="325" rx="8" ry="6" fill="#2a2118"/>
  {eyes(300, 275, gap=38, look=4 if pose == 'point' else 0)}
  <!-- round sunglasses -->
  <circle cx="262" cy="278" r="30" fill="#2a3028" opacity=".85"/>
  <circle cx="338" cy="278" r="30" fill="#2a3028" opacity=".85"/>
  <path d="M292,278 H308" stroke="#3a4038" stroke-width="5"/>
  <circle cx="252" cy="270" r="8" fill="#8ab" opacity=".25"/>
  <circle cx="328" cy="270" r="8" fill="#8ab" opacity=".25"/>
  {mouth(m, 300, 365)}
  {arm('L', False, '#c9a882')}
  {arm('R', raise_r, '#c9a882')}
  {paws(color='#b8926a')}
''')


# ---------- Wombat (Roblox Studio): blocky builder vest + hard hat + shades ----------
def wombat(pose="neutral"):
    m = {"neutral": "smile", "talk": "open", "point": "o", "wow": "open"}[pose]
    raise_r = pose in ("point", "wow")
    return svg(f'''
  <ellipse cx="300" cy="565" rx="120" ry="125" fill="#8a6e52"/>
  <!-- chunky builder vest (blocky pockets) -->
  <path d="M205,470 Q300,435 395,470 L405,640 Q300,675 195,640 Z" fill="#c4785a"/>
  <path d="M230,485 L285,485 L290,635 L230,625 Z" fill="#d4906a"/>
  <path d="M370,485 L315,485 L310,635 L370,625 Z" fill="#d4906a"/>
  <rect x="240" y="520" width="50" height="40" rx="4" fill="#5a6a4c"/>
  <rect x="310" y="520" width="50" height="40" rx="4" fill="#5a6a4c"/>
  <rect x="265" y="575" width="70" height="28" rx="3" fill="#4a4038"/>
  <!-- head -->
  <ellipse cx="300" cy="290" rx="145" ry="130" fill="#a88868"/>
  <ellipse cx="300" cy="310" rx="112" ry="95" fill="#b89878"/>
  <!-- small ears -->
  <ellipse cx="185" cy="195" rx="22" ry="28" fill="#8a6e52"/>
  <ellipse cx="415" cy="195" rx="22" ry="28" fill="#8a6e52"/>
  <!-- hard hat -->
  <ellipse cx="300" cy="180" rx="128" ry="50" fill="#d4a03a"/>
  <path d="M185,190 Q300,100 415,190" fill="#e0b24a"/>
  <rect x="272" y="135" width="56" height="16" rx="3" fill="#c49230"/>
  <ellipse cx="300" cy="205" rx="140" ry="20" fill="#c49230"/>
  <!-- blocky sunglasses -->
  <rect x="228" y="255" width="60" height="38" rx="6" fill="#1e2824"/>
  <rect x="312" y="255" width="60" height="38" rx="6" fill="#1e2824"/>
  <path d="M288,274 H312" stroke="#1e2824" stroke-width="6"/>
  <rect x="236" y="262" width="18" height="10" rx="2" fill="#7ec" opacity=".3"/>
  <ellipse cx="300" cy="340" rx="55" ry="36" fill="#ead4b8"/>
  <ellipse cx="300" cy="328" rx="11" ry="8" fill="#2a2118"/>
  {eyes(300, 270)}
  {mouth(m, 300, 362)}
  {arm('L', False, '#a88868')}
  {arm('R', raise_r, '#a88868')}
  {paws(color='#8a6e52')}
''')


# ---------- Hedgehog (Godot): tinkerer apron + reading glasses + receipt pocket ----------
def hedgehog(pose="neutral"):
    m = {"neutral": "smile", "talk": "open", "point": "smile", "wow": "o"}[pose]
    raise_r = pose in ("point", "wow", "talk")
    return svg(f'''
  <ellipse cx="300" cy="560" rx="112" ry="130" fill="#8a7058"/>
  <!-- spikes (distinctive hedgehog) -->
  <path d="M180,220 L155,150 L210,195 Z" fill="#6a5848"/>
  <path d="M220,175 L210,105 L260,165 Z" fill="#7a6858"/>
  <path d="M280,155 L300,85 L320,155 Z" fill="#6a5848"/>
  <path d="M340,165 L380,100 L390,175 Z" fill="#7a6858"/>
  <path d="M400,195 L445,145 L430,220 Z" fill="#6a5848"/>
  <path d="M160,280 L120,230 L175,265 Z" fill="#7a6858"/>
  <path d="M440,280 L480,230 L425,265 Z" fill="#7a6858"/>
  <!-- apron -->
  <path d="M210,470 Q300,430 390,470 L400,650 Q300,685 200,650 Z" fill="#6b7c5c"/>
  <path d="M235,490 Q300,470 365,490 L370,640 Q300,660 230,640 Z" fill="#7e9170"/>
  <!-- receipt sticking out of pocket -->
  <rect x="320" y="540" width="36" height="55" rx="2" fill="#f0e8d8"/>
  <path d="M324,550 H352 M324,560 H350 M324,570 H348 M324,580 H346" stroke="#c4a35a" stroke-width="2"/>
  <rect x="250" y="555" width="50" height="40" rx="4" fill="#5a6a4c"/>
  <!-- head -->
  <ellipse cx="300" cy="295" rx="135" ry="125" fill="#c4a888"/>
  <ellipse cx="300" cy="315" rx="105" ry="90" fill="#d4b898"/>
  <ellipse cx="190" cy="210" rx="20" ry="26" fill="#8a7058"/>
  <ellipse cx="410" cy="210" rx="20" ry="26" fill="#8a7058"/>
  <ellipse cx="300" cy="345" rx="50" ry="34" fill="#ead4b8"/>
  <ellipse cx="300" cy="333" rx="9" ry="7" fill="#2a2118"/>
  {eyes(300, 285)}
  <!-- reading glasses -->
  <circle cx="268" cy="288" r="26" fill="none" stroke="#4a4038" stroke-width="5"/>
  <circle cx="332" cy="288" r="26" fill="none" stroke="#4a4038" stroke-width="5"/>
  <path d="M294,288 H306" stroke="#4a4038" stroke-width="4"/>
  <path d="M242,288 Q220,275 210,295" fill="none" stroke="#4a4038" stroke-width="4"/>
  <path d="M358,288 Q380,275 390,295" fill="none" stroke="#4a4038" stroke-width="4"/>
  {mouth(m, 300, 368)}
  {arm('L', False, '#c4a888')}
  {arm('R', raise_r, '#c4a888')}
  {paws(color='#8a7058')}
''')


# ---------- Ferret (Nilo): cheerful browser explorer — portal goggles + teal scarf ----------
def ferret(pose="neutral"):
    m = {"neutral": "smile", "talk": "open", "point": "smile", "wow": "open"}[pose]
    raise_r = pose in ("point", "wow")
    return svg(f'''
  <ellipse cx="300" cy="560" rx="100" ry="132" fill="#c9a070"/>
  <!-- teal explorer hoodie -->
  <path d="M210,465 Q300,425 390,465 L400,645 Q300,685 200,645 Z" fill="#4a8a88"/>
  <path d="M225,480 Q300,450 375,480 L380,635 Q300,658 220,635 Z" fill="#5a9a98"/>
  <!-- scarf -->
  <path d="M220,455 Q300,490 380,455 Q360,520 300,535 Q240,520 220,455 Z" fill="#e0a060"/>
  <path d="M310,520 L340,620 L300,610 Z" fill="#d09050"/>
  <!-- head (long ferret face) -->
  <ellipse cx="300" cy="280" rx="140" ry="130" fill="#d8b888"/>
  <ellipse cx="300" cy="310" rx="100" ry="85" fill="#e4c8a0"/>
  <!-- ears -->
  <ellipse cx="185" cy="175" rx="28" ry="38" fill="#c9a070"/>
  <ellipse cx="415" cy="175" rx="28" ry="38" fill="#c9a070"/>
  <ellipse cx="185" cy="180" rx="12" ry="18" fill="#e8b4a0"/>
  <ellipse cx="415" cy="180" rx="12" ry="18" fill="#e8b4a0"/>
  <!-- portal goggles -->
  <ellipse cx="260" cy="265" rx="36" ry="32" fill="#2a4048"/>
  <ellipse cx="340" cy="265" rx="36" ry="32" fill="#2a4048"/>
  <ellipse cx="260" cy="265" rx="24" ry="22" fill="#5ec8c0" opacity=".55"/>
  <ellipse cx="340" cy="265" rx="24" ry="22" fill="#5ec8c0" opacity=".55"/>
  <path d="M296,265 H304" stroke="#3a5058" stroke-width="8"/>
  <path d="M160,250 Q150,200 300,185 Q450,200 440,250" fill="none" stroke="#3a5058" stroke-width="12" stroke-linecap="round"/>
  <ellipse cx="300" cy="340" rx="48" ry="32" fill="#f0dcc4"/>
  <ellipse cx="300" cy="328" rx="9" ry="7" fill="#2a2118"/>
  {eyes(300, 265, gap=40)}
  {mouth(m, 300, 360)}
  <!-- little backpack -->
  <ellipse cx="400" cy="530" rx="28" ry="40" fill="#3a6a68"/>
  <path d="M380,500 Q400,490 420,500" fill="none" stroke="#2a5050" stroke-width="6"/>
  {arm('L', False, '#d8b888')}
  {arm('R', raise_r, '#d8b888')}
  {paws(color='#c9a070')}
''')


# ---------- Sugar glider (outro): join-now scarf + tiny aviator hat ----------
def sugar_glider(pose="neutral"):
    m = {"neutral": "smile", "talk": "open", "point": "smile", "wow": "o"}[pose]
    raise_r = pose in ("point", "wow", "talk")
    return svg(f'''
  <ellipse cx="300" cy="555" rx="105" ry="128" fill="#c8b8a0"/>
  <!-- soft mint hoodie -->
  <path d="M208,465 Q300,425 392,465 L402,640 Q300,680 198,640 Z" fill="#6a8f8a"/>
  <path d="M225,480 Q300,450 375,480 L380,630 Q300,655 220,630 Z" fill="#7aa49e"/>
  <!-- join scarf -->
  <path d="M230,450 Q300,480 370,450 L360,510 Q300,530 240,510 Z" fill="#c4785a"/>
  <rect x="280" y="500" width="40" height="18" rx="3" fill="#f0e6d0"/>
  <!-- gliding membrane hint -->
  <path d="M200,480 Q150,540 195,600" fill="#d8c8b0" opacity=".7"/>
  <path d="M400,480 Q450,540 405,600" fill="#d8c8b0" opacity=".7"/>
  <!-- head -->
  <ellipse cx="300" cy="275" rx="142" ry="135" fill="#ddd0bc"/>
  <ellipse cx="300" cy="295" rx="110" ry="95" fill="#e8dcc8"/>
  <!-- big round ears -->
  <ellipse cx="170" cy="165" rx="40" ry="50" fill="#c8b8a0"/>
  <ellipse cx="430" cy="165" rx="40" ry="50" fill="#c8b8a0"/>
  <ellipse cx="170" cy="170" rx="20" ry="28" fill="#e8b0b0"/>
  <ellipse cx="430" cy="170" rx="20" ry="28" fill="#e8b0b0"/>
  <!-- face stripe -->
  <ellipse cx="300" cy="290" rx="35" ry="70" fill="#4a4038" opacity=".35"/>
  <!-- tiny aviator hat -->
  <path d="M200,210 Q300,140 400,210 Q380,175 300,165 Q220,175 200,210 Z" fill="#5a5048"/>
  <ellipse cx="300" cy="195" rx="50" ry="14" fill="#3a3530"/>
  <path d="M200,215 Q180,250 195,280" fill="none" stroke="#5a5048" stroke-width="10"/>
  <path d="M400,215 Q420,250 405,280" fill="none" stroke="#5a5048" stroke-width="10"/>
  <!-- small shades -->
  <rect x="235" y="250" width="52" height="30" rx="8" fill="#2a2118"/>
  <rect x="313" y="250" width="52" height="30" rx="8" fill="#2a2118"/>
  <path d="M287,265 H313" stroke="#2a2118" stroke-width="5"/>
  <ellipse cx="300" cy="330" rx="48" ry="34" fill="#f2e8dc"/>
  <ellipse cx="300" cy="318" rx="9" ry="7" fill="#2a2118"/>
  {eyes(300, 262)}
  {mouth(m, 300, 352)}
  {arm('L', False, '#ddd0bc')}
  {arm('R', raise_r, '#ddd0bc')}
  {paws(color='#c8b8a0')}
''')


CHARS = {
    "capybara": capybara,
    "wombat": wombat,
    "hedgehog": hedgehog,
    "ferret": ferret,
    "sugarglider": sugar_glider,
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
                             output_width=600, output_height=800)
            print("wrote", png_path.name)


if __name__ == "__main__":
    main()
