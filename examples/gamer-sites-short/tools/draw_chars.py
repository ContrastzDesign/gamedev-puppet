#!/usr/bin/env python3
"""Hand-author original anthropomorphic animal SVGs (V1 style) and rasterize to PNG."""
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


# ---------- Quokka (hook): mustard beanie + round glasses ----------
def quokka(pose="neutral"):
    m = {"neutral": "smile", "talk": "open", "point": "o", "wow": "open"}[pose]
    raise_r = pose in ("point", "wow")
    return svg(f'''
  <!-- body -->
  <ellipse cx="300" cy="560" rx="110" ry="130" fill="#c9a882"/>
  <ellipse cx="300" cy="560" rx="88" ry="100" fill="#d8b894"/>
  <!-- hoodie -->
  <path d="M210,470 Q300,430 390,470 L400,640 Q300,680 200,640 Z" fill="#6b7c5c"/>
  <path d="M230,480 Q300,455 370,480 L365,560 Q300,575 235,560 Z" fill="#7e9170"/>
  <ellipse cx="300" cy="500" rx="28" ry="18" fill="#5a6a4c"/>
  <!-- head -->
  <ellipse cx="300" cy="280" rx="150" ry="145" fill="#d4b38f"/>
  <ellipse cx="300" cy="300" rx="118" ry="100" fill="#e2c4a0"/>
  <!-- ears -->
  <ellipse cx="175" cy="175" rx="32" ry="42" fill="#c9a882"/>
  <ellipse cx="425" cy="175" rx="32" ry="42" fill="#c9a882"/>
  <ellipse cx="175" cy="180" rx="16" ry="22" fill="#e8b4a0"/>
  <ellipse cx="425" cy="180" rx="16" ry="22" fill="#e8b4a0"/>
  <!-- beanie -->
  <path d="M160,220 Q300,70 440,220 Q420,160 300,145 Q180,160 160,220 Z" fill="#c4a35a"/>
  <path d="M170,215 Q300,120 430,215" fill="none" stroke="#a8863f" stroke-width="8"/>
  <ellipse cx="300" cy="118" rx="28" ry="22" fill="#d4b56e"/>
  <!-- muzzle -->
  <ellipse cx="300" cy="330" rx="55" ry="40" fill="#f0dcc4"/>
  <ellipse cx="300" cy="318" rx="10" ry="8" fill="#3a2a24"/>
  {eyes(300, 265, look=4 if pose == 'point' else 0)}
  <!-- glasses -->
  <circle cx="266" cy="268" r="28" fill="none" stroke="#4a4038" stroke-width="5"/>
  <circle cx="334" cy="268" r="28" fill="none" stroke="#4a4038" stroke-width="5"/>
  <path d="M294,268 H306" stroke="#4a4038" stroke-width="4"/>
  {mouth(m, 300, 355)}
  {arm('L', False)}
  {arm('R', raise_r)}
  {paws()}
''')


