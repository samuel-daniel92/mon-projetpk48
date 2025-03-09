// Sélection sécurisée des éléments
const elementframe = document.getElementById("frame");
const affiche = document.getElementById("affiche");
const profileCard = document.getElementById("profile-card");
const backButton = document.getElementById("back-button");
const modal = document.getElementById("myModal");
const closeModal = document.querySelector(".close");
const sidebar = document.getElementById("sidebar");
const toggleSidebar = document.getElementById("toggle-sidebar");
const mainContent = document.querySelector(".main-content");
const sidebarLogo = document.getElementById("sidebar-logo");
const profilePhoto = document.getElementById("profile-photo");
const themeToggle = document.getElementById("theme-toggle");

// Fonction utilitaire pour gérer les transitions avec promesses
const toggleClassWithTransition = (element, className, delay = 500) => {
    return new Promise(resolve => {
        element.classList.toggle(className);
        setTimeout(resolve, delay);
    });
};

// Gestion du mode sombre
const toggleTheme = () => {
    document.body.classList.toggle("dark-mode");
    const isDarkMode = document.body.classList.contains("dark-mode");
    const themeIcon = themeToggle.querySelector("i");
    themeIcon.className = isDarkMode ? "fas fa-sun" : "fas fa-moon";
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");

    // Ajouter un paramètre theme à l'URL de l'iframe si un projet est chargé
    if (elementframe.src) {
        const baseUrl = elementframe.src.split("?")[0];
        elementframe.src = `${baseUrl}?theme=${isDarkMode ? "dark" : "light"}`;
    }

    // Ajouter une transition douce au body
    document.body.style.transition = "background-color 0.5s ease, color 0.5s ease";
};

// Charger le thème sauvegardé
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
    themeToggle.querySelector("i").className = "fas fa-sun";
}

// Écouteur pour le bouton de thème
themeToggle?.addEventListener("click", toggleTheme);

// Gestion du toggle de la sidebar
let isSidebarHidden = false;
toggleSidebar?.addEventListener("click", () => {
    isSidebarHidden = !isSidebarHidden;
    toggleClassWithTransition(sidebar, "hidden", 700);
    toggleClassWithTransition(mainContent, "full-width", 700);
});

// Gestion des clics sur la sidebar (amélioration avec closest)
document.querySelector(".sidebar-menu")?.addEventListener("click", (event) => {
    const menuItem = event.target.closest(".menu-item");
    if (menuItem) {
        event.preventDefault();
        const url = menuItem.getAttribute("data-url");
        const isDarkMode = document.body.classList.contains("dark-mode");

        // Ajouter l'effet de chargement
        affiche.classList.add("loading");
        randomizeLoader();

        if (affiche.classList.contains("visible")) {
            toggleClassWithTransition(affiche, "visible", 500).then(() => {
                elementframe.src = `${url}?theme=${isDarkMode ? "dark" : "light"}`;
                affiche.classList.add("visible");
                setTimeout(() => affiche.classList.remove("loading"), 100);
            });
        } else {
            elementframe.src = `${url}?theme=${isDarkMode ? "dark" : "light"}`;
            profileCard.classList.add("hidden");
            toggleClassWithTransition(affiche, "visible", 1500).then(() => {
                affiche.classList.remove("loading");
            });
        }

        // Masquer la sidebar sur mobile après clic
        if (window.innerWidth <= 768) {
            isSidebarHidden = true;
            sidebar.classList.add("hidden");
            mainContent.classList.add("full-width");
        }

        // Ajouter une animation subtile au menu-item cliqué
        menuItem.style.animation = "vibrate 0.3s ease";
    }
});

// Bouton Retour
backButton?.addEventListener("click", () => {
    toggleClassWithTransition(affiche, "visible", 500).then(() => {
        profileCard.classList.remove("hidden");
    });
});

// Retour au profil en cliquant sur le logo de la sidebar
sidebarLogo?.addEventListener("click", () => {
    toggleClassWithTransition(affiche, "visible", 500).then(() => {
        profileCard.classList.remove("hidden");
    });
});

// Gestion de la modale lors du clic sur la photo de profil
profilePhoto?.addEventListener("click", () => {
    if (modal) {
        modal.classList.add("visible");
        modal.style.animation = "fadeIn 1s ease";
    }
});

// Fermeture de la modale
closeModal?.addEventListener("click", () => {
    if (modal) {
        modal.style.animation = "fadeOut 0.5s ease forwards";
        setTimeout(() => modal.classList.remove("visible"), 500);
    }
});

window.addEventListener("click", (event) => {
    if (event.target === modal) {
        modal.style.animation = "fadeOut 0.5s ease forwards";
        setTimeout(() => modal.classList.remove("visible"), 500);
    }
});

// Randomisation des loaders (seulement loader1 et loader3)
function randomizeLoader() {
    const loaders = document.querySelectorAll(".loader1, .loader3");
    if (!loaders.length) return;

    loaders.forEach(loader => loader.style.display = "none");
    const randomIndex = Math.floor(Math.random() * loaders.length);
    loaders[randomIndex].style.display = "block";
    loaders[randomIndex].style.animation = "pulse 1.5s infinite";
}

// Ajouter des animations personnalisées
const style = document.createElement("style");
style.textContent = `
    @keyframes vibrate {
        0%, 100% { transform: translateX(0); }
        20% { transform: translateX(-2px); }
        40% { transform: translateX(2px); }
        60% { transform: translateX(-2px); }
        80% { transform: translateX(2px); }
    }
    @keyframes pulse {
        0%, 100% { transform: scale(1); opacity: 0.8; }
        50% { transform: scale(1.2); opacity: 1; }
    }
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
`;
document.head.appendChild(style);

// Initialisation au chargement de la page
document.addEventListener("DOMContentLoaded", () => {
    // Animation d'entrée pour la page
    document.body.style.opacity = "0";
    setTimeout(() => {
        document.body.style.transition = "opacity 1s ease";
        document.body.style.opacity = "1";
    }, 100);
});