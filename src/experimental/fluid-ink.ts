/** Low-resolution alpha field keeps the ink continuous without a full-size pixel pass. */
export class FluidInk {
  private mask: HTMLCanvasElement | null = null;
  private brush: HTMLCanvasElement | null = null;
  paint(
    context: CanvasRenderingContext2D,
    points: readonly { x: number; y: number }[],
    height: number,
    color: string,
  ) {
    this.mask ??= document.createElement("canvas");
    if (!this.brush) {
      this.brush = document.createElement("canvas");
      this.brush.width = this.brush.height = 64;
      const brush = this.brush.getContext("2d");
      if (!brush) return;
      const gradient = brush.createRadialGradient(32, 32, 0, 32, 32, 32);
      gradient.addColorStop(0, "rgba(255,255,255,1)");
      gradient.addColorStop(1, "rgba(255,255,255,0)");
      brush.fillStyle = gradient;
      brush.fillRect(0, 0, 64, 64);
    }
    const scale = Math.min(0.4, 400 / height),
      width = Math.max(1, Math.ceil(800 * scale)),
      h = Math.max(1, Math.ceil(height * scale));
    if (this.mask.width !== width || this.mask.height !== h) {
      this.mask.width = width;
      this.mask.height = h;
    }
    const mask = this.mask.getContext("2d", { willReadFrequently: true });
    if (!mask) return;
    mask.clearRect(0, 0, width, h);
    const radius = 28 * scale;
    for (const point of points)
      mask.drawImage(
        this.brush,
        point.x * scale - radius,
        point.y * scale - radius,
        radius * 2,
        radius * 2,
      );
    mask.globalCompositeOperation = "source-in";
    mask.fillStyle = color;
    mask.fillRect(0, 0, width, h);
    mask.globalCompositeOperation = "source-over";
    const pixels = mask.getImageData(0, 0, width, h);
    for (let i = 3; i < pixels.data.length; i += 4)
      pixels.data[i] = Math.max(0, Math.min(255, (pixels.data[i] - 62) * 9));
    mask.putImageData(pixels, 0, 0);
    context.drawImage(this.mask, 0, 0, 800, height);
  }
}
