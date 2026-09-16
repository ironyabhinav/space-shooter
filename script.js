var canvas = document.getElementById("gameCanvas");
var ctx = canvas.getContext("2d");

var scoreBox = document.getElementById("score");
var highScoreBox = document.getElementById("highScore");
var pauseScreen = document.getElementById("pauseScreen");
var gameOverScreen = document.getElementById("gameOverScreen");
var finalScore = document.getElementById("finalScore");
var restart = document.getElementById("restart");

var score = 0;
var highScore = Number(localStorage.getItem("spaceShooterHighScore")) || 0;

var paused = false;
var gameOver = false;

var keys = {};
var bullets = [];
var enemies = [];

var player = {
    x: 0,
    y: 0,
    width: 42,
    height: 30,
    speed: 420
};

var enemySpawnTime = 0;
var lastTime = 0;

function resize() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    player.x = (canvas.width - player.width) / 2;
    player.y = canvas.height - 55;
}

function createEnemy() {
    enemies.push({
        x: Math.random() * (canvas.width - 36),
        y: -30,
        width: 36,
        height: 26,
        speed: 110 + Math.random() * 70
    });
}

function shoot() {
    if (gameOver || paused) return;

    bullets.push({
        x: player.x + player.width / 2 - 2,
        y: player.y - 12,
        width: 4,
        height: 14,
        speed: 650
    });
}

function collision(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

function update(deltaTime) {
    if (keys["ArrowLeft"] || keys["a"] || keys["A"]) {
        player.x -= player.speed * deltaTime;
    }

    if (keys["ArrowRight"] || keys["d"] || keys["D"]) {
        player.x += player.speed * deltaTime;
    }

    if (player.x < 0) {
        player.x = 0;
    }

    if (player.x + player.width > canvas.width) {
        player.x = canvas.width - player.width;
    }

    for (var i = bullets.length - 1; i >= 0; i--) {
        bullets[i].y -= bullets[i].speed * deltaTime;

        if (bullets[i].y < -20) {
            bullets.splice(i, 1);
        }
    }

    enemySpawnTime += deltaTime;

    if (enemySpawnTime >= 0.75) {
        createEnemy();
        enemySpawnTime = 0;
    }

    for (var i = enemies.length - 1; i >= 0; i--) {
        enemies[i].y += enemies[i].speed * deltaTime;

        if (collision(player, enemies[i])) {
            endGame();
            return;
        }

        if (enemies[i].y > canvas.height) {
            enemies.splice(i, 1);
        }
    }

    checkHits();
}

function checkHits() {
    for (var i = enemies.length - 1; i >= 0; i--) {
        for (var j = bullets.length - 1; j >= 0; j--) {

            if (collision(bullets[j], enemies[i])) {
                enemies.splice(i, 1);
                bullets.splice(j, 1);

                score += 10;

                scoreBox.textContent = String(score).padStart(4, "0");

                if (score > highScore) {
                    highScore = score;

                    highScoreBox.textContent =
                        String(highScore).padStart(4, "0");

                    localStorage.setItem(
                        "spaceShooterHighScore",
                        highScore
                    );
                }

                break;
            }
        }
    }
}

function drawPlayer() {
    ctx.fillStyle = "#4edcff";

    ctx.beginPath();
    ctx.moveTo(player.x + 21, player.y);
    ctx.lineTo(player.x, player.y + 30);
    ctx.lineTo(player.x + 42, player.y + 30);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#071018";
    ctx.fillRect(
        player.x + 17,
        player.y + 15,
        8,
        7
    );
}

function drawBullets() {
    ctx.fillStyle = "#ffffff";

    for (var i = 0; i < bullets.length; i++) {
        ctx.fillRect(
            bullets[i].x,
            bullets[i].y,
            bullets[i].width,
            bullets[i].height
        );
    }
}

function drawEnemies() {
    for (var i = 0; i < enemies.length; i++) {
        var e = enemies[i];

        ctx.fillStyle = "#ff5278";

        ctx.fillRect(
            e.x + 5,
            e.y + 4,
            26,
            18
        );

        ctx.fillRect(
            e.x,
            e.y + 10,
            5,
            8
        );

        ctx.fillRect(
            e.x + 31,
            e.y + 10,
            5,
            8
        );

        ctx.fillStyle = "#03050a";

        ctx.fillRect(
            e.x + 10,
            e.y + 9,
            4,
            4
        );

        ctx.fillRect(
            e.x + 22,
            e.y + 9,
            4,
            4
        );
    }
}

function draw() {
    ctx.fillStyle = "#000";
    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    drawBullets();
    drawEnemies();
    drawPlayer();
}

function endGame() {
    gameOver = true;
    paused = false;

    bullets = [];
    enemies = [];

    finalScore.textContent =
        String(score).padStart(4, "0");

    gameOverScreen.style.display = "flex";
    pauseScreen.style.display = "none";
}

function togglePause() {
    if (gameOver) return;

    paused = !paused;

    if (paused) {
        pauseScreen.style.display = "flex";
    } else {
        pauseScreen.style.display = "none";
    }
}

function resetGame() {
    score = 0;
    bullets = [];
    enemies = [];
    enemySpawnTime = 0;

    paused = false;
    gameOver = false;

    scoreBox.textContent = "0000";

    pauseScreen.style.display = "none";
    gameOverScreen.style.display = "none";

    player.x = (canvas.width - player.width) / 2;
    player.y = canvas.height - 55;
}

document.addEventListener("keydown", function(e) {

    if (e.key === "Enter") {
        e.preventDefault();

        if (!e.repeat) {
            togglePause();
        }

        return;
    }

    if (e.code === "Space") {
        e.preventDefault();

        if (!e.repeat) {
            shoot();
        }

        return;
    }

    keys[e.key] = true;
});

document.addEventListener("keyup", function(e) {
    keys[e.key] = false;
});

restart.addEventListener("click", function() {
    resetGame();
});

window.addEventListener("resize", function() {
    resize();
});

resize();

highScoreBox.textContent =
    String(highScore).padStart(4, "0");

function gameLoop(timestamp) {

    if (!lastTime) {
        lastTime = timestamp;
    }

    var deltaTime =
        (timestamp - lastTime) / 1000;

    lastTime = timestamp;

    if (deltaTime > 0.05) {
        deltaTime = 0.05;
    }

    if (!paused && !gameOver) {
        update(deltaTime);
    }

    draw();

    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);