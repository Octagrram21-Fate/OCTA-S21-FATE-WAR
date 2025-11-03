// ==================== KONFIGURASI JSONBIN ====================
const BIN_ID = "6908b0acae596e708f41ae1a"; 
const API_KEY = "$2a$10$MtQAS8YauDJ2XJS6jN5l1uKIV6OOXpkOIVGnwuULjrRjKuSJPyJry"; 
const API_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

// ==================== ELEMENT ====================
const form = document.getElementById('eventForm');
const list = document.getElementById('eventList');

// ==================== CEK LOGIN R4 ====================
function isR4LoggedIn() {
  return localStorage.getItem("isR4") === "true";
}

// ==================== LOAD EVENT ====================
document.addEventListener('DOMContentLoaded', loadEvents);

// ==================== TAMBAH EVENT (HANYA R4) ====================
form.addEventListener('submit', async function (e) {
  e.preventDefault();

  if (!isR4LoggedIn()) {
    alert("⚠️ Hanya R4 yang bisa menambah event!");
    return;
  }

  const name = document.getElementById('eventName').value.trim();
  const date = document.getElementById('eventDate').value;
  const time = document.getElementById('eventTime').value;

  if (!name || !date || !time) return;

  const newEvent = {
    id: Date.now(),
    name,
    date,
    time
  };

  try {
    const res = await fetch(API_URL, { headers: { "X-Master-Key": API_KEY } });
    const data = await res.json();

    // jika belum ada array guildEvents, buat
    if (!data.record.guildEvents) data.record.guildEvents = [];

    data.record.guildEvents.push(newEvent);

    await fetch(API_URL, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": API_KEY
      },
      body: JSON.stringify(data.record)
    });

    addEventCard(newEvent);
    form.reset();
  } catch (err) {
    alert("❌ Gagal menyimpan ke JSONBin.");
    console.error(err);
  }
});

// ==================== MUAT DATA DARI JSONBIN ====================
async function loadEvents() {
  try {
    const res = await fetch(API_URL, { headers: { "X-Master-Key": API_KEY } });
    const data = await res.json();
    list.innerHTML = "";

    if (!data.record.guildEvents || data.record.guildEvents.length === 0) {
      list.innerHTML = "<p>📭 Belum ada event.</p>";
      return;
    }

    data.record.guildEvents.forEach(addEventCard);
  } catch (err) {
    list.innerHTML = "<p style='color:red;'>⚠️ Gagal memuat data dari JSONBin.</p>";
    console.error(err);
  }
}

// ==================== TAMPILKAN SATU EVENT ====================
function addEventCard(ev) {
  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `
    <h3>${ev.name}</h3>
    <p><strong>Tanggal:</strong> ${ev.date}</p>
    <p><strong>Jam:</strong> ${ev.time}</p>
    ${isR4LoggedIn() ? `<button onclick="deleteEvent(${ev.id})">🗑️ Hapus</button>` : ""}
  `;
  list.appendChild(card);
}

// ==================== HAPUS EVENT (HANYA R4) ====================
async function deleteEvent(id) {
  if (!isR4LoggedIn()) {
    alert("⚠️ Hanya R4 yang bisa menghapus event!");
    return;
  }

  if (!confirm("Yakin ingin menghapus event ini?")) return;

  try {
    const res = await fetch(API_URL, { headers: { "X-Master-Key": API_KEY } });
    const data = await res.json();

    if (!data.record.guildEvents) return;

    const updatedEvents = data.record.guildEvents.filter(ev => ev.id !== id);
    data.record.guildEvents = updatedEvents;

    await fetch(API_URL, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": API_KEY
      },
      body: JSON.stringify(data.record)
    });

    loadEvents(); // refresh daftar
  } catch (err) {
    alert("❌ Gagal menghapus event dari JSONBin.");
    console.error(err);
  }
}
