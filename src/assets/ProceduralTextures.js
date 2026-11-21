import { TILE_SIZE } from '../core/GameConfig.js';
import { Logger } from '../utils/logger.js';

function createPixelCanvas(width, height, drawFn) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  drawFn(ctx, width, height);
  return canvas;
}

export function generateProceduralTextures(scene) {
  try {
    const t = TILE_SIZE;

    // 1. Dark stone floor tile
    const floorCanvas = createPixelCanvas(t, t, (ctx) => {
      ctx.fillStyle = '#23202a';
      ctx.fillRect(0, 0, t, t);
      ctx.fillStyle = '#2b2733';
      ctx.fillRect(2, 2, 12, 12);
      ctx.fillRect(18, 16, 11, 11);
      ctx.strokeStyle = '#19161f';
      ctx.strokeRect(0.5, 0.5, t - 1, t - 1);
    });

    // 2. Wall tile
    const wallCanvas = createPixelCanvas(t, t, (ctx) => {
      ctx.fillStyle = '#121017';
      ctx.fillRect(0, 0, t, t);
      ctx.fillStyle = '#3a3446';
      ctx.fillRect(2, 2, t - 4, t - 6);
      ctx.fillStyle = '#4c455c';
      ctx.fillRect(4, 4, t - 8, 6);
    });

    // 3. Portal tile
    const portalCanvas = createPixelCanvas(t, t, (ctx) => {
      ctx.fillStyle = '#23202a';
      ctx.fillRect(0, 0, t, t);
      ctx.fillStyle = '#4c2a85';
      ctx.fillRect(5, 5, t - 10, t - 10);
      ctx.fillStyle = '#9d6bff';
      ctx.fillRect(10, 10, t - 20, t - 20);
    });

    // 4. Placeholder warrior (24x28)
    const playerCanvas = createPixelCanvas(24, 28, (ctx) => {
      // Cloak
      ctx.fillStyle = '#5c1d24';
      ctx.fillRect(5, 10, 14, 14);
      // Armor chest
      ctx.fillStyle = '#8f96a3';
      ctx.fillRect(7, 10, 10, 9);
      // Helmet + hollow crown crest
      ctx.fillStyle = '#b5bcc9';
      ctx.fillRect(7, 3, 10, 7);
      ctx.fillStyle = '#d9a441';
      ctx.fillRect(7, 1, 3, 3);
      ctx.fillRect(11, 0, 2, 4);
      ctx.fillRect(14, 1, 3, 3);
      // Boots
      ctx.fillStyle = '#2c2630';
      ctx.fillRect(7, 23, 4, 4);
      ctx.fillRect(13, 23, 4, 4);
    });

    // 5. Hollow Thrall (22x24)
    const thrallCanvas = createPixelCanvas(22, 24, (ctx) => {
      ctx.fillStyle = '#4b4754';
      ctx.fillRect(5, 8, 12, 12);
      ctx.fillStyle = '#756f82';
      ctx.fillRect(6, 2, 10, 7);
      ctx.fillStyle = '#e0533c';
      ctx.fillRect(8, 5, 2, 2);
      ctx.fillRect(12, 5, 2, 2);
      ctx.fillStyle = '#26232c';
      ctx.fillRect(6, 20, 4, 4);
      ctx.fillRect(12, 20, 4, 4);
    });

    // 6. Dread Knight (26x28)
    const knightCanvas = createPixelCanvas(26, 28, (ctx) => {
      ctx.fillStyle = '#2a2d38';
      ctx.fillRect(5, 9, 16, 14);
      ctx.fillStyle = '#4c5366';
      ctx.fillRect(7, 2, 12, 8);
      ctx.fillStyle = '#ff9e2c';
      ctx.fillRect(9, 5, 8, 2);
      ctx.fillStyle = '#1b1d24';
      ctx.fillRect(7, 23, 5, 4);
      ctx.fillRect(14, 23, 5, 4);
    });

    // 7. Wayfarer Shrine (inactive & active)
    const shrineInactive = createPixelCanvas(28, 32, (ctx) => {
      ctx.fillStyle = '#3b3647';
      ctx.fillRect(8, 8, 12, 22);
      ctx.fillStyle = '#575069';
      ctx.fillRect(5, 26, 18, 4);
    });

    const shrineActive = createPixelCanvas(28, 32, (ctx) => {
      ctx.fillStyle = '#4a435c';
      ctx.fillRect(8, 8, 12, 22);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(10, 3, 8, 6);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(12, 5, 4, 3);
      ctx.fillStyle = '#575069';
      ctx.fillRect(5, 26, 18, 4);
    });

    // 8. Slash arc texture
    const slashCanvas = createPixelCanvas(36, 36, (ctx) => {
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(10, 18, 18, -0.8, 0.8);
      ctx.stroke();
    });

    const entries = [
      ['tile_floor', floorCanvas],
      ['tile_wall', wallCanvas],
      ['tile_portal', portalCanvas],
      ['player_idle', playerCanvas],
      ['enemy_thrall', thrallCanvas],
      ['enemy_knight', knightCanvas],
      ['shrine_inactive', shrineInactive],
      ['shrine_active', shrineActive],
      ['slash_effect', slashCanvas]
    ];

    for (const [key, canvas] of entries) {
      if (!scene.textures.exists(key)) {
        scene.textures.addCanvas(key, canvas);
      }
    }

    Logger.info('ProceduralTextures', `Generated ${entries.length} placeholder textures`);
  } catch (err) {
    Logger.error('ProceduralTextures', 'Failed to generate textures', err);
  }
}