#!/usr/bin/env python3
"""Original in-scene screen UIs (no real logos) for the phone-hot-v1 Short.

Generic colourful mobile runner, FPS/temp gauges, graphics sliders, app-store grid.
No Apple/Google/Samsung branding.
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


def save(img, name):
    path = OUT / name
    img.save(path)
    print("wrote", path)


def game_smooth():
    """Colourful mobile runner — smooth high FPS."""
    img = Image.new("RGB", (W, H))
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, W, H], fill="#1a3040")
    # parallax hills
    d.ellipse([-40, 180, 220, 420], fill="#2a5860")
    d.ellipse([160, 160, 480, 440], fill="#3a6870")
    d.ellipse([400, 200, 700, 460], fill="#2a4858")
    # track
    d.polygon([(180, H), (280, 120), (360, 120), (460, H)], fill="#4a4a50")
    d.line([(300, 120), (240, H)], fill="#e0c070", width=4)
    d.line([(340, 120), (400, H)], fill="#e0c070", width=4)
    # runner character blob
    d.ellipse([290, 200, 350, 270], fill="#c45848")
    d.ellipse([300, 170, 340, 210], fill="#e8c090")
    # coins
    for x, y in [(250, 160), (380, 180), (300, 140), (360, 220)]:
        d.ellipse([x, y, x + 22, y + 22], fill="#e0c070")
    d.rounded_rectangle([16, 16, 160, 56], 8, fill="#0e181c")
    d.text((28, 24), "FPS 60", fill="#6b8f6a", font=font(22, True))
    d.rounded_rectangle([W - 150, 16, W - 16, 56], 8, fill="#0e181c")
    d.text((W - 138, 24), "TEMP 36°", fill="#8ab0a0", font=font(18, True))
    d.text((20, 360), "DASH RUNNER", fill="#f0e6d0", font=font(16, True))
    save(img, "game-smooth.png")


def game_slow():
    """Same game dropped to slideshow — blocky, red temp."""
    img = Image.new("RGB", (W, H))
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, W, H], fill="#2a2030")
    d.rectangle([0, 200, W, H], fill="#3a3040")
    # blocky low-detail hills
    d.rectangle([0, 220, 160, H], fill="#4a4050")
    d.rectangle([160, 180, 360, H], fill="#5a5060")
    d.rectangle([360, 240, W, H], fill="#3a3848")
    d.rectangle([220, 140, 420, H], fill="#5a5a68")
    d.rectangle([300, 140, 340, H], fill="#e0c070")
    # chunky runner
    d.rectangle([285, 200, 355, 280], fill="#a04040")
    d.rectangle([295, 165, 345, 215], fill="#c4a070")
    d.rounded_rectangle([16, 16, 160, 56], 8, fill="#1c1010")
    d.text((28, 24), "FPS 12", fill="#c45848", font=font(22, True))
    d.rounded_rectangle([W - 160, 16, W - 16, 56], 8, fill="#1c1010")
    d.text((W - 148, 24), "TEMP 48°", fill="#c45848", font=font(18, True))
    d.text((20, 360), "DROPPED FRAMES", fill="#c45848", font=font(16, True))
    # scanline stutter bars
    for y in range(80, 360, 40):
        d.rectangle([0, y, W, y + 4], fill="#000000", outline=None)
    save(img, "game-slow.png")


def game_worse():
    """Even blockier after graphics cut."""
    img = Image.new("RGB", (W, H))
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, W, H], fill="#1a1820")
    # chunky 8-bit style
    for i, col in enumerate(["#3a3848", "#4a4858", "#2a2838"]):
        d.rectangle([i * 220, 160, (i + 1) * 220, H], fill=col)
    d.rectangle([260, 200, 380, 320], fill="#6a4050")
    d.rectangle([280, 160, 360, 220], fill="#8a7060")
    d.rounded_rectangle([16, 16, 170, 56], 8, fill="#0e1014")
    d.text((28, 24), "FPS 20", fill="#c4a35a", font=font(22, True))
    d.text((20, 340), "LOW GRAPHICS", fill="#a09080", font=font(18, True))
    d.text((20, 365), "LOOKS WORSE", fill="#c45848", font=font(16, True))
    save(img, "game-worse.png")


def temp_gauge():
    img = Image.new("RGB", (W, H))
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, W, H], fill="#12181c")
    d.text((40, 30), "PHONE THERMAL", fill="#f0e6d0", font=font(28, True))
    # thermometer
    d.rounded_rectangle([280, 80, 360, 300], 30, fill="#2a3238")
    d.ellipse([250, 280, 390, 380], fill="#2a3238")
    d.rounded_rectangle([295, 100, 345, 300], 20, fill="#c45848")
    d.ellipse([265, 295, 375, 365], fill="#c45848")
    d.text((400, 160), "48°C", fill="#c45848", font=font(48, True))
    d.text((400, 220), "THROTTLING", fill="#e0c070", font=font(22, True))
    save(img, "temp.png")


def sliders():
    img = Image.new("RGB", (W, H))
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, W, H], fill="#1a2228")
    d.text((40, 28), "GAME SETTINGS", fill="#f0e6d0", font=font(26, True))
    rows = [
        ("GRAPHICS", 0.25, "#c45848"),
        ("FRAME RATE", 0.35, "#c4a35a"),
        ("SHADOWS", 0.15, "#6b8f6a"),
        ("EFFECTS", 0.2, "#4a8a98"),
    ]
    for i, (label, val, col) in enumerate(rows):
        y = 90 + i * 70
        d.text((40, y), label, fill="#c8d4c0", font=font(18, True))
        d.rounded_rectangle([40, y + 30, 600, y + 48], 8, fill="#0e1418")
        d.rounded_rectangle([40, y + 30, 40 + int(560 * val), y + 48], 8, fill=col)
        d.ellipse([40 + int(560 * val) - 14, y + 24, 40 + int(560 * val) + 14, y + 54], fill="#f0e6d0")
    d.text((40, 360), "TURNING DOWN THE HEAT… BY CUTTING THE GAME", fill="#a09080", font=font(14, True))
    save(img, "sliders.png")


def app_store():
    """Generic app-store-style icon grid — no brand logos."""
    img = Image.new("RGB", (W, H))
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, W, H], fill="#f4f0ea")
    d.rectangle([0, 0, W, 56], fill="#e8e0d4")
    d.text((24, 16), "APPS", fill="#3a3028", font=font(24, True))
    colors = ["#c45848", "#4a8a98", "#6b8f6a", "#c4a35a", "#a87890", "#3a4858",
              "#8a6a40", "#6a7a98", "#5a8a78", "#b07050", "#7a6a98", "#4a6a58"]
    labels = ["Run", "Dash", "Farm", "Puzzle", "Race", "Build",
              "Shoot", "Craft", "Fish", "Fly", "Music", "Chat"]
    for i, (col, lab) in enumerate(zip(colors, labels)):
        x = 40 + (i % 4) * 150
        y = 80 + (i // 4) * 100
        d.rounded_rectangle([x, y, x + 100, y + 70], 14, fill=col)
        d.text((x + 20, y + 22), lab, fill="#f0e6d0", font=font(16, True))
    save(img, "appstore.png")


def blueprint():
    img = Image.new("RGB", (W, H))
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, W, H], fill="#1a3a58")
    for x in range(0, W, 40):
        d.line([(x, 0), (x, H)], fill="#2a4a68", width=1)
    for y in range(0, H, 40):
        d.line([(0, y), (W, y)], fill="#2a4a68", width=1)
    d.rounded_rectangle([180, 80, 460, 320], 20, fill="#2a4a68", outline="#8ab0c8", width=3)
    # fan sketch
    d.ellipse([260, 120, 380, 240], outline="#e0c070", width=4)
    d.line([(320, 120), (320, 240)], fill="#e0c070", width=3)
    d.line([(260, 180), (380, 180)], fill="#e0c070", width=3)
    d.text((200, 280), "TINY DESK FAN v0.1", fill="#e0c070", font=font(18, True))
    d.text((40, 350), "INVENTOR NOTES — AIR HOLES REQUIRED", fill="#8ab0c8", font=font(14, True))
    save(img, "blueprint.png")


def circuit():
    img = Image.new("RGB", (W, H))
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, W, H], fill="#0e1814")
    # traces
    for y in (80, 140, 200, 260, 320):
        d.line([(40, y), (600, y)], fill="#2a5840", width=6)
    for x in (100, 220, 340, 460, 560):
        d.line([(x, 60), (x, 340)], fill="#2a5840", width=4)
    # chips
    for i, (x, y) in enumerate([(120, 100), (280, 160), (440, 100), (200, 240), (380, 260)]):
        d.rounded_rectangle([x, y, x + 80, y + 50], 4, fill="#3a4850")
        d.rectangle([x + 10, y + 15, x + 70, y + 35], fill="#1a2428")
        for p in range(4):
            d.rectangle([x + 12 + p * 16, y - 6, x + 20 + p * 16, y], fill="#c4a35a")
            d.rectangle([x + 12 + p * 16, y + 50, x + 20 + p * 16, y + 56], fill="#c4a35a")
    # heat glow
    d.ellipse([250, 140, 390, 260], fill="#c45848", outline=None)
    d.ellipse([270, 160, 370, 240], fill="#e08040")
    d.text((40, 360), "HEAT HAS NOWHERE TO GO", fill="#c45848", font=font(18, True))
    save(img, "circuit.png")


def racetrack():
    img = Image.new("RGB", (W, H))
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, W, H], fill="#0e1814")
    # oval track
    d.ellipse([60, 60, 580, 340], outline="#2a5840", width=40)
    d.ellipse([100, 100, 540, 300], outline="#1a3028", width=8)
    # SAFE MODE sign
    d.rounded_rectangle([220, 160, 420, 220], 8, fill="#2a3228")
    d.rounded_rectangle([228, 168, 412, 212], 6, fill="#c45848")
    d.text((245, 178), "SAFE MODE", fill="#f0e6d0", font=font(24, True))
    d.text((40, 360), "THERMAL THROTTLING", fill="#e0c070", font=font(18, True))
    save(img, "racetrack.png")


def harder_hotter():
    img = Image.new("RGB", (W, H))
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, W, H], fill="#1a2228")
    d.rounded_rectangle([40, 80, 300, 300], 16, fill="#2a3238")
    d.text((90, 160), "HARDER?", fill="#8a9080", font=font(32, True))
    d.text((100, 210), "NOPE", fill="#6a7060", font=font(28, True))
    d.rounded_rectangle([340, 80, 600, 300], 16, fill="#3a2020")
    d.text((390, 160), "HOTTER!", fill="#c45848", font=font(32, True))
    d.text((400, 210), "YES", fill="#e08040", font=font(28, True))
    # thermometer icon
    d.rounded_rectangle([470, 240, 500, 290], 10, fill="#c45848")
    d.ellipse([455, 275, 515, 325], fill="#c45848")
    save(img, "harder-hotter.png")


def main():
    game_smooth()
    game_slow()
    game_worse()
    temp_gauge()
    sliders()
    app_store()
    blueprint()
    circuit()
    racetrack()
    harder_hotter()


if __name__ == "__main__":
    main()
