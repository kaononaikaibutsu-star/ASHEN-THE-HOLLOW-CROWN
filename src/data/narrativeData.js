// src/data/narrativeData.js
export const NPC_DEFINITIONS = {
  warden_marcus: {
    id: 'warden_marcus',
    name: 'Warden Marcus',
    description: 'An ash-worn sentinel keeping watch beside the courtyard ruins.',
    faction: 'human_factions',
    homeRegion: 'ashen_courtyard',
    altRegion: 'hollow_catacombs',
    schedule: [
      { startHour: 0, endHour: 12, regionId: 'ashen_courtyard', x: 192, y: 160, idleMode: 'guard' },
      { startHour: 12, endHour: 24, regionId: 'ashen_courtyard', x: 256, y: 192, idleMode: 'patrol' }
    ],
    defaultDialogueId: 'marcus_intro',
    questIds: ['q_main_hollow_crown', 'q_side_ember_stock'],
    baseReputation: 10,
    baseRelationship: 15,
    corruptionReactions: {
      low: 'Keep your blade steady, traveler. The ash spares no one.',
      mid: 'Your eyes carry a hollow glint... have you touched the Crown\'s remnants?',
      high: 'The Crown speaks through you now. Stand back before I am forced to strike.'
    }
  },
  tinker_cora: {
    id: 'tinker_cora',
    name: 'Cora the Cinder-Smith',
    description: 'Scavenger and reliquary archivist studying pre-collapse kilns.',
    faction: 'ancient_guardians',
    homeRegion: 'ashen_courtyard',
    altRegion: 'ashen_courtyard',
    schedule: [
      { startHour: 0, endHour: 24, regionId: 'ashen_courtyard', x: 128, y: 224, idleMode: 'work' }
    ],
    defaultDialogueId: 'cora_intro',
    questIds: ['q_hidden_catacomb_relic', 'q_escort_cora_survey'],
    baseReputation: 5,
    baseRelationship: 10,
    corruptionReactions: {
      low: 'Old iron remembers its maker if you feed it honest ore.',
      mid: 'Forbidden power warps the metal—and the hand that swings it.',
      high: 'Do not bring that eclipsed aura near my anvil!'
    }
  }
};

