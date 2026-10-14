class TetrisEngine {
  constructor() {
    this.reset();
  }

  reset() {
    this.grid = Array.from({ length: TOTAL_ROWS }, () =>
      Array(COLS).fill(null)
    );
    this.score = 0;
    this.level = 0;
    this.lines = 0;
    this.gameOver = false;
    this.bag = [];
    this.nextType = this._drawFromBag();
    this._spawnPiece();
  }

  _shuffleBag() {
    const bag = [...PIECE_TYPES];
    for (let i = bag.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [bag[i], bag[j]] = [bag[j], bag[i]];
    }
    this.bag = bag;
  }

  _drawFromBag() {
    if (this.bag.length === 0) this._shuffleBag();
    return this.bag.pop();
  }

  _spawnPiece() {
    const type = this.nextType;
    this.nextType = this._drawFromBag();
    this.active = {
      type,
      rotation: 0,
      row: 0,
      col: 3,
    };
    if (this._collides(this.active)) {
      this.gameOver = true;
      this.active = null;
    }
  }

  _cellsFor(piece) {
    const shape = getShape(piece.type, piece.rotation);
    return shape.map(([dr, dc]) => [piece.row + dr, piece.col + dc]);
  }

  _collides(piece, rowOffset = 0, colOffset = 0) {
    const test = {
      ...piece,
      row: piece.row + rowOffset,
      col: piece.col + colOffset,
    };
    for (const [r, c] of this._cellsFor(test)) {
      if (c < 0 || c >= COLS || r >= TOTAL_ROWS) return true;
      if (r >= 0 && this.grid[r][c]) return true;
    }
    return false;
  }

  moveLeft() {
    if (this.gameOver || !this.active) return false;
    if (this._collides(this.active, 0, -1)) return false;
    this.active.col -= 1;
    return true;
  }

  moveRight() {
    if (this.gameOver || !this.active) return false;
    if (this._collides(this.active, 0, 1)) return false;
    this.active.col += 1;
    return true;
  }

  /** Simple wall kicks: try rotation, then nudge ±1 col. */
  rotate() {
    if (this.gameOver || !this.active) return false;
    const nextRot = (this.active.rotation + 1) % 4;
    const rotated = { ...this.active, rotation: nextRot };
    const kicks = [0, -1, 1, -2, 2];
    for (const kick of kicks) {
      if (!this._collides(rotated, 0, kick)) {
        this.active.rotation = nextRot;
        this.active.col += kick;
        return true;
      }
    }
    return false;
  }

  softDrop() {
    if (this.gameOver || !this.active) return false;
    if (this._collides(this.active, 1, 0)) {
      this._lockPiece();
      return false;
    }
    this.active.row += 1;
    this.score += SOFT_DROP_POINTS;
    return true;
  }

  hardDrop() {
    if (this.gameOver || !this.active) return false;
    let dropped = 0;
    while (!this._collides(this.active, 1, 0)) {
      this.active.row += 1;
      dropped += 1;
    }
    this.score += dropped * HARD_DROP_POINTS;
    this._lockPiece();
    return true;
  }

  tick() {
    if (this.gameOver || !this.active) return;
    if (this._collides(this.active, 1, 0)) {
      this._lockPiece();
    } else {
      this.active.row += 1;
    }
  }

  _lockPiece() {
    if (!this.active) return;
    for (const [r, c] of this._cellsFor(this.active)) {
      if (r >= 0 && r < TOTAL_ROWS && c >= 0 && c < COLS) {
        this.grid[r][c] = this.active.type;
      }
    }
    this.active = null;
    const cleared = this._clearLines();
    if (cleared > 0) {
      const base = LINE_SCORES[cleared] || LINE_SCORES[4];
      this.score += base * (this.level + 1);
      this.lines += cleared;
      const newLevel = Math.floor(this.lines / LINES_PER_LEVEL);
      if (newLevel > this.level) {
        this.level = newLevel;
      }
    }
    if (!this.gameOver) {
      this._spawnPiece();
    }
  }

  _clearLines() {
    let cleared = 0;
    for (let r = TOTAL_ROWS - 1; r >= 0; ) {
      if (this.grid[r].every((cell) => cell !== null)) {
        this.grid.splice(r, 1);
        this.grid.unshift(Array(COLS).fill(null));
        cleared += 1;
      } else {
        r -= 1;
      }
    }
    return cleared;
  }

  /** Ghost piece row (lowest valid row without collision). */
  getGhostRow() {
    if (!this.active) return null;
    let ghostRow = this.active.row;
    while (!this._collides({ ...this.active, row: ghostRow + 1 })) {
      ghostRow += 1;
    }
    return ghostRow;
  }
}
