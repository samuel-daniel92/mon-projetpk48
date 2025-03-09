// Sélection des éléments
const taskInput = document.getElementById("task-input");
const taskPrioritySelect = document.getElementById("task-priority");
const addTaskButton = document.getElementById("add-task");
const taskList = document.getElementById("task-list");
const totalTasksDisplay = document.getElementById("total-tasks");
const completedTasksDisplay = document.getElementById("completed-tasks");
const filterAllButton = document.getElementById("filter-all");
const filterCompletedButton = document.getElementById("filter-completed");
const filterPendingButton = document.getElementById("filter-pending");
const clearAllButton = document.getElementById("clear-all");

// Charger le thème depuis l'URL
window.onload = function () {
    const urlParams = new URLSearchParams(window.location.search);
    const theme = urlParams.get("theme");
    if (theme === "dark") document.body.classList.add("dark-mode");

    // Ajouter les écouteurs d'événements
    addTaskButton.addEventListener("click", addTask);
    taskInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") addTask();
    });
    filterAllButton.addEventListener("click", () => filterTasks("all"));
    filterCompletedButton.addEventListener("click", () => filterTasks("completed"));
    filterPendingButton.addEventListener("click", () => filterTasks("pending"));
    clearAllButton.addEventListener("click", clearAllTasks);

    // Charger les tâches sauvegardées
    loadTasks();
    updateStats();
};

// Fonction pour ajouter une tâche
function addTask() {
    const taskText = taskInput.value.trim();
    const priority = taskPrioritySelect.value;
    if (taskText === "") return;

    const li = createTaskElement(taskText, priority);
    taskList.appendChild(li);
    li.classList.add("task-added");
    taskInput.value = "";
    saveTasks();
    updateStats();
}

// Créer un élément de tâche
function createTaskElement(text, priority, completed = false) {
    const li = document.createElement("li");
    li.classList.add(priority);
    if (completed) li.classList.add("completed");
    li.innerHTML = `
        <input type="checkbox" aria-label="Marquer comme terminé" ${completed ? "checked" : ""}>
        <span>${text}</span>
        <div class="buttons">
            <button class="edit-task" aria-label="Modifier la tâche"><i class="fas fa-edit"></i></button>
            <button class="delete-task" aria-label="Supprimer la tâche"><i class="fas fa-trash"></i></button>
        </div>
    `;

    const checkbox = li.querySelector("input[type='checkbox']");
    checkbox.addEventListener("change", () => {
        li.classList.toggle("completed");
        saveTasks();
        updateStats();
    });

    const editButton = li.querySelector(".edit-task");
    editButton.addEventListener("click", () => editTask(li));

    const deleteButton = li.querySelector(".delete-task");
    deleteButton.addEventListener("click", () => {
        li.classList.add("task-removed");
        li.addEventListener("animationend", () => {
            li.remove();
            saveTasks();
            updateStats();
        }, { once: true }); // Écouteur unique pour éviter les doublons
    });

    return li;
}

// Modifier une tâche
function editTask(li) {
    const span = li.querySelector("span");
    const currentText = span.textContent;
    const input = document.createElement("input");
    input.type = "text";
    input.value = currentText;
    input.classList.add("edit-input");

    li.replaceChild(input, span);
    input.focus();

    input.addEventListener("blur", () => saveEdit(li, input));
    input.addEventListener("keypress", (e) => {
        if (e.key === "Enter") saveEdit(li, input);
    });
}

function saveEdit(li, input) {
    const newText = input.value.trim();
    if (newText) {
        const newSpan = document.createElement("span");
        newSpan.textContent = newText;
        li.replaceChild(newSpan, input);
        saveTasks();
    } else {
        li.remove();
        saveTasks();
    }
    updateStats();
}

// Sauvegarder les tâches dans localStorage
function saveTasks() {
    const tasks = Array.from(taskList.children).map((li) => ({
        text: li.querySelector("span").textContent,
        priority: li.classList.contains("low") ? "low" : li.classList.contains("medium") ? "medium" : "high",
        completed: li.classList.contains("completed"),
    }));
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Charger les tâches depuis localStorage
function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks.forEach((task) => {
        const li = createTaskElement(task.text, task.priority, task.completed);
        taskList.appendChild(li);
    });
}

// Mettre à jour les statistiques
function updateStats() {
    const total = taskList.children.length;
    const completed = Array.from(taskList.children).filter(li => li.classList.contains("completed")).length;
    totalTasksDisplay.textContent = total;
    completedTasksDisplay.textContent = completed;
}

// Filtrer les tâches
function filterTasks(filter) {
    const tasks = taskList.children;
    Array.from(tasks).forEach(li => {
        switch (filter) {
            case "all":
                li.style.display = "flex";
                break;
            case "completed":
                li.style.display = li.classList.contains("completed") ? "flex" : "none";
                break;
            case "pending":
                li.style.display = !li.classList.contains("completed") ? "flex" : "none";
                break;
        }
    });

    [filterAllButton, filterCompletedButton, filterPendingButton].forEach(btn => btn.classList.remove("active"));
    if (filter === "all") filterAllButton.classList.add("active");
    else if (filter === "completed") filterCompletedButton.classList.add("active");
    else filterPendingButton.classList.add("active");
}

// Supprimer toutes les tâches (corrigé)
function clearAllTasks() {
    if (confirm("Voulez-vous vraiment supprimer toutes les tâches ?")) {
        const tasks = Array.from(taskList.children);
        if (tasks.length === 0) return;

        const promises = tasks.map(li => {
            return new Promise(resolve => {
                li.classList.add("task-removed");
                li.addEventListener("animationend", () => {
                    li.remove();
                    resolve();
                }, { once: true });
            });
        });

        Promise.all(promises).then(() => {
            taskList.innerHTML = ""; // Vider uniquement après toutes les animations
            saveTasks();
            updateStats();
        });
    }
}

// Écouter les messages de la page parente pour le mode sombre
window.addEventListener("message", (event) => {
    if (event.data.theme) {
        document.body.classList.toggle("dark-mode", event.data.theme === "dark");
    }
});