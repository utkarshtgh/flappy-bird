const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

// Game constants
const GRAVITY = 0.5;
const FLAP_SPEED = -8;
const PIPE_SPEED = 2;
const PIPE_SPAWN_INTERVAL = 1500;
const PIPE_GAP = 150;

// Game state
let score = 0;
let gameOver = false;

// Bird object
const bird = {
    x: 50,
    y: canvas.height / 2,
    velocity: 0,
    width: 30,
    height: 30,
    
    flap() {
        this.velocity = FLAP_SPEED;
    },
    
    update() {
        this.velocity += GRAVITY;
        this.y += this.velocity;
        
        // Ground collision
        if (this.y + this.height > canvas.height) {
            this.y = canvas.height - this.height;
            gameOver = true;
        }
        
        // Ceiling collision
        if (this.y < 0) {
            this.y = 0;
            this.velocity = 0;
        }
    },
    
    draw() {
        ctx.fillStyle = '#f4d03f';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
};

// Pipe class
class Pipe {
    constructor() {
        this.width = 50;
        this.x = canvas.width;
        this.gap = PIPE_GAP;
        this.topHeight = Math.random() * (canvas.height - this.gap - 100) + 50;
        this.bottomY = this.topHeight + this.gap;
    }
    
    update() {
        this.x -= PIPE_SPEED;
    }
    
    draw() {
        ctx.fillStyle = '#2ecc71';
        // Top pipe
        ctx.fillRect(this.x, 0, this.width, this.topHeight);
        // Bottom pipe
        ctx.fillRect(this.x, this.bottomY, this.width, canvas.height - this.bottomY);
    }
    
    checkCollision(bird) {
        // Check collision with top pipe
        if (bird.x + bird.width > this.x && 
            bird.x < this.x + this.width && 
            bird.y < this.topHeight) {
            return true;
        }
        
        // Check collision with bottom pipe
        if (bird.x + bird.width > this.x && 
            bird.x < this.x + this.width && 
            bird.y + bird.height > this.bottomY) {
            return true;
        }
        
        return false;
    }
}

// Game objects
let pipes = [];
let lastPipeSpawn = 0;

// Event listeners
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        if (gameOver) {
            resetGame();
        } else {
            bird.flap();
        }
    }
});

// Game functions
function resetGame() {
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    pipes = [];
    score = 0;
    gameOver = false;
    scoreElement.textContent = `Score: ${score}`;
}

function update() {
    if (gameOver) return;
    
    bird.update();
    
    // Spawn pipes
    const currentTime = Date.now();
    if (currentTime - lastPipeSpawn > PIPE_SPAWN_INTERVAL) {
        pipes.push(new Pipe());
        lastPipeSpawn = currentTime;
    }
    
    // Update pipes
    pipes.forEach((pipe, index) => {
        pipe.update();
        
        // Check collision
        if (pipe.checkCollision(bird)) {
            gameOver = true;
        }
        
        // Score point
        if (pipe.x + pipe.width < bird.x && !pipe.passed) {
            pipe.passed = true;
            score++;
            scoreElement.textContent = `Score: ${score}`;
        }
        
        // Remove off-screen pipes
        if (pipe.x + pipe.width < 0) {
            pipes.splice(index, 1);
        }
    });
}

function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw game objects
    bird.draw();
    pipes.forEach(pipe => pipe.draw());
    
    // Draw game over message
    if (gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = 'white';
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2);
        ctx.font = '20px Arial';
        ctx.fillText('Press Space to Restart', canvas.width / 2, canvas.height / 2 + 40);
    }
}

// Game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop(); 