export const DIALOGUE_TREES = {
  marcus_intro: {
    id: 'marcus_intro',
    npcId: 'warden_marcus',
    startNodeId: 'root',
    nodes: {
      root: {
        id: 'root',
        speaker: 'Warden Marcus',
        text: 'The Hollow Crown stirs beneath the catacombs. Will you aid the courtyard or claim its dark power?',
        choices: [
          {
            id: 'accept_main',
            label: 'Accept the duty to confront the Hollow Sovereign.',
            nextNodeId: 'duty_accepted',
            consequences: {
              startQuestId: 'q_main_hollow_crown',
              flags: { chose_courtyard_oath: true },
              reputation: { human_factions: 10 },
              relationship: { warden_marcus: 10 }
            }
          },
          {
            id: 'ask_hidden_clue',
            label: '[Arcane 10+] Sense the hidden catacomb seal.',
            conditions: { minAttributes: { arcane: 10 } },
            nextNodeId: 'arcane_insight',
            consequences: {
              unlockLoreId: 'lore_catacomb_seal',
              flags: { sensed_catacomb_seal: true },
              corruption: 6
            }
          },
          {
            id: 'offer_shard',
            label: 'Hand over an Ashen Shard (Requires 1 Ashen Shard).',
            conditions: { requiredItems: [{ itemId: 'ashen_shard', quantity: 1 }] },
            nextNodeId: 'shard_thanks',
            consequences: {
              consumeItems: [{ itemId: 'ashen_shard', quantity: 1 }],
              xp: 45,
              gold: 30,
              relationship: { warden_marcus: 15 }
            }
          },
          {
            id: 'leave_chat',
            label: 'Step back for now.',
            nextNodeId: null,
            consequences: {}
          }
        ]
      },
      duty_accepted: {
        id: 'duty_accepted',
        speaker: 'Warden Marcus',
        text: 'Then enter the catacombs, clear the corrupted hounds, and inspect the Sovereign altar.',
        choices: [{ id: 'end_1', label: 'I will not fail.', nextNodeId: null, consequences: {} }]
      },
      arcane_insight: {
        id: 'arcane_insight',
        speaker: 'Warden Marcus',
        text: 'You read the ward-stones like a scholar of the old court... tread carefully.',
        choices: [{ id: 'end_2', label: 'Continue.', nextNodeId: null, consequences: {} }]
      },
      shard_thanks: {
        id: 'shard_thanks',
        speaker: 'Warden Marcus',
        text: 'This shard will reinforce our perimeter wards. Take these coins for your road.',
        choices: [{ id: 'end_3', label: 'Farewell.', nextNodeId: null, consequences: {} }]
      }
    }
  },
  cora_intro: {
    id: 'cora_intro',
    npcId: 'tinker_cora',
    startNodeId: 'start',
    nodes: {
      start: {
        id: 'start',
        speaker: 'Cora the Cinder-Smith',
        text: 'Need a survey escort near the ruins, or hunting the hidden crest?',
        choices: [
          {
            id: 'start_escort',
            label: 'Escort Cora to the courtyard survey point.',
            nextNodeId: 'escort_go',
            consequences: { startQuestId: 'q_escort_cora_survey' }
          },
          {
            id: 'unlock_hidden_q',
            label: '[Corruption 20+] Ask about the Broken Crown Crest.',
            conditions: { minCorruption: 20 },
            nextNodeId: 'hidden_q_node',
            consequences: { startQuestId: 'q_hidden_catacomb_relic', unlockLoreId: 'lore_hollow_crown' }
          },
          { id: 'bye_cora', label: 'Maybe later.', nextNodeId: null, consequences: {} }
        ]
      },
      escort_go: {
        id: 'escort_go',
        speaker: 'Cora the Cinder-Smith',
        text: 'Stay close—I\'ll mark the survey stone once we reach it.',
        choices: [{ id: 'ok_escort', label: 'Lead on.', nextNodeId: null, consequences: {} }]
      },
      hidden_q_node: {
        id: 'hidden_q_node',
        speaker: 'Cora the Cinder-Smith',
        text: 'Only one bearing the Crown\'s mark can unseal the hidden crest. Bring it to me if you dare.',
        choices: [{ id: 'ok_hidden', label: 'I will find it.', nextNodeId: null, consequences: {} }]
      }
    }
  }
};

export const QUEST_DEFINITIONS = {
  q_main_hollow_crown: {
    id: 'q_main_hollow_crown',
    title: 'Crown of Ash and Bone',
    kind: 'main',
    description: 'Investigate the Hollow Crown threat, defeat corrupted foes, and reach the catacombs.',
    prerequisites: {},
    nextQuestId: 'q_side_ember_stock',
    stages: [
      {
        id: 'stage_1',
        summary: 'Defeat 2 enemies and discover the Hollow Catacombs.',
        objectives: [
          { id: 'obj_defeat', type: 'defeat', target: 'any_enemy', current: 0, required: 2, optional: false },
          { id: 'obj_discover', type: 'discover', target: 'hollow_catacombs', current: 0, required: 1, optional: false },
          { id: 'obj_investigate', type: 'investigate', target: 'ashen_altar_clue', current: 0, required: 1, optional: true }
        ]
      }
    ],
    rewards: {
      xp: 150,
      gold: 85,
      items: [{ itemId: 'health_potion', quantity: 2 }],
      abilityId: 'void_bolt',
      flags: { main_quest_1_complete: true }
    },
    branchOutcomeFlag: 'hollow_crown_confronted'
  },
  q_side_ember_stock: {
    id: 'q_side_ember_stock',
    title: 'Embers for the Vigil',
    kind: 'side',
    description: 'Gather Ashen Ore to supply the courtyard defenses.',
    prerequisites: { completedQuests: ['q_main_hollow_crown'] },
    stages: [
      {
        id: 'stage_1',
        summary: 'Collect 3 Ashen Ore.',
        objectives: [
          { id: 'obj_ore', type: 'collect', target: 'ashen_ore', current: 0, required: 3, optional: false }
        ]
      }
    ],
    rewards: {
      xp: 90,
      gold: 60,
      items: [{ itemId: 'damage_tonic', quantity: 1 }],
      flags: { vigil_supplied: true }
    }
  },
  q_hidden_catacomb_relic: {
    id: 'q_hidden_catacomb_relic',
    title: 'The Fractured Sovereign',
    kind: 'hidden',
    description: 'Recover the Broken Crown Crest tied to the Hollow Sovereign.',
    prerequisites: { minCorruption: 20 },
    stages: [
      {
        id: 'stage_1',
        summary: 'Obtain 1 Broken Crown Crest and speak with Cora.',
        objectives: [
          { id: 'obj_crest', type: 'collect', target: 'hollow_crown_fragment', current: 0, required: 1, optional: false },
          { id: 'obj_talk', type: 'interact', target: 'tinker_cora', current: 0, required: 1, optional: false }
        ]
      }
    ],
    rewards: {
      xp: 220,
      gold: 140,
      items: [{ itemId: 'amulet_of_ash', quantity: 1 }],
      corruptionDelta: 10,
      flags: { hidden_crest_recovered: true }
    }
  },
  q_escort_cora_survey: {
    id: 'q_escort_cora_survey',
    title: 'Survey of the Ruins',
    kind: 'side',
    description: 'Escort Cora to the courtyard survey marker.',
    prerequisites: {},
    stages: [
      {
        id: 'stage_1',
        summary: 'Escort Cora to the Survey Marker.',
        objectives: [
          { id: 'obj_escort', type: 'escort', target: 'survey_marker_alpha', current: 0, required: 1, optional: false }
        ]
      }
    ],
    rewards: {
      xp: 80,
      gold: 50,
      items: [{ itemId: 'stamina_potion', quantity: 2 }],
      flags: { survey_completed: true }
    }
  }
};

