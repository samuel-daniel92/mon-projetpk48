// Détection du thème au chargement
const urlParams = new URLSearchParams(window.location.search);
const theme = urlParams.get("theme");
if (theme === "dark") {
    document.body.classList.add("dark-mode");
}

// Sélection des éléments
const tabNameInput = document.getElementById("tab-name");
const tabContentInput = document.getElementById("tab-content");
const tabImageInput = document.getElementById("tab-image");
const tabColorInput = document.getElementById("tab-color");
const addTabButton = document.getElementById("add-tab");
const tabsContainer = document.getElementById("tabs-container");
const tabCountDisplay = document.getElementById("tab-count");
const toggleViewButton = document.getElementById("toggle-view");
const previewContent = document.getElementById("preview-content");

// Charger les onglets depuis localStorage
let tabs = JSON.parse(localStorage.getItem("tabs")) || [];

// Mettre à jour le compteur
function updateTabCount() {
    tabCountDisplay.textContent = tabsContainer.children.length;
}

// Prévisualisation en temps réel
function updatePreview() {
    previewContent.innerHTML = "";
    const text = tabContentInput.value.trim();
    if (text) {
        const textDiv = document.createElement("div");
        textDiv.textContent = text;
        previewContent.appendChild(textDiv);
    }
    if (tabImageInput.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = document.createElement("img");
            img.src = e.target.result;
            previewContent.appendChild(img);
        };
        reader.readAsDataURL(tabImageInput.files[0]);
    }
}

tabContentInput.addEventListener("input", updatePreview);
tabImageInput.addEventListener("change", updatePreview);

// Ajouter un onglet au DOM
function createTabElement(id, name, content, image = null, color = "#87CEEB", isNew = false) {
    const tab = document.createElement("div");
    tab.classList.add("tab");
    tab.setAttribute("data-id", id);
    tab.draggable = true;
    tab.style.backgroundColor = color;

    const tabHeader = document.createElement("div");
    tabHeader.classList.add("tab-header");
    tabHeader.innerHTML = `
        <h3>${name}</h3>
        <div class="buttons">
            <button class="edit-tab" aria-label="Éditer l'onglet"><i class="fas fa-edit"></i></button>
            <button class="delete-tab" aria-label="Supprimer l'onglet"><i class="fas fa-times"></i></button>
        </div>
    `;

    const tabContentDiv = document.createElement("div");
    tabContentDiv.classList.add("tab-content");
    tabContentDiv.textContent = content;
    if (image) {
        const img = document.createElement("img");
        img.src = image;
        tabContentDiv.appendChild(img);
    }

    tab.appendChild(tabHeader);
    tab.appendChild(tabContentDiv);
    tabsContainer.appendChild(tab);

    if (isNew) tab.classList.add("tab-added");

    // Événements pour l’onglet
    tabHeader.addEventListener("click", (e) => {
        if (!e.target.closest("button")) {
            tabContentDiv.classList.toggle("active");
        }
    });

    const deleteButton = tabHeader.querySelector(".delete-tab");
    deleteButton.addEventListener("click", (e) => {
        e.stopPropagation();
        tab.remove();
        tabs = tabs.filter(t => t.id !== id);
        localStorage.setItem("tabs", JSON.stringify(tabs));
        updateTabCount();
    });

    const editButton = tabHeader.querySelector(".edit-tab");
    editButton.addEventListener("click", (e) => {
        e.stopPropagation();
        tabNameInput.value = name;
        tabContentInput.value = content;
        tabColorInput.value = color;
        tab.remove();
        tabs = tabs.filter(t => t.id !== id);
        localStorage.setItem("tabs", JSON.stringify(tabs));
        updateTabCount();
        updatePreview();
    });

    // Drag-and-Drop
    tab.addEventListener("dragstart", () => tab.classList.add("dragging"));
    tab.addEventListener("dragend", () => tab.classList.remove("dragging"));

    updateTabCount();
}

// Charger les onglets existants
function loadTabs() {
    tabs.forEach(tab => createTabElement(tab.id, tab.name, tab.content, tab.image, tab.color));
}

// Ajouter un nouvel onglet
addTabButton.addEventListener("click", () => {
    const tabName = tabNameInput.value.trim();
    const tabContent = tabContentInput.value.trim();
    const tabColor = tabColorInput.value;
    const tabImage = tabImageInput.files[0];

    if (tabName && (tabContent || tabImage)) {
        const tabId = Date.now().toString();
        const reader = new FileReader();

        if (tabImage) {
            reader.onload = (e) => {
                const imageData = e.target.result;
                const newTab = { id: tabId, name: tabName, content: tabContent, image: imageData, color: tabColor };
                tabs.push(newTab);
                localStorage.setItem("tabs", JSON.stringify(tabs));
                createTabElement(tabId, tabName, tabContent, imageData, tabColor, true);
                resetInputs();
            };
            reader.readAsDataURL(tabImage);
        } else {
            const newTab = { id: tabId, name: tabName, content: tabContent, image: null, color: tabColor };
            tabs.push(newTab);
            localStorage.setItem("tabs", JSON.stringify(tabs));
            createTabElement(tabId, tabName, tabContent, null, tabColor, true);
            resetInputs();
        }
    } else {
        alert("Veuillez remplir au moins le nom et un contenu (texte ou image) !");
    }
});

function resetInputs() {
    tabNameInput.value = "";
    tabContentInput.value = "";
    tabImageInput.value = "";
    tabColorInput.value = "#87CEEB";
    previewContent.innerHTML = "";
}

// Drag-and-Drop pour réorganiser
tabsContainer.addEventListener("dragover", (e) => {
    e.preventDefault();
    const draggingTab = document.querySelector(".dragging");
    const afterElement = getDragAfterElement(tabsContainer, e.clientY);
    if (afterElement == null) {
        tabsContainer.appendChild(draggingTab);
    } else {
        tabsContainer.insertBefore(draggingTab, afterElement);
    }

    const newOrder = Array.from(tabsContainer.children).map(tab => {
        const id = tab.getAttribute("data-id");
        return tabs.find(t => t.id === id);
    });
    tabs = newOrder;
    localStorage.setItem("tabs", JSON.stringify(tabs));
});

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll(".tab:not(.dragging)")];
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// Basculer entre vue liste et grille
let isGridView = false;
toggleViewButton.addEventListener("click", () => {
    isGridView = !isGridView;
    tabsContainer.classList.toggle("grid");
    toggleViewButton.innerHTML = isGridView 
        ? '<i class="fas fa-list"></i> Vue liste' 
        : '<i class="fas fa-th"></i> Vue grille';
});

// Initialisation
loadTabs();
updateTabCount();