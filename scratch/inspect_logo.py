from PIL import Image

try:
    img = Image.open("public/logo.png")
    print("Format:", img.format)
    print("Size:", img.size)
    print("Mode:", img.mode)
    if "A" in img.mode:
        print("Has alpha channel!")
        # Check if alpha is used (are there transparent pixels?)
        extrema = img.getextrema()
        print("Alpha channel range:", extrema[3] if len(extrema) > 3 else "None")
    else:
        print("No alpha channel (solid background)")
except Exception as e:
    print("Error:", e)
