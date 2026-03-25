"""
Build script for Sonar pitch deck.
Assembles component files into public/index.html.
Usage: python build.py
"""
import os

BASE = os.path.dirname(os.path.abspath(__file__))
PUBLIC = os.path.join(BASE, 'public')

# Component files in assembly order
COMPONENTS = [
    'src/head.html',
    'src/slides/s1-title.html',
    'src/slides/s2-problem.html',
    'src/slides/s3-how-it-works--demo.html',
    'src/slides/s4-business-model-and-go-to-market.html',
    'src/slides/s5-market-opportunity-donut-gram.html',
    'src/slides/s6-competition.html',
    'src/slides/s7-founders.html',
    'src/slides/s8-traction-and-tech.html',
    'src/slides/s9-the-ask.html',
    'src/slides/s10-sonar-live-origin-cinematic.html',
    'src/nav.html',
    'src/js/engine.js',
    'src/js/donut.js',
    'src/js/init.js',
    'src/footer.html',
]

def build():
    parts = []
    for comp in COMPONENTS:
        path = os.path.join(BASE, comp)
        with open(path, 'r', encoding='utf-8') as f:
            parts.append(f.read())
    
    output = ''.join(parts)
    out_path = os.path.join(PUBLIC, 'index.html')
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write(output)
    
    lines = output.count('\n') + 1
    print(f"Built index.html: {len(output):,} bytes, {lines:,} lines")
    print(f"Assembled from {len(COMPONENTS)} components")

if __name__ == '__main__':
    build()
