#!/usr/bin/env python3
"""Lossless WOFF2 packaging; requires fonttools and Brotli, no glyph subsetting."""
from pathlib import Path
from fontTools.ttLib import TTFont
for name in ('amiri', 'sans'):
    source=Path('assets/fonts') / (name + '.ttf')
    font=TTFont(source)
    font.flavor='woff2'
    destination=source.with_suffix('.woff2')
    font.save(destination)
    print(f'{source}: {source.stat().st_size} -> {destination.stat().st_size} bytes')
