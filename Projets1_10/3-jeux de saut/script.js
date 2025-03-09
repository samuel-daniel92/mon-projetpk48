const bird = document.getElementById("bird");
const obstaclesContainer = document.getElementById("obstacles");
const scoreElement = document.getElementById("score");
const levelElement = document.getElementById("level");
const highScoreElement = document.getElementById("high-score");
const bestPlayerElement = document.getElementById("best-player");
const finalScoreElement = document.getElementById("final-score");
const finalLevelElement = document.getElementById("final-level");
const startScreen = document.querySelector(".start-screen");
const gameOverScreen = document.querySelector(".game-over-screen");
const restartButton = document.getElementById("restart");
const jumpButton = document.getElementById("jump-button");
const playerNameInput = document.getElementById("player-name");
const topScoresList = document.getElementById("top-scores-list");
const startButton = document.getElementById("start-button");

let birdY = window.innerHeight / 2 - 20; // Position initiale au centre de l’écran
let velocity = 0;
let gravity = 0.5;
let gameStarted = false;
let gameOver = false;
let score = 0;
let level = 1;
let obstacleSpeed = 2;
let obstacles = [];
let timeElapsed = 0;
let topScores = JSON.parse(localStorage.getItem("topScores")) || [
    { score: 0, player: "Inconnu" },
    { score: 0, player: "Inconnu" },
    { score: 0, player: "Inconnu" }
];

const birdHeight = 40;
const gameHeight = window.innerHeight - 100; // Hauteur du jeu moins le sol
const scorePerLevel = 10;

// Initialiser l’affichage des meilleurs scores
updateTopScoresDisplay();

// Mettre à jour l’affichage des meilleurs scores
function updateTopScoresDisplay() {
    topScoresList.innerHTML = "";
    topScores.forEach((entry, index) => {
        const li = document.createElement("li");
        li.textContent = `${index + 1}. ${entry.player}: ${entry.score}`;
        topScoresList.appendChild(li);
    });
    highScoreElement.textContent = topScores[0].score;
    bestPlayerElement.textContent = topScores[0].player;
}

// Démarrer le jeu avec le bouton "Commencer"
startButton.addEventListener("click", () => {
    if (!gameStarted && !gameOver) {
        startGame();
    }
});

// Sauter avec Espace ou le bouton de saut
document.addEventListener("keydown", (e) => {
    if (e.code === "Space" && gameStarted && !gameOver) {
        jump();
    }
});

jumpButton.addEventListener("click", () => {
    if (!gameStarted && !gameOver) {
        startGame();
    } else if (gameStarted && !gameOver) {
        jump();
    }
});

function startGame() {
    // Réinitialiser les variables au démarrage
    birdY = window.innerHeight / 2 - 20; // Centrer l’oiseau
    velocity = 0;
    score = 0;
    level = 1;
    obstacleSpeed = 2;
    timeElapsed = 0;
    obstacles.forEach(obs => obs.element.remove());
    obstacles = [];
    scoreElement.textContent = "0";
    levelElement.textContent = "1";

    gameStarted = true;
    gameOver = false;
    startScreen.style.display = "none";
    bird.style.top = `${birdY}px`; // Appliquer la position initiale
    gameLoop();
    spawnObstacles();
    increaseSpeedOverTime();
}

// Saut
function jump() {
    velocity = -12; // Hauteur du saut
}

// Boucle principale
function gameLoop() {
    if (!gameStarted || gameOver) return;

    // Mouvement de l'oiseau
    velocity += gravity;
    birdY += velocity;
    bird.style.top = `${birdY}px`;

    // Limites
    if (birdY + birdHeight > gameHeight) {
        birdY = gameHeight - birdHeight;
        velocity = 0;
        endGame();
    }
    if (birdY < 0) {
        birdY = 0;
        velocity = 0;
    }

    // Mise à jour des obstacles
    obstacles.forEach(obstacle => {
        obstacle.x -= obstacleSpeed;
        obstacle.element.style.left = `${obstacle.x}px`;

        // Collision
        const birdRect = bird.getBoundingClientRect();
        const obsRect = obstacle.element.getBoundingClientRect();
        if (
            birdRect.left < obsRect.right &&
            birdRect.right > obsRect.left &&
            birdRect.top < obsRect.bottom &&
            birdRect.bottom > obsRect.top
        ) {
            endGame();
        }

        // Score et level up
        if (obstacle.x + obstacle.width < 150 && !obstacle.passed) {
            score += 1;
            scoreElement.textContent = score;
            obstacle.passed = true;

            if (score >= level * scorePerLevel) {
                level += 1;
                levelElement.textContent = level;
                obstacleSpeed += 0.5;
            }
        }

        // Suppression des obstacles hors écran
        if (obstacle.x + obstacle.width < 0) {
            obstacle.element.remove();
            obstacles.shift();
        }
    });

    requestAnimationFrame(gameLoop);
}

// Augmentation progressive de la vitesse
function increaseSpeedOverTime() {
    if (!gameStarted || gameOver) return;

    timeElapsed += 1;
    if (timeElapsed % 600 === 0) {
        obstacleSpeed += 0.2;
    }
    requestAnimationFrame(increaseSpeedOverTime);
}

// Génération des obstacles
function spawnObstacles() {
    if (!gameStarted || gameOver) return;

    const types = ["rock", "lightning", "drone"];
    const type = types[Math.floor(Math.random() * types.length)];
    const obstacle = document.createElement("div");
    obstacle.classList.add("obstacle", type);

    let height, width, y;
    switch (type) {
        case "rock":
            height = 50;
            width = 50;
            y = Math.random() * (gameHeight - height - 100) + 50;
            break;
        case "lightning":
            height = 100;
            width = 20;
            y = Math.random() * (gameHeight - height - 100);
            break;
        case "drone":
            height = 40;
            width = 60;
            y = Math.random() * (gameHeight - height - 100) + 50;
            break;
    }

    obstacle.style.width = `${width}px`;
    obstacle.style.height = `${height}px`;
    obstacle.style.top = `${y}px`;
    obstacle.style.left = `${window.innerWidth}px`;

    obstaclesContainer.appendChild(obstacle);
    obstacles.push({ element: obstacle, x: window.innerWidth, width, height, passed: false });

    const baseInterval = 3500;
    const minInterval = 1500;
    const intervalReduction = Math.min(level * 200, baseInterval - minInterval);
    const interval = baseInterval - intervalReduction;
    setTimeout(spawnObstacles, Math.random() * 1000 + interval);
}

// Fin du jeu
function endGame() {
    gameOver = true;
    gameStarted = false;
    finalScoreElement.textContent = score;
    finalLevelElement.textContent = level;
    gameOverScreen.style.display = "flex";
}

// Rejouer
restartButton.addEventListener("click", () => {
    const playerName = playerNameInput.value.trim() || "Inconnu";
    if (score > topScores[2].score) {
        topScores.push({ score: score, player: playerName });
        topScores.sort((a, b) => b.score - a.score);
        topScores = topScores.slice(0, 3);
        localStorage.setItem("topScores", JSON.stringify(topScores));
        updateTopScoresDisplay();
    }

    gameOverScreen.style.display = "none";
    playerNameInput.value = "";
    birdY = window.innerHeight / 2 - 20; // Réinitialiser au centre
    velocity = 0;
    score = 0;
    level = 1;
    obstacleSpeed = 2;
    timeElapsed = 0;
    scoreElement.textContent = "0";
    levelElement.textContent = "1";
    obstacles.forEach(obs => obs.element.remove());
    obstacles = [];
    gameOver = false;
    startGame();
});