/* finance.js - final fixed full version with full delete */

// ===== CONFIG =====
const R4_PASSWORD = "octaR4";
let isR4 = false;

const BIN_ID = "690dcb1fae596e708f4a2478";
const API_KEY = "$2a$10$MtQAS8YauDJ2XJS6jN5l1uKIV6OOXpkOIVGnwuULjrRjKuSJPyJry";
const API_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

// ===== DOM =====
const loginBox = document.getElementById("loginBox");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const r4Password = document.getElementById("r4Password");
const loginMessage = document.getElementById("loginMessage");

const uploadBtn = document.getElementById("uploadBtn");
const fileInput = document.getElementById("fileInput");
const deleteAll = document.getElementById("deleteAll");
const exportExcel = document.getElementById("exportExcel");
const exportCSV = document.getElementById("exportCSV");

const eventFilter = document.getElementById("eventFilter");
const monthFilter = document.getElementById("monthFilter");
const applyFilter = document.getElementById("applyFilter");

const tableHead = document.getElementById("tableHeader");
const tableBody = document.querySelector("#historyTable tbody");

document.getElementById("currentDate").textContent = new Date().toLocaleDateString("id-ID");

// ===== STATE =====
let goldData = [];

// ===== UTIL =====
function normalizeString(s){ if(s===null||s===undefined) return ""; return String(s).trim(); }
function tryParseDate(val){
  if(!val) return null;
  const d = new Date(val);
  if(!isNaN(d)) return d;
  const m = String(val).match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
  if(m){ let y=Number(m[3]); if(y<100) y+=2000; return new Date(y,Number(m[2])-1,Number(m[1])); }
  return null;
}
function formatDateForDisplay(d){
  if(!d) return "-";
  if(!(d instanceof Date)) d = tryParseDate(d);
  const pad=n=>n<10?"0"+n:n;
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
}
function extractMonthNameFromDate(d){
  const dt = tryParseDate(d); if(!dt) return "";
  return dt.toLocaleString("id-ID",{month:"long", year:"numeric"});
}
function extractWeekFromDate(d){
  const dt=tryParseDate(d); if(!dt) return "";
  const day=dt.getDate();
  return Math.ceil(day/7).toString();
}
function escapeHtml(s){ return s ? s.replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c])) : ""; }
function formatNumberForDisplay(v){
  if(v===null||v===undefined||v==="") return "-";
  const num = Number(String(v).replace(/[^\d\-.,]/g,"").replace(",", "."));
  if(isNaN(num)) return escapeHtml(v);
  return num.toLocaleString("id-ID");
}

// ===== JSONBIN =====
async function loadFromJSONBin(){
  try {
    const res = await fetch(`${API_URL}/latest`, { headers: {"X-Master-Key":API_KEY} });
    const json = await res.json();
    const recs = json.record || [];
    goldData = recs.map(r => {
      const d = tryParseDate(r.date) || new Date();
      return {
        name: r.name || "",
        gold: r.gold || "",
        point: r.point || "",
        date: formatDateForDisplay(d),
        event: r.event || "Unknown",
        bulan: r.bulan || extractMonthNameFromDate(d),
        minggu: r.minggu || extractWeekFromDate(d)
      };
    });
    renderTable();
  } catch(err){
    console.error("❌ Load error:", err);
    tableBody.innerHTML = `<tr><td colspan="6">Gagal memuat data</td></tr>`;
  }
}

async function saveToJSONBin() {
  try {
    const payload = goldData.map(r => ({
      name: r.name, gold: r.gold, point: r.point, date: r.date,
      event: r.event, bulan: r.bulan, minggu: r.minggu
    }));

    const res = await fetch(API_URL, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": API_KEY,
        "X-Bin-Versioning": "false"
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error("Gagal update JSONBin");
    console.log("✅ Data berhasil diupdate ke JSONBin");
  } catch (err) {
    console.error("❌ Save error:", err);
  }
}

// ===== fungsi khusus kosongkan BIN =====
async function saveEmptyToJSONBin() {
  try {
    const res = await fetch(API_URL, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": API_KEY,
        "X-Bin-Versioning": "false"
      },
      body: JSON.stringify([]) // benar-benar array kosong
    });
    if (!res.ok) throw new Error("Gagal hapus data di JSONBin");
    console.log("✅ JSONBin sudah dikosongkan total");
  } catch (err) {
    console.error("❌ Error kosongkan BIN:", err);
    alert("Gagal menghapus semua data di server.");
  }
}

// ===== TABEL =====
function buildTableHeader(){
  tableHead.innerHTML = `
    <th>No</th>
    <th>Nama</th>
    <th>Gold</th>
    <th>Point</th>
    <th>Tanggal</th>
    ${isR4 ? `<th>Aksi</th>` : ""}
  `;
}

