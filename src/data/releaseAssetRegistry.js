// src/data/releaseAssetRegistry.js
export const RELEASE_ASSET_SPECS = {
  tiles: {
    tile_floor: { path: 'assets/tiles/tile_floor.png', frameWidth: 32, frameHeight: 32, fallbackTexture: 'tile_floor' },
    tile_wall: { path: 'assets/tiles/tile_wall.png', frameWidth: 32, frameHeight: 32, fallbackTexture: 'tile_wall' },
    tile_portal: { path: 'assets/tiles/tile_portal.png', frameWidth: 32, frameHeight: 32, fallbackTexture: 'tile_portal' }
  },
  characterSheets: {
    player_knight: {
      path: 'assets/sprites/64x64/player_knight.png',
      frameWidth: 64,
      frameHeight: 64,
      fallbackTexture: 'player_knight',
      anims: ['idle', 'walk', 'light_atk', 'heavy_atk', 'dodge', 'block_parry', 'hurt', 'death']
    },
    enemy_thrall: {
      path: 'assets/sprites/64x64/enemy_thrall.png',
      frameWidth: 64,
      frameHeight: 64,
      fallbackTexture: 'enemy_thrall',
      anims: ['idle', 'walk', 'light_atk', 'heavy_atk', 'hurt', 'death']
    },
    enemy_hound: {
      path: 'assets/sprites/64x64/enemy_hound.png',
      frameWidth: 64,
      frameHeight: 64,
      fallbackTexture: 'enemy_hound',
      anims: ['idle', 'walk', 'light_atk', 'hurt', 'death']
    }
  },
  bossSheets: {
    hollow_warden_boss: {
      path: 'assets/sprites/bosses/hollow_warden_boss.png',
      frameWidth: 128,
      frameHeight: 128,
      fallbackTexture: 'enemy_thrall',
      anims: ['idle', 'walk', 'light_atk', 'heavy_atk', 'hurt', 'death']
    },
    silence_sovereign_boss: {
      path: 'assets/sprites/bosses/silence_sovereign_boss.png',
      frameWidth: 128,
      frameHeight: 128,
      fallbackTexture: 'enemy_thrall',
      anims: ['idle', 'walk', 'light_atk', 'heavy_atk', 'hurt', 'death']
    }
  },
  icons: {
    icon_default_32: { path: 'assets/icons/icon_default_32.png', width: 32, height: 32, fallbackTexture: 'slash_fx' },
    icon_relic_64: { path: 'assets/icons/icon_relic_64.png', width: 64, height: 64, fallbackTexture: 'prop_pillar' }
  },
  audio: {
    slash_light: { paths: ['assets/audio/slash_light.ogg', 'assets/audio/slash_light.mp3', 'assets/audio/slash_light.wav'], fallbackSfx: 'slash_light' },
    slash_heavy: { paths: ['assets/audio/slash_heavy.ogg', 'assets/audio/slash_heavy.mp3', 'assets/audio/slash_heavy.wav'], fallbackSfx: 'slash_heavy' },
    parry_clang: { paths: ['assets/audio/parry_clang.ogg', 'assets/audio/parry_clang.mp3', 'assets/audio/parry_clang.wav'], fallbackSfx: 'parry_clang' },
    bgm_ashen_vale: { paths: ['assets/audio/bgm_ashen_vale.ogg', 'assets/audio/bgm_ashen_vale.mp3'], fallbackMusic: 'bgm_ashen_vale' },
    bgm_crown_of_silence: { paths: ['assets/audio/bgm_crown_of_silence.ogg', 'assets/audio/bgm_crown_of_silence.mp3'], fallbackMusic: 'bgm_crown_of_silence' }
  }
};

export function validateAssetRegistry(registry = RELEASE_ASSET_SPECS) {
  const issues = [];
  for (const [group, entries] of Object.entries(registry)) {
    for (const [key, cfg] of Object.entries(entries)) {
      if (!cfg || typeof cfg !== 'object') {
        issues.push(`${group}.${key}: invalid config`);
        continue;
      }
      if (group === 'characterSheets' && (cfg.frameWidth !== 64 || cfg.frameHeight !== 64)) {
        issues.push(`${group}.${key}: expected 64x64 cell size`);
      }
      if (group === 'bossSheets' && (cfg.frameWidth < 128 || cfg.frameHeight < 128)) {
        issues.push(`${group}.${key}: expected at least 128x128 boss cell size`);
      }
      if (group !== 'audio' && !cfg.fallbackTexture) {
        issues.push(`${group}.${key}: missing fallbackTexture`);
      }
      if (group === 'audio' && (!Array.isArray(cfg.paths) || cfg.paths.length === 0)) {
        issues.push(`${group}.${key}: missing audio paths`);
      }
    }
  }
  return { valid: issues.length === 0, issues };
}