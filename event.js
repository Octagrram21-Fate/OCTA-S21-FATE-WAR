// ==== SETUP JSONBIN ====
const BIN_ID = "6908b0acae596e708f41ae1a"; 
const API_KEY = "$2a$10$MtQAS8YauDJ2XJS6jN5l1uKIV6OOXpkOIVGnwuULjrRjKuSJPyJry"; 
const API_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

// ==== ELEMENT HTML ====
const form = document.getElementById('eventForm');
const list = document.getElementById('eventList');

// Saat halaman dibuka, muat event dari JSONBin
document.addEventListener('DOMContentLoaded', loadEvents);

// Saat form disubmit
form.addEventListener('submit', async function (e) {
  e.preventDefault();

  const name = document.getElementById('eventName').value.trim();
  const date = document.getElementById('eventDate').value;
  const time = document.getElementById('eventTime').value;

  if (!name || !date || !time) return;

  const localDateTime = new Date(`${date}T${time}`);
  const utcString = localDateTime.toUTCString();

  const eventData = {
    id: Date.now(), // ID unik biar bisa dihapus spesifik
    name,
    date,
    time,
    utcString
  };

  try {
    // Ambil data lama
    const res = await fetch(API_URL, { headers: { "X-Master-Key": API_KEY } });
    const data = await res.json();

    // Tambah event baru
    data.record.guildEvents.push(eventData);

    // Simpan kembali ke JSONBin
    await fetch(API_URL, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": API_KEY
      },
      body: JSON.stringify(data.record)
    });

    addEventCard(eventData);
    form.reset();
  } catch (error) {
    console.error("Gagal menyimpan ke JSONBin:", error);
    alert("❌ Gagal menyimpan data. Cek koneksi atau API Key kamu.");
  }
});

// ====== FUNGSI ======

// Muat event dari JSONBin
async function loadEvents() {
  try {
    const res = await fetch(API_URL, { headers: { "X-Master-Key": API_KEY } });
    const data = await res.json();
    list.innerHTML = "";
    data.record.guildEvents.forEach(addEventCard);
  } catch (err) {
    console.error("Gagal memuat data:", err);
    list.innerHTML = "<p style='color:red;'>⚠️ Gagal memuat event. Cek API Key / BIN ID.</p>";
  }
}

// Tambahkan 1 kartu event
function addEventCard(event) {
  const card = document.createElement('div');
  card.className = 'card';
  card.dataset.id = event.id;

  card.innerHTML = `
    <h3>${event.name}</h3>
    <p><strong>Tanggal:</strong> ${event.date}</p>
    <p><strong>Jam:</strong> ${event.time}</p>
    <small>${event.utcString}</small>
    <button class="delete-btn">🗑 Hapus</button>
  `;

  const delBtn = card.querySelector('.delete-btn');
  delBtn.addEventListener('click', () => deleteEvent(event.id));

  list.appendChild(card);
}

// Fungsi hapus event dari JSONBin
async function deleteEvent(id) {
  if (!confirm("Yakin ingin hapus event ini?")) return;

  try {
    const res = await fetch(API_URL, { headers: { "X-Master-Key": API_KEY } });
    const data = await res.json();

    // Filter event yg tidak dihapus
    data.record.guildEvents = data.record.guildEvents.filter(ev => ev.id !== id);

    // Update ke JSONBin
    await fetch(API_URL, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": API_KEY
      },
      body: JSON.stringify(data.record)
    });

    // Hapus dari tampilan
    const card = document.querySelector(`.card[data-id="${id}"]`);
    if (card) card.remove();

  } catch (error) {
    console.error("Gagal hapus data:", error);
    alert("❌ Gagal hapus data dari server.");
  }
}