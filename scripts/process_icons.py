from PIL import Image
import numpy as np
import os

ICON_DIR = "C:\\Users\\박승래\\Desktop\\coding\\GameSpeak\\icon"
OUT_DIR  = "C:\\Users\\박승래\\Desktop\\coding\\GameSpeak\\public\\games"
SIZE = 512   # 고화질 출력

SOURCES = {
    "pubg":      os.path.join(ICON_DIR, "배틀그라운드.png"),
    "lol":       os.path.join(ICON_DIR, "리그오브레전드.jpg"),
    "valorant":  os.path.join(ICON_DIR, "발로란트.png"),
    "overwatch": os.path.join(ICON_DIR, "오버워치.png"),
    "tft":       os.path.join(ICON_DIR, "롤토체스.jpg"),
}

def remove_white(img, threshold=220):
    img = img.convert("RGBA")
    arr = np.array(img, dtype=np.uint8)
    r = arr[:,:,0].astype(int)
    g = arr[:,:,1].astype(int)
    b = arr[:,:,2].astype(int)
    is_white = (r > threshold) & (g > threshold) & (b > threshold)
    arr[:,:,3] = np.where(is_white, 0, arr[:,:,3])
    return Image.fromarray(arr)

def center_crop_square(img):
    w, h = img.size
    m = min(w, h)
    l, t = (w - m) // 2, (h - m) // 2
    return img.crop((l, t, l + m, t + m))

def make_icon_fill(game, bg_rgb):
    """정사각 소스 → SIZE x SIZE 꽉 채워서 리사이즈"""
    src = Image.open(SOURCES[game]).convert("RGBA")
    src = center_crop_square(src)
    canvas = Image.new("RGBA", (SIZE, SIZE), bg_rgb + (255,))
    src = src.resize((SIZE, SIZE), Image.LANCZOS)
    canvas.paste(src, (0, 0), src)
    canvas.save(os.path.join(OUT_DIR, f"{game}.png"), "PNG")
    print(f"OK: {game}.png")

def make_icon_fit(game, bg_rgb, remove_bg=False, padding=40):
    """비정사각 소스 → 비율 유지, 패딩 포함 letterbox"""
    src = Image.open(SOURCES[game]).convert("RGBA")
    if remove_bg:
        src = remove_white(src)
        bbox = src.getbbox()
        if bbox:
            src = src.crop(bbox)

    canvas = Image.new("RGBA", (SIZE, SIZE), bg_rgb + (255,))
    inner = SIZE - padding * 2
    # LANCZOS로 비율 유지 업스케일
    w, h = src.size
    scale = min(inner / w, inner / h)
    new_w, new_h = int(w * scale), int(h * scale)
    src = src.resize((new_w, new_h), Image.LANCZOS)
    x = (SIZE - new_w) // 2
    y = (SIZE - new_h) // 2
    canvas.paste(src, (x, y), src)
    canvas.save(os.path.join(OUT_DIR, f"{game}.png"), "PNG")
    print(f"OK: {game}.png")

# PUBG: 정사각(225x225), 노란 브랜드 배경으로 꽉 채움
make_icon_fill("pubg", bg_rgb=(245, 166, 35))

# LOL: 정사각(224x224), 다크 네이비 배경으로 꽉 채움
make_icon_fill("lol", bg_rgb=(10, 20, 40))

# Valorant: 가로형 흰 배경 제거 → 다크 배경 + 패딩 여유
make_icon_fit("valorant", bg_rgb=(15, 25, 35), remove_bg=True, padding=48)

# Overwatch: 정사각 고해상도(1280x1280), 다크 배경에 letterbox
make_icon_fit("overwatch", bg_rgb=(30, 30, 35), remove_bg=True, padding=32)

# TFT: 가로형 → 다크 퍼플 배경에 letterbox (텍스트+캐릭터 모두 보이게)
make_icon_fit("tft", bg_rgb=(27, 26, 50), remove_bg=False, padding=24)

print("\nDone!")
