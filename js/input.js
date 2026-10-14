const Input = {
  engine: null,
  _boundHandler: null,
  _boundKeyUpHandler: null,
  _softDropInterval: null,

  init(engine) {
    this.engine = engine;
    this._boundHandler = this._onKeyDown.bind(this);
    this._boundKeyUpHandler = this._onKeyUp.bind(this);
    window.addEventListener('keydown', this._boundHandler);
    window.addEventListener('keyup', this._boundKeyUpHandler);
  },

  destroy() {
    window.removeEventListener('keydown', this._boundHandler);
    window.removeEventListener('keyup', this._boundKeyUpHandler);
    this._stopSoftDropRepeat();
  },

  _onKeyDown(e) {
    const code = e.code;
    const gameKeys = [
      'ArrowLeft',
      'ArrowRight',
      'ArrowUp',
      'ArrowDown',
      'Space',
    ];
    if (!gameKeys.includes(code)) return;

    e.preventDefault();

    if (this.engine.gameOver) return;

    if (code === 'ArrowLeft') {
      this.engine.moveLeft();
      return;
    }
    if (code === 'ArrowRight') {
      this.engine.moveRight();
      return;
    }
    if (code === 'ArrowUp') {
      if (e.repeat) return;
      this.engine.rotate();
      return;
    }
    if (code === 'ArrowDown') {
      this.engine.softDrop();
      if (!this._softDropInterval) {
        this._softDropInterval = setInterval(() => {
          if (this.engine.gameOver) {
            this._stopSoftDropRepeat();
            return;
          }
          this.engine.softDrop();
        }, 50);
      }
      return;
    }
    if (code === 'Space') {
      if (e.repeat) return;
      this.engine.hardDrop();
    }
  },

  _onKeyUp(e) {
    if (e.code === 'ArrowDown') {
      this._stopSoftDropRepeat();
    }
  },

  _stopSoftDropRepeat() {
    if (this._softDropInterval) {
      clearInterval(this._softDropInterval);
      this._softDropInterval = null;
    }
  },
};
