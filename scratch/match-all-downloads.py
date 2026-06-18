import os
import glob
from PIL import Image

brain_dir = '/Users/lateshk/.gemini/antigravity-ide/brain/d666d69b-7a96-4219-8446-64a423f5b933'
downloads_dir = '/Users/lateshk/Downloads'

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

brain_signatures = []
for f in glob.glob(os.path.join(brain_dir, 'media__*')):
    sig = get_image_signature(f)
    if sig:
        brain_signatures.append((os.path.basename(f), sig))

print("=== All Matches between Downloads and Brain ===")
for dp in glob.glob(os.path.join(downloads_dir, 'IMG*')):
    dname = os.path.basename(dp)
    sig = get_image_signature(dp)
    if not sig:
        continue
    dw, dh, davg, dpix = sig
    dar = dw / dh
    
    for bname, bsig in brain_signatures:
        bw, bh, bavg, bpix = bsig
        bar = bw / bh
        
        if abs(dar - bar) > 0.05:
            continue
            
        pix_diff = sum(abs(p1 - p2) for p1, p2 in zip(dpix, bpix)) / 64.0
        if pix_diff < 5.0:
            print(f"Downloads: {dname}  ==>  Brain: {bname} (diff: {pix_diff:.2f}, size: {dw}x{dh})")
