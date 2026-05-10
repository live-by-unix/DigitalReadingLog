
const days = ["Monday","Tuesday","Wednesday","Thursday","Friday"];
const logBody = document.getElementById("logBody");

days.forEach(day=>{
  const row = document.createElement("tr");

  row.innerHTML = `
    <td>${day}</td>
    <td><input class="table-input" data-save="${day}-book"></td>
    <td><input class="table-input" data-save="${day}-genre"></td>
    <td><input class="table-input minutes-field" data-save="${day}-minutes"></td>
    <td><input class="table-input pages-field" data-save="${day}-pages"></td>
    <td>
      <button class="sign-btn" data-day="${day}">Sign</button>
      <div>
        <img class="signature-preview" id="${day}-signature-preview">
      </div>
    </td>
  `;

  logBody.appendChild(row);
});

document.querySelectorAll("[data-save]").forEach(el=>{
  const saved = localStorage.getItem(el.dataset.save);

  if(saved !== null){
    el.value = saved;
  }

  el.addEventListener("input",()=>{
    localStorage.setItem(el.dataset.save,el.value);
  });
});

let logId = localStorage.getItem("readingLogId");

if(!logId){
  logId = "readinglog-" + Math.random().toString(36).substring(2,10);
  localStorage.setItem("readingLogId",logId);
}

document.getElementById("logId").textContent =
location.origin + "/" + logId;

const themeToggle = document.getElementById("themeToggle");

if(localStorage.getItem("theme")==="dark"){
  document.body.classList.add("dark");
  themeToggle.textContent = "☀️ Light Mode";
}

themeToggle.addEventListener("click",()=>{
  document.body.classList.toggle("dark");

  const dark = document.body.classList.contains("dark");

  localStorage.setItem("theme",dark ? "dark" : "light");

  themeToggle.textContent =
  dark ? "☀️ Light Mode" : "🌙 Dark Mode";
});

let remainingSeconds =
Number(localStorage.getItem("timerRemaining")) || 1500;

const timerDisplay = document.getElementById("timerDisplay");
const timerMinutes = document.getElementById("timerMinutes");

function updateTimer(){
  const mins = String(Math.floor(remainingSeconds/60)).padStart(2,"0");
  const secs = String(remainingSeconds%60).padStart(2,"0");

  timerDisplay.textContent = `${mins}:${secs}`;
}

updateTimer();

document.querySelectorAll(".preset").forEach(btn=>{
  btn.addEventListener("click",()=>{
    timerMinutes.value = btn.dataset.min;
    remainingSeconds = Number(btn.dataset.min) * 60;
    updateTimer();
  });
});

let timer;

document.getElementById("startTimer").addEventListener("click",()=>{
  clearInterval(timer);

  timer = setInterval(()=>{
    remainingSeconds--;

    localStorage.setItem("timerRemaining",remainingSeconds);

    updateTimer();

    if(remainingSeconds <= 0){
      clearInterval(timer);
      alert("Reading complete!");
    }
  },1000);
});

document.getElementById("pauseTimer").addEventListener("click",()=>{
  clearInterval(timer);
});

document.getElementById("resetTimer").addEventListener("click",()=>{
  clearInterval(timer);

  remainingSeconds = Number(timerMinutes.value) * 60;

  updateTimer();
});

const modal = document.getElementById("signatureModal");
const canvas = document.getElementById("signatureCanvas");

const signaturePad = new SignaturePad(canvas);

let currentSignatureDay = null;

document.addEventListener("click",(e)=>{
  if(e.target.classList.contains("sign-btn")){
    currentSignatureDay = e.target.dataset.day;
    modal.classList.remove("hidden");
  }
});

document.getElementById("clearSignature").addEventListener("click",()=>{
  signaturePad.clear();
});

document.getElementById("closeSignature").addEventListener("click",()=>{
  modal.classList.add("hidden");
});

document.getElementById("saveSignature").addEventListener("click",()=>{
  if(signaturePad.isEmpty()){
    alert("Draw initials first.");
    return;
  }

  const data = signaturePad.toDataURL();

  localStorage.setItem(`${currentSignatureDay}-signature`,data);

  document.getElementById(`${currentSignatureDay}-signature-preview`).src = data;

  modal.classList.add("hidden");
});

days.forEach(day=>{
  const savedSig = localStorage.getItem(`${day}-signature`);

  if(savedSig){
    document.getElementById(`${day}-signature-preview`).src = savedSig;
  }
});

document.getElementById("exportBtn").addEventListener("click",async()=>{
  const { jsPDF } = window.jspdf;

  const target = document.getElementById("readingLog");

  const canvas = await html2canvas(target,{
    scale:2
  });

  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF("p","mm","a4");

  const width = 190;
  const height = canvas.height * width / canvas.width;

  pdf.addImage(imgData,"PNG",10,10,width,height);

  pdf.save("DigitalReadingLog.pdf");
});

document.getElementById("printBtn").addEventListener("click",()=>{
  window.print();
});

document.getElementById("shareBtn").addEventListener("click",async()=>{
  await navigator.clipboard.writeText(location.origin + "/" + logId);

  alert("Share link copied!");
});

document.getElementById("clearBtn").addEventListener("click",()=>{
  if(confirm("Clear reading log?")){
    localStorage.clear();
    location.reload();
  }
});
