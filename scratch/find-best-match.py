import os
import glob
from PIL import Image

brain_dir = '/Users/lateshk/.gemini/antigravity-ide/brain/d666d69b-7a96-4219-8446-64a423f5b933'
downloads_dir = '/Users/lateshk/Downloads'

target_name = 'IMG20251218212613.jpg'

def get_image_signature(filepath):
    try:
        with Image.open(filepath) as img:
            width, height = img.size
            img_small = img.convert('L').resize((8, 8))
            pixels = list(img_small.getdata())
            avg = sum(pixels) / len(pixels)
            return (width, height, avg, pixels)
    except Exception as e:
        return None

sig = get_image_signature(os.path.join(downloads_dir, target_name))
if not sig:
    print("Target image not found.")
    exit(1)

dw, dh, davg, dpix = sig
dar = dw / dh

matches = []
for f in glob.glob(os.path.join(brain_dir, 'media__*')):
    bsig = get_image_signature(f)
    if bsig:
        bw, bh, bavg, bpix = bsig
        bar = bw / bh
        ar_diff = abs(dar - bar)
        pix_diff = sum(abs(p1 - p2) for p1, p2 in zip(dpix, bpix)) / 64.0
        matches.append((os.path.basename(f), ar_diff, pix_diff))

matches.sort(key=lambda x: x[2])
print(f"Top 10 matches for {target_name} (aspect ratio dar={dar:.4f}):")
for name, ar_diff, pix_diff in matches[:10]:
    print(f"  {name} | ar_diff: {ar_diff:.4f} | pix_diff: {pix_diff:.4f}")
