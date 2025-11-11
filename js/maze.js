class Player {
    constructor(x, y, maze) {
        this.x = x;
        this.y = y;
        this.maze = maze;
        this.moveCount = 0;
        this.name = "탐험가";
        
        // 픽셀 캐릭터 색상 데이터 (8x8 그리드)
        this.pixelData = [
            [0,0,1,1,1,1,0,0],
            [0,1,1,1,1,1,1,0],
            [0,0,1,2,2,1,0,0],
            [0,0,0,2,2,0,0,0],
            [0,0,1,1,1,1,0,0],
            [0,1,1,0,0,1,1,0],
            [1,1,0,0,0,0,1,1],
            [1,0,0,0,0,0,0,1]
        ];
        this.colors = ['transparent', '#ff6b6b', '#333']; // 0:투명, 1:피부, 2:머리카락
    }

    move(dx, dy) {
        const newX = this.x + dx;
        const newY = this.y + dy;

        if (!this.maze.isWall(newX, newY)) {
            this.x = newX;
            this.y = newY;
            this.moveCount++;
            return true;
        }
        return false;
    }

    draw(ctx, cellSize) {
        const pixelSize = cellSize / 8;
        const offsetX = this.x * cellSize;
        const offsetY = this.y * cellSize;

        // 픽셀 단위로 캐릭터 그리기
        for (let py = 0; py < 8; py++) {
            for (let px = 0; px < 8; px++) {
                const colorIndex = this.pixelData[py][px];
                if (colorIndex !== 0) {
                    ctx.fillStyle = this.colors[colorIndex];
                    ctx.fillRect(
                        offsetX + px * pixelSize,
                        offsetY + py * pixelSize,
                        pixelSize,
                        pixelSize
                    );
                }
            }
        }

        // 캐릭터 주위에 강조 효과
        ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)';
        ctx.lineWidth = 2;
        ctx.strokeRect(offsetX + 1, offsetY + 1, cellSize - 2, cellSize - 2);
    }
}
