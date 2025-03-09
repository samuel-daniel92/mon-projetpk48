// Détection du thème au chargement
const urlParams = new URLSearchParams(window.location.search);
const theme = urlParams.get("theme");
if (theme === "dark") document.body.classList.add("dark-mode");

// Variables globales
let score = 0;
let timeLeft = 30;
let timerInterval;
let isGameRunning = false;
let difficulty = null;
let bestScore = localStorage.getItem("bestScore") ? parseInt(localStorage.getItem("bestScore")) : 0;
let scoreHistory = JSON.parse(localStorage.getItem("scoreHistory")) || [];
let consecutiveCorrect = 0;

// Sélection des éléments
const difficultySelection = document.getElementById("difficulty-selection");
const difficultyButtons = document.querySelectorAll(".difficulty-btn");
const gameDisplay = document.querySelector(".game-display");
const scoreDisplay = document.getElementById("score");
const progressFill = document.getElementById("progress");
const timerDisplay = document.getElementById("timer");
const problemText = document.getElementById("problem-text");
const userAnswerInput = document.getElementById("user-answer");
const startButton = document.getElementById("start-game");
const backToMenuButton = document.getElementById("back-to-menu");
const gameResultDisplay = document.getElementById("game-result");
const bestScoreDisplay = document.getElementById("best-score");
const historyList = document.getElementById("history-list");
const clearHistoryButton = document.getElementById("clear-history");

// Initialisation
bestScoreDisplay.textContent = bestScore;
renderScoreHistory();

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
    if (!isGameRunning) startGame();
});

// Retour au menu
backToMenuButton.addEventListener("click", () => {
    resetGame();
    difficultySelection.style.display = "flex";
    gameDisplay.style.display = "none";
    startButton.style.display = "none";
    gameResultDisplay.innerHTML = "";
});

// Supprimer l’historique
clearHistoryButton.addEventListener("click", () => {
    if (confirm("Voulez-vous vraiment supprimer tout l’historique des scores ?")) {
        scoreHistory = [];
        localStorage.setItem("scoreHistory", JSON.stringify(scoreHistory));
        renderScoreHistory();
    }
});

// Fonction pour démarrer le jeu
function startGame() {
    score = 0;
    timeLeft = 30;
    consecutiveCorrect = 0;
    isGameRunning = true;
    startButton.disabled = true;
    userAnswerInput.disabled = false;
    userAnswerInput.focus();
    gameResultDisplay.innerHTML = "";
    updateDisplay();
    generateProblem();
    timerInterval = setInterval(updateTimer, 1000);
}

// Réinitialiser le jeu
function resetGame() {
    clearInterval(timerInterval);
    isGameRunning = false;
    startButton.disabled = false;
    startButton.innerHTML = '<i class="fas fa-play"></i> Démarrer';
    userAnswerInput.disabled = true;
}

// Mettre à jour l'affichage
function updateDisplay() {
    scoreDisplay.textContent = `Score : ${score}`;
    const progressPercentage = Math.min((score / 30) * 100, 100); // Max 30 pour la barre
    progressFill.style.width = `${progressPercentage}%`;
    if (score >= 10 && score < 20) progressFill.classList.add("milestone");
    else if (score >= 20) progressFill.classList.add("milestone");
    else progressFill.classList.remove("milestone");
    timerDisplay.textContent = `Temps : ${timeLeft}`;
}

// Générer un problème mathématique selon la difficulté
function generateProblem() {
    let problem, correctAnswer;
    switch (difficulty) {
        case "easy":
            problem = generateSimpleProblem();
            break;
        case "medium":
            problem = Math.random() < 0.5 ? generateSimpleProblem(true) : generateParenthesesProblem();
            break;
        case "hard":
            problem = generateEquationProblem();
            break;
        case "expert":
            problem = generateComplexEquationProblem();
            break;
    }

    problemText.innerHTML = problem.text;
    correctAnswer = problem.answer;
    userAnswerInput.value = "";
    userAnswerInput.classList.remove("correct", "incorrect");
    userAnswerInput.dataset.correct = correctAnswer; // Stocker la réponse correcte
}

