import os
import glob
import struct

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

# Simple native JPEG width/height parser
def get_jpeg_size(filepath):
    try:
        with open(filepath, 'rb') as f:
            # Check JPEG SOI marker
            if f.read(2) != b'\xff\xd8':
                return None
            while True:
                marker, length = struct.unpack(">2sH", f.read(4))
                if marker in (b'\xff\xc0', b'\xff\xc2'): # SOF0 or SOF2
                    # Read dimensions
                    # precision (1 byte), height (2 bytes), width (2 bytes)
                    f.read(1)
                    height, width = struct.unpack(">HH", f.read(4))
                    return width, height
                else:
                    f.seek(length - 2, 1)
    except Exception:
        return None

# Get all media__ files in brain directory
brain_files = []
for f in glob.glob(os.path.join(brain_dir, 'media__*')):
    size = get_jpeg_size(f)
    bytes_size = os.path.getsize(f)
    brain_files.append({
        'name': os.path.basename(f),
        'size': size,
        'bytes': bytes_size
    })

print("=== native details ===")
for name in target_names:
    p = os.path.join(downloads_dir, name)
    size = get_jpeg_size(p)
    bytes_size = os.path.getsize(p) if os.path.exists(p) else 0
    print(f"Name: {name} | size: {size} | bytes: {bytes_size}")

print("\n=== brain files details ===")
for bf in brain_files:
    print(f"Name: {bf['name']} | size: {bf['size']} | bytes: {bf['bytes']}")