function renderTable(filtered=null){
  buildTableHeader();
  const data = filtered || goldData;
  tableBody.innerHTML = "";
  if(!data.length){
    tableBody.innerHTML = `<tr><td colspan="${isR4?6:5}" style="text-align:center;color:#888">Tidak ada data</td></tr>`;
    return;
  }

  data.forEach((r,i)=>{
    const tr=document.createElement("tr");
    tr.innerHTML=`
      <td>${i+1}</td>
      <td>${escapeHtml(r.name)}</td>
      <td>${formatNumberForDisplay(r.gold)}</td>
      <td>${escapeHtml(r.point||"-")}</td>
      <td>${escapeHtml(r.date)}</td>
      ${isR4?`<td><button class="btn warn deleteRow" data-i="${i}">Hapus</button></td>`:""}
    `;
    tableBody.appendChild(tr);
  });

  if(isR4){
    document.querySelectorAll(".deleteRow").forEach(btn=>{
      btn.addEventListener("click",async e=>{
        const i=Number(e.currentTarget.dataset.i);
        if(confirm("Hapus baris ini?")){
          goldData.splice(i,1);
          await saveToJSONBin();
          renderTable();
        }
      });
    });
  }
}

// ===== LOGIN =====
loginBtn.addEventListener("click", ()=>{
  if(r4Password.value === R4_PASSWORD){
    isR4 = true;
    loginBox.style.display = "none";
    uploadBtn.disabled = false;
    deleteAll.disabled = false;
    logoutBtn.style.display = "inline-block";
    updateManualBox();
    renderTable();
    alert("✅ Login berhasil sebagai R4");
  } else {
    loginMessage.textContent = "Password salah!";
    setTimeout(()=> loginMessage.textContent="",2500);
  }
});
logoutBtn.addEventListener("click", ()=>{
  isR4 = false;
  loginBox.style.display = "";
  r4Password.value = "";
  uploadBtn.disabled = true;
  deleteAll.disabled = true;
  logoutBtn.style.display = "none";
  updateManualBox();
  renderTable();
});

// ===== DELETE ALL =====
deleteAll.addEventListener("click", async ()=>{
  if(!isR4) return alert("Hanya R4 yang bisa hapus semua data.");
  if(confirm("⚠️ Yakin hapus semua data di tabel dan server?")){
    goldData = [];
    renderTable();
    await saveEmptyToJSONBin(); // benar-benar kosong
    alert("✅ Semua data telah dihapus total dari server JSONBin.");
  }
});

// ===== FILTER =====
applyFilter.addEventListener("click", ()=>{
  const evt = (eventFilter.value || "all").toLowerCase();
  const monthq = (monthFilter.value || "").toLowerCase().trim();
  let filtered = goldData.slice();
  if(evt && evt!=="all") filtered = filtered.filter(r => (r.event||"").toLowerCase().includes(evt));
  if(monthq) filtered = filtered.filter(r => (r.bulan||"").toLowerCase().includes(monthq) || (r.date||"").toLowerCase().includes(monthq));
  renderTable(filtered);
});

// ===== EXPORT =====
exportExcel.addEventListener("click", ()=>{
  if(!goldData.length) return alert("Tidak ada data untuk diexport!");
  const ws = XLSX.utils.json_to_sheet(goldData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "GoldHistory");
  XLSX.writeFile(wb, "GoldHistory.xlsx");
});
exportCSV.addEventListener("click", ()=>{
  if(!goldData.length) return alert("Tidak ada data untuk diexport!");
  const ws = XLSX.utils.json_to_sheet(goldData);
  const csv = XLSX.utils.sheet_to_csv(ws);
  const blob = new Blob([csv], { type:"text/csv" });
  const a=document.createElement("a");
  a.href=URL.createObjectURL(blob);
  a.download="GoldHistory.csv";
  a.click();
});

// ===== INPUT MANUAL =====
const manualBox = document.getElementById("manualInputBox");
const inputNama = document.getElementById("inputNama");
const inputGold = document.getElementById("inputGold");
const inputPoint = document.getElementById("inputPoint");
const inputTanggal = document.getElementById("inputTanggal");
const inputEvent = document.getElementById("inputEvent");
const manualAddBtn = document.getElementById("manualAddBtn");

function updateManualBox() {
  manualBox.style.display = isR4 ? "block" : "none";
}
inputTanggal.value = new Date().toISOString().split("T")[0];

manualAddBtn.addEventListener("click", async ()=>{
  const nama = normalizeString(inputNama.value);
  const gold = normalizeString(inputGold.value);
  const point = normalizeString(inputPoint.value);
  const tgl = tryParseDate(inputTanggal.value);
  const event = normalizeString(inputEvent.value);

  if(!nama || !gold || isNaN(Number(gold)) || !tgl){
    alert("Nama, gold, dan tanggal wajib diisi dengan benar!");
    return;
  }

  const newRec = {
    name: nama, gold: gold, point: point || "-",
    date: formatDateForDisplay(tgl),
    event: event,
    bulan: extractMonthNameFromDate(tgl),
    minggu: extractWeekFromDate(tgl)
  };

  goldData.push(newRec);
  await saveToJSONBin();
  renderTable();
  alert("✅ Data berhasil ditambahkan!");
  inputNama.value = "";
  inputGold.value = "";
  inputPoint.value = "";
  inputTanggal.value = new Date().toISOString().split("T")[0];
});

// ===== START =====
loadFromJSONBin();
