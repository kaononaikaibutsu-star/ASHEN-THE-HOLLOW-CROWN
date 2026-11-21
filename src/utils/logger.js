const LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };
let currentLevel = LEVELS.info;

export const Logger = {
  setLevel(level) {
    if (LEVELS[level] !== undefined) currentLevel = LEVELS[level];
  },
  debug(tag, ...args) {
    if (currentLevel <= LEVELS.debug) console.debug(`[${tag}]`, ...args);
  },
  info(tag, ...args) {
    if (currentLevel <= LEVELS.info) console.log(`[${tag}]`, ...args);
  },
  warn(tag, ...args) {
    if (currentLevel <= LEVELS.warn) console.warn(`[${tag}]`, ...args);
  },
  error(tag, ...args) {
    if (currentLevel <= LEVELS.error) console.error(`[${tag}]`, ...args);
  }
};