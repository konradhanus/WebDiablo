#!/usr/bin/env python3
"""Generate WebDiablo PWA icons (192, 512, maskable 512) + mask-icon.svg."""
import os, math
from PIL import Image, ImageDraw, ImageFilter

OUT = os.path.join(os.path.dirname(__file__), 'icons')
os.makedirs(OUT, exist_ok=True)

BG_TOP = (34, 24, 48)      # deep purple-black
BG_BOT = (12, 16, 24)      # near-black blue
GOLD   = (255, 207, 107)
STEEL  = (200, 212, 230)
BLOOD  = (180, 40, 40)

def radial_bg(size):
    img = Image.new('RGBA', (size, size))
    d = ImageDraw.Draw(img)
    # vertical gradient
    for y in range(size):
        t = y / size
        r = int(BG_TOP[0]*(1-t) + BG_BOT[0]*t)
        g = int(BG_TOP[1]*(1-t) + BG_BOT[1]*t)
        b = int(BG_TOP[2]*(1-t) + BG_BOT[2]*t)
        d.line([(0, y), (size, y)], fill=(r, g, b, 255))
    # soft radial glow center-bottom
    glow = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    cx, cy = size*0.5, size*0.62
    maxr = size*0.55
    steps = 60
    for i in range(steps, 0, -1):
        t = i/steps
        r = maxr * t
        a = int(70 * (1-t))
        gd.ellipse([cx-r, cy-r, cx+r, cy+r], fill=(90, 60, 120, a))
    glow = glow.filter(ImageFilter.GaussianBlur(size*0.06))
    img = Image.alpha_composite(img, glow)
    return img

def draw_sword(size, img):
    d = ImageDraw.Draw(img)
    cx = size*0.5
    # blade (vertical), pointing up
    blade_w = size*0.085
    top = size*0.16
    guard_y = size*0.66
    tip = top
    # blade body as a tapered polygon
    bw = blade_w
    d.polygon([
        (cx, tip),
        (cx+bw*0.6, top+size*0.12),
        (cx+bw*0.5, guard_y),
        (cx-bw*0.5, guard_y),
        (cx-bw*0.6, top+size*0.12),
    ], fill=STEEL)
    # blade edge highlight
    d.line([(cx, tip+2), (cx+bw*0.45, guard_y)], fill=(240, 248, 255), width=max(1, int(size*0.006)))
    # guard
    gw = size*0.26
    d.rounded_rectangle([cx-gw, guard_y, cx+gw, guard_y+size*0.045], radius=size*0.02, fill=GOLD)
    # grip
    d.rectangle([cx-size*0.035, guard_y+size*0.045, cx+size*0.035, guard_y+size*0.20], fill=(80, 50, 26))
    # pommel
    pr = size*0.05
    d.ellipse([cx-pr, guard_y+size*0.20, cx+pr, guard_y+size*0.20+2*pr], fill=GOLD)
    # blood gem on guard center
    d.ellipse([cx-size*0.03, guard_y+size*0.005, cx+size*0.03, guard_y+size*0.005+2*size*0.03], fill=BLOOD)
    return img

def make(size, maskable=False):
    img = radial_bg(size)
    if maskable:
        # safe zone: keep art within central 80% (maskable requires ~40% margin safe)
        # scale sword down a touch so it survives the mask
        inner = int(size*0.82)
        sub = Image.new('RGBA', (inner, inner), (0, 0, 0, 0))
        draw_sword(inner, sub)
        img.paste(sub, (int((size-inner)/2), int((size-inner)/2)), sub)
    else:
        draw_sword(size, img)
    # vignette
    vig = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    vd = ImageDraw.Draw(vig)
    for i in range(40, 0, -1):
        t = i/40
        a = int(120*(1-t))
        vd.ellipse([size*t*0.5, size*t*0.5, size*(1-t*0.5), size*(1-t*0.5)], outline=(0, 0, 0, a), width=int(size*0.02))
    img = Image.alpha_composite(img, vig)
    return img

for s in (192, 512):
    make(s).save(os.path.join(OUT, f'icon-{s}.png'))
    print('wrote icon-%d.png' % s)

make(512, maskable=True).save(os.path.join(OUT, 'icon-maskable-512.png'))
print('wrote icon-maskable-512.png')

# favicon (reuse 192)
make(64).save(os.path.join(OUT, 'favicon-64.png'))
print('wrote favicon-64.png')

# mask-icon.svg (monochrome, full bleed for maskable)
svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#0c1018"/>
  <g fill="#ffffff">
    <polygon points="256,90 286,150 280,346 232,346 226,150"/>
    <rect x="196" y="346" width="120" height="22" rx="6"/>
    <rect x="238" y="368" width="36" height="64" fill="#cfd6e2"/>
    <circle cx="256" cy="446" r="22"/>
    <circle cx="256" cy="357" r="14" fill="#c0392b"/>
  </g>
</svg>'''
with open(os.path.join(OUT, 'mask-icon.svg'), 'w') as f:
    f.write(svg)
print('wrote mask-icon.svg')