# ---------- Red panda (Steam): headset + flannel ----------
def red_panda(pose="neutral"):
    m = {"neutral": "smile", "talk": "open", "point": "smile", "wow": "o"}[pose]
    raise_r = pose in ("point", "wow", "talk")
    return svg(f'''
  <ellipse cx="300" cy="565" rx="108" ry="128" fill="#c26a45"/>
  <!-- flannel -->
  <path d="M205,465 Q300,425 395,465 L405,645 Q300,685 195,645 Z" fill="#5c6e4e"/>
  <path d="M220,480 L380,480 L385,640 Q300,665 215,640 Z" fill="#6d825c"/>
  <path d="M240,490 L250,630 M280,485 L290,635 M320,485 L330,635 M360,490 L370,630" stroke="#8b3d3d" stroke-width="7" opacity=".55"/>
  <path d="M230,520 H370 M230,560 H370 M230,600 H370" stroke="#8b3d3d" stroke-width="5" opacity=".4"/>
  <!-- head -->
  <ellipse cx="300" cy="275" rx="148" ry="142" fill="#d27852"/>
  <ellipse cx="300" cy="295" rx="110" ry="95" fill="#e09068"/>
  <!-- ears -->
  <ellipse cx="170" cy="160" rx="38" ry="48" fill="#c26a45"/>
  <ellipse cx="430" cy="160" rx="38" ry="48" fill="#c26a45"/>
  <ellipse cx="170" cy="168" rx="18" ry="24" fill="#f0c4b0"/>
  <ellipse cx="430" cy="168" rx="18" ry="24" fill="#f0c4b0"/>
  <!-- face stripes -->
  <path d="M210,250 Q240,290 230,340" fill="none" stroke="#8a3f2c" stroke-width="14" opacity=".45"/>
  <path d="M390,250 Q360,290 370,340" fill="none" stroke="#8a3f2c" stroke-width="14" opacity=".45"/>
  <ellipse cx="300" cy="330" rx="58" ry="42" fill="#f3e0d0"/>
  <ellipse cx="300" cy="318" rx="11" ry="8" fill="#2a2118"/>
  {eyes(300, 260)}
  <!-- headset -->
  <path d="M155,250 Q150,180 300,155 Q450,180 445,250" fill="none" stroke="#3d4654" stroke-width="16" stroke-linecap="round"/>
  <ellipse cx="148" cy="275" rx="34" ry="42" fill="#2f3744"/>
  <ellipse cx="452" cy="275" rx="34" ry="42" fill="#2f3744"/>
  <ellipse cx="148" cy="275" rx="18" ry="24" fill="#5a6a7c"/>
  <ellipse cx="452" cy="275" rx="18" ry="24" fill="#5a6a7c"/>
  <path d="M148,315 Q200,380 260,350" fill="none" stroke="#3d4654" stroke-width="8"/>
  <ellipse cx="268" cy="348" rx="14" ry="10" fill="#4a5564"/>
  {mouth(m, 300, 358)}
  {arm('L', False, '#d27852')}
  {arm('R', raise_r, '#d27852')}
  {paws(color='#c26a45')}
''')


# ---------- Axolotl (Poki): candy hoodie + arcade visor ----------
def axolotl(pose="neutral"):
    m = {"neutral": "smile", "talk": "open", "point": "smile", "wow": "open"}[pose]
    raise_r = pose in ("point", "wow")
    return svg(f'''
  <ellipse cx="300" cy="560" rx="115" ry="132" fill="#e8b0b8"/>
  <!-- candy hoodie -->
  <path d="M200,460 Q300,420 400,460 L410,650 Q300,690 190,650 Z" fill="#6a8fbf"/>
  <path d="M220,475 Q300,445 380,475 L385,630 Q300,655 215,630 Z" fill="#7ea3d4"/>
  <path d="M240,500 Q300,520 360,500" fill="none" stroke="#f2c96a" stroke-width="10"/>
  <path d="M245,540 Q300,560 355,540" fill="none" stroke="#e8899a" stroke-width="8"/>
  <!-- external gill stalks (distinctive axolotl) -->
  <path d="M155,210 C110,160 95,230 130,250 C95,255 115,310 160,295" fill="#e8899a"/>
  <path d="M150,250 C90,245 100,300 155,310" fill="#d9788a"/>
  <path d="M165,195 C145,140 100,175 140,220" fill="#f0a0ac"/>
  <path d="M445,210 C490,160 505,230 470,250 C505,255 485,310 440,295" fill="#e8899a"/>
  <path d="M450,250 C510,245 500,300 445,310" fill="#d9788a"/>
  <path d="M435,195 C455,140 500,175 460,220" fill="#f0a0ac"/>
  <!-- head -->
  <ellipse cx="300" cy="295" rx="138" ry="125" fill="#f0c2c8"/>
  <ellipse cx="300" cy="315" rx="108" ry="90" fill="#f7d4d8"/>
  <ellipse cx="300" cy="345" rx="52" ry="36" fill="#fce8e6"/>
  <ellipse cx="288" cy="332" rx="6" ry="5" fill="#2a2118"/>
  <ellipse cx="312" cy="332" rx="6" ry="5" fill="#2a2118"/>
  {eyes(300, 280, r=8)}
  <!-- arcade visor -->
  <rect x="210" y="240" width="180" height="48" rx="14" fill="#2c3548"/>
  <rect x="218" y="248" width="164" height="32" rx="10" fill="#7ec8c0"/>
  <rect x="230" y="256" width="40" height="16" rx="4" fill="#f2e6a0" opacity=".7"/>
  <rect x="280" y="256" width="28" height="16" rx="4" fill="#f2e6a0" opacity=".45"/>
  <path d="M210,260 Q170,250 165,280" fill="none" stroke="#2c3548" stroke-width="10"/>
  <path d="M390,260 Q430,250 435,280" fill="none" stroke="#2c3548" stroke-width="10"/>
  {mouth(m, 300, 370)}
  {arm('L', False, '#f0c2c8')}
  {arm('R', raise_r, '#f0c2c8')}
  {paws(color='#e8b0b8')}
''')