export const CODEX_ENTRIES = [
  {
    id: 'lore_hollow_crown',
    category: 'creatures',
    title: 'The Hollow Crown',
    body: 'A relic circlet that grants overwhelming arcane force at the cost of mortal vitality and sanity.',
    unlockedByDefault: true
  },
  {
    id: 'lore_warden_marcus',
    category: 'characters',
    title: 'Warden Marcus',
    body: 'Former border captain holding the Ashen Courtyard against encroaching hollows.',
    unlockedByDefault: true
  },
  {
    id: 'lore_factions_ash',
    category: 'factions',
    title: 'Factions of the Cinder Realm',
    body: 'Undead, Hollow Creatures, Corrupted Wildlife, Ancient Guardians, and fractured human remnants vie over ruined kilns.',
    unlockedByDefault: true
  },
  {
    id: 'lore_ashen_courtyard',
    category: 'regions',
    title: 'Ashen Courtyard',
    body: 'Outer courtyard scarred by soot where fallen sentinels still patrol.',
    unlockedByDefault: true
  },
  {
    id: 'lore_catacomb_seal',
    category: 'discoveries',
    title: 'The Catacomb Ward-Stones',
    body: 'Ancient runes binding the lower vaults to the Sovereign\'s memory.',
    unlockedByDefault: false
  },
  {
    id: 'lore_ancient_guardians',
    category: 'ancient_guardians',
    title: 'Kiln Sentinels',
    body: 'Constructed guardians built to test intruders with heavy blows and armored resilience.',
    unlockedByDefault: false
  },
  {
    id: 'lore_first_eclipse',
    category: 'historical_events',
    title: 'The Ashen Eclipse',
    body: 'The night the old hearth went cold and hollow spirits rose from the deep.',
    unlockedByDefault: false
  }
];

export const ENDING_CONDITIONS = [
  {
    id: 'ending_hollow_ascendant',
    title: 'Ending I: Crown of the Eclipse',
    priority: 3,
    summary: 'You claim the Hollow Crown\'s corruption as your own, becoming a sovereign of ash.',
    requires: { minCorruption: 75, flags: { hidden_crest_recovered: true } }
  },
  {
    id: 'ending_vigil_restored',
    title: 'Ending II: Kindling the Vigil',
    priority: 2,
    summary: 'Standing with the courtyard and resisting deep corruption, you rally hope from the ruins.',
    requires: { maxCorruption: 35, flags: { main_quest_1_complete: true, vigil_supplied: true } }
  },
  {
    id: 'ending_wandering_ashen',
    title: 'Ending III: The Ashen Wanderer',
    priority: 1,
    summary: 'Unbound by oath or crown, you walk the shattered threshold into an uncertain dawn.',
    requires: {}
  }
];