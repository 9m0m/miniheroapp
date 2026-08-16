import { AssetManager } from '../AssetManager';

export class BackgroundRenderer {
  public static render(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    worldIndex: number,
    stageIndex: number,
    floorOffset: number,
    currentTime: number,
    assets: AssetManager
  ) {
    // 1. Determine progressive background key
    let bgStageKey = 's1';
    if (stageIndex >= 10) bgStageKey = 's10';
    else if (stageIndex >= 8) bgStageKey = 's8';
    else if (stageIndex >= 5) bgStageKey = 's5';
    else if (stageIndex >= 3) bgStageKey = 's3';

    const customBgImg = assets.getBackgroundImage(`w${worldIndex}_${bgStageKey}`);

    if (customBgImg) {
      // Draw Custom Pixel Art Background
      ctx.drawImage(customBgImg, 0, 0, width, height);
    } else {
      // Fallback: Dynamic Ambient Gradient & Particles
      const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
      if (worldIndex === 2) {
        bgGradient.addColorStop(0, '#0f172a');
        bgGradient.addColorStop(0.7, '#1e293b');
        bgGradient.addColorStop(1, '#0c4a6e');
      } else if (worldIndex === 3) {
        bgGradient.addColorStop(0, '#1c1917');
        bgGradient.addColorStop(0.7, '#450a0a');
        bgGradient.addColorStop(1, '#7f1d1d');
      } else if (worldIndex === 4) {
        bgGradient.addColorStop(0, '#09090b');
        bgGradient.addColorStop(0.7, '#2e1065');
        bgGradient.addColorStop(1, '#3b0764');
      } else {
        bgGradient.addColorStop(0, '#052e16');
        bgGradient.addColorStop(0.7, '#064e3b');
        bgGradient.addColorStop(1, '#022c22');
      }
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);

      // Distant ambient pixel particles
      ctx.fillStyle = worldIndex === 3 ? '#f97316' : (worldIndex === 2 ? '#38bdf8' : '#34d399');
      for (let i = 0; i < 6; i++) {
        const particleX = (currentTime / (30 + i * 5) + i * 60) % width;
        const particleY = (i * 22 + (currentTime / 50)) % (height - 40);
        ctx.fillRect(particleX, particleY, 2, 2);
      }

      // Parallax Floor Pattern
      ctx.fillStyle = '#06130B';
      ctx.fillRect(0, height - 24, width, 24);

      ctx.strokeStyle = '#0F2E1B';
      ctx.lineWidth = 1.5;
      for (let x = -24 + floorOffset; x < width + 24; x += 24) {
        ctx.beginPath();
        ctx.moveTo(x, height - 24);
        ctx.lineTo(x - 12, height);
        ctx.stroke();
      }
    }
  }
}
