(function () {
  const gameCanvas = document.getElementById('gameCanvas');
  const nextCanvas = document.getElementById('nextCanvas');
  const scoreEl = document.getElementById('score');
  const levelEl = document.getElementById('level');
  const linesEl = document.getElementById('lines');
  const restartButton = document.getElementById('restartButton');

  gameCanvas.width = COLS * CELL_SIZE;
  gameCanvas.height = ROWS * CELL_SIZE;

  const engine = new TetrisEngine();
  Render.init(gameCanvas, nextCanvas);
  Input.init(engine);

  let lastTime = 0;
  let dropAccumulator = 0;

  function updatePanel() {
    scoreEl.textContent = engine.score;
    levelEl.textContent = engine.level;
    linesEl.textContent = engine.lines;
    Render.drawNextPiece(engine.nextType);
  }

  function frame(time) {
    if (!lastTime) lastTime = time;
    const delta = time - lastTime;
    lastTime = time;

    if (!engine.gameOver) {
      dropAccumulator += delta;
      const interval = dropIntervalMs(engine.level);
      while (dropAccumulator >= interval) {
        engine.tick();
        dropAccumulator -= interval;
      }
    }

    Render.drawBoard(engine);
    updatePanel();

    requestAnimationFrame(frame);
  }

  restartButton.addEventListener('click', () => {
    engine.reset();
    dropAccumulator = 0;
    updatePanel();
    Render.drawBoard(engine);
  });

  updatePanel();
  Render.drawBoard(engine);
  requestAnimationFrame(frame);
})();
