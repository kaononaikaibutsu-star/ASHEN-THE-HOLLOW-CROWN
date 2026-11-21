// src/world/maps/WorldMapBuilder.js
import { createSeededRng } from './ProceduralMapGenerator.js';

// Layer tile codes:
// terrain: 0 = ash/earth, 1 = worn path, 2 = river/water, 3 = ruin floor
// collision: 0 = walkable, 1 = wall/cliff/ruin barrier, 2 = locked door barrier
export function buildRegionLayers(region, unlockedDoorIds = []) {
  const { widthTiles: w, heightTiles: h, seed } = region;
  const rng = createSeededRng(seed);

  const terrain = Array.from({ length: h }, () => Array(w).fill(0));
  const collision = Array.from({ length: h }, (_, y) =>
    Array.from({ length: w }, (_, x) => (x === 0 || y === 0 || x === w - 1 || y === h - 1 ? 1 : 0))
  );
  const decorations = [];

  // Carve a river across part of the map with a walkable bridge/path crossing
  const riverRow = Math.floor(h * 0.55);
  const bridgeCol = Math.floor(w * 0.5);
  for (let x = 2; x < w - 2; x++) {
    terrain[riverRow][x] = 2;
    if (Math.abs(x - bridgeCol) > 1) {
      collision[riverRow][x] = 1;
    } else {
      terrain[riverRow][x] = 1;
      collision[riverRow][x] = 0;
    }
  }

  // Carve navigable paths between subareas and exits
  const waypoints = [
    ...(region.subareas || []).map((s) => ({ x: s.x, y: s.y })),
    ...(region.exits || []).map((e) => ({ x: e.tileX, y: e.tileY }))
  ];

  for (let i = 0; i < waypoints.length - 1; i++) {
    const a = waypoints[i];
    const b = waypoints[i + 1];
    let cx = Math.max(2, Math.min(w - 3, a.x));
    let cy = Math.max(2, Math.min(h - 3, a.y));
    const tx = Math.max(2, Math.min(w - 3, b.x));
    const ty = Math.max(2, Math.min(h - 3, b.y));

    while (cx !== tx) {
      if (terrain[cy][cx] !== 2) terrain[cy][cx] = 1;
      collision[cy][cx] = 0;
      cx += cx < tx ? 1 : -1;
    }
    while (cy !== ty) {
      if (terrain[cy][cx] !== 2) terrain[cy][cx] = 1;
      collision[cy][cx] = 0;
      cy += cy < ty ? 1 : -1;
    }
  }

  // Place ruin pillars/walls away from paths, spawns, and exits
  const protectedSet = new Set(waypoints.map((pt) => `${pt.x},${pt.y}`));
  for (let y = 3; y < h - 3; y += 3) {
    for (let x = 3; x < w - 3; x += 4) {
      if (protectedSet.has(`${x},${y}`) || collision[y][x] !== 0 || terrain[y][x] === 1) continue;
      if (rng() < 0.25) {
        collision[y][x] = 1;
        decorations.push({ tileX: x, tileY: y, kind: 'ruin_pillar' });
      } else if (rng() < 0.2) {
        terrain[y][x] = 3;
        decorations.push({ tileX: x, tileY: y, kind: 'ruin_debris' });
      }
    }
  }

  // Apply locked doors unless already unlocked
  for (const door of region.doors || []) {
    const isOpen = unlockedDoorIds.includes(door.id);
    collision[door.tileY][door.tileX] = isOpen ? 0 : 2;
  }

  // Ensure exits and checkpoints are walkable
  for (const ex of region.exits || []) {
    collision[ex.tileY][ex.tileX] = 0;
  }
  for (const cp of region.checkpoints || []) {
    collision[cp.tileY][cp.tileX] = 0;
  }

  return {
    regionId: region.id,
    widthTiles: w,
    heightTiles: h,
    tileSize: region.tileSize || 32,
    terrain,
    collision,
    decorations
  };
}