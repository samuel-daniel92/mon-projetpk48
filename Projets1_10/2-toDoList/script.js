// Sélection des éléments
const taskInput = document.getElementById("task-input");
const addTaskButton = document.getElementById("add-task");
const taskList = document.getElementById("task-list");

// Charger le thème depuis l'URL
window.onload = function () {
    const urlParams = new URLSearchParams(window.location.search);
    const theme = urlParams.get("theme");
    if (theme === "dark") {
        document.body.classList.add("dark-mode");
    }

    // Ajouter les écouteurs d'événements
    addTaskButton.addEventListener("click", addTask);
    taskInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") addTask();
    });

    // Charger les tâches sauvegardées
    loadTasks();
};

// Fonction pour ajouter une tâche
function addTask() {
    const taskText = taskInput.value.trim();
    if (taskText === "") return;

    const li = document.createElement("li");
    li.innerHTML = `
        <input type="checkbox" aria-label="Marquer comme terminé">
        <span>${taskText}</span>
        <button aria-label="Supprimer la tâche"><i class="fas fa-trash"></i></button>
    `;

    // Gestion de la complétion
    const checkbox = li.querySelector("input[type='checkbox']");
    checkbox.addEventListener("change", () => {
        li.classList.toggle("completed");
        saveTasks();
    });

    // Gestion de la suppression
    const deleteButton = li.querySelector("button");
    deleteButton.addEventListener("click", () => {
        li.remove();
        saveTasks();
    });

    taskList.appendChild(li);
    taskInput.value = "";
    saveTasks();
}

// Sauvegarder les tâches dans localStorage
function saveTasks() {
    const tasks = Array.from(taskList.children).map((li) => ({
        text: li.querySelector("span").textContent,
        completed: li.classList.contains("completed"),
    }));
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Charger les tâches depuis localStorage
function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks.forEach((task) => {
        const li = document.createElement("li");
        li.innerHTML = `
            <input type="checkbox" aria-label="Marquer comme terminé" ${task.completed ? "checked" : ""}>
            <span>${task.text}</span>
            <button aria-label="Supprimer la tâche"><i class="fas fa-trash"></i></button>
        `;
        if (task.completed) li.classList.add("completed");

        const checkbox = li.querySelector("input[type='checkbox']");
        checkbox.addEventListener("change", () => {
            li.classList.toggle("completed");
            saveTasks();
        });

        const deleteButton = li.querySelector("button");
        deleteButton.addEventListener("click", () => {
            li.remove();
            saveTasks();
        });

        taskList.appendChild(li);
    });
}

// Écouter les messages de la page parente pour le mode sombre
window.addEventListener("message", (event) => {
    if (event.data.theme) {
        document.body.classList.toggle("dark-mode", event.data.theme === "dark");
    }
});