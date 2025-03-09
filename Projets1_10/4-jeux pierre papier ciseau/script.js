// Détection du thème au chargement
const urlParams = new URLSearchParams(window.location.search);
const theme = urlParams.get("theme");

if (theme === "dark") {
    document.body.classList.add("dark-mode");
}

// Sélection des éléments
const playerScoreEl = document.getElementById("player-score");
const computerScoreEl = document.getElementById("computer-score");
const choiceButtons = document.querySelectorAll(".choice-btn");
const resultText = document.getElementById("result-text");
const playerIcon = document.getElementById("player-icon");
const computerIcon = document.getElementById("computer-icon");
const resetBtn = document.getElementById("reset-btn");

// Variables de score
let playerScore = 0;
let computerScore = 0;

// Choix possibles
const choices = ["pierre", "papier", "ciseaux"];
const icons = {
    pierre: "fa-hand-rock",
    papier: "fa-hand-paper",
    ciseaux: "fa-hand-scissors"
};

// Jouer un tour
choiceButtons.forEach(button => {
    button.addEventListener("click", () => {
        const playerChoice = button.dataset.choice;
        const computerChoice = choices[Math.floor(Math.random() * 3)];
        playRound(playerChoice, computerChoice);
    });
});

// Logique du jeu
function playRound(playerChoice, computerChoice) {
    // Mettre à jour les icônes
    playerIcon.className = `fas ${icons[playerChoice]} bounce`;
    computerIcon.className = `fas ${icons[computerChoice]} bounce`;

    // Déterminer le gagnant
    if (playerChoice === computerChoice) {
        resultText.textContent = "Égalité !";
    } else if (
        (playerChoice === "pierre" && computerChoice === "ciseaux") ||
        (playerChoice === "papier" && computerChoice === "pierre") ||
        (playerChoice === "ciseaux" && computerChoice === "papier")
    ) {
        resultText.textContent = "Vous gagnez !";
        playerScore++;
        playerScoreEl.textContent = playerScore;
    } else {
        resultText.textContent = "L'ordinateur gagne !";
        computerScore++;
        computerScoreEl.textContent = computerScore;
    }

    // Animation des icônes
    playerIcon.style.animation = "bounce 0.5s";
    computerIcon.style.animation = "bounce 0.5s";
    setTimeout(() => {
        playerIcon.style.animation = "";
        computerIcon.style.animation = "";
    }, 500);
}

// Réinitialisation
resetBtn.addEventListener("click", () => {
    playerScore = 0;
    computerScore = 0;
    playerScoreEl.textContent = "0";
    computerScoreEl.textContent = "0";
    resultText.textContent = "Fais ton choix !";
    playerIcon.className = "fas fa-question";
    computerIcon.className = "fas fa-question";
});