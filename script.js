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
const headerProfilePhoto = document.getElementById("header-profile-photo");
const themeToggle = document.getElementById("theme-toggle");

// Gestion du mode sombre
const toggleTheme = () => {
    document.body.classList.toggle("dark-mode");
    const isDarkMode = document.body.classList.contains("dark-mode");
    const themeIcon = themeToggle.querySelector("i");
    themeIcon.className = isDarkMode ? "fas fa-sun" : "fas fa-moon";
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");

    if (elementframe.src) {
        const baseUrl = elementframe.src.split("?")[0];
        elementframe.src = `${baseUrl}?theme=${isDarkMode ? "dark" : "light"}`;
    }
};

const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
    themeToggle.querySelector("i").className = "fas fa-sun";
}

themeToggle?.addEventListener("click", toggleTheme);

// Gestion du toggle de la sidebar
let isSidebarHidden = false;
toggleSidebar?.addEventListener("click", () => {
    isSidebarHidden = !isSidebarHidden;
    sidebar.classList.toggle("hidden");
    mainContent.classList.toggle("full-width");
});

// Gestion des clics sur la sidebar
document.querySelector(".sidebar-menu")?.addEventListener("click", (event) => {
    const menuItem = event.target.closest(".menu-item");
    if (menuItem) {
        event.preventDefault();
        const url = menuItem.getAttribute("data-url");
        const isDarkMode = document.body.classList.contains("dark-mode");

        // Afficher le loader
        affiche.classList.add("loading");
        profileCard.classList.add("hidden");

        // Charger l’iframe avec un délai pour voir le loader
        setTimeout(() => {
            elementframe.src = `${url}?theme=${isDarkMode ? "dark" : "light"}`;
            affiche.classList.add("visible");
            setTimeout(() => {
                affiche.classList.remove("loading");
            }, 2000); // Loader visible pendant 2 secondes
        }, 100);

        // Masquer la sidebar sur mobile après clic
        if (window.innerWidth <= 768) {
            isSidebarHidden = true;
            sidebar.classList.add("hidden");
            mainContent.classList.add("full-width");
        }

        menuItem.style.animation = "vibrate 0.3s ease";
    }
});

// Bouton Retour
backButton?.addEventListener("click", () => {
    affiche.classList.remove("visible");
    setTimeout(() => {
        profileCard.classList.remove("hidden");
        elementframe.src = "";
        affiche.classList.remove("loading");
    }, 500);
});

// Retour au profil en cliquant sur le logo de la sidebar
sidebarLogo?.addEventListener("click", () => {
    affiche.classList.remove("visible");
    setTimeout(() => {
        profileCard.classList.remove("hidden");
        elementframe.src = "";
        affiche.classList.remove("loading");
    }, 500);
});

// Gestion de la modale pour la photo du profil principal
profilePhoto?.addEventListener("click", () => {
    if (modal) {
        modal.style.display = "block";
        setTimeout(() => {
            modal.classList.add("visible");
        }, 10);
    }
});

// Gestion de la modale pour la photo dans le header
headerProfilePhoto?.addEventListener("click", () => {
    if (modal) {
        modal.style.display = "block";
        setTimeout(() => {
            modal.classList.add("visible");
        }, 10);
    }
});

// Fermeture de la modale
closeModal?.addEventListener("click", () => {
    if (modal) {
        modal.classList.remove("visible");
        setTimeout(() => {
            modal.style.display = "none";
        }, 500);
    }
});

window.addEventListener("click", (event) => {
    if (event.target === modal) {
        modal.classList.remove("visible");
        setTimeout(() => {
            modal.style.display = "none";
        }, 500);
    }
});

// Animations personnalisées
const style = document.createElement("style");
style.textContent = `
    @keyframes vibrate {
        0%, 100% { transform: translateX(0); }
        20% { transform: translateX(-2px); }
        40% { transform: translateX(2px); }
        60% { transform: translateX(-2px); }
        80% { transform: translateX(2px); }
    }
`;
document.head.appendChild(style);

// Initialisation au chargement de la page
document.addEventListener("DOMContentLoaded", () => {
    document.body.style.opacity = "0";
    setTimeout(() => {
        document.body.style.transition = "opacity 1s ease";
        document.body.style.opacity = "1";
    }, 100);
});