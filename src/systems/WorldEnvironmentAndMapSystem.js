// src/systems/WorldEnvironmentAndMapSystem.js
export const WEATHER_TYPES = ['clear', 'ash_fall', 'mist', 'cinder_rain'];

export class WorldEnvironmentAndMapSystem {
  constructor(gameState, explorationSystem, narrativeSystem) {
    this.gameState = gameState;
    this.exploration = explorationSystem;
    this.narrative = narrativeSystem;
    this.timeOfDayHours = 8; // 0..24
    this.weather = 'ash_fall';
    this.dayCycleEnabled = true;
  }

  setWeather(weatherType) {
    if (WEATHER_TYPES.includes(weatherType)) {
      this.weather = weatherType;
    }
  }

  advanceTime(deltaMs, region) {
    if (!this.dayCycleEnabled) return;
    // 1 real second = 0.05 in-game hours (20s per hour)
    this.timeOfDayHours = (this.timeOfDayHours + (deltaMs / 1000) * 0.05) % 24;

    if (region) {
      const we = this.exploration.ensureWorldState();
      if (!we.fogByRegion[region.id]) we.fogByRegion[region.id] = [];
    }
  }

  getLightingTint(region) {
    const base = region?.lighting || { ambientColor: 0x2b2436, ambientAlpha: 0.3 };
    const isNight = this.timeOfDayHours < 6 || this.timeOfDayHours >= 19;
    return {
      color: isNight ? 0x100d1c : base.ambientColor,
      alpha: isNight ? Math.min(0.68, base.ambientAlpha + 0.2) : base.ambientAlpha,
      weather: this.weather,
      hour: Math.floor(this.timeOfDayHours)
    };
  }

  getWeatherModifiers() {
    if (this.weather === 'mist') {
      return { detectRangeMult: 0.82, staminaDrainMult: 1.0 };
    }
    if (this.weather === 'cinder_rain') {
      return { detectRangeMult: 0.9, staminaDrainMult: 1.08 };
    }
    return { detectRangeMult: 1.0, staminaDrainMult: 1.0 };
  }

  revealFogAround(regionId, tileX, tileY, radiusTiles = 4) {
    const we = this.exploration.ensureWorldState();
    const set = new Set(we.fogByRegion[regionId] || []);
    for (let dy = -radiusTiles; dy <= radiusTiles; dy++) {
      for (let dx = -radiusTiles; dx <= radiusTiles; dx++) {
        if (dx * dx + dy * dy <= radiusTiles * radiusTiles) {
          set.add(`${tileX + dx},${tileY + dy}`);
        }
      }
    }
    we.fogByRegion[regionId] = Array.from(set);
    return we.fogByRegion[regionId].length;
  }

  getMapSnapshot(region, playerTileX, playerTileY) {
    const we = this.exploration.ensureWorldState();
    const revealedSet = new Set(we.fogByRegion[region.id] || []);

    const visibleLandmarks = (region.landmarks || []).filter((lm) =>
      revealedSet.has(`${lm.tileX},${lm.tileY}`) || we.discoveredLocations.includes(lm.id)
    );

    const activeQuests = Object.values(this.narrative?.ensureShape().quests || {}).filter(
      (q) => q.status === 'active'
    );

    return {
      regionId: region.id,
      regionName: region.name,
      playerTile: { x: playerTileX, y: playerTileY },
      revealedCellCount: revealedSet.size,
      completionPct: this.exploration.getRegionCompletionPercent(region),
      landmarks: visibleLandmarks,
      activeQuestCount: activeQuests.length,
      weather: this.weather,
      hour: Math.floor(this.timeOfDayHours)
    };
  }
}