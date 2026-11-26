#!/usr/bin/env python3
"""Original in-scene screen UIs (no real logos) for the gta6-bug-v1 Short.

Rockstar/GTA VI and Sony footage is NOT cleared — original open-world city,
code editor, upload UI, harbour map, QA checklist, cert FAIL stamp only.
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


def city_bridge():
    """Original open-world city with cars falling through a suspension bridge."""
    img = Image.new("RGB", (W, H))
    d = ImageDraw.Draw(img)
    # sky / water
    d.rectangle([0, 0, W, H], fill="#6a9ab8")
    d.rectangle([0, 260, W, H], fill="#3a6a78")
    # distant skyline
    for i, (x, h) in enumerate([(20, 120), (70, 160), (130, 100), (180, 140), (240, 90),
                                 (400, 130), (460, 170), (530, 110), (580, 150)]):
        d.rectangle([x, 260 - h, x + 40, 260], fill="#2a3848" if i % 2 == 0 else "#3a4858")
        d.rectangle([x + 8, 260 - h + 20, x + 18, 260 - h + 40], fill="#c4a35a")
    # suspension bridge deck
    d.rectangle([40, 200, 600, 220], fill="#5a5a60")
    d.rectangle([80, 100, 100, 200], fill="#4a4a50")
    d.rectangle([540, 100, 560, 200], fill="#4a4a50")
    d.line([(90, 100), (40, 200)], fill="#c8c8c8", width=3)
    d.line([(90, 100), (300, 200)], fill="#c8c8c8", width=3)
    d.line([(550, 100), (600, 200)], fill="#c8c8c8", width=3)
    d.line([(550, 100), (340, 200)], fill="#c8c8c8", width=3)
    # hole in bridge
    d.ellipse([280, 195, 360, 225], fill="#3a6a78")
    # cars (one falling)
    d.rounded_rectangle([160, 185, 210, 205], 4, fill="#c45848")
    d.rounded_rectangle([220, 185, 270, 205], 4, fill="#4a8a98")
    d.rounded_rectangle([300, 230, 345, 250], 4, fill="#c4a35a")  # falling
    d.rounded_rectangle([310, 270, 350, 288], 4, fill="#6b8f6a")  # fallen
    d.text((20, 20), "OPEN CITY — LIVE", fill="#f0e6d0", font=font(16, True))
    d.text((20, 360), "BUG: cars fall through Bridge 7", fill="#c45848", font=font(14, True))
    save(img, "city.png")


def code_editor():
    """Highlighted one-line fix."""
    img = Image.new("RGB", (W, H))
    d = ImageDraw.Draw(img)
    chrome(d, "bridge_collider.cpp — edit", "#4a8a98")
    lines = [
        ("  41", "void Bridge::update() {", "#8ab0a0"),
        ("  42", "  if (car.onDeck()) {", "#8ab0a0"),
        ("  43", "    car.setSolid(deckMesh);  // FIX", "#e8d080"),
        ("  44", "  }", "#8ab0a0"),
        ("  45", "}", "#8ab0a0"),
        ("  46", "", "#8ab0a0"),
        ("  47", "// ticket BUG-4412", "#6a7a70"),
    ]
    d.rectangle([20, 50, 620, 370], fill="#1a2228")
    # highlight line 43
    d.rectangle([20, 130, 620, 165], fill="#3a4840")
    for i, (num, text, col) in enumerate(lines):
        y = 60 + i * 36
        d.text((30, y), num, fill="#5a6a60", font=font(16))
        d.text((80, y), text, fill=col, font=font(16, True if "FIX" in text else False))
    save(img, "code.png")


def upload_ui():
    """Giant UPLOAD button."""
    img = Image.new("RGB", (W, H))
    d = ImageDraw.Draw(img)
    chrome(d, "Patch publisher — staging", "#c4a35a")
    d.rectangle([40, 60, 600, 340], fill="#1a2228", outline="#3a4850", width=2)
    d.text((60, 80), "Ready to ship?", fill="#f0e6d0", font=font(28, True))
    d.text((60, 120), "bridge_fix_v1.patch  —  1 line", fill="#8ab0a0", font=font(16))
    d.rounded_rectangle([120, 180, 520, 280], 16, fill="#6b8f6a")
    d.text((220, 210), "UPLOAD", fill="#f0e6d0", font=font(42, True))
    d.text((60, 300), "Warning: untested side effects", fill="#c45848", font=font(14, True))
    save(img, "upload.png")


def harbour_map():
    """Stylised harbour with invisible wall shimmer mark."""
    img = Image.new("RGB", (W, H))
    d = ImageDraw.Draw(img)
    chrome(d, "Harbour sim — collision debug", "#4a8a98")
    d.rectangle([20, 50, 620, 370], fill="#2a5060")
    # water
    d.rectangle([20, 180, 620, 370], fill="#3a6a78")
    # bridge top
    d.rectangle([40, 140, 600, 170], fill="#5a5a60")
    # invisible wall shimmer (vertical translucent strip under bridge)
    for i in range(8):
        x = 300 + i * 4
        d.rectangle([x, 170, x + 2, 340], fill="#c8e8f0")
    d.text((250, 250), "INVISIBLE WALL", fill="#f0e6d0", font=font(16, True))
    # boat triangle
    d.polygon([(180, 280), (220, 260), (220, 300)], fill="#c45848")
    d.text((20, 360), "boats hit wall under fixed bridge", fill="#c4a35a", font=font(13, True))
    save(img, "harbour.png")


def qa_board():
    """QA checklist / city map pins."""
    img = Image.new("RGB", (W, H))
    d = ImageDraw.Draw(img)
    chrome(d, "QA lab — full replay", "#6b8f6a")
    rows = [
        ("Bridge 7 cars", "PASS", "#6b8f6a"),
        ("Harbour boats", "FAIL", "#c45848"),
        ("Downtown traffic", "REPLAY", "#c4a35a"),
        ("Airport runway", "REPLAY", "#c4a35a"),
        ("Whole map sweep", "RUNNING", "#4a8a98"),
    ]
    for i, (label, val, col) in enumerate(rows):
        y = 55 + i * 60
        d.rounded_rectangle([30, y, 610, y + 50], 8, fill="#1a2228", outline=col, width=2)
        d.text((50, y + 12), label, fill="#c8d4c0", font=font(18, True))
        d.text((420, y + 12), val, fill=col, font=font(18, True))
    save(img, "qa.png")


def cert_fail():
    """Certification FAIL stamp UI."""
    img = Image.new("RGB", (W, H))
    d = ImageDraw.Draw(img)
    chrome(d, "Platform certification — checklist", "#c45848")
    d.rectangle([40, 60, 600, 340], fill="#1a2228", outline="#3a4850", width=2)
    checks = [
        ("Save data rules", "OK"),
        ("Network timeout", "OK"),
        ("Collision layers", "FAIL"),
        ("Trophy hooks", "OK"),
    ]
    for i, (label, val) in enumerate(checks):
        y = 80 + i * 40
        col = "#c45848" if val == "FAIL" else "#6b8f6a"
        d.text((60, y), label, fill="#c8d4c0", font=font(18, True))
        d.text((420, y), val, fill=col, font=font(18, True))
    # big FAIL stamp
    d.ellipse([200, 220, 440, 320], outline="#c45848", width=8)
    d.text((250, 250), "FAILED", fill="#c45848", font=font(36, True))
    save(img, "cert.png")


def year10():
    """YEAR 10 calendar board."""
    img = Image.new("RGB", (W, H))
    d = ImageDraw.Draw(img)
    chrome(d, "Studio wall — ship calendar", "#a87890")
    d.rectangle([40, 60, 600, 340], fill="#1a2228")
    d.text((80, 100), "YEAR 10", fill="#e8d080", font=font(56, True))
    d.text((80, 180), "Still proving the fix…", fill="#c8d4c0", font=font(22, True))
    d.rounded_rectangle([80, 240, 280, 300], 10, fill="#3a1818")
    d.text((100, 255), "10 YEARS", fill="#c45848", font=font(24, True))
    d.rounded_rectangle([320, 240, 560, 300], 10, fill="#1a3020")
    d.text((340, 255), "TEST PILE", fill="#6b8f6a", font=font(24, True))
    save(img, "years.png")


def main():
    city_bridge()
    code_editor()
    upload_ui()
    harbour_map()
    qa_board()
    cert_fail()
    year10()


if __name__ == "__main__":
    main()
