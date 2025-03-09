// Détection du thème au chargement
const urlParams = new URLSearchParams(window.location.search);
const theme = urlParams.get("theme");

if (theme === "dark") {
    document.body.classList.add("dark-mode");
}

// Sélection des éléments
const resultDisplay = document.getElementById("result");
const buttons = document.querySelectorAll(".btn");
const toggleModeButton = document.getElementById("toggle-mode");
const historyList = document.getElementById("history-list");

// Variables
let currentInput = "";
let expression = "";
let memory = 0;
let isDegrees = true;
let history = JSON.parse(localStorage.getItem("calcHistory")) || [];

// Mettre à jour l’historique
function updateHistory(expr, result) {
    const entry = `${expr} = ${result}`;
    history.unshift(entry);
    if (history.length > 5) history.pop();
    localStorage.setItem("calcHistory", JSON.stringify(history));
    renderHistory();
}

function renderHistory() {
    historyList.innerHTML = "";
    history.forEach((entry, index) => {
        const li = document.createElement("li");
        li.innerHTML = `${entry} <button class="delete-btn" aria-label="Supprimer ce calcul"><i class="fas fa-trash"></i></button>`;
        
        // Clic sur l’entrée pour la réutiliser
        li.addEventListener("click", (e) => {
            if (e.target.tagName !== "BUTTON" && e.target.tagName !== "I") {
                const [expr] = entry.split(" = ");
                currentInput = expr;
                expression = expr;
                resultDisplay.value = currentInput;
            }
        });

        // Clic sur le bouton de suppression
        li.querySelector(".delete-btn").addEventListener("click", (e) => {
            e.stopPropagation(); // Empêche le clic sur le <li> de se déclencher
            history.splice(index, 1);
            localStorage.setItem("calcHistory", JSON.stringify(history));
            renderHistory();
        });

        historyList.appendChild(li);
    });
}

// Toggle degrés/radians
toggleModeButton.addEventListener("click", () => {
    isDegrees = !isDegrees;
    toggleModeButton.textContent = isDegrees ? "Deg" : "Rad";
});

// Gestion des clics sur les boutons
buttons.forEach(button => {
    button.addEventListener("click", () => {
        const value = button.dataset.value;

        if (value === "AC") {
            currentInput = "";
            expression = "";
            resultDisplay.value = "";
        } else if (value === "DEL") {
            currentInput = currentInput.slice(0, -1);
            resultDisplay.value = currentInput;
        } else if (value === "=") {
            try {
                const result = evaluateExpression(expression);
                currentInput = result.toString();
                updateHistory(expression, result);
                expression = currentInput;
                resultDisplay.value = currentInput;
                resultDisplay.classList.add("result");
                setTimeout(() => resultDisplay.classList.remove("result"), 500);
            } catch (error) {
                resultDisplay.value = "Erreur";
                currentInput = "";
                expression = "";
            }
        } else if (value === "M+") {
            memory += parseFloat(currentInput) || 0;
        } else if (value === "M-") {
            memory -= parseFloat(currentInput) || 0;
        } else if (value === "MR") {
            currentInput = memory.toString();
            expression = currentInput;
            resultDisplay.value = currentInput;
        } else if (value === "MC") {
            memory = 0;
        } else {
            handleInput(value);
        }
    });
});

// Gestion des entrées
function handleInput(value) {
    switch (value) {
        case "sin":
        case "cos":
        case "tan":
        case "asin":
        case "acos":
        case "atan":
        case "ln":
        case "log":
        case "e^x":
            expression += `${value}(`;
            currentInput += `${value}(`;
            break;
        case "x²":
            expression += `Math.pow(${currentInput}, 2)`;
            currentInput += "²";
            break;
        case "√":
            expression += "Math.sqrt(";
            currentInput += "√(";
            break;
        case "!":
            expression = `factorial(${currentInput})`;
            currentInput += "!";
            break;
        case "π":
            expression += Math.PI;
            currentInput += "π";
            break;
        default:
            expression += value;
            currentInput += value;
    }
    resultDisplay.value = currentInput;
}

// Évaluation de l’expression
function evaluateExpression(expr) {
    let adjustedExpr = expr
        .replace(/sin/g, `Math.sin${isDegrees ? "(toRadians(" : "("}`)
        .replace(/cos/g, `Math.cos${isDegrees ? "(toRadians(" : "("}`)
        .replace(/tan/g, `Math.tan${isDegrees ? "(toRadians(" : "("}`)
        .replace(/asin/g, `Math.asin${isDegrees ? "(toDegrees(" : "("}`)
        .replace(/acos/g, `Math.acos${isDegrees ? "(toDegrees(" : "("}`)
        .replace(/atan/g, `Math.atan${isDegrees ? "(toDegrees(" : "("}`)
        .replace(/ln/g, "Math.log")
        .replace(/log/g, "Math.log10")
        .replace(/e\^x/g, "Math.exp")
        .replace(/π/g, Math.PI);

    if (isDegrees) {
        adjustedExpr = adjustedExpr.replace(/\(/g, "(").replace(/\)/g, ")");
    }

    return eval(adjustedExpr); // Note : eval utilisé pour simplifier, envisager un parseur sécurisé en production
}

// Fonctions utilitaires
function toRadians(deg) {
    return deg * (Math.PI / 180);
}

function toDegrees(rad) {
    return rad * (180 / Math.PI);
}

function factorial(n) {
    n = parseInt(n);
    if (n < 0) return NaN;
    if (n === 0) return 1;
    return n * factorial(n - 1);
}

// Initialisation
renderHistory();