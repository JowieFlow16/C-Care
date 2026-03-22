from PIL import Image
import os

src = os.path.join('static', 'logo.png')
out = os.path.join('static', 'icons')
os.makedirs(out, exist_ok=True)

img = Image.open(src).convert('RGBA')

for size in [192, 512]:
    resized = img.resize((size, size), Image.LANCZOS)
    # Put on a solid background matching app theme
    bg = Image.new('RGBA', (size, size), (15, 76, 129, 255))
    # Center the logo with padding
    pad = int(size * 0.15)
    logo_size = size - pad * 2
    logo = resized.resize((logo_size, logo_size), Image.LANCZOS)
    bg.paste(logo, (pad, pad), logo)
    bg.convert('RGB').save(os.path.join(out, f'icon-{size}.png'))
    print(f'Generated icon-{size}.png')

print('Icons ready.')
