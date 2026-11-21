// src/world/maps/ProceduralMapGenerator.js
export function createSeededRng(seed = 104729) {
  let s = (Number(seed) || 104729) % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function generateRegionMap(region) {
  const w = region?.widthTiles || 36;
  const h = region?.heightTiles || 28;
  const rng = createSeededRng(region?.seed || 104729);
  const grid = Array.from({ length: h }, (_, y) =>
    Array.from({ length: w }, (_, x) => (x === 0 || y === 0 || x === w - 1 || y === h - 1 ? 1 : 0))
  );

  for (let y = 3; y < h - 3; y += 4) {
    for (let x = 3; x < w - 3; x += 5) {
      if (x < 7 && y < 7) continue;
      if (rng() < 0.35) {
        grid[y][x] = 1;
      }
    }
  }

  return { grid, spawn: { x: 3, y: 3 } };
}