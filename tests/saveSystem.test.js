import { migrateSaveData } from '../systems/SaveSystem.js';
import { GAME_CONFIG } from '../core/GameConfig.js';

const migrated = migrateSaveData({ slotId: 2, player: { hp: 75 } });
console.assert(migrated.slotId === 2, 'Expected slotId 2');
console.assert(migrated.player.hp === 75, 'Expected preserved hp 75');
console.assert(migrated.saveVersion === GAME_CONFIG.saveVersion, 'Expected current saveVersion');
console.log('saveSystem.test.js passed');