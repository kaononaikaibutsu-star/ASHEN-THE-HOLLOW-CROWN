// Tile legend: 0 = floor, 1 = wall, 2 = portal
export function generateRegionGrid(widthTiles, heightTiles, exitPortal) {
  const grid = Array.from({ length: heightTiles }, (_, y) =>
    Array.from({ length: widthTiles }, (_, x) => {
      if (x === 0 || y === 0 || x === widthTiles - 1 || y === heightTiles - 1) {
        return 1;
      }
      return 0;
    })
  );

  // Add interior ruin pillars/walls while keeping clear lanes
  for (let y = 5; y < heightTiles - 5; y += 6) {
    for (let x = 7; x < widthTiles - 7; x += 8) {
      grid[y][x] = 1;
      grid[y][x + 1] = 1;
    }
  }

  if (
    exitPortal &&
    exitPortal.tileY > 0 &&
    exitPortal.tileY < heightTiles - 1 &&
    exitPortal.tileX > 0 &&
    exitPortal.tileX < widthTiles - 1
  ) {
    grid[exitPortal.tileY][exitPortal.tileX] = 2;
  }

  return grid;
}