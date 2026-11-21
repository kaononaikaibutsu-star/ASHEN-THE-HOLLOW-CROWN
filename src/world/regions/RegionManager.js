import { REGIONS } from '../../data/regions.js';
import { TILE_SIZE } from '../../core/GameConfig.js';
import { GameState } from '../../core/GameState.js';

export class RegionManager {
  getRegion(regionId) {
    return REGIONS[regionId] || REGIONS.ashen_verge;
  }

  getSpawnWorldPosition(regionId) {
    const region = this.getRegion(regionId);
    return {
      x: region.spawnPoint.tileX * TILE_SIZE + TILE_SIZE / 2,
      y: region.spawnPoint.tileY * TILE_SIZE + TILE_SIZE / 2
    };
  }

  transitionToNextRegion(currentRegionId) {
    const current = this.getRegion(currentRegionId);
    const next = this.getRegion(current.nextRegionId);
    const spawn = this.getSpawnWorldPosition(next.id);
    GameState.state.regionId = next.id;
    GameState.state.player.x = spawn.x;
    GameState.state.player.y = spawn.y;
    return next;
  }
}