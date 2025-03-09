// Détection du thème au chargement
const urlParams = new URLSearchParams(window.location.search);
const theme = urlParams.get("theme");

if (theme === "dark") {
    document.body.classList.add("dark-mode");
}

// Sélection des éléments
const passwordDisplay = document.getElementById("generated-password");
const copyButton = document.getElementById("copy-password");
const generateButton = document.getElementById("generate-password");
const lengthInput = document.getElementById("password-length");
const lengthValue = document.getElementById("length-value");
const randomLengthCheckbox = document.getElementById("random-length");
const uppercaseCheckbox = document.getElementById("uppercase");
const lowercaseCheckbox = document.getElementById("lowercase");
const numbersCheckbox = document.getElementById("numbers");
const symbolsCheckbox = document.getElementById("symbols");
const strengthBar = document.querySelector(".strength-bar");
const strengthText = document.querySelector(".strength-text");
const historyList = document.getElementById("history-list");

// Caractères possibles
const uppercaseLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const lowercaseLetters = "abcdefghijklmnopqrstuvwxyz";
const numbers = "0123456789";
const symbols = "!@#$%^&*()_+{}[]";

// Historique des mots de passe
let passwordHistory = JSON.parse(localStorage.getItem("passwordHistory")) || [];

// Mettre à jour la longueur affichée
lengthInput.addEventListener("input", () => {
    lengthValue.textContent = lengthInput.value;
});

// Évaluer la force du mot de passe
function checkPasswordStrength(password) {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (password.length >= 12) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    return strength;
}

function updateStrength(password) {
    if (password === "Cliquez sur Générer") {
        strengthBar.style.backgroundColor = "var(--strength-weak)";
        strengthText.textContent = "Force : Inconnue";
        return;
    }
    const strength = checkPasswordStrength(password);
    if (strength <= 2) {
        strengthBar.style.backgroundColor = "var(--strength-weak)";
        strengthText.textContent = "Force : Faible";
    } else if (strength <= 4) {
        strengthBar.style.backgroundColor = "var(--strength-medium)";
        strengthText.textContent = "Force : Moyen";
    } else {
        strengthBar.style.backgroundColor = "var(--strength-strong)";
        strengthText.textContent = "Force : Fort";
    }
}

// Mettre à jour l’historique
function updateHistory(password) {
    if (password && password !== "Cliquez sur Générer") {
        passwordHistory.unshift(password);
        if (passwordHistory.length > 5) passwordHistory.pop();
        localStorage.setItem("passwordHistory", JSON.stringify(passwordHistory));
        renderHistory();
    }
}

function renderHistory() {
    historyList.innerHTML = "";
    passwordHistory.forEach((pwd, index) => {
        const li = document.createElement("li");
        li.innerHTML = `${pwd} <button class="delete-btn" aria-label="Supprimer ce mot de passe"><i class="fas fa-trash"></i></button>`;
        
        // Clic sur le mot de passe pour le copier
        li.addEventListener("click", (e) => {
            if (e.target.tagName !== "BUTTON" && e.target.tagName !== "I") {
                passwordDisplay.textContent = pwd;
                updateStrength(pwd);
                navigator.clipboard.writeText(pwd);
                alert("Mot de passe copié depuis l’historique !");
            }
        });

        // Clic sur le bouton de suppression
        li.querySelector(".delete-btn").addEventListener("click", (e) => {
            e.stopPropagation(); // Empêche le clic sur le <li> de se déclencher
            passwordHistory.splice(index, 1);
            localStorage.setItem("passwordHistory", JSON.stringify(passwordHistory));
            renderHistory();
        });

        historyList.appendChild(li);
    });
}

// Générer un mot de passe
generateButton.addEventListener("click", () => {
    let characters = "";
    if (uppercaseCheckbox.checked) characters += uppercaseLetters;
    if (lowercaseCheckbox.checked) characters += lowercaseLetters;
    if (numbersCheckbox.checked) characters += numbers;
    if (symbolsCheckbox.checked) characters += symbols;

    if (!characters) {
        alert("Veuillez sélectionner au moins une option !");
        return;
    }

    const length = randomLengthCheckbox.checked ? 
        Math.floor(Math.random() * (32 - 6 + 1)) + 6 : 
        parseInt(lengthInput.value);

    let password = "";
    for (let i = 0; i < length; i++) {
        password += characters[Math.floor(Math.random() * characters.length)];
    }

    // Animation de scramble
    passwordDisplay.style.animation = "scramble 0.3s";
    setTimeout(() => {
        passwordDisplay.style.animation = "";
        passwordDisplay.textContent = password;
        updateStrength(password);
        updateHistory(password);
    }, 300);
});

// Copier le mot de passe
copyButton.addEventListener("click", () => {
    const text = passwordDisplay.textContent;
    if (text !== "Cliquez sur Générer") {
        navigator.clipboard.writeText(text);
        copyButton.classList.add("copied");
        setTimeout(() => copyButton.classList.remove("copied"), 500);
        alert("Mot de passe copié !");
    }
});

// Initialisation
renderHistory();
updateStrength(passwordDisplay.textContent);