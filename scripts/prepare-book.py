#!/usr/bin/env python3
"""Prepare screen and detailed reader images without changing the source PDF."""
import argparse
import hashlib
import io
from pathlib import Path
import subprocess
import tempfile
from PIL import Image

parser = argparse.ArgumentParser()
parser.add_argument('pdf', type=Path)
parser.add_argument('--out', type=Path, required=True, help='Detailed image folder')
parser.add_argument('--height', type=int, default=2400)
parser.add_argument('--screen-out', type=Path)
args = parser.parse_args()
original_hash = hashlib.sha256(args.pdf.read_bytes()).hexdigest()
screen_out = args.screen_out or args.out.parent / 'screen'
args.out.mkdir(parents=True, exist_ok=True)
screen_out.mkdir(parents=True, exist_ok=True)
def write_image(image, destination, quality):
    buffer = io.BytesIO()
    image.save(buffer, format='WEBP', quality=quality, method=6)
    data = buffer.getvalue()
    assert len(data) > 1000, 'Empty encoded image'
    with Image.open(io.BytesIO(data)) as check:
        check.verify()
    temporary = destination.with_suffix('.webp.tmp')
    temporary.write_bytes(data)
    temporary.replace(destination)
with tempfile.TemporaryDirectory(prefix='wird-pages-') as directory:
    prefix = Path(directory) / 'page'
    subprocess.run(['pdftoppm', '-scale-to', str(args.height), '-png', str(args.pdf), str(prefix)], check=True)
    pages = sorted(Path(directory).glob('page-*.png'))
    for source in pages:
        number = int(source.stem.split('-')[-1])
        with Image.open(source) as image:
            write_image(image, args.out / f'{number:02}.webp', 92)
            screen = image.copy()
            screen.thumbnail((1400, 1400), Image.Resampling.LANCZOS)
            write_image(screen, screen_out / f'{number:02}.webp', 88)
    print(f'Prepared {len(pages)} detailed and lightweight pages')
assert hashlib.sha256(args.pdf.read_bytes()).hexdigest() == original_hash, 'Original PDF unexpectedly changed'
print(f'Original PDF unchanged: {original_hash}')
