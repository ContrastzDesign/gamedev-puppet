#!/usr/bin/env python3
"""Original in-scene screen UIs (no real logos) for the engine-real Short.

Epic/Unity demo footage is NOT cleared — these are original city/face renders
and editor-like UIs with plain generic lettering only.
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


def lab():
    """Side-by-side realism comparison wall."""
    img = Image.new("RGB", (W, H))
    d = ImageDraw.Draw(img)
    chrome(d, "Realism Lab — compare footage vs render", "#c4a35a")
    # left: "footage"
    d.rounded_rectangle([30, 55, 310, 360], 10, fill="#1a2228", outline="#c4a35a", width=2)
    d.text((46, 68), "Reference", fill="#e0d0a0", font=font(14, True))
    # faux photo city
    d.rectangle([46, 100, 294, 280], fill="#2a3a48")
    for i in range(8):
        d.rectangle([56 + i * 28, 160 + (i % 3) * 20, 76 + i * 28, 280], fill="#3a4a58")
        for j in range(4):
            d.rectangle([60 + i * 28, 170 + (i % 3) * 20 + j * 22, 72 + i * 28, 182 + (i % 3) * 20 + j * 22], fill="#e8c878")
    d.ellipse([220, 110, 250, 140], fill="#e8d080")
    d.text((46, 300), "street photo", fill="#a8b8a0", font=font(13))
    d.text((46, 325), "real-world plate", fill="#889890", font=font(12))
    # right: "render"
    d.rounded_rectangle([330, 55, 610, 360], 10, fill="#1a2228", outline="#6b8f6a", width=2)
    d.text((346, 68), "Engine render", fill="#a0d0b0", font=font(14, True))
    d.rectangle([346, 100, 594, 280], fill="#1a2838")
    for i in range(8):
        d.rectangle([356 + i * 28, 155 + (i % 3) * 18, 376 + i * 28, 280], fill="#2a4858")
        for j in range(4):
            d.rectangle([360 + i * 28, 165 + (i % 3) * 18 + j * 22, 372 + i * 28, 177 + (i % 3) * 18 + j * 22], fill="#70c0e0")
    d.ellipse([520, 110, 550, 140], fill="#a0c8e0")
    d.text((346, 300), "real-time preview", fill="#a8b8a0", font=font(13))
    d.text((346, 325), "which looks closer?", fill="#889890", font=font(12))
    save(img, "lab.png")


def city():
    """Street-level city fly-through + Nanite/Lumen viz."""
    img = Image.new("RGB", (W, H))
    d = ImageDraw.Draw(img)
    chrome(d, "City street view — detail + lighting", "#4a8a98")
    # night city street
    d.rectangle([20, 50, 400, 370], fill="#0e1824")
    # road
    d.polygon([(40, 360), (180, 180), (240, 180), (380, 360)], fill="#1a2430")
    d.line([(110, 360), (210, 180)], fill="#e8d080", width=2)
    # buildings L/R
    for i, x0 in enumerate([30, 50, 70]):
        h = 140 + i * 30
        d.rectangle([x0, 360 - h, x0 + 40, 360], fill="#1e2a38")
        for r in range(6):
            for c in range(2):
                d.rectangle([x0 + 6 + c * 16, 360 - h + 10 + r * 20, x0 + 16 + c * 16, 360 - h + 22 + r * 20],
                            fill="#e0a050" if (r + c + i) % 3 else "#3a5060")
    for i, x0 in enumerate([320, 350, 370]):
        h = 120 + i * 35
        d.rectangle([x0, 360 - h, x0 + 45, 360], fill="#1a2838")
        for r in range(5):
            for c in range(2):
                d.rectangle([x0 + 8 + c * 16, 360 - h + 12 + r * 22, x0 + 18 + c * 16, 360 - h + 26 + r * 22],
                            fill="#70b0d0" if (r + i) % 2 else "#2a4050")
    # car lights
    d.ellipse([150, 300, 170, 312], fill="#e8e0c0")
    d.ellipse([250, 290, 270, 302], fill="#e06050")
    d.text((30, 55), "street level", fill="#a0c0d0", font=font(12, True))
    # right panel: Nanite / Lumen viz
    d.rounded_rectangle([415, 55, 620, 200], 8, fill="#142028", outline="#7ab0c0", width=2)
    d.text((428, 65), "Geometry detail", fill="#a0d0e0", font=font(12, True))
    # wireframe to dense
    d.line([(430, 170), (450, 100), (470, 160), (490, 90), (510, 150), (530, 110), (550, 165), (580, 95), (605, 170)],
           fill="#70c8e0", width=2)
    for x in range(430, 610, 18):
        d.ellipse([x, 140, x + 4, 144], fill="#e0f0ff")
    d.rounded_rectangle([415, 215, 620, 360], 8, fill="#142028", outline="#e0c070", width=2)
    d.text((428, 225), "Light bounce", fill="#e0d0a0", font=font(12, True))
    # bounce rays
    d.ellipse([500, 280, 540, 320], fill="#e8c878")
    for ang in range(8):
        import math
        a = ang * math.pi / 4
        x2 = 520 + int(math.cos(a) * 55)
        y2 = 300 + int(math.sin(a) * 40)
        d.line([(520, 300), (x2, y2)], fill="#c4a35a", width=2)
    d.text((428, 335), "indirect fill", fill="#a89870", font=font(11))
    save(img, "city.png")


def face():
    """Portrait close-up with eye/skin/hair detail layers."""
    img = Image.new("RGB", (W, H))
    d = ImageDraw.Draw(img)
    chrome(d, "Close-up face — eye / skin / hair", "#a87890")
    # big face preview
    d.rounded_rectangle([30, 55, 360, 370], 10, fill="#2a2228", outline="#c4a35a", width=2)
    # stylized face
    d.ellipse([80, 90, 310, 340], fill="#e8c8a8")
    # eyes
    d.ellipse([120, 160, 175, 200], fill="#f4f0ea")
    d.ellipse([215, 160, 270, 200], fill="#f4f0ea")
    d.ellipse([135, 170, 160, 195], fill="#4a6a58")
    d.ellipse([230, 170, 255, 195], fill="#4a6a58")
    d.ellipse([142, 175, 152, 185], fill="#1a1818")
    d.ellipse([237, 175, 247, 185], fill="#1a1818")
    # nose / mouth
    d.ellipse([180, 210, 210, 245], fill="#d8b098")
    d.arc([150, 255, 240, 300], 20, 160, fill="#c4785a", width=3)
    # hair strands
    for i in range(12):
        x = 100 + i * 16
        d.arc([x - 20, 70, x + 40, 140], 200, 340, fill="#3a2e28", width=3)
    d.text((46, 345), "fills the frame", fill="#c8b8a0", font=font(13))
    # detail layers
    layers = [
        (380, 60, "#4a8a98", "Eye shaders", "iris + wetness"),
        (380, 160, "#c4785a", "Skin shaders", "pores + scatter"),
        (380, 260, "#6a5878", "Hair sim", "strands + motion"),
    ]
    for x, y, col, title, sub in layers:
        d.rounded_rectangle([x, y, 620, y + 85], 8, fill="#1a2228", outline=col, width=2)
        d.rectangle([x + 10, y + 10, x + 50, y + 50], fill=col)
        d.text((x + 65, y + 18), title, fill="#f0e6d0", font=font(14, True))
        d.text((x + 65, y + 45), sub, fill="#a8b0a0", font=font(12))
    save(img, "face.png")


def budget():
    """Frame-budget station: 16.7 ms timer bar split city vs face."""
    img = Image.new("RGB", (W, H))
    d = ImageDraw.Draw(img)
    chrome(d, "Frame budget — 16.7 ms @ sixty fps", "#6b8f6a")
    d.text((40, 55), "One frame clock", fill="#d8e8d0", font=font(16, True))
    d.text((40, 80), "16.7 milliseconds total", fill="#a8c8a0", font=font(13))
    # big timer bar
    d.rounded_rectangle([40, 120, 600, 180], 10, fill="#1a2420", outline="#6b8f6a", width=2)
    # city portion
    d.rounded_rectangle([48, 128, 340, 172], 6, fill="#4a8a98")
    d.text((60, 140), "CITY work", fill="#f0f8ff", font=font(14, True))
    # face portion
    d.rounded_rectangle([348, 128, 592, 172], 6, fill="#a87890")
    d.text((360, 140), "FACE work", fill="#fff0f8", font=font(14, True))
    # ms labels
    d.text((48, 195), "0 ms", fill="#889890", font=font(12))
    d.text((300, 195), "geometry · lights", fill="#7aa0a8", font=font(11))
    d.text((430, 195), "skin · hair · eyes", fill="#b888a0", font=font(11))
    d.text((540, 195), "16.7", fill="#889890", font=font(12))
    # two spend cards
    d.rounded_rectangle([40, 230, 310, 360], 10, fill="#142028", outline="#4a8a98", width=2)
    d.text((56, 245), "Realistic city", fill="#a0d0e0", font=font(14, True))
    for i, lab in enumerate(["dense meshes", "bounce lighting", "street scale"]):
        d.rounded_rectangle([56, 280 + i * 22, 290, 298 + i * 22], 4, fill="#1e3038")
        d.text((66, 282 + i * 22), lab, fill="#d0e0e8", font=font(12))
    d.rounded_rectangle([330, 230, 600, 360], 10, fill="#201420", outline="#a87890", width=2)
    d.text((346, 245), "Realistic face", fill="#e0b0c8", font=font(14, True))
    for i, lab in enumerate(["shader layers", "hair strands", "close-up pixels"]):
        d.rounded_rectangle([346, 280 + i * 22, 580, 298 + i * 22], 4, fill="#302030")
        d.text((356, 282 + i * 22), lab, fill="#e8d0e0", font=font(12))
    save(img, "budget.png")


def wire():
    """Secondary: geometry wireframe-to-detail."""
    img = Image.new("RGB", (W, H))
    d = ImageDraw.Draw(img)
    chrome(d, "Geometry — wire to detail", "#4a8a98")
    d.rounded_rectangle([40, 60, 300, 350], 10, fill="#101820", outline="#7ab0c0", width=2)
    d.text((56, 75), "Wire", fill="#a0d0e0", font=font(14, True))
    for i in range(6):
        d.line([(70, 120 + i * 35), (270, 120 + i * 35)], fill="#3a6070", width=1)
        d.line([(70 + i * 40, 110), (70 + i * 40, 330)], fill="#3a6070", width=1)
    d.polygon([(100, 280), (160, 140), (240, 280)], outline="#70c8e0", width=2)
    d.rounded_rectangle([340, 60, 600, 350], 10, fill="#101820", outline="#c4a35a", width=2)
    d.text((356, 75), "Detail", fill="#e0d0a0", font=font(14, True))
    for i in range(10):
        for j in range(8):
            d.rectangle([360 + i * 22, 120 + j * 26, 378 + i * 22, 140 + j * 26],
                        fill="#4a6a58" if (i + j) % 2 else "#6a8a78")
    d.text((70, 360), "same scene, more triangles", fill="#889890", font=font(12))
    save(img, "wire.png")


def skin():
    """Secondary: skin/eye detail panel."""
    img = Image.new("RGB", (W, H))
    d = ImageDraw.Draw(img)
    chrome(d, "Material layers — eye + skin", "#a87890")
    d.ellipse([80, 80, 280, 280], fill="#e8c8a8")
    d.ellipse([130, 140, 230, 220], fill="#f4f0ea")
    d.ellipse([155, 155, 205, 205], fill="#4a6a58")
    d.ellipse([170, 170, 190, 190], fill="#1a1818")
    d.arc([140, 145, 220, 175], 200, 340, fill="#3a2e28", width=4)
    d.text((100, 300), "iris · wetness · lid", fill="#c8b8a0", font=font(13))
    # layer stack
    for i, (lab, col) in enumerate([
        ("Base color", "#e8c8a8"),
        ("Scatter", "#c4785a"),
        ("Specular", "#d0d8e0"),
        ("Pore map", "#a89078"),
    ]):
        y = 70 + i * 70
        d.rounded_rectangle([340, y, 600, y + 55], 8, fill="#1a2228", outline=col, width=2)
        d.rectangle([350, y + 10, 390, y + 45], fill=col)
        d.text((410, y + 18), lab, fill="#f0e6d0", font=font(14, True))
    save(img, "skin.png")


if __name__ == "__main__":
    lab()
    city()
    face()
    budget()
    wire()
    skin()
