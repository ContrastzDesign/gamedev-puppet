#!/usr/bin/env python3
"""Original in-scene screen UIs (no real logos) for the easiest-tool Short."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

OUT = Path(__file__).resolve().parents[1] / "assets" / "screens"
OUT.mkdir(parents=True, exist_ok=True)

W, H = 640, 400


def font(size, bold=False):
    # DejaVu is usually present; fall back to default.
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


def workshop():
    img = Image.new("RGB", (W, H))
    d = ImageDraw.Draw(img)
    chrome(d, "First Game Lab — stations", "#c4a35a")
    # three station cards
    cards = [
        (40, 70, "#5a4868", "Story branch", "passage cards + string"),
        (230, 70, "#4a6a78", "2D logic", "conditions → actions"),
        (420, 70, "#3a7a78", "3D world", "type → build"),
    ]
    for x, y, col, t, sub in cards:
        d.rounded_rectangle([x, y, x + 170, y + 260], 12, fill="#1a2228", outline=col, width=3)
        d.rectangle([x + 10, y + 10, x + 160, y + 90], fill=col)
        d.text((x + 20, y + 110), t, fill="#f0e6d0", font=font(18, True))
        d.text((x + 20, y + 145), sub, fill="#a8b8a0", font=font(13))
        for i in range(3):
            d.rounded_rectangle([x + 20, y + 180 + i * 28, x + 150, y + 200 + i * 28], 4, fill="#243038")
    save(img, "workshop.png")


def story():
    img = Image.new("RGB", (W, H))
    d = ImageDraw.Draw(img)
    chrome(d, "Passage map — branching story", "#6a5878")
    # passage cards
    cards = [
        (60, 80, "Start", "You wake up."),
        (250, 60, "Forest", "Trees whisper."),
        (250, 200, "Cave", "It is dark."),
        (440, 120, "Ending", "You smile."),
    ]
    for x, y, title, body in cards:
        d.rounded_rectangle([x, y, x + 140, y + 100], 8, fill="#2a2238", outline="#c4a35a", width=2)
        d.text((x + 14, y + 14), title, fill="#f0e6d0", font=font(16, True))
        d.text((x + 14, y + 48), body, fill="#c8b8d8", font=font(13))
    # string links
    d.line([(200, 130), (250, 100)], fill="#e8d080", width=3)
    d.line([(200, 140), (250, 240)], fill="#e8d080", width=3)
    d.line([(390, 110), (440, 160)], fill="#e8d080", width=3)
    d.line([(390, 250), (440, 180)], fill="#e8d080", width=3)
    d.text((70, 320), "Linking two passages creates a choice", fill="#d8c8a0", font=font(15))
    d.text((70, 350), "No programming required for a basic story", fill="#a8b0a0", font=font(13))
    save(img, "story.png")


def logic():
    img = Image.new("RGB", (W, H))
    d = ImageDraw.Draw(img)
    chrome(d, "Event editor — conditions + actions", "#4a6a78")
    # event rule block
    d.rounded_rectangle([40, 60, 600, 200], 10, fill="#1a2830", outline="#7ab0c0", width=2)
    d.text((56, 72), "Event 1", fill="#a0d0e0", font=font(14, True))
    d.rounded_rectangle([56, 100, 300, 150], 8, fill="#243840", outline="#c4a35a", width=2)
    d.text((70, 112), "Condition", fill="#c4a35a", font=font(12, True))
    d.text((70, 130), "Player touches key", fill="#f0e6d0", font=font(16, True))
    d.text((310, 118), "→", fill="#e0c070", font=font(28, True))
    d.rounded_rectangle([350, 100, 580, 150], 8, fill="#243840", outline="#6b8f6a", width=2)
    d.text((364, 112), "Action", fill="#6b8f6a", font=font(12, True))
    d.text((364, 130), "open door", fill="#f0e6d0", font=font(16, True))
    # mini game preview: key + door
    d.rounded_rectangle([40, 220, 300, 370], 10, fill="#152028", outline="#3a5058", width=2)
    d.text((56, 232), "Preview", fill="#8aa0a8", font=font(13, True))
    # key
    d.ellipse([80, 290, 120, 330], fill="#e0c070")
    d.rectangle([118, 302, 180, 318], fill="#e0c070")
    d.rectangle([160, 318, 172, 340], fill="#e0c070")
    d.rectangle([175, 318, 187, 340], fill="#e0c070")
    # door
    d.rounded_rectangle([210, 260, 275, 350], 4, fill="#8a6040", outline="#c4a35a", width=2)
    d.ellipse([255, 300, 265, 310], fill="#e0c070")
    d.text((56, 345), "rule readable in the editor", fill="#a8b8a0", font=font(12))
    # side list
    d.rounded_rectangle([320, 220, 600, 370], 10, fill="#152028", outline="#3a5058", width=2)
    d.text((336, 232), "Events", fill="#8aa0a8", font=font(13, True))
    for i, label in enumerate(["Player touches key → open door", "On start → spawn player", "Timer → close door"]):
        d.rounded_rectangle([336, 265 + i * 30, 580, 288 + i * 30], 4, fill="#1e3038" if i else "#2a4850")
        d.text((346, 268 + i * 30), label, fill="#d8e0d0", font=font(12))
    save(img, "logic.png")


def world3d():
    img = Image.new("RGB", (W, H))
    d = ImageDraw.Draw(img)
    chrome(d, "Text → 3D world build", "#3a7a78")
    # prompt panel
    d.rounded_rectangle([30, 55, 300, 370], 10, fill="#142428", outline="#5a9a98", width=2)
    d.text((46, 68), "Describe a world", fill="#a0e0d8", font=font(14, True))
    d.rounded_rectangle([46, 100, 284, 220], 8, fill="#0e1c20", outline="#2a4850", width=1)
    d.text((56, 112), "a sunny meadow with", fill="#d8f0e8", font=font(14))
    d.text((56, 136), "a wooden cabin and", fill="#d8f0e8", font=font(14))
    d.text((56, 160), "a glowing portal", fill="#d8f0e8", font=font(14))
    d.rectangle([56, 186, 62, 204], fill="#7ec8c0")  # caret
    d.rounded_rectangle([46, 240, 180, 280], 8, fill="#3a7a78")
    d.text((70, 250), "Build", fill="#f0fff8", font=font(16, True))
    d.text((46, 300), "Playtest before writing code", fill="#a8c8c0", font=font(12))
    # 3D preview
    d.rounded_rectangle([320, 55, 610, 370], 10, fill="#1a3040", outline="#5a9a98", width=2)
    # ground
    d.polygon([(340, 300), (460, 240), (590, 300), (470, 340)], fill="#4a8a58")
    # cabin
    d.rectangle([430, 220, 500, 290], fill="#8a6040")
    d.polygon([(420, 220), (465, 180), (510, 220)], fill="#c45848")
    d.rectangle([450, 250, 475, 290], fill="#3a2e24")
    # portal
    d.ellipse([360, 210, 410, 280], outline="#5ec8c0", width=6)
    d.ellipse([370, 225, 400, 265], fill="#2a6070")
    # sun
    d.ellipse([540, 90, 580, 130], fill="#e8c878")
    d.text((340, 340), "live playtest view", fill="#a0d0c8", font=font(12))
    save(img, "world3d.png")


def passages():
    """Secondary screen: passage cards close-up."""
    img = Image.new("RGB", (W, H))
    d = ImageDraw.Draw(img)
    chrome(d, "Passage cards", "#6a5878")
    for i, (title, body) in enumerate([
        ("Passage A", "[[Go left]] [[Go right]]"),
        ("Passage B", "The door creaks open."),
        ("Passage C", "You find a key."),
    ]):
        x = 40 + i * 200
        d.rounded_rectangle([x, 80, x + 180, 320], 10, fill="#2a2238", outline="#c4a35a", width=2)
        d.rectangle([x + 10, 95, x + 170, 130], fill="#4a3a58")
        d.text((x + 20, 102), title, fill="#f0e6d0", font=font(16, True))
        d.text((x + 20, 160), body, fill="#c8b8d8", font=font(13))
        d.line([(x + 30, 220), (x + 150, 220)], fill="#e8d080", width=2)
    save(img, "passages.png")


if __name__ == "__main__":
    workshop()
    story()
    logic()
    world3d()
    passages()
