const COLS = 10;
const ROWS = 20;
const HIDDEN_ROWS = 2;
const TOTAL_ROWS = HIDDEN_ROWS + ROWS;
const CELL_SIZE = 30;

const PIECE_COLORS = {
  I: '#00f0f0',
  O: '#f0f000',
  T: '#a000f0',
  S: '#00f000',
  Z: '#f00000',
  J: '#0000f0',
  L: '#f0a000',
};

/** NES-style line clear base points (multiplied by level + 1). */
const LINE_SCORES = {
  1: 40,
  2: 100,
  3: 300,
  4: 1200,
};

const SOFT_DROP_POINTS = 1;
const HARD_DROP_POINTS = 2;

const LINES_PER_LEVEL = 10;

const MIN_DROP_MS = 80;
const BASE_DROP_MS = 1000;

/**
 * Gravity interval in ms for a given level (0-based).
 * Speed increases each level, capped for playability.
 */
function dropIntervalMs(level) {
  const ms = BASE_DROP_MS - level * 80;
  return Math.max(MIN_DROP_MS, ms);
}

const PIECE_TYPES = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
