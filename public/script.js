let selectedFiles = [];
let selectedFormat = null;
let supportedFormats = [];

async function loadFormats() {
  try {
    const res = await fetch('formats');
    const data = await res.json();
    supportedFormats = data.formats;
    const accept = supportedFormats.map(f => '.' + f).join(',');
    fileInput.setAttribute('accept', accept);
    document.querySelector('.file-upload-subtext').textContent =
      'Supported: ' + accept;
  } catch (e) {
    console.error('Failed to load formats', e);
  }
}

// Format selection
document.querySelectorAll(".format-option").forEach(option => {
  option.addEventListener("click", () => {
    document.querySelectorAll(".format-option").forEach(o => o.classList.remove("selected"));
    option.classList.add("selected");
    selectedFormat = option.dataset.format;
    checkReadyState();
  });
});

// File selection
const fileInput = document.getElementById("file-input");
const fileUpload = document.getElementById("file-upload");
const selectedFilesContainer = document.getElementById("selected-files");

loadFormats();

// Open file dialog when the upload area is clicked
fileUpload.addEventListener("click", () => fileInput.click());

// Allow drag & drop file uploads
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

// Add newly selected files to the list when the input changes
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

// Start conversion
document.getElementById("start-button").addEventListener("click", async () => {
  if (!supportedFormats.includes(selectedFormat)) {
    alert("The selected format is not supported.");
    return;
  }

  const formData = new FormData();
  selectedFiles.forEach(file => formData.append("files", file));
  formData.append("format", selectedFormat);

  showProgress();

  try {
    // Use absolute URL based on current origin to avoid cross-origin issues
    const response = await fetch(`${window.location.origin}/convert`, {
      method: "POST",
      body: formData
    });

    const data = await response.json();
    if (data.success) {
      showDownloadPage(data.converted);
    } else {
      alert("Conversion failed: " + data.error);
    }
  } catch (err) {
    console.error(err);
    alert("There was an error uploading your files.");
  }
});

// Display progress bar
function showProgress() {
  document.getElementById("progress-section").style.display = "block";
  document.getElementById("main-page").classList.add("disabled");
  document.getElementById("progress-fill").style.width = "100%";

  document.getElementById("upload-icon").classList.add("complete");
  const convertIcon = document.getElementById("convert-icon");
  convertIcon.classList.remove("inactive");
  convertIcon.classList.add("processing");
}

// Show conversion results
function showDownloadPage(convertedFiles) {
  document.getElementById("main-page").style.display = "none";
  document.getElementById("download-page").style.display = "block";

  const convertIcon = document.getElementById("convert-icon");
  convertIcon.classList.remove("processing");
  convertIcon.classList.add("complete");
  const downloadIcon = document.getElementById("download-icon");
  downloadIcon.classList.remove("inactive");
  downloadIcon.classList.add("complete");

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

// "New Conversion" button
document.getElementById("new-conversion-button").addEventListener("click", () => {
  location.reload();
});
