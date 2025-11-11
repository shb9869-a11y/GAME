class Maze {
  constructor(seed = 2025) {
    this.W = 960;
    this.H = 540;
    this.TILE = 16;
    this.COLS = (this.W / this.TILE) | 0;
    this.ROWS = (this.H / this.TILE) | 0;
    this.WALL = 1;
    this.OPEN = 0;
    
    this.SEED = seed;
    this.grid = Array.from({ length: this.ROWS }, () => Array(this.COLS).fill(this.WALL));
    
    this.colors = {
      grassD: '#0b0f0b', grassM: '#171f17', grassH: '#293329',
      path: '#cfd6d9', edgeTop: '#f5f9fb', edgeBot: '#4a5053',
      exitMark: 'rgba(255,255,255,.14)'
    };
    
    this.generate();
  }

  rnd() {
    this.SEED = (this.SEED * 1664525 + 1013904223) >>> 0;
    return this.SEED / 0xFFFFFFFF;
  }

  generate() {
    const startX = ((this.COLS / 2) | 0) | 1;
    const startY = this.ROWS - 3;
    const stack = [[startX, startY]];
    this.grid[startY][startX] = this.OPEN;
    
    const dirs = [[2, 0], [-2, 0], [0, 2], [0, -2]];
    
    while (stack.length) {
      const [x, y] = stack[stack.length - 1];
      const cand = dirs.map(d => [x + d[0], y + d[1]])
        .filter(([nx, ny]) => 
          nx > 1 && ny > 1 && nx < this.COLS - 1 && ny < this.ROWS - 1 && 
          this.grid[ny][nx] === this.WALL
        );
      
      if (!cand.length) {
        stack.pop();
        continue;
      }
      
      const [nx, ny] = cand[(this.rnd() * cand.length) | 0];
      this.grid[(y + ny) / 2][(x + nx) / 2] = this.OPEN;
      this.grid[ny][nx] = this.OPEN;
      stack.push([nx, ny]);
    }

    // 중앙 직통 코어
    for (let y = startY; y >= 1; y--) {
      this.grid[y][startX] = this.OPEN;
    }
    
    return { start: [startX, startY], exit: [startX, 0] };
  }

  prng(n) {
    n = (n << 13) ^ n;
    return (1 - ((n * (n * n * 15731 + 789221) + 1376312589) & 0x7fffffff) / 1073741824.0);
  }

  draw(ctx, exitPos) {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, this.W, this.H);
    
    for (let ty = 0; ty < this.ROWS; ty++) {
      for (let tx = 0; tx < this.COLS; tx++) {
        const x = tx * this.TILE;
        const y = ty * this.TILE;
        
        if (this.grid[ty][tx] === this.OPEN) {
          ctx.fillStyle = this.colors.path;
          ctx.fillRect(x, y, this.TILE, this.TILE);
          ctx.fillStyle = this.colors.edgeTop;
          ctx.fillRect(x, y, this.TILE, 1);
          ctx.fillStyle = this.colors.edgeBot;
          ctx.fillRect(x, y + this.TILE - 1, this.TILE, 1);
        } else {
          const r = Math.abs(this.prng(tx * 73856093 ^ ty * 19349663));
          ctx.fillStyle = r < 0.33 ? this.colors.grassD : 
                         r < 0.66 ? this.colors.grassM : this.colors.grassH;
          const cx = x + (this.TILE >> 1);
          const cy = y + (this.TILE >> 1);
          
          // 귀여운 풀 잎사귀
          ctx.fillRect(cx - 1, cy - 4, 2, 5);
          ctx.fillRect(cx - 4, cy - 1, 2, 3);
          ctx.fillRect(cx + 2, cy - 1, 2, 3);
          if (r > 0.7) ctx.fillRect(cx - 6, cy + 4, 1, 1);
          if (r < 0.25) ctx.fillRect(cx + 5, cy + 3, 1, 1);
        }
      }
    }
    
    // 출구 표시
    if (exitPos) {
      ctx.fillStyle = this.colors.exitMark;
      ctx.fillRect(exitPos[0] * this.TILE, 0, this.TILE, this.TILE);
    }
  }

  isOpen(x, y) {
    const tx = (x / this.TILE) | 0;
    const ty = (y / this.TILE) | 0;
    if (tx < 0 || ty < 0 || tx >= this.COLS || ty >= this.ROWS) return false;
    return this.grid[ty][tx] === this.OPEN;
  }
}
