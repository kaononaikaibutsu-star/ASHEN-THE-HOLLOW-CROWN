// src/core/LifecycleManager.js
import { GameState } from './GameState.js';
import { saveSystem } from '../systems/SaveSystem.js';

export function attachAppLifecycleHandlers({ audioSystem, getPlayerSprite }) {
  if (typeof document === 'undefined') return () => {};

  const onBackground = () => {
    audioSystem?.suspend();
    const st = GameState.getState();
    if (st.settings?.autoSaveOnPause !== false) {
      saveSystem.saveSlot(st.slotId || 1, getPlayerSprite?.()).catch(() => {});
    }
  };

  const onForeground = () => {
    audioSystem?.resume();
  };

  const handleVis = () => {
    if (document.hidden) onBackground();
    else onForeground();
  };

  document.addEventListener('visibilitychange', handleVis);
  window.addEventListener('pagehide', onBackground);

  return () => {
    document.removeEventListener('visibilitychange', handleVis);
    window.removeEventListener('pagehide', onBackground);
  };
}