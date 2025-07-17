let selectedFiles = [];
let selectedFormat = null;

// Výber formátu
document.querySelectorAll(".format-option").forEach(option => {
  option.addEventListener("click", () => {
    document.querySelectorAll(".format-option").forEach(o => o.classList.remove("selected"));
    option.classList.add("selected");
    selectedFormat = option.dataset.format;
    checkReadyState();
  });
});

// Výber súborov
const fileInput = document.getElementById("file-input");
const fileUpload = document.getElementById("file-upload");
const selectedFilesContainer = document.getElementById("selected-files");

// Po kliknutí na upload zónu otvorí dialóg pre výber súborov
fileUpload.addEventListener("click", () => fileInput.click());

// Umožní drag & drop nahrávanie súborov
fileUpload.addEventListener("dragover", (e) => {
  e.preventDefault();
  fileUpload.classList.add("dragover");
});

fileUpload.addEventListener("dragleave", () => {
  fileUpload.classList.remove("dragover");
});

fileUpload.addEventListener("drop", (e) => {
  e.preventDefault();
  fileUpload.classList.remove("dragover");
  const files = Array.from(e.dataTransfer.files);
  selectedFiles = selectedFiles.concat(files);
  displaySelectedFiles();
  checkReadyState();
});

// Reaguje na zmenu inputu a prida nové súbory k existujúcim
fileInput.addEventListener("change", (e) => {
  selectedFiles = selectedFiles.concat(Array.from(e.target.files));
  displaySelectedFiles();
  checkReadyState();
});

function displaySelectedFiles() {
  selectedFilesContainer.innerHTML = "";
  selectedFiles.forEach(file => {
    const item = document.createElement("div");
    item.classList.add("file-item");

    const name = document.createElement("div");
    name.classList.add("file-name");
    name.textContent = file.name;

    const size = document.createElement("div");
    size.classList.add("file-size");
    size.textContent = `${(file.size / 1024).toFixed(1)} KB`;

    item.appendChild(name);
    item.appendChild(size);
    selectedFilesContainer.appendChild(item);
  });
}

function checkReadyState() {
  const startBtn = document.getElementById("start-button");
  if (selectedFiles.length > 0 && selectedFormat) {
    startBtn.disabled = false;
  } else {
    startBtn.disabled = true;
  }
}

// Spustenie konverzie
document.getElementById("start-button").addEventListener("click", async () => {
  if (!["litematic", "schem", "schematic", "nbt"].includes(selectedFormat)) {
    alert("Zvolený formát nie je podporovaný.");
    return;
  }

  const formData = new FormData();
  selectedFiles.forEach(file => formData.append("files", file));
  formData.append("format", selectedFormat);

  showProgress();

  try {
    const response = await fetch("/convert", {
      method: "POST",
      body: formData
    });

    const data = await response.json();
    if (data.success) {
      showDownloadPage(data.converted);
    } else {
      alert("Chyba pri konverzii: " + data.error);
    }
  } catch (err) {
    console.error(err);
    alert("Došlo k chybe pri odosielaní súborov.");
  }
});

// Zobrazenie progres baru
function showProgress() {
  document.getElementById("progress-section").style.display = "block";
  document.getElementById("main-page").classList.add("disabled");
  document.getElementById("progress-fill").style.width = "100%";
}

// Zobrazenie výsledkov
function showDownloadPage(convertedFiles) {
  document.getElementById("main-page").style.display = "none";
  document.getElementById("download-page").style.display = "block";

  const container = document.getElementById("download-files");
  container.innerHTML = "";

  convertedFiles.forEach(file => {
    const link = document.createElement("a");
    link.href = `/converted/${file.filename}`;
    link.download = file.filename;
    link.textContent = `⬇ ${file.filename}`;
    link.classList.add("download-link");

    const wrapper = document.createElement("div");
    wrapper.appendChild(link);
    container.appendChild(wrapper);
  });
}

// Tlačidlo Nová konverzia
document.getElementById("new-conversion-button").addEventListener("click", () => {
  location.reload();
});
