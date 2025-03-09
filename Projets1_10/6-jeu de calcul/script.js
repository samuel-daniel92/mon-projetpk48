// Détection du thème au chargement
const urlParams = new URLSearchParams(window.location.search);
const theme = urlParams.get("theme");

if (theme === "dark") {
    document.body.classList.add("dark-mode");
}

// Variables globales
let score = 0;
let timeLeft = 30;
let timerInterval;
let isGameRunning = false;
let difficulty = null;
let bestScore = localStorage.getItem("bestScore") ? parseInt(localStorage.getItem("bestScore")) : 0;

// Sélection des éléments
const difficultySelection = document.getElementById("difficulty-selection");
const difficultyButtons = document.querySelectorAll(".difficulty-btn");
const gameDisplay = document.querySelector(".game-display");
const scoreDisplay = document.getElementById("score");
const progressFill = document.getElementById("progress");
const timerDisplay = document.getElementById("timer");
const num1Display = document.getElementById("num1");
const operatorDisplay = document.getElementById("operator");
const num2Display = document.getElementById("num2");
const userAnswerInput = document.getElementById("user-answer");
const startButton = document.getElementById("start-game");
const gameResultDisplay = document.getElementById("game-result");
const bestScoreDisplay = document.getElementById("best-score");

// Initialisation
bestScoreDisplay.textContent = bestScore;

// Sélection de la difficulté
difficultyButtons.forEach(button => {
    button.addEventListener("click", () => {
        difficulty = button.dataset.level;
        difficultySelection.style.display = "none";
        gameDisplay.style.display = "block";
        startButton.style.display = "block";
        startButton.focus();
    });
});

// Démarrer le jeu
startButton.addEventListener("click", () => {
    if (!isGameRunning) {
        startGame();
    }
});

// Fonction pour démarrer le jeu
function startGame() {
    score = 0;
    timeLeft = 30;
    isGameRunning = true;
    startButton.disabled = true;
    userAnswerInput.disabled = false;
    userAnswerInput.focus();
    gameResultDisplay.textContent = "";
    updateDisplay();
    generateProblem();
    timerInterval = setInterval(updateTimer, 1000);
}

// Mettre à jour l'affichage
function updateDisplay() {
    scoreDisplay.textContent = `Score : ${score}`;
    const progressPercentage = Math.min((score / 20) * 100, 100); // Max 20 pour la barre
    progressFill.style.width = `${progressPercentage}%`;
    timerDisplay.textContent = `Temps : ${timeLeft}`;
}

// Générer un problème mathématique selon la difficulté
function generateProblem() {
    let operators, maxNum;
    switch (difficulty) {
        case "easy":
            operators = ["+", "-"];
            maxNum = 20;
            break;
        case "medium":
            operators = ["+", "-", "×"];
            maxNum = 50;
            break;
        case "hard":
            operators = ["+", "-", "×", "÷"];
            maxNum = 100;
            break;
    }

    const operator = operators[Math.floor(Math.random() * operators.length)];
    let num1, num2;

    if (operator === "+" || operator === "-") {
        num1 = Math.floor(Math.random() * maxNum);
        num2 = Math.floor(Math.random() * maxNum);
    } else if (operator === "×") {
        num1 = Math.floor(Math.random() * 10) + 1;
        num2 = Math.floor(Math.random() * 10) + 1;
    } else if (operator === "÷") {
        num2 = Math.floor(Math.random() * 10) + 1;
        num1 = num2 * (Math.floor(Math.random() * 10) + 1); // Assure un résultat entier
    }

    num1Display.textContent = num1;
    operatorDisplay.textContent = operator;
    num2Display.textContent = num2;
    userAnswerInput.value = "";
    userAnswerInput.classList.remove("correct", "incorrect");
}

// Vérifier la réponse
userAnswerInput.addEventListener("input", () => {
    if (!isGameRunning) return;

    const userAnswer = parseFloat(userAnswerInput.value);
    const num1 = parseInt(num1Display.textContent);
    const num2 = parseInt(num2Display.textContent);
    const operator = operatorDisplay.textContent;

    let correctAnswer;
    switch (operator) {
        case "+":
            correctAnswer = num1 + num2;
            break;
        case "-":
            correctAnswer = num1 - num2;
            break;
        case "×":
            correctAnswer = num1 * num2;
            break;
        case "÷":
            correctAnswer = num1 / num2;
            break;
    }

    if (userAnswer === correctAnswer) {
        score++;
        userAnswerInput.classList.add("correct");
        updateDisplay();
        setTimeout(generateProblem, 500); // Délai pour voir l'animation
    } else if (userAnswerInput.value !== "") {
        userAnswerInput.classList.add("incorrect");
        setTimeout(() => userAnswerInput.classList.remove("incorrect"), 500);
    }
});

// Mettre à jour le temps
function updateTimer() {
    timeLeft--;
    timerDisplay.textContent = `Temps : ${timeLeft}`;

    if (timeLeft <= 0) {
        endGame();
    }
}

// Terminer le jeu
function endGame() {
    clearInterval(timerInterval);
    isGameRunning = false;
    startButton.disabled = false;
    userAnswerInput.disabled = true;
    gameResultDisplay.textContent = `Jeu terminé ! Votre score est de ${score}.`;
    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem("bestScore", bestScore);
        bestScoreDisplay.textContent = bestScore;
    }
}