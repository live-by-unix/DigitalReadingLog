
const days=["Monday","Tuesday","Wednesday","Thursday","Friday"];
const logBody=document.getElementById("logBody");

days.forEach(day=>{
const row=document.createElement("tr");
row.innerHTML=`<td>${day}</td><td><input class="table-input" data-save="${day}-book"></td><td><input class="table-input" data-save="${day}-genre"></td><td><input class="table-input" data-save="${day}-minutes"></td><td><input class="table-input" data-save="${day}-pages"></td><td><button class="sign-btn" data-day="${day}">Sign</button><div><img class="signature-preview" id="${day}-signature-preview"></div></td>`;
logBody.appendChild(row);
});

document.querySelectorAll("[data-save]").forEach(el=>{
const saved=localStorage.getItem(el.dataset.save);
if(saved!==null)el.value=saved;
el.addEventListener("input",()=>localStorage.setItem(el.dataset.save,el.value));
});

const themeToggle=document.getElementById("themeToggle");

if(localStorage.getItem("theme")==="dark"){
document.body.classList.add("dark");
themeToggle.textContent="☀️ Light Mode";
}

themeToggle.addEventListener("click",()=>{
document.body.classList.toggle("dark");
const dark=document.body.classList.contains("dark");
localStorage.setItem("theme",dark?"dark":"light");
themeToggle.textContent=dark?"☀️ Light Mode":"🌙 Dark Mode";
});

let remainingSeconds=1500;
const timerDisplay=document.getElementById("timerDisplay");
const timerMinutes=document.getElementById("timerMinutes");

function updateTimer(){
const mins=String(Math.floor(remainingSeconds/60)).padStart(2,"0");
const secs=String(remainingSeconds%60).padStart(2,"0");
timerDisplay.textContent=`${mins}:${secs}`;
}

updateTimer();

document.querySelectorAll(".preset").forEach(btn=>{
btn.addEventListener("click",()=>{
timerMinutes.value=btn.dataset.min;
remainingSeconds=Number(btn.dataset.min)*60;
updateTimer();
});
});

let timer;

document.getElementById("startTimer").onclick=()=>{
clearInterval(timer);
timer=setInterval(()=>{
remainingSeconds--;
updateTimer();
if(remainingSeconds<=0){
clearInterval(timer);
alert("Reading complete!");
}
},1000);
};

document.getElementById("pauseTimer").onclick=()=>clearInterval(timer);

document.getElementById("resetTimer").onclick=()=>{
clearInterval(timer);
remainingSeconds=Number(timerMinutes.value)*60;
updateTimer();
};

const modal=document.getElementById("signatureModal");
const signaturePad=new SignaturePad(document.getElementById("signatureCanvas"));
let currentSignatureDay=null;

document.addEventListener("click",(e)=>{
if(e.target.classList.contains("sign-btn")){
currentSignatureDay=e.target.dataset.day;
modal.classList.remove("hidden");
}
});

document.getElementById("clearSignature").onclick=()=>signaturePad.clear();
document.getElementById("closeSignature").onclick=()=>modal.classList.add("hidden");

document.getElementById("saveSignature").onclick=()=>{
const data=signaturePad.toDataURL();
localStorage.setItem(currentSignatureDay+"-signature",data);
document.getElementById(currentSignatureDay+"-signature-preview").src=data;
modal.classList.add("hidden");
};

days.forEach(day=>{
const sig=localStorage.getItem(day+"-signature");
if(sig)document.getElementById(day+"-signature-preview").src=sig;
});

document.getElementById("exportBtn").onclick=async()=>{
const { jsPDF }=window.jspdf;
const canvas=await html2canvas(document.getElementById("readingLog"),{scale:2});
const imgData=canvas.toDataURL("image/png");
const pdf=new jsPDF("p","mm","a4");
const width=190;
const height=canvas.height*width/canvas.width;
pdf.addImage(imgData,"PNG",10,10,width,height);
pdf.save("DigitalReadingLog.pdf");
};

document.getElementById("printBtn").onclick=()=>window.print();

document.getElementById("shareBtn").onclick=async()=>{
const html=document.documentElement.outerHTML;
const res=await fetch("/api/create-log",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({html})
});

const data=await res.json();

if(data.url){
await navigator.clipboard.writeText(data.url);
document.getElementById("logId").textContent=data.url;
alert("Share link copied!");
}
};

document.getElementById("clearBtn").onclick=()=>{
if(confirm("Clear reading log?")){
localStorage.clear();
location.reload();
}
};
