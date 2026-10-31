#!/usr/bin/env python3
"""Render original PDF pages for the lightweight reader, preserving the PDF bytes."""
import argparse
import hashlib
from pathlib import Path
import subprocess
import tempfile
from PIL import Image

parser = argparse.ArgumentParser()
parser.add_argument('pdf', type=Path)
parser.add_argument('--out', type=Path, required=True)
parser.add_argument('--height', type=int, default=2400)
args = parser.parse_args()
original_hash = hashlib.sha256(args.pdf.read_bytes()).hexdigest()
args.out.mkdir(parents=True, exist_ok=True)
with tempfile.TemporaryDirectory(prefix='wird-pages-') as directory:
    prefix = Path(directory) / 'page'
    subprocess.run(['pdftoppm', '-scale-to', str(args.height), '-png', str(args.pdf), str(prefix)], check=True)
    pages = sorted(Path(directory).glob('page-*.png'))
    for source in pages:
        number = int(source.stem.split('-')[-1])
        with Image.open(source) as image:
            image.save(args.out / f'{number:02}.webp', quality=92, method=6)
    print(f'Prepared {len(pages)} pages in {args.out}')
assert hashlib.sha256(args.pdf.read_bytes()).hexdigest() == original_hash, 'Original PDF unexpectedly changed'
print(f'Original PDF unchanged: {original_hash}')
