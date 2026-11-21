# ashen-the-hollow-crown
# ASHEN: THE HOLLOW CROWN

A modular top-down 2D dark fantasy action RPG built with **Phaser 3**, **ES Modules**, and **Vite**, designed for desktop and Android web/PWA play.

---

## Features & Architecture

- **Modular Scene Flow:** `BootScene` (procedural texture generation) → `MainMenuScene` (`MainMenuUI`) → `WorldScene` (region loading, entity spawning, combat & autosave loop) → `UIScene` (`HudOverlay`, pause/inventory toggles).
- **Centralized State & Event Bus:** `GameState` manages player stats, inventory, equipment, gold, world progress, and settings while emitting events over `EventBus`.
- **Combat & Weapons System:** `CombatSystem` and `weaponsData.js` handle combo chains, heavy attacks, critical rolls, knockback, hitboxes, and weapon categories (`sword`, `greatsword`, `dual_daggers`, `axe`, `spear`, `staff`, `bow`).
- **Persistence:** `SaveSystem` supports save slots across IndexedDB and `localStorage`, paired with Wayfarer Shrines and periodic autosaves.
- **Procedural Pixel Assets:** `ProceduralTextures.js` generates crisp pixel-art tiles, characters, shrines, and slash effects on startup.

---

## Project Structure

```text
src/
├── assets/
│   └── ProceduralTextures.js
├── core/
│   ├── EventBus.js
│   ├── GameConfig.js
│   └── GameState.js
├── data/
│   ├── enemies.js
│   └── weaponsData.js
├── entities/
│   ├── enemies/
│   │   └── Enemy.js
│   ├── npcs/
│   │   └── WayfarerShrine.js
│   └── player/
│       └── Player.js
├── input/
│   └── InputManager.js
├── scenes/
│   ├── BootScene.js
│   ├── MainMenuScene.js
│   ├── UIScene.js
│   └── WorldScene.js
├── systems/
│   ├── CombatSystem.js
│   ├── ProgressionSystem.js
│   └── SaveSystem.js
├── ui/
│   ├── HudOverlay.js
│   └── MainMenuUI.js
├── world/
│   ├── maps/
│   │   └── TestMapBuilder.js
│   └── regions/
│       └── RegionManager.js
└── main.js