// Problèmes simples (+, -, ×, ÷)
function generateSimpleProblem(includeMultDiv = false) {
    const operators = includeMultDiv ? ["+", "-", "×", "÷"] : ["+", "-"];
    const operator = operators[Math.floor(Math.random() * operators.length)];
    let num1, num2;

    if (operator === "+" || operator === "-") {
        num1 = Math.floor(Math.random() * 20) + 1;
        num2 = Math.floor(Math.random() * 20) + 1;
    } else if (operator === "×") {
        num1 = Math.floor(Math.random() * 10) + 1;
        num2 = Math.floor(Math.random() * 10) + 1;
    } else if (operator === "÷") {
        num2 = Math.floor(Math.random() * 10) + 1;
        num1 = num2 * (Math.floor(Math.random() * 10) + 1); // Résultat entier
    }

    const answer = operator === "+" ? num1 + num2 :
                  operator === "-" ? num1 - num2 :
                  operator === "×" ? num1 * num2 :
                  num1 / num2;

    return { text: `${num1} ${operator} ${num2} = `, answer };
}

// Problèmes avec parenthèses
function generateParenthesesProblem() {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const num3 = Math.floor(Math.random() * 10) + 1;
    const answer = num1 * (num2 + num3);
    return { text: `${num1} × (${num2} + ${num3}) = `, answer };
}

// Équations simples avec x
function generateEquationProblem() {
    const type = Math.random() < 0.5 ? "left" : "right";
    if (type === "left") {
        const a = Math.floor(Math.random() * 10) + 1;
        const b = Math.floor(Math.random() * 20);
        const answer = Math.floor(Math.random() * 10) + 1;
        const c = a * answer + b;
        return { text: `${a}x + ${b} = ${c}, x = `, answer };
    } else {
        const a = Math.floor(Math.random() * 10) + 1;
        const c = Math.floor(Math.random() * 20) + 1;
        const answer = c - a;
        return { text: `x + ${a} = ${c}, x = `, answer };
    }
}

// Équations complexes avec x
function generateComplexEquationProblem() {
    const a = Math.floor(Math.random() * 5) + 1;
    const b = Math.floor(Math.random() * 10);
    const c = Math.floor(Math.random() * 5) + 1;
    const d = Math.floor(Math.random() * 10);
    const answer = Math.floor(Math.random() * 10) + 1;
    const left = a * answer - b;
    const right = c * answer + d;
    return { text: `${a}x - ${b} = ${c}x + ${d}, x = `, answer };
}

// Vérifier la réponse
userAnswerInput.addEventListener("input", () => {
    if (!isGameRunning) return;

    const userAnswer = parseFloat(userAnswerInput.value);
    const correctAnswer = parseFloat(userAnswerInput.dataset.correct);

    if (userAnswer === correctAnswer) {
        score++;
        consecutiveCorrect++;
        userAnswerInput.classList.add("correct");
        if (consecutiveCorrect % 3 === 0) timeLeft += 2; // Bonus de temps
        updateDisplay();
        setTimeout(generateProblem, 500);
    } else if (userAnswerInput.value !== "") {
        consecutiveCorrect = 0;
        userAnswerInput.classList.add("incorrect");
        setTimeout(() => userAnswerInput.classList.remove("incorrect"), 500);
    }
});

// Mettre à jour le temps
function updateTimer() {
    timeLeft--;
    timerDisplay.textContent = `Temps : ${timeLeft}`;

    if (timeLeft <= 0) endGame();
}

// Terminer le jeu
function endGame() {
    clearInterval(timerInterval);
    isGameRunning = false;
    startButton.disabled = false;
    startButton.innerHTML = '<i class="fas fa-redo"></i> Rejouer';
    userAnswerInput.disabled = true;
    gameResultDisplay.innerHTML = `Jeu terminé ! Votre score est de ${score}.<br><button id="restart-game">Rejouer</button>`;
    document.getElementById("restart-game").addEventListener("click", startGame);

    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem("bestScore", bestScore);
        bestScoreDisplay.textContent = bestScore;
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }

    updateScoreHistory();
}

// Mettre à jour l’historique des scores
function updateScoreHistory() {
    scoreHistory.unshift({ score, difficulty, timestamp: new Date().toLocaleString() });
    if (scoreHistory.length > 5) scoreHistory.pop();
    localStorage.setItem("scoreHistory", JSON.stringify(scoreHistory));
    renderScoreHistory();
}

// Rendre l’historique des scores
function renderScoreHistory() {
    historyList.innerHTML = "";
    scoreHistory.forEach(entry => {
        const li = document.createElement("li");
        li.textContent = `${entry.difficulty.charAt(0).toUpperCase() + entry.difficulty.slice(1)} : ${entry.score} - ${entry.timestamp}`;
        historyList.appendChild(li);
    });
}