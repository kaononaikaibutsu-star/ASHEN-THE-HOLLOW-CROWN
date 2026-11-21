// src/data/weaponsData.js
export const WEAPON_CATEGORIES = {
  sword: {
    id: 'sword',
    category: 'sword',
    name: 'Ashen Broadsword',
    baseDamage: 15,
    heavyMultiplier: 1.85,
    attackSpeed: 1.0,
    range: 36,
    arcRad: Math.PI * 0.65,
    staminaCost: 14,
    heavyStaminaCost: 26,
    critChance: 0.15,
    critMultiplier: 1.75,
    startupMs: 70,
    activeMs: 110,
    recoveryMs: 170,
    heavyRecoveryMs: 290,
    comboWindowMs: 520,
    comboStages: [
      { name: 'Slash', damageMult: 1.0, knockback: 90, hitStunMs: 140 },
      { name: 'Cross Cut', damageMult: 1.15, knockback: 110, hitStunMs: 160 },
      { name: 'Severing Arc', damageMult: 1.45, knockback: 175, hitStunMs: 220 }
    ],
    specialAbility: {
      id: 'riposte_slash',
      name: 'Cinder Riposte',
      staminaCost: 20,
      cooldownMs: 1400,
      mode: 'lunge_slash'
    }
  },
  greatsword: {
    id: 'greatsword',
    category: 'greatsword',
    name: 'Hollow Greatsword',
    baseDamage: 26,
    heavyMultiplier: 2.0,
    attackSpeed: 0.72,
    range: 48,
    arcRad: Math.PI * 0.78,
    staminaCost: 24,
    heavyStaminaCost: 38,
    critChance: 0.12,
    critMultiplier: 1.85,
    startupMs: 140,
    activeMs: 145,
    recoveryMs: 280,
    heavyRecoveryMs: 420,
    comboWindowMs: 600,
    comboStages: [
      { name: 'Overhead Cleave', damageMult: 1.0, knockback: 150, hitStunMs: 200 },
      { name: 'Sweep', damageMult: 1.2, knockback: 180, hitStunMs: 220 },
      { name: 'Cataclysm Slam', damageMult: 1.55, knockback: 250, hitStunMs: 280 }
    ],
    specialAbility: {
      id: 'crushing_wave',
      name: 'Hollow Shockwave',
      staminaCost: 32,
      cooldownMs: 2000,
      mode: 'radial_slam'
    }
  },
  dual_daggers: {
    id: 'dual_daggers',
    category: 'dual_daggers',
    name: 'Twin Ash Stilettos',
    baseDamage: 10,
    heavyMultiplier: 1.75,
    attackSpeed: 1.45,
    range: 26,
    arcRad: Math.PI * 0.5,
    staminaCost: 9,
    heavyStaminaCost: 18,
    critChance: 0.32,
    critMultiplier: 2.1,
    startupMs: 40,
    activeMs: 85,
    recoveryMs: 105,
    heavyRecoveryMs: 210,
    comboWindowMs: 460,
    comboStages: [
      { name: 'Left Fang', damageMult: 0.9, knockback: 45, hitStunMs: 95 },
      { name: 'Right Fang', damageMult: 1.0, knockback: 55, hitStunMs: 105 },
      { name: 'Flurry Pierce', damageMult: 1.35, knockback: 105, hitStunMs: 150 }
    ],
    specialAbility: {
      id: 'shadow_step_strike',
      name: 'Shadow Blink',
      staminaCost: 16,
      cooldownMs: 1100,
      mode: 'blink_strike'
    }
  },
  axe: {
    id: 'axe',
    category: 'axe',
    name: 'Kiln-Breaker Axe',
    baseDamage: 21,
    heavyMultiplier: 1.95,
    attackSpeed: 0.84,
    range: 38,
    arcRad: Math.PI * 0.68,
    staminaCost: 19,
    heavyStaminaCost: 34,
    critChance: 0.18,
    critMultiplier: 1.95,
    startupMs: 110,
    activeMs: 125,
    recoveryMs: 230,
    heavyRecoveryMs: 360,
    comboWindowMs: 550,
    comboStages: [
      { name: 'Chop', damageMult: 1.05, knockback: 140, hitStunMs: 180 },
      { name: 'Backhand Hack', damageMult: 1.2, knockback: 165, hitStunMs: 200 },
      { name: 'Executioner Split', damageMult: 1.5, knockback: 230, hitStunMs: 260 }
    ],
    specialAbility: {
      id: 'armor_sunder',
      name: 'Sunder Cleave',
      staminaCost: 26,
      cooldownMs: 1700,
      mode: 'armor_break'
    }
  },
  spear: {
    id: 'spear',
    category: 'spear',
    name: 'Cinder Pike',
    baseDamage: 16,
    heavyMultiplier: 1.8,
    attackSpeed: 1.08,
    range: 56,
    arcRad: Math.PI * 0.32,
    staminaCost: 15,
    heavyStaminaCost: 27,
    critChance: 0.2,
    critMultiplier: 1.8,
    startupMs: 65,
    activeMs: 105,
    recoveryMs: 165,
    heavyRecoveryMs: 280,
    comboWindowMs: 520,
    comboStages: [
      { name: 'Thrust', damageMult: 1.0, knockback: 115, hitStunMs: 145 },
      { name: 'Sweep Jab', damageMult: 1.15, knockback: 125, hitStunMs: 160 },
      { name: 'Impaling Lunge', damageMult: 1.4, knockback: 195, hitStunMs: 210 }
    ],
    specialAbility: {
      id: 'piercing_rush',
      name: 'Lance Charge',
      staminaCost: 22,
      cooldownMs: 1500,
      mode: 'pierce_line'
    }
  },
  staff: {
    id: 'staff',
    category: 'staff',
    name: 'Ashen Reliquary Staff',
    baseDamage: 14,
    heavyMultiplier: 1.9,
    attackSpeed: 1.02,
    range: 44,
    arcRad: Math.PI * 0.85,
    staminaCost: 14,
    heavyStaminaCost: 28,
    critChance: 0.16,
    critMultiplier: 1.85,
    startupMs: 80,
    activeMs: 120,
    recoveryMs: 185,
    heavyRecoveryMs: 300,
    comboWindowMs: 540,
    comboStages: [
      { name: 'Ember Tap', damageMult: 0.95, knockback: 120, hitStunMs: 150 },
      { name: 'Whirl Sweep', damageMult: 1.15, knockback: 150, hitStunMs: 175 },
      { name: 'Cinder Pulse', damageMult: 1.42, knockback: 210, hitStunMs: 230 }
    ],
    specialAbility: {
      id: 'ember_nova',
      name: 'Ashen Nova',
      staminaCost: 28,
      cooldownMs: 1800,
      mode: 'radial_slam'
    }
  },
  bow: {
    id: 'bow',
    category: 'bow',
    name: 'Hollow Longbow',
    baseDamage: 15,
    heavyMultiplier: 2.05,
    attackSpeed: 0.95,
    range: 180,
    arcRad: Math.PI * 0.2,
    staminaCost: 15,
    heavyStaminaCost: 30,
    critChance: 0.24,
    critMultiplier: 2.0,
    startupMs: 90,
    activeMs: 110,
    recoveryMs: 195,
    heavyRecoveryMs: 330,
    comboWindowMs: 500,
    comboStages: [
      { name: 'Quick Shot', damageMult: 0.95, knockback: 65, hitStunMs: 110 },
      { name: 'Twin Draw', damageMult: 1.1, knockback: 80, hitStunMs: 125 },
      { name: 'Piercing Volley', damageMult: 1.38, knockback: 135, hitStunMs: 170 }
    ],
    specialAbility: {
      id: 'volley_burst',
      name: 'Cinder Volley',
      staminaCost: 25,
      cooldownMs: 1600,
      mode: 'pierce_line'
    }
  }
};

export const WEAPON_LIST = Object.values(WEAPON_CATEGORIES);

export function getWeaponDef(weaponId, fallbackToDefault = true) {
  if (typeof weaponId === 'string' && weaponId.trim() !== '') {
    const key = weaponId.trim();
    if (WEAPON_CATEGORIES[key]) {
      return WEAPON_CATEGORIES[key];
    }

    const matched = WEAPON_LIST.find(
      (weapon) => weapon && (weapon.id === key || weapon.category === key)
    );
    if (matched) {
      return matched;
    }
  }

  return fallbackToDefault ? WEAPON_CATEGORIES.sword : null;
}

export default WEAPON_CATEGORIES;