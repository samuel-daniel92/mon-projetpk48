// Détection du thème au chargement
const urlParams = new URLSearchParams(window.location.search);
const theme = urlParams.get("theme");

if (theme === "dark") {
    document.body.classList.add("dark-mode");
}

// Sélection des éléments
const barcodeTextInput = document.getElementById("barcode-text");
const generateBarcodeButton = document.getElementById("generate-barcode");
const barcodeDisplay = document.getElementById("barcode");
const downloadBarcodeButton = document.getElementById("download-barcode");

// Générer le code-barres
generateBarcodeButton.addEventListener("click", () => {
    const text = barcodeTextInput.value.trim();
    if (text) {
        JsBarcode("#barcode", text, {
            format: "CODE128",
            displayValue: true,
            fontSize: 16,
            lineColor: document.body.classList.contains("dark-mode") ? "#E2E8F0" : "#000",
            background: document.body.classList.contains("dark-mode") ? "#2D3748" : "#fff",
        });
        downloadBarcodeButton.disabled = false;
    } else {
        alert("Veuillez entrer un texte ou un numéro !");
    }
});

// Télécharger le code-barres
downloadBarcodeButton.addEventListener("click", () => {
    const svg = document.getElementById("barcode");
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png");
        link.download = "code-barres.png";
        link.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
});