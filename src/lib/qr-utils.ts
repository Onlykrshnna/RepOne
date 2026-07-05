export async function downloadQRAsPNG(svgElementId: string, filename: string) {
  const svg = document.getElementById(svgElementId);
  if (!svg) return;

  const svgData = new XMLSerializer().serializeToString(svg);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const img = new Image();

  img.onload = () => {
    // Make canvas slightly larger for padding
    const padding = 20;
    canvas.width = img.width + padding * 2;
    canvas.height = img.height + padding * 2;

    if (ctx) {
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, padding, padding);

      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `${filename}.png`;
      downloadLink.href = `${pngFile}`;
      downloadLink.click();
    }
  };

  img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
}
