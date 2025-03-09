// Détection du thème au chargement
const urlParams = new URLSearchParams(window.location.search);
const theme = urlParams.get("theme");

if (theme === "dark") {
    document.body.classList.add("dark-mode");
}

// Sélection des éléments
const tabNameInput = document.getElementById("tab-name");
const tabContentInput = document.getElementById("tab-content");
const addTabButton = document.getElementById("add-tab");
const tabsContainer = document.getElementById("tabs-container");
const tabCountDisplay = document.getElementById("tab-count");

// Charger les onglets depuis localStorage
let tabs = JSON.parse(localStorage.getItem("tabs")) || [];

// Mettre à jour le compteur
function updateTabCount() {
    tabCountDisplay.textContent = tabsContainer.children.length;
}

// Ajouter un onglet au DOM
function createTabElement(id, name, content, isNew = false) {
    const tab = document.createElement("div");
    tab.classList.add("tab");
    tab.setAttribute("data-id", id);
    tab.draggable = true;

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
        tab.remove();
        tabs = tabs.filter(t => t.id !== id);
        localStorage.setItem("tabs", JSON.stringify(tabs));
        updateTabCount();
    });

    // Drag-and-Drop
    tab.addEventListener("dragstart", () => tab.classList.add("dragging"));
    tab.addEventListener("dragend", () => tab.classList.remove("dragging"));

    updateTabCount();
}

// Charger les onglets existants
function loadTabs() {
    tabs.forEach(tab => createTabElement(tab.id, tab.name, tab.content));
}

// Ajouter un nouvel onglet
addTabButton.addEventListener("click", () => {
    const tabName = tabNameInput.value.trim();
    const tabContent = tabContentInput.value.trim();

    if (tabName && tabContent) {
        const tabId = Date.now().toString();
        const newTab = { id: tabId, name: tabName, content: tabContent };
        tabs.push(newTab);
        localStorage.setItem("tabs", JSON.stringify(tabs));
        createTabElement(tabId, tabName, tabContent, true);

        tabNameInput.value = "";
        tabContentInput.value = "";
    } else {
        alert("Veuillez remplir le nom et le contenu de l’onglet !");
    }
});

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

    // Mettre à jour l’ordre dans tabs
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

// Initialisation
loadTabs();
updateTabCount();