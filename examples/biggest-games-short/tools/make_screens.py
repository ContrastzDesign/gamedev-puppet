#!/usr/bin/env python3
"""Original in-scene screen UIs (no real logos) for the biggest-games Short.

Rockstar/Activision/Bethesda/EA footage is NOT cleared — these are original
genre-evoking screens with plain generic lettering only.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

OUT = Path(__file__).resolve().parents[1] / "assets" / "screens"
OUT.mkdir(parents=True, exist_ok=True)

W, H = 640, 400


def font(size, bold=False):
    for path in (
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
    ):
        p = Path(path)
        if p.exists():
            return ImageFont.truetype(str(p), size)
    return ImageFont.load_default()


def chrome(draw, title, accent):
    draw.rectangle([0, 0, W, H], fill="#12181c")
    draw.rectangle([0, 0, W, 36], fill="#1c242c")
    draw.ellipse([12, 12, 24, 24], fill="#c45848")
    draw.ellipse([32, 12, 44, 24], fill="#c4a35a")
    draw.ellipse([52, 12, 64, 24], fill="#6b8f6a")
    draw.rounded_rectangle([90, 8, W - 16, 30], 6, fill="#0e1418")
    draw.text((100, 10), title, fill="#c8d4c0", font=font(14, True))
    draw.rectangle([0, 36, 8, H], fill=accent)


def save(img, name):
    path = OUT / name
    img.save(path)
    print("wrote", path)


def chart():
    """Annual sales chart wall with three era sections."""
    img = Image.new("RGB", (W, H))
    d = ImageDraw.Draw(img)
    chrome(d, "US annual sales leaders — tracked dollars", "#c4a35a")
    eras = [
        (30, "2002", "#4a8a98", 180),
        (230, "2007", "#c45848", 220),
        (430, "2011", "#6b8f6a", 200),
    ]
    for x, label, col, bar_h in eras:
        d.rounded_rectangle([x, 55, x + 180, 360], 10, fill="#1a2228", outline=col, width=2)
        d.text((x + 20, 68), label, fill=col, font=font(22, True))
        d.rectangle([x + 40, 340 - bar_h, x + 100, 340], fill=col)
        d.rectangle([x + 110, 340 - int(bar_h * 0.72), x + 155, 340], fill="#3a4850")
        d.text((x + 20, 100), "#1", fill="#f0e6d0", font=font(16, True))
        d.text((x + 20, 125), "genre lead", fill="#a8b8a0", font=font(13))
        d.text((x + 20, 150), "#2 sports", fill="#889890", font=font(12))
    save(img, "chart.png")


def drive():
    """Open-world driving scene for 2002 CRT (no real GTA footage)."""
    img = Image.new("RGB", (W, H))
    d = ImageDraw.Draw(img)
    chrome(d, "Open-world drive — city cruise", "#e8a0b0")
    # neon dusk sky
    d.rectangle([20, 50, 620, 370], fill="#2a1840")
    d.rectangle([20, 200, 620, 370], fill="#3a2860")
    # palm silhouettes
    for px in (80, 160, 500, 580):
        d.rectangle([px, 160, px + 8, 280], fill="#1a2830")
        d.ellipse([px - 30, 130, px + 40, 180], fill="#2a3840")
    # road
    d.polygon([(40, 360), (280, 210), (360, 210), (600, 360)], fill="#2a2438")
    d.line([(170, 360), (320, 210)], fill="#e8d080", width=3)
    # car
    d.rounded_rectangle([250, 280, 390, 330], 8, fill="#98d0dc")
    d.rectangle([265, 265, 310, 285], fill="#1a2838")
    d.rectangle([330, 265, 375, 285], fill="#1a2838")
    d.ellipse([260, 320, 290, 345], fill="#1a1a20")
    d.ellipse([350, 320, 380, 345], fill="#1a1a20")
    # neon signs (generic)
    d.rectangle([450, 90, 560, 130], fill="#c45848")
    d.text((462, 100), "NIGHT", fill="#f0e6d0", font=font(16, True))
    d.rectangle([60, 100, 150, 135], fill="#4a8a98")
    d.text((72, 108), "CRUISE", fill="#f0e6d0", font=font(14, True))
    d.text((30, 340), "open world", fill="#e8c0d0", font=font(13))
    save(img, "drive.png")


def rhythm():
    """Rhythm-game note highway for 2007 TV."""
    img = Image.new("RGB", (W, H))
    d = ImageDraw.Draw(img)
    chrome(d, "Rhythm highway — frets + notes", "#c45848")
    d.rectangle([20, 50, 620, 370], fill="#0e1018")
    # highway trapezoid
    d.polygon([(180, 60), (460, 60), (580, 360), (60, 360)], fill="#1a1e28", outline="#4a5060")
    cols = ["#c45848", "#c4a35a", "#6b8f6a", "#4a8a98", "#a87890"]
    for i, col in enumerate(cols):
        x0 = 200 + i * 48
        d.line([(x0, 70), (100 + i * 110, 350)], fill=col, width=3)
        for n in range(4):
            y = 100 + n * 60 + (i % 2) * 20
            t = (y - 70) / 280
            cx = x0 + (100 + i * 110 - x0) * t
            r = 8 + int(10 * t)
            d.ellipse([cx - r, y - r // 2, cx + r, y + r // 2], fill=col)
    # hit line
    d.line([(80, 330), (560, 330)], fill="#f0e6d0", width=4)
    d.text((30, 340), "5-fret highway", fill="#c8d0d8", font=font(13))
    save(img, "rhythm.png")


def shooter():
    """Military shooter HUD for 2011 launch screen."""
    img = Image.new("RGB", (W, H))
    d = ImageDraw.Draw(img)
    chrome(d, "Tactical ops — urban night", "#4a8a98")
    d.rectangle([20, 50, 620, 370], fill="#0a1218")
    # buildings
    for i, (x0, h) in enumerate([(40, 200), (100, 260), (180, 180), (400, 240), (480, 280), (560, 200)]):
        d.rectangle([x0, 360 - h, x0 + 50, 360], fill="#1a2830")
        for r in range(h // 28):
            for c in range(2):
                d.rectangle([x0 + 8 + c * 18, 360 - h + 12 + r * 28,
                             x0 + 18 + c * 18, 360 - h + 24 + r * 28],
                            fill="#e0a050" if (r + c + i) % 3 else "#2a4050")
    # muzzle flash / soldier silhouette
    d.polygon([(280, 280), (300, 200), (320, 280)], fill="#2a3038")
    d.ellipse([285, 175, 315, 210], fill="#3a4048")
    d.ellipse([310, 220, 360, 250], fill="#e8d080")
    # HUD
    d.rectangle([30, 60, 160, 100], outline="#6b8f6a", width=2)
    d.text((40, 70), "SQUAD OK", fill="#a0d0b0", font=font(14, True))
    d.text((480, 340), "AMMO 32", fill="#c8d4c0", font=font(14, True))
    d.ellipse([310, 195, 330, 215], outline="#c4a35a", width=2)
    save(img, "shooter.png")


def fantasy():
    """Snowy fantasy mountain scene for Skyrim-evoking screen."""
    img = Image.new("RGB", (W, H))
    d = ImageDraw.Draw(img)
    chrome(d, "Fantasy peak — snow trek", "#a87890")
    d.rectangle([20, 50, 620, 370], fill="#b8c8d8")
    d.rectangle([20, 220, 620, 370], fill="#d8e4f0")
    # mountains
    d.polygon([(40, 300), (160, 90), (280, 300)], fill="#6a7a88")
    d.polygon([(200, 320), (340, 70), (480, 320)], fill="#5a6a78")
    d.polygon([(400, 300), (520, 110), (620, 300)], fill="#7a8a98")
    # snow caps
    d.polygon([(140, 130), (160, 90), (185, 130)], fill="#f0f4f8")
    d.polygon([(310, 120), (340, 70), (375, 120)], fill="#f0f4f8")
    d.polygon([(500, 145), (520, 110), (545, 145)], fill="#f0f4f8")
    # path + figure
    d.polygon([(280, 360), (310, 250), (330, 250), (360, 360)], fill="#c8d4e0")
    d.ellipse([305, 230, 335, 265], fill="#4a3a58")
    d.text((30, 340), "open fantasy", fill="#3a4858", font=font(13))
    save(img, "fantasy.png")


def trophies():
    """Three genre trophies on one chart (outro)."""
    img = Image.new("RGB", (W, H))
    d = ImageDraw.Draw(img)
    chrome(d, "Three eras — three genres", "#c4a35a")
    labels = [("OPEN WORLD", "#4a8a98"), ("RHYTHM", "#c45848"), ("SHOOTER", "#6b8f6a")]
    for i, (lab, col) in enumerate(labels):
        x = 50 + i * 195
        d.rounded_rectangle([x, 70, x + 170, 340], 12, fill="#1a2228", outline=col, width=3)
        # trophy cup
        d.ellipse([x + 45, 100, x + 125, 180], fill=col)
        d.rectangle([x + 70, 175, x + 100, 230], fill="#c4a35a")
        d.rectangle([x + 50, 230, x + 120, 250], fill="#e0c070")
        d.text((x + 20, 270), lab, fill="#f0e6d0", font=font(14, True))
        d.text((x + 55, 295), f"#{i + 1}", fill=col, font=font(20, True))
    save(img, "trophies.png")


def main():
    chart()
    drive()
    rhythm()
    shooter()
    fantasy()
    trophies()


if __name__ == "__main__":
    main()