# ---------- Pangolin (Roblox-ish booth): builder vest + hard hat ----------
def pangolin(pose="neutral"):
    m = {"neutral": "smile", "talk": "open", "point": "o", "wow": "open"}[pose]
    raise_r = pose in ("point", "wow")
    return svg(f'''
  <ellipse cx="300" cy="565" rx="112" ry="130" fill="#b8956a"/>
  <!-- scales hint -->
  <ellipse cx="250" cy="540" rx="30" ry="22" fill="#a6845c"/>
  <ellipse cx="320" cy="555" rx="28" ry="20" fill="#a6845c"/>
  <ellipse cx="280" cy="590" rx="26" ry="18" fill="#9a7954"/>
  <!-- builder vest -->
  <path d="M210,470 Q300,435 390,470 L400,640 Q300,675 200,640 Z" fill="#c4a35a"/>
  <path d="M235,485 L280,485 L285,640 L235,630 Z" fill="#d8b86e"/>
  <path d="M365,485 L320,485 L315,640 L365,630 Z" fill="#d8b86e"/>
  <rect x="270" y="510" width="60" height="36" rx="6" fill="#5a6a4c"/>
  <rect x="278" y="560" width="44" height="28" rx="5" fill="#4a4038"/>
  <!-- head -->
  <ellipse cx="300" cy="280" rx="140" ry="135" fill="#c9a878"/>
  <ellipse cx="300" cy="300" rx="108" ry="92" fill="#d8b890"/>
  <!-- small ears -->
  <ellipse cx="190" cy="185" rx="24" ry="30" fill="#b8956a"/>
  <ellipse cx="410" cy="185" rx="24" ry="30" fill="#b8956a"/>
  <!-- hard hat -->
  <ellipse cx="300" cy="175" rx="130" ry="55" fill="#d4a03a"/>
  <path d="M180,185 Q300,95 420,185" fill="#e0b24a"/>
  <rect x="270" y="130" width="60" height="18" rx="4" fill="#c49230"/>
  <ellipse cx="300" cy="200" rx="145" ry="22" fill="#c49230"/>
  <ellipse cx="300" cy="328" rx="50" ry="34" fill="#ead4b8"/>
  <ellipse cx="300" cy="316" rx="10" ry="7" fill="#2a2118"/>
  {eyes(300, 262)}
  {mouth(m, 300, 352)}
  {arm('L', False, '#c9a878')}
  {arm('R', raise_r, '#c9a878')}
  {paws(color='#b8956a')}
''')


