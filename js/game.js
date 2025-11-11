class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.minimap = document.getElementById('minimap');
        this.minimapCtx = this.minimap.getContext('2d');
        
        this.mazeWidth = 31; // 홀수로 설정
        this.mazeHeight = 21;
        this.cellSize = 32;
        
        this.maze = new Maze(this.mazeWidth, this.mazeHeight, this.cellSize);
        this.player = new Player(1, 1, this.maze);
        
        this.setupCanvas();
        this.setupControls();
        this.gameLoop();
    }

    setupCanvas() {
        this.canvas.width = this.mazeWidth * this.cellSize;
        this.canvas.height = this.mazeHeight * this.cellSize;
        this.minimap.width = 200;
        this.minimap.height = 150;
    }

    setupControls() {
        document.addEventListener('keydown', (e) => {
            let moved = false;
            switch(e.key) {
                case 'ArrowUp':
                    moved = this.player.move(0, -1);
                    break;
                case 'ArrowDown':
                    moved = this.player.move(0, 1);
                    break;
                case 'ArrowLeft':
                    moved = this.player.move(-1, 0);
                    break;
                case 'ArrowRight':
                    moved = this.player.move(1, 0);
                    break;
            }
            if (moved) {
                this.updateUI();
            }
        });
    }

    updateUI() {
        document.getElementById('playerPos').textContent = 
            `X:${this.player.x} Y:${this.player.y}`;
        document.getElementById('moveCount').textContent = this.player.moveCount;
    }

    drawMinimap() {
        const scale = 5;
        this.minimapCtx.fillStyle = '#000';
        this.minimapCtx.fillRect(0, 0, this.minimap.width, this.minimap.height);

        for (let y = 0; y < this.mazeHeight; y++) {
            for (let x = 0; x < this.mazeWidth; x++) {
                this.minimapCtx.fillStyle = this.maze.isWall(x, y) ? '#444' : '#2a2a3a';
                this.minimapCtx.fillRect(x * scale, y * scale, scale, scale);
            }
        }

        // 플레이어 위치 표시
        this.minimapCtx.fillStyle = '#ff0';
        this.minimapCtx.fillRect(
            this.player.x * scale, 
            this.player.y * scale, 
            scale, 
            scale
        );
    }

    gameLoop() {
        // 미로 그리기
        this.maze.draw(this.ctx);
        
        // 플레이어 그리기
        this.player.draw(this.ctx, this.cellSize);
        
        // 미니맵 업데이트
        this.drawMinimap();
        
        requestAnimationFrame(() => this.gameLoop());
    }
}

// 게임 시작
window.addEventListener('load', () => {
    new Game();
});
