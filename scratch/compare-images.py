import os
import glob
from PIL import Image

brain_dir = '/Users/lateshk/.gemini/antigravity-ide/brain/d666d69b-7a96-4219-8446-64a423f5b933'
downloads_dir = '/Users/lateshk/Downloads'

target_names = [
    'IMG20251218212613.jpg',
    'IMG20251218112731.jpg',
    'IMG-20251216-WA0031.jpeg',
    'IMG20251028232722.jpg',
    'IMG20251028162817.jpg',
    'IMG20251227104004.jpg',
    'IMG20251127190629.jpg'
]

# Function to get a unique visual signature (size + aspect ratio + downscaled pixel average)
def get_image_signature(filepath):
    try:
        with Image.open(filepath) as img:
            width, height = img.size
            # Convert to RGB and resize to 8x8 to compute a simple signature
            img_small = img.convert('L').resize((8, 8))
            pixels = list(img_small.getdata())
            # Normalize pixels
            avg = sum(pixels) / len(pixels)
            return (width, height, avg, pixels)
    except Exception as e:
        print(f"Error reading {filepath}: {e}")
        return None

print("=== Visual Signatures matching ===")
brain_signatures = []
for f in glob.glob(os.path.join(brain_dir, 'media__*')):
    sig = get_image_signature(f)
    if sig:
        brain_signatures.append((os.path.basename(f), sig))

for name in target_names:
    download_path = os.path.join(downloads_dir, name)
    sig = get_image_signature(download_path)
    if not sig:
        print(f"{name} signature could not be computed.")
        continue
    
    dw, dh, davg, dpix = sig
    
    # Find closest match in brain_signatures
    best_match = None
    min_diff = float('inf')
    
    for bname, bsig in brain_signatures:
        bw, bh, bavg, bpix = bsig
        
        # We check aspect ratio similarity first
        dar = dw / dh
        bar = bw / bh
        ar_diff = abs(dar - bar)
        
        if ar_diff > 0.05:
            continue # not the same aspect ratio
            
        # Compute pixel difference
        pix_diff = sum(abs(p1 - p2) for p1, p2 in zip(dpix, bpix)) / 64.0
        
        if pix_diff < min_diff:
            min_diff = pix_diff
            best_match = bname
            
    if best_match and min_diff < 15.0: # threshold for match
        print(f"Original: {name}  ==>  Brain: {best_match} (diff: {min_diff:.2f})")
    else:
        print(f"Original: {name}  ==>  No reliable match found (best diff: {min_diff:.2f})")
