// Détection du thème
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get("theme") === "dark") document.body.classList.add("dark-mode");

// Variables globales
let hours = 0, minutes = 0, seconds = 0, milliseconds = 0;
let intervalId = null;
let isRunning = false;
let isCountdown = false;
let countdownTime = 0;

// Sélection des éléments
const hoursDisplay = document.getElementById("hours");
const minutesDisplay = document.getElementById("minutes");
const secondsDisplay = document.getElementById("seconds");
const millisecondsDisplay = document.getElementById("milliseconds");
const startButton = document.getElementById("start");
const lapButton = document.getElementById("lap");
const resetButton = document.getElementById("reset");
const countdownToggleButton = document.getElementById("countdown-toggle");
const countdownInput = document.getElementById("countdown-input");
const countdownHours = document.getElementById("countdown-hours");
const countdownMinutes = document.getElementById("countdown-minutes");
const countdownSeconds = document.getElementById("countdown-seconds");
const lapNameInput = document.getElementById("lap-name");
const alarmSoundSelect = document.getElementById("alarm-sound");
const lapsList = document.getElementById("laps-list");
const alarm = document.getElementById("countdown-alarm");

// Initialisation
window.onload = function () {
    updateDisplay();
    loadLaps();
    updateAlarmSound();

    startButton.addEventListener("click", toggleStart);
    lapButton.addEventListener("click", addLap);
    resetButton.addEventListener("click", reset);
    countdownToggleButton.addEventListener("click", toggleCountdown);
    alarmSoundSelect.addEventListener("change", updateAlarmSound);
};

// Mettre à jour l’affichage
function updateDisplay() {
    hoursDisplay.textContent = String(hours).padStart(2, "0");
    minutesDisplay.textContent = String(minutes).padStart(2, "0");
    secondsDisplay.textContent = String(seconds).padStart(2, "0");
    millisecondsDisplay.textContent = String(milliseconds).padStart(3, "0");
}

// Mettre à jour le chronomètre
function updateChrono() {
    if (isCountdown) {
        countdownTime -= 10;
        if (countdownTime <= 0) {
            countdownTime = 0;
            clearInterval(intervalId);
            isRunning = false;
            alarm.play();
            startButton.innerHTML = '<i class="fas fa-play"></i>';
            toggleButtons(false);
            updateTimeFromCountdown();
            return;
        }
        updateTimeFromCountdown();
    } else {
        milliseconds += 10;
        if (milliseconds >= 1000) {
            milliseconds = 0;
            seconds++;
        }
        if (seconds >= 60) {
            seconds = 0;
            minutes++;
        }
        if (minutes >= 60) {
            minutes = 0;
            hours++;
        }
    }
    updateDisplay();
}

// Convertir le temps du compte à rebours
function updateTimeFromCountdown() {
    let totalMs = countdownTime;
    hours = Math.floor(totalMs / (1000 * 60 * 60));
    totalMs %= 1000 * 60 * 60;
    minutes = Math.floor(totalMs / (1000 * 60));
    totalMs %= 1000 * 60;
    seconds = Math.floor(totalMs / 1000);
    milliseconds = totalMs % 1000;
    updateDisplay();
}

// Démarrer ou mettre en pause
function toggleStart() {
    if (!isRunning) {
        if (isCountdown) {
            const h = parseInt(countdownHours.value) || 0;
            const m = parseInt(countdownMinutes.value) || 0;
            const s = parseInt(countdownSeconds.value) || 0;
            countdownTime = (h * 3600 + m * 60 + s) * 1000;
            if (countdownTime <= 0) {
                alert("Veuillez définir une durée valide !");
                return;
            }
        }
        intervalId = setInterval(updateChrono, 10);
        isRunning = true;
        startButton.innerHTML = '<i class="fas fa-pause"></i>';
        toggleButtons(true);
    } else {
        clearInterval(intervalId);
        isRunning = false;
        startButton.innerHTML = '<i class="fas fa-play"></i>';
        toggleButtons(false);
    }
}

// Gérer l’état des boutons
function toggleButtons(running) {
    startButton.disabled = false;
    lapButton.disabled = !running;
    resetButton.disabled = !running && countdownTime === 0 && hours === 0 && minutes === 0 && seconds === 0 && milliseconds === 0;
    countdownToggleButton.disabled = running;
}

// Ajouter un temps intermédiaire
function addLap() {
    const time = `${hoursDisplay.textContent}:${minutesDisplay.textContent}:${secondsDisplay.textContent}.${millisecondsDisplay.textContent}`;
    const name = lapNameInput.value.trim() || `Tour ${lapsList.children.length + 1}`;
    const li = document.createElement("li");
    li.textContent = `${name} - ${time}`;
    lapsList.insertBefore(li, lapsList.firstChild);
    saveLaps();
    lapNameInput.value = "";
}

// Réinitialiser
function reset() {
    clearInterval(intervalId);
    isRunning = false;
    hours = 0;
    minutes = 0;
    seconds = 0;
    milliseconds = 0;
    countdownTime = 0;
    updateDisplay();
    startButton.innerHTML = '<i class="fas fa-play"></i>';
    toggleButtons(false);
    countdownInput.style.display = "none";
    isCountdown = false;
    lapsList.innerHTML = "";
    localStorage.removeItem("laps");
}

// Basculer vers le compte à rebours
function toggleCountdown() {
    if (isRunning) return;
    isCountdown = !isCountdown;
    countdownInput.style.display = isCountdown ? "flex" : "none";
    countdownToggleButton.style.backgroundColor = isCountdown ? "var(--secondary-color)" : "var(--button-bg)";
    reset();
}

// Sauvegarder et charger les laps
function saveLaps() {
    const laps = Array.from(lapsList.children).map(li => li.textContent);
    localStorage.setItem("laps", JSON.stringify(laps));
}

function loadLaps() {
    const laps = JSON.parse(localStorage.getItem("laps")) || [];
    laps.reverse().forEach(lap => {
        const li = document.createElement("li");
        li.textContent = lap;
        lapsList.appendChild(li);
    });
}

// Mettre à jour le son d’alarme
function updateAlarmSound() {
    const sound = alarmSoundSelect.value;
    alarm.src = `https://www.soundjay.com/buttons/${sound}`;
}