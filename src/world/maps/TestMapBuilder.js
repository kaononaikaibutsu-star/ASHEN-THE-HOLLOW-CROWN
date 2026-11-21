import { TILE_SIZE } from '../../core/GameConfig.js';
import { generateRegionGrid } from '../TileMapGenerator.js';

export function buildRegionMap(scene, regionConfig) {
  const { widthTiles, heightTiles, exitPortal, ambientTint } = regionConfig;
  const grid = generateRegionGrid(widthTiles, heightTiles, exitPortal);

  const wallGroup = scene.physics.add.staticGroup();
  const portalZone = scene.physics.add.staticGroup();

  for (let y = 0; y < heightTiles; y++) {
    for (let x = 0; x < widthTiles; x++) {
      const worldX = x * TILE_SIZE + TILE_SIZE / 2;
      const worldY = y * TILE_SIZE + TILE_SIZE / 2;

      const floor = scene.add.image(worldX, worldY, 'tile_floor');
      floor.setTint(ambientTint ? 0xffffff : 0xffffff);

      const tile = grid[y][x];
      if (tile === 1) {
        const wall = wallGroup.create(worldX, worldY, 'tile_wall');
        wall.refreshBody();
      } else if (tile === 2) {
        const portal = portalZone.create(worldX, worldY, 'tile_portal');
        portal.refreshBody();
      }
    }
  }

  return {
    grid,
    wallGroup,
    portalZone,
    widthPx: widthTiles * TILE_SIZE,
    heightPx: heightTiles * TILE_SIZE
  };
}