// Détection du thème au chargement
const urlParams = new URLSearchParams(window.location.search);
const theme = urlParams.get("theme");

if (theme === "dark") {
    document.body.classList.add("dark-mode");
}

// Sélection des éléments
const originalUrlInput = document.getElementById("original-url");
const shortenLinkButton = document.getElementById("shorten-link");
const shortenedUrlInput = document.getElementById("shortened-url");
const copyLinkButton = document.getElementById("copy-link");
const historyList = document.getElementById("history-list");

// Historique des liens
let linkHistory = JSON.parse(localStorage.getItem("linkHistory")) || [];

// Fonction pour valider une URL
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

// Fonction pour raccourcir l'URL avec l'API TinyURL
async function shortenUrl(originalUrl) {
    const apiUrl = `https://tinyurl.com/api-create.php?url=${encodeURIComponent(originalUrl)}`;

    try {
        const response = await fetch(apiUrl);
        if (response.ok) {
            return await response.text();
        } else {
            throw new Error("Erreur lors du raccourcissement de l'URL");
        }
    } catch (error) {
        console.error("Erreur :", error);
        alert("Erreur lors du raccourcissement de l'URL. Vérifie ton URL ou ta connexion.");
        return null;
    }
}

// Mettre à jour l’historique
function updateHistory(shortenedUrl) {
    if (shortenedUrl) {
        linkHistory.unshift(shortenedUrl);
        if (linkHistory.length > 5) linkHistory.pop();
        localStorage.setItem("linkHistory", JSON.stringify(linkHistory));
        renderHistory();
    }
}

// Rendre l’historique avec une poubelle pour supprimer
function renderHistory() {
    historyList.innerHTML = "";
    linkHistory.forEach((url, index) => {
        const li = document.createElement("li");
        li.innerHTML = `
            <span>${url}</span>
            <button class="delete-link" aria-label="Supprimer le lien"><i class="fas fa-trash"></i></button>
        `;

        // Clic sur le lien pour copier
        li.querySelector("span").addEventListener("click", () => {
            shortenedUrlInput.value = url;
            navigator.clipboard.writeText(url);
            copyLinkButton.classList.add("copied");
            setTimeout(() => copyLinkButton.classList.remove("copied"), 500);
            alert("Lien copié depuis l’historique !");
        });

        // Suppression du lien
        const deleteButton = li.querySelector(".delete-link");
        deleteButton.addEventListener("click", (e) => {
            e.stopPropagation();
            linkHistory.splice(index, 1);
            localStorage.setItem("linkHistory", JSON.stringify(linkHistory));
            renderHistory();
        });

        historyList.appendChild(li);
    });
}

// Raccourcir le lien
shortenLinkButton.addEventListener("click", async () => {
    const originalUrl = originalUrlInput.value.trim();
    if (!originalUrl) {
        alert("Veuillez entrer une URL !");
        return;
    }
    if (!isValidUrl(originalUrl)) {
        alert("Veuillez entrer une URL valide (ex. https://exemple.com) !");
        return;
    }

    shortenLinkButton.classList.add("loading");
    shortenLinkButton.disabled = true;
    const shortenedUrl = await shortenUrl(originalUrl);
    shortenLinkButton.classList.remove("loading");
    shortenLinkButton.disabled = false;

    if (shortenedUrl) {
        shortenedUrlInput.value = shortenedUrl;
        copyLinkButton.disabled = false;
        updateHistory(shortenedUrl);
    }
});

// Copier le lien raccourci
copyLinkButton.addEventListener("click", () => {
    const text = shortenedUrlInput.value;
    if (text) {
        navigator.clipboard.writeText(text);
        copyLinkButton.classList.add("copied");
        setTimeout(() => copyLinkButton.classList.remove("copied"), 500);
        alert("Lien copié dans le presse-papiers !");
    }
});

// Initialisation
renderHistory();