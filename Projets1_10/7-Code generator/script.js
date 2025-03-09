// Détection du thème au chargement
const urlParams = new URLSearchParams(window.location.search);
const theme = urlParams.get("theme");
if (theme === "dark") {
    document.body.classList.add("dark-mode");
    document.getElementById("line-color").value = "#E2E8F0";
    document.getElementById("bg-color").value = "#2D3748";
}

// Sélection des éléments
const codeTextInput = document.getElementById("code-text");
const codeTypeSelect = document.getElementById("code-type");
const lineColorInput = document.getElementById("line-color");
const bgColorInput = document.getElementById("bg-color");
const generateCodeButton = document.getElementById("generate-code");
const codeOutput = document.getElementById("code-output");
const downloadPngButton = document.getElementById("download-png");
const downloadPdfButton = document.getElementById("download-pdf");
const historyList = document.getElementById("history-list");

// Historique des codes
let codeHistory = JSON.parse(localStorage.getItem("codeHistory")) || [];

// Générer le code
generateCodeButton.addEventListener("click", () => {
    const text = codeTextInput.value.trim();
    const type = codeTypeSelect.value;
    const lineColor = lineColorInput.value;
    const bgColor = bgColorInput.value;

    if (!text) {
        alert("Veuillez entrer un texte ou un numéro !");
        return;
    }

    codeOutput.innerHTML = ""; // Réinitialiser le conteneur

    if (type === "barcode") {
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.id = "barcode-output";
        codeOutput.appendChild(svg);
        JsBarcode(svg, text, {
            format: "CODE128",
            displayValue: true,
            fontSize: 16,
            lineColor: lineColor,
            background: bgColor,
            width: 2,
            height: 100,
        });
    } else if (type === "qrcode") {
        const qrContainer = document.createElement("div");
        qrContainer.id = "qrcode-output";
        codeOutput.appendChild(qrContainer);
        const qrcode = new QRCode(qrContainer, {
            text: text,
            width: 300,
            height: 300,
            colorDark: lineColor,
            colorLight: bgColor,
            correctLevel: QRCode.CorrectLevel.H,
        });

        console.log("QR Code généré pour :", text);
        if (!qrContainer.querySelector("canvas")) {
            console.error("Échec de la génération du QR code : canvas non trouvé.");
            alert("Erreur lors de la génération du QR code. Vérifiez la console pour plus de détails.");
        }
    }

    downloadPngButton.disabled = false;
    downloadPdfButton.disabled = false; // PDF activé pour les deux types
    updateHistory(text, type);
});

// Télécharger en PNG
downloadPngButton.addEventListener("click", () => {
    const element = codeOutput.firstChild;
    if (element.tagName === "svg") {
        const svgData = new XMLSerializer().serializeToString(element);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            const link = document.createElement("a");
            link.href = canvas.toDataURL("image/png");
            link.download = `${codeTypeSelect.value}.png`;
            link.click();
        };
        img.src = "data:image/svg+xml;base64," + btoa(svgData);
    } else if (element.querySelector("canvas")) {
        const canvas = element.querySelector("canvas");
        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png");
        link.download = "qrcode.png";
        link.click();
    }
});

// Télécharger en PDF
downloadPdfButton.addEventListener("click", () => {
    const { jsPDF } = window.jspdf; // Récupérer jsPDF depuis l’objet global
    const doc = new jsPDF();
    const element = codeOutput.firstChild;

    if (element.tagName === "svg") {
        const svgData = new XMLSerializer().serializeToString(element);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            const imgData = canvas.toDataURL("image/png");
            doc.addImage(imgData, "PNG", 10, 10, 190, 0); // Largeur 190mm, hauteur auto
            doc.save(`${codeTypeSelect.value}.pdf`);
        };
        img.src = "data:image/svg+xml;base64," + btoa(svgData);
    } else if (element.querySelector("canvas")) {
        const canvas = element.querySelector("canvas");
        const imgData = canvas.toDataURL("image/png");
        doc.addImage(imgData, "PNG", 10, 10, 190, 0); // Largeur 190mm, hauteur auto
        doc.save("qrcode.pdf");
    }
});

// Mettre à jour l’historique
function updateHistory(text, type) {
    const entry = { text, type, timestamp: Date.now() };
    codeHistory.unshift(entry);
    if (codeHistory.length > 5) codeHistory.pop();
    localStorage.setItem("codeHistory", JSON.stringify(codeHistory));
    renderHistory();
}

// Rendre l’historique
function renderHistory() {
    historyList.innerHTML = "";
    codeHistory.forEach((entry, index) => {
        const li = document.createElement("li");
        li.innerHTML = `
            <span>${entry.type === "barcode" ? "Code-barres" : "Code QR"}: ${entry.text}</span>
            <button class="delete-code" aria-label="Supprimer l’entrée"><i class="fas fa-trash"></i></button>
        `;

        li.querySelector("span").addEventListener("click", () => {
            codeTextInput.value = entry.text;
            codeTypeSelect.value = entry.type;
            generateCodeButton.click();
        });

        li.querySelector(".delete-code").addEventListener("click", (e) => {
            e.stopPropagation();
            codeHistory.splice(index, 1);
            localStorage.setItem("codeHistory", JSON.stringify(codeHistory));
            renderHistory();
        });

        historyList.appendChild(li);
    });
}

// Initialisation
renderHistory();