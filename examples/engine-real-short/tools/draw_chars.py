#!/usr/bin/env python3
"""Hand-author original anthropomorphic animal SVGs (V1 style) and rasterize to PNG.

Species intentionally NOT reused from prior Shorts
(quokka, red panda, axolotl, pangolin, lemur, capybara, wombat, hedgehog,
ferret, sugar glider, otter, beaver, alpaca, chinchilla, meerkat, fennec).

Cast: raccoon, wallaby, puffin, tortoise — themed hats/sunglasses/outfits.
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


# ---------- Raccoon (hook / question): film-critic host — beret + dark shades + scarf ----------
def raccoon(pose="neutral"):
    m = {"neutral": "smile", "talk": "open", "point": "o", "wow": "open"}[pose]
    raise_r = pose in ("point", "wow")
    return svg(f'''
  <ellipse cx="300" cy="565" rx="112" ry="128" fill="#7a7068"/>
  <!-- critic jacket -->
  <path d="M205,465 Q300,430 395,465 L405,645 Q300,680 195,645 Z" fill="#3a3838"/>
  <path d="M225,485 Q300,455 375,485 L380,635 Q300,655 220,635 Z" fill="#4a4848"/>
  <path d="M250,505 Q300,520 350,505" fill="none" stroke="#c4a35a" stroke-width="4"/>
  <!-- cream scarf -->
  <path d="M220,470 Q300,445 380,470 L365,510 Q300,490 235,510 Z" fill="#d8c8a8"/>
  <path d="M350,495 Q380,560 355,620" fill="none" stroke="#d8c8a8" stroke-width="16" stroke-linecap="round"/>
  <!-- head -->
  <ellipse cx="300" cy="295" rx="145" ry="132" fill="#8a8078"/>
  <ellipse cx="300" cy="315" rx="115" ry="100" fill="#9a9088"/>
  <!-- raccoon eye mask -->
  <ellipse cx="255" cy="290" rx="48" ry="32" fill="#2a2828" opacity=".85"/>
  <ellipse cx="345" cy="290" rx="48" ry="32" fill="#2a2828" opacity=".85"/>
  <!-- ears -->
  <ellipse cx="185" cy="195" rx="28" ry="34" fill="#7a7068"/>
  <ellipse cx="415" cy="195" rx="28" ry="34" fill="#7a7068"/>
  <ellipse cx="185" cy="200" rx="12" ry="16" fill="#e8b4a0"/>
  <ellipse cx="415" cy="200" rx="12" ry="16" fill="#e8b4a0"/>
  <!-- beret -->
  <ellipse cx="300" cy="195" rx="125" ry="42" fill="#2a3a48"/>
  <path d="M190,200 Q300,120 410,200" fill="#3a4a58"/>
  <ellipse cx="300" cy="215" rx="130" ry="14" fill="#1a2a38"/>
  <circle cx="380" cy="175" r="10" fill="#c45848"/>
  <!-- dark round sunglasses -->
  <circle cx="262" cy="292" r="30" fill="#1a1818" opacity=".92"/>
  <circle cx="338" cy="292" r="30" fill="#1a1818" opacity=".92"/>
  <path d="M292,292 H308" stroke="#3a3838" stroke-width="5"/>
  <circle cx="252" cy="284" r="7" fill="#8ab" opacity=".25"/>
  <circle cx="328" cy="284" r="7" fill="#8ab" opacity=".25"/>
  <ellipse cx="300" cy="345" rx="42" ry="30" fill="#ebe4dc"/>
  <ellipse cx="300" cy="335" rx="12" ry="9" fill="#2a2118"/>
  {eyes(300, 290, gap=38, look=3 if pose == 'point' else 0)}
  {mouth(m, 300, 365)}
  {arm('L', False, '#8a8078')}
  {arm('R', raise_r, '#8a8078')}
  {paws(color='#7a7068')}
''')


# ---------- Wallaby (UE5 city): street explorer — camera + urban jacket + cap ----------
def wallaby(pose="neutral"):
    m = {"neutral": "smile", "talk": "open", "point": "o", "wow": "open"}[pose]
    raise_r = pose in ("point", "wow")
    return svg(f'''
  <ellipse cx="300" cy="560" rx="108" ry="130" fill="#c49a6a"/>
  <!-- urban jacket -->
  <path d="M210,460 Q300,425 390,460 L400,640 Q300,670 200,640 Z" fill="#3a4a58"/>
  <path d="M230,480 Q300,450 370,480 L375,625 Q300,645 225,625 Z" fill="#4a5a68"/>
  <rect x="270" y="520" width="60" height="10" rx="2" fill="#c4a35a"/>
  <!-- kangaroo-ish pouch hint -->
  <ellipse cx="300" cy="580" rx="40" ry="22" fill="#2a3a48" opacity=".5"/>
  <!-- head -->
  <ellipse cx="300" cy="285" rx="135" ry="125" fill="#d8b080"/>
  <ellipse cx="300" cy="305" rx="105" ry="95" fill="#e8c898"/>
  <!-- tall wallaby ears -->
  <ellipse cx="200" cy="155" rx="26" ry="70" fill="#c49a6a" transform="rotate(-10 200 155)"/>
  <ellipse cx="400" cy="155" rx="26" ry="70" fill="#c49a6a" transform="rotate(10 400 155)"/>
  <ellipse cx="200" cy="160" rx="10" ry="40" fill="#e8b4a0" transform="rotate(-10 200 160)"/>
  <ellipse cx="400" cy="160" rx="10" ry="40" fill="#e8b4a0" transform="rotate(10 400 160)"/>
  <!-- city cap -->
  <path d="M185,210 Q300,145 415,210" fill="#2a3838"/>
  <ellipse cx="300" cy="215" rx="120" ry="22" fill="#1a2828"/>
  <ellipse cx="360" cy="225" rx="70" ry="14" fill="#3a4848"/>
  <!-- camera around neck -->
  <path d="M240,455 Q300,475 360,455" fill="none" stroke="#2a2118" stroke-width="4"/>
  <rect x="255" y="455" width="90" height="55" rx="8" fill="#2a2e34"/>
  <circle cx="300" cy="480" r="18" fill="#1a1e24"/>
  <circle cx="300" cy="480" r="10" fill="#4a7a88"/>
  <rect x="330" y="460" width="12" height="10" rx="2" fill="#c45848"/>
  <ellipse cx="300" cy="340" rx="44" ry="32" fill="#f0dcc0"/>
  <ellipse cx="300" cy="328" rx="11" ry="8" fill="#2a2118"/>
  {eyes(300, 280, gap=38, look=4 if pose == 'point' else 0)}
  <!-- thin explorer shades -->
  <rect x="230" y="268" width="55" height="28" rx="6" fill="#1e2830" opacity=".88"/>
  <rect x="315" y="268" width="55" height="28" rx="6" fill="#1e2830" opacity=".88"/>
  <path d="M285,282 H315" stroke="#3a4850" stroke-width="4"/>
  {mouth(m, 300, 360)}
  {arm('L', False, '#d8b080')}
  {arm('R', raise_r, '#d8b080')}
  {paws(color='#c49a6a')}
''')


# ---------- Puffin (Unity face): portrait photographer / makeup artist — lens + apron ----------
def puffin(pose="neutral"):
    m = {"neutral": "smile", "talk": "open", "point": "o", "wow": "open"}[pose]
    raise_r = pose in ("point", "wow", "talk")
    return svg(f'''
  <!-- black back / white belly puffin body -->
  <ellipse cx="300" cy="565" rx="112" ry="128" fill="#2a2e34"/>
  <ellipse cx="300" cy="580" rx="78" ry="100" fill="#f4f0ea"/>
  <!-- cream makeup apron over belly -->
  <path d="M230,490 Q300,460 370,490 L375,640 Q300,660 225,640 Z" fill="#e8dcc8" opacity=".92"/>
  <rect x="275" y="540" width="50" height="36" rx="4" fill="#c4785a"/>
  <circle cx="300" cy="558" r="7" fill="#e0c070"/>
  <!-- black head with white face -->
  <ellipse cx="300" cy="295" rx="138" ry="128" fill="#2a2e34"/>
  <ellipse cx="300" cy="325" rx="95" ry="88" fill="#f4f0ea"/>
  <ellipse cx="225" cy="315" rx="38" ry="48" fill="#f4f0ea"/>
  <ellipse cx="375" cy="315" rx="38" ry="48" fill="#f4f0ea"/>
  <!-- small tufts -->
  <ellipse cx="195" cy="200" rx="20" ry="26" fill="#2a2e34"/>
  <ellipse cx="405" cy="200" rx="20" ry="26" fill="#2a2e34"/>
  <!-- photographer beret -->
  <path d="M185,215 Q300,145 415,215" fill="#5a4868"/>
  <ellipse cx="300" cy="220" rx="120" ry="18" fill="#4a3858"/>
  <circle cx="380" cy="185" r="9" fill="#c45848"/>
  <!-- big colorful puffin beak (species signal) -->
  <path d="M300,330 L220,355 L235,390 L300,375 L365,390 L380,355 Z" fill="#e07050"/>
  <path d="M300,330 L250,350 L260,375 L300,365 L340,375 L350,350 Z" fill="#e8c878"/>
  <path d="M300,330 L280,348 L300,358 L320,348 Z" fill="#2a2118"/>
  <rect x="255" y="352" width="90" height="8" rx="2" fill="#c45848"/>
  {eyes(300, 275, gap=40, look=3 if pose == 'point' else 0)}
  <!-- round makeup/photo glasses -->
  <circle cx="260" cy="278" r="28" fill="none" stroke="#c4a35a" stroke-width="5"/>
  <circle cx="340" cy="278" r="28" fill="none" stroke="#c4a35a" stroke-width="5"/>
  <path d="M288,278 H312" stroke="#c4a35a" stroke-width="4"/>
  {mouth(m, 300, 400) if pose != 'neutral' else ''}
  <!-- close-up lens prop -->
  <circle cx="150" cy="520" r="32" fill="#2a3038"/>
  <circle cx="150" cy="520" r="22" fill="#4a7a88" opacity=".7"/>
  <circle cx="150" cy="520" r="10" fill="#1a2830"/>
  {arm('L', False, '#f4f0ea')}
  {arm('R', raise_r, '#f4f0ea')}
  <!-- orange webbed feet -->
  {paws(color='#e07050')}
''')


# ---------- Tortoise (frame budget): referee / race timer — stopwatch + striped shirt ----------
def tortoise(pose="neutral"):
    m = {"neutral": "smile", "talk": "open", "point": "o", "wow": "open"}[pose]
    raise_r = pose in ("point", "wow")
    return svg(f'''
  <!-- big domed shell (species signal) -->
  <ellipse cx="300" cy="580" rx="145" ry="125" fill="#4a6a38"/>
  <ellipse cx="300" cy="560" rx="125" ry="105" fill="#6a8a58"/>
  <!-- hex-ish shell plates -->
  <path d="M240,500 L300,470 L360,500 L340,555 L260,555 Z" fill="#3a5a30"/>
  <path d="M200,555 L250,515 L290,555 L250,600 Z" fill="#5a7a48"/>
  <path d="M310,555 L350,515 L400,555 L350,600 Z" fill="#5a7a48"/>
  <path d="M250,590 L300,555 L350,590 L320,640 L280,640 Z" fill="#3a5a30" opacity=".85"/>
  <ellipse cx="300" cy="530" rx="28" ry="22" fill="#2a4a28" opacity=".45"/>
  <!-- referee striped shirt across shell rim -->
  <path d="M205,455 Q300,425 395,455 L400,510 Q300,485 200,510 Z" fill="#f0f0f0"/>
  <rect x="225" y="440" width="20" height="55" fill="#2a2a2a"/>
  <rect x="265" y="435" width="20" height="60" fill="#2a2a2a"/>
  <rect x="315" y="435" width="20" height="60" fill="#2a2a2a"/>
  <rect x="355" y="440" width="20" height="55" fill="#2a2a2a"/>
  <!-- smaller protruding head -->
  <ellipse cx="300" cy="295" rx="105" ry="100" fill="#b8a070"/>
  <ellipse cx="300" cy="315" rx="82" ry="78" fill="#c8b080"/>
  <ellipse cx="215" cy="230" rx="18" ry="22" fill="#a89060"/>
  <ellipse cx="385" cy="230" rx="18" ry="22" fill="#a89060"/>
  <!-- referee cap -->
  <path d="M205,220 Q300,155 395,220" fill="#2a2a2a"/>
  <ellipse cx="300" cy="225" rx="100" ry="16" fill="#1a1a1a"/>
  <rect x="288" y="180" width="24" height="18" fill="#c45848"/>
  <!-- stopwatch -->
  <circle cx="425" cy="500" r="30" fill="#e0c070"/>
  <circle cx="425" cy="500" r="22" fill="#f0e8d0"/>
  <path d="M425,500 L425,482" stroke="#2a2118" stroke-width="3" stroke-linecap="round"/>
  <path d="M425,500 L438,510" stroke="#2a2118" stroke-width="2" stroke-linecap="round"/>
  <rect x="417" y="466" width="16" height="10" rx="2" fill="#8a6e48"/>
  <ellipse cx="300" cy="345" rx="36" ry="26" fill="#e8d8b8"/>
  <ellipse cx="300" cy="335" rx="10" ry="8" fill="#2a2118"/>
  {eyes(300, 285, gap=32, look=3 if pose == 'point' else 0)}
  <rect x="240" y="270" width="52" height="28" rx="8" fill="#1a2820" opacity=".9"/>
  <rect x="308" y="270" width="52" height="28" rx="8" fill="#1a2820" opacity=".9"/>
  <path d="M292,284 H308" stroke="#3a4840" stroke-width="4"/>
  {mouth(m, 300, 365)}
  {arm('L', False, '#c8b080')}
  {arm('R', raise_r, '#c8b080')}
  {paws(y=715, spread=78, color='#a89060')}
''')


CHARS = {
    "raccoon": raccoon,
    "wallaby": wallaby,
    "puffin": puffin,
    "tortoise": tortoise,
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