# ---------- Lemur (Twitch): streamer hoodie + cat-ear headset + shades ----------
def lemur(pose="neutral"):
    m = {"neutral": "smile", "talk": "open", "point": "smile", "wow": "o"}[pose]
    raise_r = pose in ("point", "wow", "talk")
    return svg(f'''
  <ellipse cx="300" cy="560" rx="110" ry="130" fill="#8a7a6a"/>
  <!-- streamer hoodie (muted grape, not neon) -->
  <path d="M205,465 Q300,425 395,465 L405,645 Q300,685 195,645 Z" fill="#6a5a72"/>
  <path d="M220,480 Q300,450 380,480 L385,635 Q300,660 215,635 Z" fill="#7a6a84"/>
  <path d="M250,500 Q300,525 350,500" fill="none" stroke="#4a3e55" stroke-width="8"/>
  <ellipse cx="300" cy="545" rx="22" ry="16" fill="#4a3e55"/>
  <!-- head -->
  <ellipse cx="300" cy="275" rx="148" ry="142" fill="#cfc3b4"/>
  <ellipse cx="300" cy="295" rx="112" ry="98" fill="#ddd4c6"/>
  <!-- ring-tail hint behind -->
  <ellipse cx="430" cy="620" rx="22" ry="70" fill="#8a7a6a" transform="rotate(25 430 620)"/>
  <ellipse cx="430" cy="590" rx="18" ry="14" fill="#ddd4c6"/>
  <ellipse cx="438" cy="630" rx="18" ry="14" fill="#ddd4c6"/>
  <ellipse cx="445" cy="665" rx="16" ry="12" fill="#ddd4c6"/>
  <!-- ears -->
  <ellipse cx="175" cy="165" rx="36" ry="46" fill="#b8aa9a"/>
  <ellipse cx="425" cy="165" rx="36" ry="46" fill="#b8aa9a"/>
  <ellipse cx="175" cy="170" rx="16" ry="22" fill="#e8b0b0"/>
  <ellipse cx="425" cy="170" rx="16" ry="22" fill="#e8b0b0"/>
  <!-- face mask markings -->
  <ellipse cx="245" cy="275" rx="42" ry="48" fill="#4a4038" opacity=".55"/>
  <ellipse cx="355" cy="275" rx="42" ry="48" fill="#4a4038" opacity=".55"/>
  <ellipse cx="300" cy="330" rx="55" ry="40" fill="#f2e8dc"/>
  <ellipse cx="300" cy="318" rx="10" ry="8" fill="#2a2118"/>
  {eyes(300, 265)}
  <!-- shades -->
  <rect x="230" y="248" width="58" height="36" rx="10" fill="#2a2118"/>
  <rect x="312" y="248" width="58" height="36" rx="10" fill="#2a2118"/>
  <path d="M288,266 H312" stroke="#2a2118" stroke-width="6"/>
  <rect x="236" y="254" width="20" height="10" rx="3" fill="#8ab" opacity=".35"/>
  <!-- cat-ear headset -->
  <path d="M160,240 Q155,170 300,150 Q445,170 440,240" fill="none" stroke="#3d3548" stroke-width="14" stroke-linecap="round"/>
  <path d="M200,155 L230,105 L255,160 Z" fill="#6a5a72"/>
  <path d="M400,155 L370,105 L345,160 Z" fill="#6a5a72"/>
  <ellipse cx="150" cy="275" rx="32" ry="40" fill="#2f2838"/>
  <ellipse cx="450" cy="275" rx="32" ry="40" fill="#2f2838"/>
  <path d="M150,312 Q210,375 270,348" fill="none" stroke="#3d3548" stroke-width="7"/>
  <ellipse cx="275" cy="348" rx="12" ry="9" fill="#5a4e66"/>
  {mouth(m, 300, 358)}
  {arm('L', False, '#cfc3b4')}
  {arm('R', raise_r, '#cfc3b4')}
  {paws(color='#8a7a6a')}
''')


CHARS = {
    "quokka": quokka,
    "redpanda": red_panda,
    "axolotl": axolotl,
    "pangolin": pangolin,
    "lemur": lemur,
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
