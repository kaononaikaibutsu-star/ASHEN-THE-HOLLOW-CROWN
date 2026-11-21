export const REGIONS = {
  ashen_verge: {
    id: 'ashen_verge',
    name: 'The Ashen Verge',
    widthTiles: 36,
    heightTiles: 28,
    ambientTint: 0x16141d,
    nextRegionId: 'hollow_catacombs',
    exitPortal: { tileX: 33, tileY: 14 },
    spawnPoint: { tileX: 4, tileY: 14 }
  },
  hollow_catacombs: {
    id: 'hollow_catacombs',
    name: 'Hollow Catacombs',
    widthTiles: 34,
    heightTiles: 26,
    ambientTint: 0x121018,
    nextRegionId: 'ashen_verge',
    exitPortal: { tileX: 2, tileY: 13 },
    spawnPoint: { tileX: 5, tileY: 13 }
  }
};