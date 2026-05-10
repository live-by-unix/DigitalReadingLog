
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const logBody = document.getElementById("logBody");
const saveStatus = document.getElementById("saveStatus");

let currentSignatureDay = null;

days.forEach(day => {
  const tr = document.createElement("tr");

  tr.innerHTML = `
    <td class="day-cell">${day}</td>
    <td><input class="table-input" data-save="${day}-book"></td>
    <td><input class="table-input" data-save="${day}-genre"></td>
    <td><input class="table-input minutes-field" data-save="${day}-minutes"></td>
    <td><input class="table-input" data-save="${day}-pages"></td>
    <td>
      <button class="sign-btn" data-day="${day}">Sign</button>
      <div>
        <img class="signature-preview" id="${day}-signature-preview"/>
      </div>
    </td>
  `;

  logBody.appendChild(tr);
});

function saveData() {
  document.querySelectorAll("[data-save]").forEach(el => {
    localStorage.setItem(el.dataset.save, el.value);
  });

  saveStatus.textContent = "✓ Saved Automatically";

  setTimeout(() => {
    saveStatus.textContent = "✓ All Changes Saved";
  }, 1200);
}

function loadData() {
  document.querySelectorAll("[data-save]").forEach(el => {
    const saved = localStorage.getItem(el.dataset.save);
    if (saved !== null) {
      el.value = saved;
    }
  });

  days.forEach(day => {
    const sig = localStorage.getItem(`${day}-signature`);
    if (sig) {
      document.getElementById(`${day}-signature-preview`).src = sig;
    }
  });
}

document.addEventListener("input", saveData);

loadData();

// TIMER
const timerDisplay = document.getElementById("timerDisplay");
const timerMinutes = document.getElementById("timerMinutes");

let timer;
let remainingSeconds = Number(localStorage.getItem("timerRemaining")) || 1500;

function updateTimerDisplay() {
  const mins = String(Math.floor(remainingSeconds / 60)).padStart(2, "0");
  const secs = String(remainingSeconds % 60).padStart(2, "0");
  timerDisplay.textContent = `${mins}:${secs}`;
}

updateTimerDisplay();

document.querySelectorAll(".preset").forEach(btn => {
  btn.addEventListener("click", () => {
    timerMinutes.value = btn.dataset.min;
    remainingSeconds = Number(btn.dataset.min) * 60;
    updateTimerDisplay();
  });
});

document.getElementById("startTimer").addEventListener("click", () => {
  clearInterval(timer);

  timer = setInterval(() => {
    remainingSeconds--;

    localStorage.setItem("timerRemaining", remainingSeconds);

    updateTimerDisplay();

    if (remainingSeconds <= 0) {
      clearInterval(timer);

      alert("Reading session complete!");

      const today = new Date().toLocaleDateString("en-US", {
        weekday: "long"
      });

      const field = document.querySelector(`[data-save="${today}-minutes"]`);

      if (field && !field.value) {
        field.value = timerMinutes.value;
        saveData();
      }
    }
  }, 1000);
});

document.getElementById("pauseTimer").addEventListener("click", () => {
  clearInterval(timer);
});

document.getElementById("resetTimer").addEventListener("click", () => {
  clearInterval(timer);

  remainingSeconds = Number(timerMinutes.value) * 60;

  localStorage.setItem("timerRemaining", remainingSeconds);

  updateTimerDisplay();
});

// SIGNATURE
const modal = document.getElementById("signatureModal");
const canvas = document.getElementById("signatureCanvas");

const signaturePad = new SignaturePad(canvas);

document.querySelectorAll(".sign-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    currentSignatureDay = btn.dataset.day;
    modal.classList.remove("hidden");
  });
});

document.getElementById("clearSignature").addEventListener("click", () => {
  signaturePad.clear();
});

document.getElementById("closeSignature").addEventListener("click", () => {
  modal.classList.add("hidden");
});

document.getElementById("saveSignature").addEventListener("click", () => {
  if (signaturePad.isEmpty()) {
    alert("Please draw initials first.");
    return;
  }

  const dataURL = signaturePad.toDataURL();

  localStorage.setItem(`${currentSignatureDay}-signature`, dataURL);

  document.getElementById(`${currentSignatureDay}-signature-preview`).src = dataURL;

  modal.classList.add("hidden");
});

// PDF EXPORT
document.getElementById("exportBtn").addEventListener("click", async () => {
  const { jsPDF } = window.jspdf;

  const canvas = await html2canvas(document.getElementById("readingLog"));

  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF("p", "mm", "a4");

  const width = 190;
  const height = canvas.height * width / canvas.width;

  pdf.addImage(imgData, "PNG", 10, 10, width, height);

  pdf.save("DigitalReadingLog.pdf");
});

// PRINT
document.getElementById("printBtn").addEventListener("click", () => {
  window.print();
});

// CLEAR
document.getElementById("clearBtn").addEventListener("click", () => {
  if (!confirm("Clear entire reading log?")) return;

  localStorage.clear();
  location.reload();
});
