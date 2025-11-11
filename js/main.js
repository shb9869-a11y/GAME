class Game {
  constructor() {
    this.canvas = document.getElementById('view');
    this.ctx = this.canvas.getContext('2d', { alpha: false });
    this.ctx.imageSmoothingEnabled = false;
    
    this.keys = new Set();
    this.dstate = { ax: 0, ay: 0 };
    this.hintT = 240;
    
    this.maze = new Maze(20251108);
    const { start, exit } = this.maze.generate();
    this.exit = exit;
    this.player = new Player(start, this.maze.TILE);
    
    this.setupControls();
    this.gameLoop();
  }

  setupControls() {
    // 키보드
    addEventListener('keydown', (e) => {
      const k = e.key.toLowerCase();
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].includes(k)) {
        e.preventDefault();
        this.keys.add(k);
      }
    });
    
    addEventListener('keyup', (e) => {
      this.keys.delete(e.key.toLowerCase());
    });

    // D-pad
    const held = new Set();
    const setHeld = (dir, on) => {
      if (on) held.add(dir);
      else held.delete(dir);
      
      let ax = 0, ay = 0;
      if (held.has('left')) ax -= 1;
      if (held.has('right')) ax += 1;
      if (held.has('up')) ay -= 1;
      if (held.has('down')) ay += 1;
      
      this.dstate.ax = ax;
      this.dstate.ay = ay;
    };

    document.querySelectorAll('[data-dir]').forEach(b => {
      const dir = b.dataset.dir;
      const off = (e) => {
        e.preventDefault();
        setHeld(dir, false);
      };
      
      b.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        setHeld(dir, true);
      }, { passive: false });
      
      b.addEventListener('pointerup', off, { passive: false });
      b.addEventListener('pointerleave', off, { passive: false });
      b.addEventListener('pointercancel', off, { passive: false });
    });

    // 모달
    const mapModal = document.getElementById('mapModal');
    const invModal = document.getElementById('invModal');
    
    document.getElementById('btnMap').onclick = () => {
      mapModal.style.display = 'flex';
      this.drawMiniMap();
    };
    
    document.getElementById('btnInv').onclick = () => {
      invModal.style.display = 'flex';
    };
    
    [mapModal, invModal].forEach(m => {
      m.addEventListener('click', (e) => {
        if (e.target === m || e.target.dataset.close != null) {
          m.style.display = 'none';
        }
      });
    });
  }

  drawMiniMap() {
    const host = document.getElementById('mini');
    host.innerHTML = '';
    
    const c = document.createElement('canvas');
    c.width = this.maze.COLS;
    c.height = this.maze.ROWS;
    c.style.width = '100%';
    c.style.height = '100%';
    
    const ctx = c.getContext('2d');
    const img = ctx.createImageData(this.maze.COLS, this.maze.ROWS);
    const d = img.data;
    
    for (let y = 0; y < this.maze.ROWS; y++) {
      for (let x = 0; x < this.maze.COLS; x++) {
        const i = (y * this.maze.COLS + x) * 4;
        const open = this.maze.grid[y][x] === this.maze.OPEN;
        const v = open ? 220 : 24;
        d[i] = d[i + 1] = d[i + 2] = v;
        d[i + 3] = 255;
      }
    }
    
    // 출구
    const exitIndex = (this.exit[1] * this.maze.COLS + this.exit[0]) * 4;
    d[exitIndex] = 255;
    d[exitIndex + 1] = 255;
    d[exitIndex + 2] = 255;
    d[exitIndex + 3] = 255;
    
    // 플레이어
    const playerX = (this.player.x / this.maze.TILE) | 0;
    const playerY = (this.player.y / this.maze.TILE) | 0;
    const playerIndex = (playerY * this.maze.COLS + playerX) * 4;
    d[playerIndex] = 32;
    d[playerIndex + 1] = 200;
    d[playerIndex + 2] = 255;
    d[playerIndex + 3] = 255;
    
    ctx.putImageData(img, 0, 0);
    host.appendChild(c);
  }

  update() {
    // 힌트 페이드
    if (this.hintT > 0) {
      this.hintT--;
      if (this.hintT === 0) {
        document.getElementById('hint').style.display = 'none';
      }
    }
    
    // 입력 처리
    let ax = 0, ay = 0;
    if (this.keys.has('arrowleft') || this.keys.has('a')) ax -= 1;
    if (this.keys.has('arrowright') || this.keys.has('d')) ax += 1;
    if (this.keys.has('arrowup') || this.keys.has('w')) ay -= 1;
    if (this.keys.has('arrowdown') || this.keys.has('s')) ay += 1;
    
    ax += this.dstate.ax;
    ay += this.dstate.ay;
    
    this.player.move(ax, ay, this.maze, audioManager);
  }

  render() {
    this.maze.draw(this.ctx, this.exit);
    this.player.draw(this.ctx);
    
    // 출구 화살표
    this.ctx.fillStyle = 'rgba(255,255,255,.25)';
    this.ctx.fillRect(this.exit[0] * this.maze.TILE + this.maze.TILE / 2 - 6, 4, 12, 2);
    this.ctx.fillRect(this.exit[0] * this.maze.TILE + this.maze.TILE / 2 - 1, 2, 2, 2);
  }

  gameLoop() {
    this.update();
    this.render();
    requestAnimationFrame(() => this.gameLoop());
  }
}

// 게임 시작
window.addEventListener('load', () => {
  new Game();
});
