/**
 * 2048 遊戲邏輯
 * 面試展示用小程式
 */

class Game2048 {
    constructor() {
        this.size = 4;
        this.grid = [];
        this.score = 0;
        this.bestScore = parseInt(localStorage.getItem('bestScore')) || 0;
        this.gameWon = false;
        this.gameOver = false;
        
        this.tileContainer = document.getElementById('tile-container');
        this.scoreDisplay = document.getElementById('score');
        this.bestScoreDisplay = document.getElementById('best-score');
        this.gameMessage = document.getElementById('game-message');
        this.newGameBtn = document.getElementById('new-game');
        this.retryBtn = document.querySelector('.retry-btn');
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.startNewGame();
    }
    
    setupEventListeners() {
        // 鍵盤事件
        document.addEventListener('keydown', (e) => this.handleKeydown(e));
        
        // 新遊戲按鈕
        this.newGameBtn.addEventListener('click', () => this.startNewGame());
        this.retryBtn.addEventListener('click', () => this.startNewGame());
        
        // 觸控事件
        let touchStartX, touchStartY;
        
        this.tileContainer.parentElement.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        }, { passive: true });
        
        this.tileContainer.parentElement.addEventListener('touchend', (e) => {
            if (!touchStartX || !touchStartY) return;
            
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            
            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;
            
            const minSwipeDistance = 50;
            
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                if (Math.abs(deltaX) > minSwipeDistance) {
                    if (deltaX > 0) {
                        this.move('right');
                    } else {
                        this.move('left');
                    }
                }
            } else {
                if (Math.abs(deltaY) > minSwipeDistance) {
                    if (deltaY > 0) {
                        this.move('down');
                    } else {
                        this.move('up');
                    }
                }
            }
            
            touchStartX = null;
            touchStartY = null;
        }, { passive: true });
    }
    
    handleKeydown(e) {
        if (this.gameOver && !this.gameWon) return;
        
        const keyMap = {
            'ArrowUp': 'up',
            'ArrowDown': 'down',
            'ArrowLeft': 'left',
            'ArrowRight': 'right',
            'w': 'up',
            'W': 'up',
            's': 'down',
            'S': 'down',
            'a': 'left',
            'A': 'left',
            'd': 'right',
            'D': 'right'
        };
        
        const direction = keyMap[e.key];
        if (direction) {
            e.preventDefault();
            this.move(direction);
        }
    }
    
    startNewGame() {
        this.grid = Array(this.size).fill(null).map(() => Array(this.size).fill(0));
        this.score = 0;
        this.gameWon = false;
        this.gameOver = false;
        
        this.hideMessage();
        this.updateScore();
        this.updateBestScore();
        
        // 初始添加兩個方塊
        this.addRandomTile();
        this.addRandomTile();
        
        this.render();
    }
    
    addRandomTile() {
        const emptyCells = [];
        
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                if (this.grid[r][c] === 0) {
                    emptyCells.push({ row: r, col: c });
                }
            }
        }
        
        if (emptyCells.length > 0) {
            const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            // 90% 機率出現 2，10% 機率出現 4
            this.grid[randomCell.row][randomCell.col] = Math.random() < 0.9 ? 2 : 4;
            return randomCell;
        }
        
        return null;
    }
    
    move(direction) {
        if (this.gameOver && !this.gameWon) return;
        
        const previousGrid = this.grid.map(row => [...row]);
        let moved = false;
        
        switch (direction) {
            case 'up':
                moved = this.moveUp();
                break;
            case 'down':
                moved = this.moveDown();
                break;
            case 'left':
                moved = this.moveLeft();
                break;
            case 'right':
                moved = this.moveRight();
                break;
        }
        
        if (moved) {
            const newTile = this.addRandomTile();
            this.render(newTile);
            this.updateScore();
            
            if (this.checkWin() && !this.gameWon) {
                this.gameWon = true;
                this.showMessage('恭喜獲勝！', 'game-won');
            } else if (this.checkGameOver()) {
                this.gameOver = true;
                this.showMessage('遊戲結束', 'game-over');
            }
        }
    }
    
    moveLeft() {
        let moved = false;
        
        for (let r = 0; r < this.size; r++) {
            const row = this.grid[r].filter(val => val !== 0);
            const merged = [];
            
            for (let i = 0; i < row.length; i++) {
                if (i < row.length - 1 && row[i] === row[i + 1]) {
                    merged.push(row[i] * 2);
                    this.score += row[i] * 2;
                    i++;
                } else {
                    merged.push(row[i]);
                }
            }
            
            while (merged.length < this.size) {
                merged.push(0);
            }
            
            if (JSON.stringify(this.grid[r]) !== JSON.stringify(merged)) {
                moved = true;
            }
            
            this.grid[r] = merged;
        }
        
        return moved;
    }
    
    moveRight() {
        let moved = false;
        
        for (let r = 0; r < this.size; r++) {
            const row = this.grid[r].filter(val => val !== 0);
            const merged = [];
            
            for (let i = row.length - 1; i >= 0; i--) {
                if (i > 0 && row[i] === row[i - 1]) {
                    merged.unshift(row[i] * 2);
                    this.score += row[i] * 2;
                    i--;
                } else {
                    merged.unshift(row[i]);
                }
            }
            
            while (merged.length < this.size) {
                merged.unshift(0);
            }
            
            if (JSON.stringify(this.grid[r]) !== JSON.stringify(merged)) {
                moved = true;
            }
            
            this.grid[r] = merged;
        }
        
        return moved;
    }
    
    moveUp() {
        let moved = false;
        
        for (let c = 0; c < this.size; c++) {
            const column = [];
            for (let r = 0; r < this.size; r++) {
                if (this.grid[r][c] !== 0) {
                    column.push(this.grid[r][c]);
                }
            }
            
            const merged = [];
            for (let i = 0; i < column.length; i++) {
                if (i < column.length - 1 && column[i] === column[i + 1]) {
                    merged.push(column[i] * 2);
                    this.score += column[i] * 2;
                    i++;
                } else {
                    merged.push(column[i]);
                }
            }
            
            while (merged.length < this.size) {
                merged.push(0);
            }
            
            for (let r = 0; r < this.size; r++) {
                if (this.grid[r][c] !== merged[r]) {
                    moved = true;
                }
                this.grid[r][c] = merged[r];
            }
        }
        
        return moved;
    }
    
    moveDown() {
        let moved = false;
        
        for (let c = 0; c < this.size; c++) {
            const column = [];
            for (let r = 0; r < this.size; r++) {
                if (this.grid[r][c] !== 0) {
                    column.push(this.grid[r][c]);
                }
            }
            
            const merged = [];
            for (let i = column.length - 1; i >= 0; i--) {
                if (i > 0 && column[i] === column[i - 1]) {
                    merged.unshift(column[i] * 2);
                    this.score += column[i] * 2;
                    i--;
                } else {
                    merged.unshift(column[i]);
                }
            }
            
            while (merged.length < this.size) {
                merged.unshift(0);
            }
            
            for (let r = 0; r < this.size; r++) {
                if (this.grid[r][c] !== merged[r]) {
                    moved = true;
                }
                this.grid[r][c] = merged[r];
            }
        }
        
        return moved;
    }
    
    checkWin() {
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                if (this.grid[r][c] === 2048) {
                    return true;
                }
            }
        }
        return false;
    }
    
    checkGameOver() {
        // 檢查是否有空格
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                if (this.grid[r][c] === 0) {
                    return false;
                }
            }
        }
        
        // 檢查是否有相鄰的相同數字
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                const current = this.grid[r][c];
                
                // 檢查右邊
                if (c < this.size - 1 && this.grid[r][c + 1] === current) {
                    return false;
                }
                
                // 檢查下面
                if (r < this.size - 1 && this.grid[r + 1][c] === current) {
                    return false;
                }
            }
        }
        
        return true;
    }
    
    render(newTilePos = null) {
        this.tileContainer.innerHTML = '';
        
        const containerRect = this.tileContainer.getBoundingClientRect();
        const gap = 12;
        const cellSize = (containerRect.width - gap * 3) / 4;
        
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                const value = this.grid[r][c];
                if (value !== 0) {
                    const tile = document.createElement('div');
                    tile.className = `tile tile-${value > 2048 ? 'super' : value}`;
                    
                    if (newTilePos && newTilePos.row === r && newTilePos.col === c) {
                        tile.classList.add('tile-new');
                    }
                    
                    tile.textContent = value;
                    
                    tile.style.width = `${cellSize}px`;
                    tile.style.height = `${cellSize}px`;
                    tile.style.left = `${c * (cellSize + gap)}px`;
                    tile.style.top = `${r * (cellSize + gap)}px`;
                    
                    this.tileContainer.appendChild(tile);
                }
            }
        }
    }
    
    updateScore() {
        this.scoreDisplay.textContent = this.score;
        
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem('bestScore', this.bestScore);
            this.updateBestScore();
        }
    }
    
    updateBestScore() {
        this.bestScoreDisplay.textContent = this.bestScore;
    }
    
    showMessage(text, className) {
        this.gameMessage.querySelector('p').textContent = text;
        this.gameMessage.className = `game-message active ${className}`;
    }
    
    hideMessage() {
        this.gameMessage.className = 'game-message';
    }
}

// 視窗調整時重新渲染
window.addEventListener('resize', () => {
    if (window.game) {
        window.game.render();
    }
});

// 初始化遊戲
document.addEventListener('DOMContentLoaded', () => {
    window.game = new Game2048();
});

