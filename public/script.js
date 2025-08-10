let selectedFiles = [];
let selectedFormat = null;
let supportedFormats = [];

// Progress bar state
let progressInterval = null;
let progressValue = 0;

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
      showErrorPage(data.error);
    }
  } catch (err) {
    console.error(err);
    showErrorPage({ code: 'NETWORK', message: 'There was an error uploading your files.' });
  }
});

// Display progress bar
function showProgress() {
  const progressSection = document.getElementById("progress-section");
  const progressFill = document.getElementById("progress-fill");
  const progressText = document.getElementById("progress-text");

  progressSection.style.display = "block";
  document.getElementById("main-page").classList.add("disabled");

  // Reset and start an incremental animation until the server responds
  progressValue = 0;
  progressFill.style.width = "0%";
  progressText.textContent = "Converting files... 0%";

  progressInterval = setInterval(() => {
    progressValue = Math.min(progressValue + Math.random() * 10, 90);
    progressFill.style.width = `${progressValue}%`;
    progressText.textContent = `Converting files... ${Math.floor(progressValue)}%`;
  }, 500);

  document.getElementById("upload-icon").classList.add("complete");
  const convertIcon = document.getElementById("convert-icon");
  convertIcon.classList.remove("inactive");
  convertIcon.classList.add("processing");
}

// Show conversion results
function showDownloadPage(convertedFiles) {
  // Finalize progress bar before showing results
  clearInterval(progressInterval);
  const progressFill = document.getElementById("progress-fill");
  const progressText = document.getElementById("progress-text");
  progressFill.style.width = "100%";
  progressText.textContent = "Converting files... 100%";

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

// Show error page with explanation
function showErrorPage(error) {
  // Finalize progress bar before displaying the error page
  clearInterval(progressInterval);
  const progressFill = document.getElementById("progress-fill");
  const progressText = document.getElementById("progress-text");
  progressFill.style.width = "100%";
  progressText.textContent = "Converting files... 100%";

  document.getElementById("main-page").style.display = "none";
  document.getElementById("progress-section").style.display = "none";
  document.getElementById("error-page").style.display = "block";

  const convertIcon = document.getElementById("convert-icon");
  convertIcon.classList.remove("processing");
  convertIcon.classList.add("error");

  document.getElementById("error-title").textContent =
    (error && error.code) ? error.code.replace(/_/g, ' ') : "ERROR";
  document.getElementById("error-description").textContent =
    (error && error.message) ? error.message : "An unknown error occurred during conversion.";
}

// "New Conversion" button
document.getElementById("new-conversion-button").addEventListener("click", () => {
  location.reload();
});

document.getElementById("error-new-conversion-button").addEventListener("click", () => {
  location.reload();
});
