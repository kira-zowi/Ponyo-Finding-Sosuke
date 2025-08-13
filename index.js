// =====================
// Game Board
// =====================
let board;
let boardWidth = 500;
let boardHeight = 650;
let context;

// =====================
// Ponyo Character
// =====================
let ponyoWidth = 90;
let ponyoHeight = 90;
let ponyoX = boardWidth / 2 - ponyoWidth / 2;
let ponyoY = boardHeight * 7 / 8 - ponyoHeight;
let ponyoRightImg;
let ponyoLeftImg;

let ponyo = {
    img: null,
    x: ponyoX,
    y: ponyoY,
    width: ponyoWidth,
    height: ponyoHeight
};

// =====================
// Physics
// =====================
let velocityX = 0;
let velocityY = 0;
let initialVelocityY = -8;
let gravity = 0.4;

// =====================
// Platforms
// =====================
let platformArray = [];
let platformWidth = 60;
let platformHeight = 18;
let platformImg;

// =====================
// Score & Game State
// =====================
let score = 0;
let maxScore = 0;
let gameOver = false;

// =====================
// Touch Controls
// =====================
let touchStartX = 0;

// =====================
// Window Load
// =====================
window.onload = function () {
    board = document.getElementById('board');
    board.width = boardWidth;
    board.height = boardHeight;
    context = board.getContext("2d");

    // Load images
    ponyoLeftImg = new Image();
    ponyoLeftImg.src = "./ponyo_left.png";
    ponyo.img = ponyoLeftImg;

    ponyoRightImg = new Image();
    ponyoRightImg.src = "./ponyo_right.png";

    platformImg = new Image();
    platformImg.src = "./green_platform.png";

    velocityY = initialVelocityY;

    placePlatforms();

    requestAnimationFrame(update);
    document.addEventListener("keydown", movePonyo);

    board.addEventListener('touchstart', handleTouchStart, false);
    board.addEventListener('touchend', handleTouchEnd, false);
};

// =====================
// Game Update Loop
// =====================
function update() {
    requestAnimationFrame(update);

    if (gameOver) {
        document.getElementById('game-over-msg').classList.remove('d-none');
        return;
    }

    context.clearRect(0, 0, board.width, board.height);

    // Move Ponyo
    ponyo.x += velocityX;
    if (ponyo.x > boardWidth) ponyo.x = 0;
    else if (ponyo.x + ponyo.width < 0) ponyo.x = boardWidth;

    velocityY += gravity;
    ponyo.y += velocityY;

    if (ponyo.y > board.height) {
        gameOver = true;
        document.getElementById('game-over-msg').classList.remove('d-none');
    }

    // Draw Ponyo
    context.drawImage(ponyo.img, ponyo.x, ponyo.y, ponyo.width, ponyo.height);

    // Draw Platforms
    for (let i = 0; i < platformArray.length; i++) {
        let platform = platformArray[i];
        if (velocityY < 0 && ponyo.y < boardHeight * 3 / 4) {
            platform.y -= initialVelocityY;
        }
        if (detectCollision(ponyo, platform) && velocityY >= 0) {
            velocityY = initialVelocityY;
        }
        context.drawImage(platform.img, platform.x, platform.y, platform.width, platform.height);
    }

    // Remove old platforms and add new ones
    while (platformArray.length > 0 && platformArray[0].y >= boardHeight) {
        platformArray.shift();
        newPlatform();
    }

    // Update Score
    updateScore();
    document.getElementById('score-display').textContent = "Score: " + score;
}

// =====================
// Player Controls
// =====================
function movePonyo(e) {
    if (e.code == "ArrowRight" || e.code == "KeyD") {
        velocityX = 4;
        ponyo.img = ponyoRightImg;
    } else if (e.code == "ArrowLeft" || e.code == "KeyA") {
        velocityX = -4;
        ponyo.img = ponyoLeftImg;
    } else if (e.code == "Space" && gameOver) {
        restartGame();
    }
}

// =====================
// Platform Management
// =====================
function placePlatforms() {
    platformArray = [];

    // Initial Platform
    platformArray.push({
        img: platformImg,
        x: boardWidth / 2,
        y: boardHeight - 50,
        width: platformWidth,
        height: platformHeight
    });

    // Random Platforms
    for (let i = 0; i < 6; i++) {
        let randomX = Math.floor(Math.random() * boardWidth * 3 / 4);
        platformArray.push({
            img: platformImg,
            x: randomX,
            y: boardHeight - 75 * i - 150,
            width: platformWidth,
            height: platformHeight
        });
    }
}

function newPlatform() {
    let randomX = Math.floor(Math.random() * boardWidth * 3 / 4);
    platformArray.push({
        img: platformImg,
        x: randomX,
        y: -platformHeight,
        width: platformWidth,
        height: platformHeight
    });
}

// =====================
// Collision Detection
// =====================
function detectCollision(a, b) {
    return a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y;
}

// =====================
// Score Management
// =====================
function updateScore() {
    let points = Math.floor(50 * Math.random());
    if (velocityY < 0) {
        maxScore += points;
        if (score < maxScore) score = maxScore;
    } else if (velocityY >= 0) {
        maxScore -= points;
    }
}

// =====================
// Touch Controls
// =====================
function handleTouchStart(event) {
    if (event.touches.length === 1) {
        touchStartX = event.touches[0].pageX;
    }
}

function handleTouchEnd(event) {
    if (event.changedTouches.length === 1) {
        let touchEndX = event.changedTouches[0].pageX;
        let touchDiff = touchEndX - touchStartX;

        if (touchDiff > 0) {
            velocityX = 4;
            ponyo.img = ponyoRightImg;
        } else if (touchDiff < 0) {
            velocityX = -4;
            ponyo.img = ponyoLeftImg;
        }
    }
    event.preventDefault();
}

// =====================
// Restart Game
// =====================
function restartGame() {
    ponyo.x = ponyoX;
    ponyo.y = ponyoY;
    ponyo.img = ponyoRightImg;
    velocityX = 0;
    velocityY = initialVelocityY;
    score = 0;
    maxScore = 0;
    gameOver = false;
    document.getElementById('game-over-msg').classList.add('d-none');
    placePlatforms();
}
