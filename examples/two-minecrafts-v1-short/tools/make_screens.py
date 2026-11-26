#!/usr/bin/env python3
"""Original in-scene screen UIs for two-minecrafts-v1-short.

Generic blocky voxel sandbox + code editors + checklist + world list + box art.
NO Minecraft/Mojang/Microsoft logos, textures, Steve, Creeper, grass-block texture,
or trademarked UI. Original teal/sand/clay palette (not classic green grass + dirt).
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

OUT = Path(__file__).resolve().parents[1] / "assets" / "screens"
OUT.mkdir(parents=True, exist_ok=True)

# Laptop / monitor friendly widescreen; square for box art & towers
W, H = 640, 360
S = 512


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


def voxel_block(d, x, y, size, top, side, face):
    """Draw a simple isometric-ish cube face stack (front + top strip)."""
    d.rectangle([x, y + size // 4, x + size, y + size], fill=face)
    d.rectangle([x, y, x + size, y + size // 4], fill=top)
    # left shade edge
    d.rectangle([x, y + size // 4, x + size // 8, y + size], fill=side)


def draw_voxel_sky_ground(d, w, h, sky="#6eb8c8", ground="#c4a878", far="#8ec8b0"):
    d.rectangle([0, 0, w, h], fill=sky)
    # distant hills as chunky rectangles (teal clay — not grass green)
    d.rectangle([0, h // 2 - 20, w, h], fill=far)
    for i, col in enumerate(["#7ab8a0", "#6aa890", "#5a9880"]):
        bx = i * (w // 3) - 20
        d.rectangle([bx, h // 2 - 40 + i * 8, bx + w // 3 + 40, h], fill=col)
    d.rectangle([0, int(h * 0.62), w, h], fill=ground)
    # sand / clay checker voxels on ground
    bs = 28
    for row in range(6):
        for col in range(w // bs + 1):
            c = "#d4b888" if (row + col) % 2 == 0 else "#c4a070"
            if row > 2:
                c = "#b89060" if (row + col) % 2 == 0 else "#a87850"
            x = col * bs
            y = int(h * 0.62) + row * (bs // 2)
            d.rectangle([x, y, x + bs - 1, y + bs // 2 - 1], fill=c)


def draw_red_wire_contraption(d, ox, oy, broken=False):
    """Little red-wire machine among voxels — original, not redstone copy."""
    # base platform (teal clay blocks)
    for i in range(5):
        voxel_block(d, ox + i * 22, oy + 40, 22, "#8ec8b8", "#5a9080", "#6eb0a0")
    # tower pillars
    for px in (ox + 10, ox + 78):
        for tier in range(3):
            voxel_block(d, px, oy - tier * 18, 18, "#d8c4a0", "#a89070", "#c4b088")
    # hopper / funnel box
    d.rectangle([ox + 28, oy + 8, ox + 78, oy + 36], fill="#4a5860")
    d.rectangle([ox + 34, oy + 14, ox + 72, oy + 30], fill="#2a3840")
    # red wire paths
    wire = "#c04040" if not broken else "#803030"
    d.line([(ox + 18, oy + 28), (ox + 18, oy - 10), (ox + 88, oy - 10), (ox + 88, oy + 28)], fill=wire, width=4)
    d.line([(ox + 18, oy - 10), (ox + 53, oy - 28), (ox + 88, oy - 10)], fill=wire, width=4)
    # glowing nodes
    node = "#e06060" if not broken else "#604040"
    for nx, ny in [(ox + 18, oy - 10), (ox + 53, oy - 28), (ox + 88, oy - 10)]:
        d.ellipse([nx - 5, ny - 5, nx + 5, ny + 5], fill=node)
    # spinning wheel / gear
    cx, cy = ox + 53, oy + 18
    if not broken:
        d.ellipse([cx - 14, cy - 14, cx + 14, cy + 14], outline="#e8c070", width=3)
        d.line([(cx - 12, cy), (cx + 12, cy)], fill="#e8c070", width=2)
        d.line([(cx, cy - 12), (cx, cy + 12)], fill="#e8c070", width=2)
        d.ellipse([cx - 4, cy - 4, cx + 4, cy + 4], fill="#f0e0a0")
    else:
        d.ellipse([cx - 14, cy - 14, cx + 14, cy + 14], outline="#806040", width=3)
        d.line([(cx - 10, cy - 8), (cx + 8, cy + 10)], fill="#806040", width=2)


def farm_ok():
    img = Image.new("RGB", (W, H))
    d = ImageDraw.Draw(img)
    draw_voxel_sky_ground(d, W, H)
    # midground teal/sand towers
    for i, (x, hgt) in enumerate([(40, 4), (90, 6), (500, 5), (560, 3)]):
        for t in range(hgt):
            top = "#a8d8c8" if t == hgt - 1 else "#c8b898"
            face = "#78b8a8" if t == hgt - 1 else "#b09870"
            side = "#589888" if t == hgt - 1 else "#887850"
            voxel_block(d, x, 200 - t * 22, 26, top, side, face)
    draw_red_wire_contraption(d, 240, 180, broken=False)
    # status HUD
    d.rounded_rectangle([16, 12, 170, 56], 8, fill="#0e2018")
    d.text((28, 22), "OK", fill="#6bdc8a", font=font(28, True))
    d.ellipse([120, 22, 150, 52], outline="#6bdc8a", width=4)
    d.line([(128, 38), (136, 46), (146, 28)], fill="#6bdc8a", width=3)
    d.rounded_rectangle([W - 200, 12, W - 16, 56], 8, fill="#0e2018")
    d.text((W - 188, 22), "FARM ONLINE", fill="#8ec8a0", font=font(16, True))
    save(img, "farm-ok.png")


def farm_break():
    img = Image.new("RGB", (W, H))
    d = ImageDraw.Draw(img)
    draw_voxel_sky_ground(d, W, H, sky="#8a7868", ground="#a89068", far="#786858")
    for i, (x, hgt) in enumerate([(40, 4), (90, 6), (500, 5), (560, 3)]):
        for t in range(hgt):
            top = "#98b8a8" if t == hgt - 1 else "#b8a888"
            face = "#688878" if t == hgt - 1 else "#a08860"
            side = "#486858" if t == hgt - 1 else "#786840"
            voxel_block(d, x, 200 - t * 22, 26, top, side, face)
    draw_red_wire_contraption(d, 240, 180, broken=True)
    # orange / yellow sparks
    sparks = [
        (280, 140, 8, "#ff8800"), (310, 120, 6, "#ffcc00"), (340, 150, 10, "#ff6600"),
        (300, 100, 5, "#ffe080"), (360, 110, 7, "#ffaa20"), (270, 160, 5, "#ffcc40"),
        (330, 90, 4, "#fff0a0"), (350, 170, 6, "#ff7020"), (290, 175, 4, "#ffd060"),
        (320, 155, 9, "#ff9800"), (255, 130, 5, "#ffc040"), (375, 145, 6, "#ff8020"),
    ]
    for sx, sy, r, col in sparks:
        d.ellipse([sx - r, sy - r, sx + r, sy + r], fill=col)
        # star streaks
        d.line([(sx - r - 4, sy), (sx + r + 4, sy)], fill=col, width=2)
        d.line([(sx, sy - r - 4), (sx, sy + r + 4)], fill=col, width=2)
    # debris blocks
    for bx, by, col in [(260, 210, "#c04040"), (350, 220, "#4a5860"), (320, 230, "#c4b088")]:
        d.rectangle([bx, by, bx + 14, by + 14], fill=col)
    # broken HUD
    d.rounded_rectangle([16, 12, 180, 56], 8, fill="#201010")
    d.text((28, 22), "BROKEN", fill="#e05050", font=font(22, True))
    d.line([(150, 22), (170, 48)], fill="#e05050", width=4)
    d.line([(170, 22), (150, 48)], fill="#e05050", width=4)
    d.rounded_rectangle([W - 210, 12, W - 16, 56], 8, fill="#201010")
    d.text((W - 198, 22), "FARM OFFLINE", fill="#e08060", font=font(16, True))
    save(img, "farm-break.png")


def code_java():
    """Warm amber code editor — plain pseudocode, JAVA label."""
    img = Image.new("RGB", (W, H))
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, W, H], fill="#2a2010")
    # title bar
    d.rectangle([0, 0, W, 36], fill="#3a2a14")
    d.ellipse([12, 10, 28, 26], fill="#c45848")
    d.ellipse([36, 10, 52, 26], fill="#c4a35a")
    d.ellipse([60, 10, 76, 26], fill="#6b8f6a")
    d.text((100, 8), "JAVA", fill="#e8c070", font=font(18, True))
    d.text((160, 10), "— sandbox-core.pseudo", fill="#a89060", font=font(14))
    # gutter
    d.rectangle([0, 36, 48, H], fill="#1e160c")
    lines = [
        ("1",  "module Sandbox {", "#e8c070"),
        ("2",  "  tick() {", "#d0b060"),
        ("3",  "    for each block in grid {", "#c8a850"),
        ("4",  "      update(wire, power)", "#b89840"),
        ("5",  "    }", "#c8a850"),
        ("6",  "    harvest(farm)", "#d0b060"),
        ("7",  "  }", "#d0b060"),
        ("8",  "  save(world) -> disk", "#e8c070"),
        ("9",  "}", "#e8c070"),
        ("10", "", "#a89060"),
        ("11", "// original desktop build", "#887848"),
        ("12", "boot(desktop_only)", "#c4a35a"),
    ]
    for i, (num, text, col) in enumerate(lines):
        y = 44 + i * 24
        d.text((10, y), num, fill="#6a5840", font=font(13))
        d.text((56, y), text, fill=col, font=font(15))
    # amber glow strip
    d.rectangle([W - 8, 36, W, H], fill="#c4a35a")
    save(img, "code-java.png")


def code_bedrock():
    """Cooler blue code editor — different look, BEDROCK label."""
    img = Image.new("RGB", (W, H))
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, W, H], fill="#0e1a28")
    # sidebar
    d.rectangle([0, 0, 56, H], fill="#0a1420")
    for i, icon_col in enumerate(["#4a8a98", "#3a7080", "#5aa0b0", "#2a5868"]):
        d.rounded_rectangle([10, 16 + i * 48, 46, 48 + i * 48], 6, fill=icon_col)
    # top bar
    d.rectangle([56, 0, W, 40], fill="#122438")
    d.text((72, 10), "BEDROCK", fill="#6ec8e0", font=font(18, True))
    d.text((180, 12), "mobile_core.pseudo", fill="#4a7890", font=font(13))
    # tabs
    d.rounded_rectangle([56, 44, 200, 72], 4, fill="#1a3048")
    d.text((70, 48), "runtime", fill="#8ab8c8", font=font(13, True))
    d.rounded_rectangle([208, 44, 340, 72], 4, fill="#0e1a28")
    d.text((220, 48), "devices", fill="#4a6880", font=font(13))
    lines = [
        "fn boot(targets) {",
        "  bind(console, phone, tablet)",
        "  loop frame {",
        "    sync(parity_queue)",
        "    render(low_power)",
        "  }",
        "}",
        "",
        "// cross-device runtime",
        "export world_format_v2",
    ]
    for i, text in enumerate(lines):
        y = 88 + i * 24
        d.text((72, y), f"{i + 1:02d}", fill="#3a5868", font=font(12))
        col = "#7ec8e0" if text.startswith("fn") or text.startswith("export") else "#a0c8d8"
        if text.startswith("//"):
            col = "#4a7088"
        d.text((110, y), text, fill=col, font=font(14))
    save(img, "code-bedrock.png")


def checklist():
    """MUST MATCH checklist with ticks on both columns."""
    img = Image.new("RGB", (W, H))
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, W, H], fill="#1a2220")
    d.text((W // 2 - 90, 18), "MUST MATCH", fill="#f0e6d0", font=font(28, True))
    d.line([(40, 58), (W - 40, 58)], fill="#3a4840", width=2)

    # column headers
    d.rounded_rectangle([40, 72, 300, 112], 8, fill="#3a2a14")
    d.text((110, 82), "SIDE A", fill="#e8c070", font=font(18, True))
    d.rounded_rectangle([340, 72, 600, 112], 8, fill="#122438")
    d.text((400, 82), "SIDE B", fill="#6ec8e0", font=font(18, True))

    items = [
        "block physics",
        "wire signals",
        "world saves",
        "player move",
        "craft rules",
    ]
    for i, label in enumerate(items):
        y = 128 + i * 42
        for col_x, accent in ((40, "#6bdc8a"), (340, "#6bdc8a")):
            d.rounded_rectangle([col_x, y, col_x + 260, y + 34], 6, fill="#242e2a")
            # green tick box
            d.rounded_rectangle([col_x + 8, y + 6, col_x + 30, y + 28], 4, fill="#1a3020", outline=accent, width=2)
            d.line([(col_x + 12, y + 16), (col_x + 18, y + 22), (col_x + 26, y + 10)], fill=accent, width=3)
            d.text((col_x + 40, y + 8), label, fill="#d0d8d0", font=font(14, True))
    d.text((160, 330), "PARITY CHECK  ·  ALL GREEN", fill="#6bdc8a", font=font(14, True))
    save(img, "checklist.png")


def worlds():
    """World-select list with generic names."""
    img = Image.new("RGB", (W, H))
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, W, H], fill="#152028")
    d.rectangle([0, 0, W, 48], fill="#1e3038")
    d.text((24, 12), "SELECT WORLD", fill="#e0ece8", font=font(22, True))

    worlds_list = [
        ("Sunny Hills", "survival · day 42", "#c4a878", True),
        ("Cave Lab", "creative · experiments", "#6a8a98", False),
        ("Sky Raft", "adventure · floating", "#7ab0c0", False),
        ("Clay Mesa", "survival · drylands", "#b89070", False),
        ("Teal Marsh", "survival · wetlands", "#5a9888", False),
    ]
    for i, (name, meta, accent, selected) in enumerate(worlds_list):
        y = 64 + i * 54
        bg = "#2a4050" if selected else "#1a2830"
        d.rounded_rectangle([20, y, W - 20, y + 48], 8, fill=bg)
        if selected:
            d.rounded_rectangle([20, y, W - 20, y + 48], 8, outline="#8ec8b0", width=2)
        # thumbnail voxel stub
        d.rectangle([32, y + 8, 72, y + 40], fill=accent)
        d.rectangle([32, y + 8, 72, y + 16], fill="#e8dcc8")
        d.text((88, y + 6), name, fill="#f0e6d0", font=font(16, True))
        d.text((88, y + 26), meta, fill="#809090", font=font(12))
        if selected:
            d.text((W - 100, y + 14), "► PLAY", fill="#8ec8b0", font=font(14, True))
    save(img, "worlds.png")


def box_art():
    """Generic game box front — abstract blocky towers, VOXEL WORLD title."""
    img = Image.new("RGB", (S, S))
    d = ImageDraw.Draw(img)
    # sky gradient bands
    for y in range(S):
        t = y / S
        r = int(80 + 40 * t)
        g = int(140 - 40 * t)
        b = int(160 - 30 * t)
        d.line([(0, y), (S, y)], fill=(r, g, b))
    # sun disc
    d.ellipse([360, 40, 460, 140], fill="#e8d080")
    # abstract blocky towers silhouette (teal/sand/clay)
    towers = [
        (40, 280, 70, 200, "#3a6860"),
        (100, 220, 80, 260, "#4a7870"),
        (170, 160, 90, 320, "#5a8880"),
        (250, 200, 70, 280, "#6a9080"),
        (310, 140, 100, 340, "#4a7068"),
        (400, 240, 60, 240, "#5a8078"),
        (450, 180, 80, 300, "#3a6058"),
    ]
    for x, top, w, hgt, col in towers:
        d.rectangle([x, top, x + w, S - 40], fill=col)
        # lighter top cap
        d.rectangle([x, top, x + w, top + 18], fill="#8ab8a8")
        # window dots
        for wy in range(top + 30, S - 60, 28):
            for wx in range(x + 12, x + w - 12, 20):
                d.rectangle([wx, wy, wx + 10, wy + 12], fill="#e8d090")
    # ground band
    d.rectangle([0, S - 40, S, S], fill="#a89060")
    # title plaque
    d.rounded_rectangle([48, 40, S - 48, 130], 12, fill="#1a2820")
    d.rounded_rectangle([56, 48, S - 56, 122], 10, outline="#c4a878", width=3)
    d.text((100, 58), "VOXEL WORLD", fill="#f0e6d0", font=font(36, True))
    d.text((160, 96), "sandbox adventure", fill="#8ab0a0", font=font(16))
    save(img, "box-art.png")


def code_towers():
    """Two glowing abstract code towers — green vs blue tint."""
    img = Image.new("RGB", (S, S))
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, S, S], fill="#0a1018")
    # floor glow
    d.ellipse([40, 420, 240, 500], fill="#1a3020")
    d.ellipse([280, 420, 480, 500], fill="#102030")

    def tower(base_x, tint_dark, tint_mid, tint_light, glow, label, label_col):
        # shaft
        d.rectangle([base_x, 80, base_x + 140, 440], fill=tint_dark)
        d.rectangle([base_x + 10, 90, base_x + 130, 430], fill=tint_mid)
        # code-line glow strips
        for i in range(18):
            y = 100 + i * 18
            wlen = 40 + (i * 17) % 70
            d.rectangle([base_x + 20, y, base_x + 20 + wlen, y + 6], fill=glow)
            if i % 3 == 0:
                d.rectangle([base_x + 20, y + 8, base_x + 50, y + 12], fill=tint_light)
        # crown
        d.polygon(
            [(base_x - 10, 80), (base_x + 70, 30), (base_x + 150, 80)],
            fill=glow,
        )
        d.rectangle([base_x + 50, 20, base_x + 90, 50], fill=tint_light)
        # pedestal
        d.rectangle([base_x - 20, 440, base_x + 160, 470], fill=tint_mid)
        d.text((base_x + 30, 475), label, fill=label_col, font=font(18, True))

    tower(60, "#142818", "#1e4030", "#3a6850", "#40e080", "CODE A", "#6bdc8a")
    tower(300, "#101828", "#1a3048", "#3a6080", "#40a0e0", "CODE B", "#6ec8e0")

    # connecting arcs of light
    d.arc([180, 60, 340, 200], 200, 340, fill="#80c0e0", width=3)
    d.text((170, 20), "TWO GAMES IN THE CODE", fill="#c8d0d8", font=font(16, True))
    save(img, "code-towers.png")


def main():
    farm_ok()
    farm_break()
    code_java()
    code_bedrock()
    checklist()
    worlds()
    box_art()
    code_towers()


if __name__ == "__main__":
    main()
