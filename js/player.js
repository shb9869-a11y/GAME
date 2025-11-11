class Player {
  constructor(startPos, tileSize) {
    this.x = startPos[0] * tileSize + (tileSize >> 1);
    this.y = startPos[1] * tileSize + (tileSize >> 1);
    this.spd = 2.2;
    this.size = 0.9;
    this.lastStepX = this.x;
    this.lastStepY = this.y;
    this.stepAcc = 0;
    this.STEP_DIST = 10;
    
    this.colors = {
      fill: '#ffffff',
      edge: '#111',
      shadow: 'rgba(0,0,0,.55)'
    };
  }

  move(ax, ay, maze, audioManager) {
    let moved = false;
    const m = Math.hypot(ax, ay) || 1;
    ax /= m; ay /= m;
    
    const nx = this.x + ax * this.spd;
    const ny = this.y + ay * this.spd;
    
    if (maze.isOpen(nx, this.y)) {
      this.x = nx;
      moved = true;
    }
    if (maze.isOpen(this.x, ny)) {
      this.y = ny;
      moved = true;
    }
    
    if (moved) {
      const dx = this.x - this.lastStepX;
      const dy = this.y - this.lastStepY;
      this.stepAcc += Math.hypot(dx, dy);
      
      if (this.stepAcc >= this.STEP_DIST) {
        audioManager.footstep();
        this.stepAcc = 0;
      }
      
      this.lastStepX = this.x;
      this.lastStepY = this.y;
    }
  }

  draw(ctx) {
    const s = this.size;
    const px = this.x;
    const py = this.y;
    
    // 그림자
    ctx.fillStyle = this.colors.shadow;
    ctx.fillRect(px - 6 * s, py + 6 * s, 12 * s, 3 * s);
    
    // 몸체
    ctx.fillStyle = this.colors.fill;
    ctx.fillRect(px - 6 * s, py - 10 * s, 12 * s, 10 * s);
    ctx.fillRect(px - 5 * s, py - 16 * s, 10 * s, 6 * s);
    
    // 테두리
    ctx.fillStyle = this.colors.edge;
    ctx.fillRect(px - 6 * s, py - 10 * s, 12 * s, 1 * s);
    ctx.fillRect(px - 6 * s, py - 1 * s, 12 * s, 1 * s);
    ctx.fillRect(px - 6 * s, py - 10 * s, 1 * s, 10 * s);
    ctx.fillRect(px + 5 * s, py - 10 * s, 1 * s, 10 * s);
    ctx.fillRect(px - 5 * s, py - 16 * s, 10 * s, 1 * s);
    ctx.fillRect(px - 5 * s, py - 10 * s, 10 * s, 1 * s);
    ctx.fillRect(px - 5 * s, py - 16 * s, 1 * s, 6 * s);
    ctx.fillRect(px + 4 * s, py - 16 * s, 1 * s, 6 * s);
  }
}
