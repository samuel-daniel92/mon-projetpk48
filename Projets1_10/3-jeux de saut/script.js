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

let birdY = 300;
let velocity = 0;
let gravity = 0.5;
let gameStarted = false;
let gameOver = false;
let score = 0;
let level = 1;
let obstacleSpeed = 2; // Vitesse initiale réduite
let obstacles = [];
let timeElapsed = 0;
let topScores = JSON.parse(localStorage.getItem("topScores")) || [
    { score: 0, player: "Inconnu" },
    { score: 0, player: "Inconnu" },
    { score: 0, player: "Inconnu" }
];

// Initialiser l’affichage des meilleurs scores
updateTopScoresDisplay();

const birdHeight = 40;
const gameHeight = window.innerHeight - 100; // Hauteur du jeu moins le sol
const scorePerLevel = 10; // Score requis pour passer au niveau suivant

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

// Démarrer le jeu
document.addEventListener("keydown", (e) => {
    if (e.code === "Space" && !gameStarted && !gameOver) {
        startGame();
    } else if (e.code === "Space" && gameStarted && !gameOver) {
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
    gameStarted = true;
    startScreen.style.display = "none";
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

            // Vérification du level up
            if (score >= level * scorePerLevel) {
                level += 1;
                levelElement.textContent = level;
                obstacleSpeed += 0.5; // Augmentation de la vitesse au level up
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
    if (timeElapsed % 600 === 0) { // Augmente la vitesse toutes les 10 secondes
        obstacleSpeed += 0.2; // Augmentation légère
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

    // Intervalle d’apparition équilibré et réduit avec le niveau
    const baseInterval = 3500; // Début modéré (3.5 secondes)
    const minInterval = 1500; // Minimum 1.5 secondes
    const intervalReduction = Math.min(level * 200, baseInterval - minInterval); // Réduction progressive
    const interval = baseInterval - intervalReduction;
    setTimeout(spawnObstacles, Math.random() * 1000 + interval); // Variation aléatoire + intervalle de base
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
    if (score > topScores[2].score) { // Si le score est supérieur au 3e meilleur
        topScores.push({ score: score, player: playerName });
        topScores.sort((a, b) => b.score - a.score); // Trier par ordre décroissant
        topScores = topScores.slice(0, 3); // Garder les 3 meilleurs
        localStorage.setItem("topScores", JSON.stringify(topScores));
        updateTopScoresDisplay();
    }

    gameOverScreen.style.display = "none";
    playerNameInput.value = ""; // Réinitialiser le champ
    birdY = 300;
    velocity = 0;
    score = 0;
    level = 1;
    obstacleSpeed = 2; // Vitesse initiale réduite
    timeElapsed = 0;
    scoreElement.textContent = "0";
    levelElement.textContent = "1";
    obstacles.forEach(obs => obs.element.remove());
    obstacles = [];
    gameOver = false;
    startGame();
});