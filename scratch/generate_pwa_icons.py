from PIL import Image

def make_pwa_icon(src_path, dest_path, size, bg_color=(11, 11, 11)):
    # bg_color is (11, 11, 11) which corresponds to #0B0B0B
    src_img = Image.open(src_path)
    
    # Create black background
    bg_img = Image.new("RGBA", src_img.size, bg_color + (255,))
    
    # Paste logo on background
    combined = Image.alpha_composite(bg_img, src_img.convert("RGBA"))
    
    # Resize to target size
    resized = combined.resize((size, size), Image.Resampling.LANCZOS)
    
    # Save as PNG
    resized.convert("RGB").save(dest_path, "PNG")
    print(f"Generated {dest_path} with size {size}x{size}")

try:
    logo_path = "public/logo.png"
    make_pwa_icon(logo_path, "public/pwa-192.png", 192)
    make_pwa_icon(logo_path, "public/pwa-512.png", 512)
    make_pwa_icon(logo_path, "public/maskable-512.png", 512)
    make_pwa_icon(logo_path, "public/apple-touch-icon.png", 180)
    
    # Let's also create favicon.ico as a transparent icon (or black background if they prefer, but transparent favicon is best for tab dark/light modes)
    # Wait, the user said "Add same logo.png as favicon", since we already did that, we don't need to change favicon.ico if it works. But let's verify if we should resize it to 32x32.
    fav = Image.open(logo_path)
    fav.resize((32, 32), Image.Resampling.LANCZOS).save("public/favicon.ico", "ICO")
    print("Generated public/favicon.ico")

except Exception as e:
    print("Error:", e)
