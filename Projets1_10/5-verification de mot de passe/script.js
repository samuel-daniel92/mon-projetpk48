// Détection du thème au chargement
const urlParams = new URLSearchParams(window.location.search);
const theme = urlParams.get("theme");

if (theme === "dark") {
    document.body.classList.add("dark-mode");
}

// Sélection des éléments
const passwordInput = document.getElementById("password-input");
const toggleVisibilityButton = document.getElementById("toggle-visibility");
const strengthBar = document.querySelector(".strength-bar");
const strengthText = document.querySelector(".strength-text");
const criteria = {
    length: document.getElementById("length-criteria"),
    uppercase: document.getElementById("uppercase-criteria"),
    lowercase: document.getElementById("lowercase-criteria"),
    number: document.getElementById("number-criteria"),
    symbol: document.getElementById("symbol-criteria"),
};

// Basculer la visibilité du mot de passe
toggleVisibilityButton.addEventListener("click", () => {
    const isVisible = passwordInput.type === "text";
    passwordInput.type = isVisible ? "password" : "text";
    toggleVisibilityButton.innerHTML = isVisible ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
});

// Vérifier la force du mot de passe
passwordInput.addEventListener("input", () => {
    const password = passwordInput.value;
    const strength = checkPasswordStrength(password);
    updateStrengthDisplay(strength);
    updateCriteria(password);
});

// Fonction pour vérifier la force du mot de passe
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

// Mettre à jour l'affichage de la force
function updateStrengthDisplay(strength) {
    if (strength <= 2) {
        strengthBar.style.backgroundColor = "var(--strength-weak)";
        strengthText.textContent = "Faible";
    } else if (strength <= 4) {
        strengthBar.style.backgroundColor = "var(--strength-medium)";
        strengthText.textContent = "Moyen";
    } else {
        strengthBar.style.backgroundColor = "var(--strength-strong)";
        strengthText.textContent = "Fort";
    }
}

// Mettre à jour les critères
function updateCriteria(password) {
    criteria.length.classList.toggle("valid", password.length >= 8);
    criteria.uppercase.classList.toggle("valid", /[A-Z]/.test(password));
    criteria.lowercase.classList.toggle("valid", /[a-z]/.test(password));
    criteria.number.classList.toggle("valid", /[0-9]/.test(password));
    criteria.symbol.classList.toggle("valid", /[^A-Za-z0-9]/.test(password));
}