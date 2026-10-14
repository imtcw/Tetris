const Render = {
  ctx: null,
  nextCtx: null,

  init(gameCanvas, nextCanvas) {
    this.ctx = gameCanvas.getContext('2d');
    this.nextCtx = nextCanvas.getContext('2d');
  },

  clear() {
    const { ctx } = this;
    ctx.fillStyle = '#1a1d27';
    ctx.fillRect(0, 0, COLS * CELL_SIZE, ROWS * CELL_SIZE);
  },

  drawBoard(engine) {
    this.clear();
    const offsetY = HIDDEN_ROWS;

    for (let r = HIDDEN_ROWS; r < TOTAL_ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const type = engine.grid[r][c];
        if (type) {
          this._drawCell(
            c * CELL_SIZE,
            (r - offsetY) * CELL_SIZE,
            PIECE_COLORS[type]
          );
        }
      }
    }

    if (engine.active && !engine.gameOver) {
      const ghostRow = engine.getGhostRow();
      if (ghostRow !== null && ghostRow !== engine.active.row) {
        const ghost = { ...engine.active, row: ghostRow };
        this._drawPiece(ghost, offsetY, 0.25);
      }
      this._drawPiece(engine.active, offsetY, 1);
    }

    this._drawGridLines();

    if (engine.gameOver) {
      this._drawGameOverOverlay();
    }
  },

  _drawPiece(piece, rowOffset, alpha) {
    const shape = getShape(piece.type, piece.rotation);
    const color = PIECE_COLORS[piece.type];
    for (const [dr, dc] of shape) {
      const r = piece.row + dr;
      const c = piece.col + dc;
      if (r < HIDDEN_ROWS) continue;
      this._drawCell(
        c * CELL_SIZE,
        (r - rowOffset) * CELL_SIZE,
        color,
        alpha
      );
    }
  },

  _drawCell(x, y, color, alpha = 1) {
    const { ctx } = this;
    const pad = 1;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.fillRect(x + pad, y + pad, CELL_SIZE - pad * 2, CELL_SIZE - pad * 2);
    ctx.globalAlpha = 1;
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.strokeRect(x + pad, y + pad, CELL_SIZE - pad * 2, CELL_SIZE - pad * 2);
  },

  _drawGridLines() {
    const { ctx } = this;
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    for (let c = 0; c <= COLS; c++) {
      ctx.beginPath();
      ctx.moveTo(c * CELL_SIZE + 0.5, 0);
      ctx.lineTo(c * CELL_SIZE + 0.5, ROWS * CELL_SIZE);
      ctx.stroke();
    }
    for (let r = 0; r <= ROWS; r++) {
      ctx.beginPath();
      ctx.moveTo(0, r * CELL_SIZE + 0.5);
      ctx.lineTo(COLS * CELL_SIZE, r * CELL_SIZE + 0.5);
      ctx.stroke();
    }
  },

  _drawGameOverOverlay() {
    const { ctx } = this;
    const w = COLS * CELL_SIZE;
    const h = ROWS * CELL_SIZE;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 28px system-ui, sans-serif';
    ctx.fillText('Game Over', w / 2, h / 2 - 16);
    ctx.font = '14px system-ui, sans-serif';
    ctx.fillStyle = '#c4c9d4';
    ctx.fillText('Press Restart', w / 2, h / 2 + 18);
  },

  drawNextPiece(type) {
    const { nextCtx } = this;
    const size = nextCtx.canvas.width;
    nextCtx.fillStyle = '#1a1d27';
    nextCtx.fillRect(0, 0, size, nextCtx.canvas.height);

    if (!type) return;

    const shape = getShape(type, 0);
    let minR = Infinity;
    let maxR = -Infinity;
    let minC = Infinity;
    let maxC = -Infinity;
    for (const [dr, dc] of shape) {
      minR = Math.min(minR, dr);
      maxR = Math.max(maxR, dr);
      minC = Math.min(minC, dc);
      maxC = Math.max(maxC, dc);
    }
    const pieceH = maxR - minR + 1;
    const pieceW = maxC - minC + 1;
    const cell = Math.min(24, Math.floor(size / Math.max(pieceW, pieceH, 4)));
    const totalW = pieceW * cell;
    const totalH = pieceH * cell;
    const ox = (size - totalW) / 2 - minC * cell;
    const oy = (size - totalH) / 2 - minR * cell;
    const color = PIECE_COLORS[type];

    for (const [dr, dc] of shape) {
      const x = ox + dc * cell;
      const y = oy + dr * cell;
      nextCtx.fillStyle = color;
      nextCtx.fillRect(x + 1, y + 1, cell - 2, cell - 2);
      nextCtx.strokeStyle = 'rgba(255,255,255,0.15)';
      nextCtx.strokeRect(x + 1, y + 1, cell - 2, cell - 2);
    }
  },
};
