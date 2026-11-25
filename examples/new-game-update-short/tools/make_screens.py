#!/usr/bin/env python3
"""Original in-scene screen UIs (no real logos) for the new-game-update Short.

Activision/Call of Duty and Sony footage is NOT cleared — these are original
generic military-shooter / download / bug-tracker / certification UIs with
plain lettering only.
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


def title_screen():
    """Generic military-shooter title (no CoD logos/footage)."""
    img = Image.new("RGB", (W, H))
    d = ImageDraw.Draw(img)
    chrome(d, "Boot menu — sealed disc", "#4a8a98")
    d.rectangle([20, 50, 620, 370], fill="#1a2830")
    # silhouette hills
    d.polygon([(20, 300), (120, 180), (220, 260), (340, 140), (480, 220), (620, 160), (620, 370), (20, 370)], fill="#2a3840")
    d.rectangle([20, 300, 620, 370], fill="#243038")
    d.text((80, 90), "FRONTLINE", fill="#e8d080", font=font(48, True))
    d.text((80, 150), "PROTOCOL", fill="#c8d4c0", font=font(36, True))
    d.rounded_rectangle([80, 220, 280, 260], 8, fill="#3a5868")
    d.text((110, 228), "PRESS START", fill="#f0e6d0", font=font(18, True))
    d.text((80, 290), "Disc edition — day-one install required", fill="#8ab0a0", font=font(14))
    save(img, "title.png")


def download():
    """Giant 200 GB patch download bar."""
    img = Image.new("RGB", (W, H))
    d = ImageDraw.Draw(img)
    chrome(d, "System update required", "#c45848")
    d.rectangle([40, 70, 600, 340], fill="#1a2228", outline="#3a4850", width=2)
    d.text((60, 90), "Downloading patch", fill="#f0e6d0", font=font(28, True))
    d.text((60, 130), "200 Gigabyte day-one update", fill="#c4a35a", font=font(20, True))
    # progress bar crawling
    d.rounded_rectangle([60, 190, 580, 230], 10, fill="#0e1418", outline="#4a5868", width=2)
    d.rounded_rectangle([64, 194, 220, 226], 8, fill="#4a8a98")
    d.text((60, 250), "38%  —  76 GB of 200 GB", fill="#a8b8a0", font=font(18, True))
    d.text((60, 290), "Estimated time: several hours", fill="#889890", font=font(14))
    # tiny spinner squares
    for i, x in enumerate((480, 510, 540)):
        d.rectangle([x, 100, x + 18, 118], fill=("#4a8a98", "#6b8f6a", "#c4a35a")[i])
    save(img, "download.png")


def factory_panel():
    """Disc press line status board."""
    img = Image.new("RGB", (W, H))
    d = ImageDraw.Draw(img)
    chrome(d, "Press line — spindle count", "#c4a35a")
    rows = [
        ("Spindle A", "12,480", "#6b8f6a"),
        ("Spindle B", "11,902", "#4a8a98"),
        ("Ship crates", "WAIT", "#c45848"),
        ("Calendar", "WEEK 3", "#a87890"),
    ]
    for i, (label, val, col) in enumerate(rows):
        y = 60 + i * 75
        d.rounded_rectangle([40, y, 600, y + 65], 10, fill="#1a2228", outline=col, width=2)
        d.text((60, y + 18), label, fill="#c8d4c0", font=font(22, True))
        d.text((380, y + 16), val, fill=col, font=font(26, True))
    save(img, "factory.png")


def bugs():
    """Bug ticket board."""
    img = Image.new("RGB", (W, H))
    d = ImageDraw.Draw(img)
    chrome(d, "Launch board — open tickets", "#6b8f6a")
    tickets = [
        ("#4412", "Collision pop", "P1", "#c45848"),
        ("#4418", "Save desync", "P1", "#c45848"),
        ("#4420", "UI overflow", "P2", "#c4a35a"),
        ("#4425", "Audio crackle", "P2", "#c4a35a"),
        ("#4431", "LOD flicker", "P3", "#4a8a98"),
    ]
    d.text((40, 50), "DAYS TO LAUNCH: 4", fill="#e8d080", font=font(22, True))
    for i, (tid, title, pri, col) in enumerate(tickets):
        y = 95 + i * 55
        d.rounded_rectangle([40, y, 600, y + 48], 8, fill="#1a2228", outline=col, width=2)
        d.text((55, y + 12), tid, fill=col, font=font(16, True))
        d.text((150, y + 12), title, fill="#f0e6d0", font=font(16, True))
        d.rounded_rectangle([500, y + 10, 570, y + 38], 6, fill=col)
        d.text((515, y + 14), pri, fill="#12181c", font=font(14, True))
    save(img, "bugs.png")


def cert():
    """Certification checklist with REJECTED stamp look."""
    img = Image.new("RGB", (W, H))
    d = ImageDraw.Draw(img)
    chrome(d, "Platform cert checklist", "#c45848")
    items = [
        ("Save interruptions", "PASS", "#6b8f6a"),
        ("Trophy triggers", "PASS", "#6b8f6a"),
        ("Network resume", "FAIL", "#c45848"),
        ("Age rating text", "PASS", "#6b8f6a"),
        ("Patch payload size", "HOLD", "#c4a35a"),
    ]
    for i, (label, status, col) in enumerate(items):
        y = 55 + i * 55
        d.rounded_rectangle([40, y, 600, y + 48], 8, fill="#1a2228")
        d.text((60, y + 12), label, fill="#c8d4c0", font=font(18, True))
        d.text((480, y + 12), status, fill=col, font=font(18, True))
    # big rejected overlay
    d.ellipse([200, 140, 440, 300], outline="#c45848", width=8)
    d.text((230, 195), "REJECTED", fill="#c45848", font=font(32, True))
    save(img, "cert.png")


def gold():
    """Gold master badge screen."""
    img = Image.new("RGB", (W, H))
    d = ImageDraw.Draw(img)
    chrome(d, "Build pipeline — master candidate", "#e0c070")
    d.ellipse([200, 80, 440, 320], fill="#2a2418", outline="#e0c070", width=6)
    d.ellipse([230, 110, 410, 290], outline="#c4a35a", width=3)
    d.text((245, 175), "GOING", fill="#e0c070", font=font(28, True))
    d.text((250, 215), "GOLD", fill="#f4f0ea", font=font(36, True))
    d.text((80, 340), "Candidate locked — print masters ship this week", fill="#a8b8a0", font=font(14))
    save(img, "gold.png")


def main():
    title_screen()
    download()
    factory_panel()
    bugs()
    cert()
    gold()


if __name__ == "__main__":
    main()
