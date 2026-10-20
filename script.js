function pindahTab(id) {
  document
    .querySelectorAll("section")
    .forEach((s) => s.classList.toggle("on", s.id === id));
  document
    .querySelectorAll("nav button")
    .forEach((b) => b.classList.toggle("on", b.dataset.tab === id));
}

document.querySelectorAll("nav button").forEach((b) => {
  b.onclick = () => pindahTab(b.dataset.tab);
});
const chat = document.getElementById("chat");
const input = document.getElementById("input");

function tambahPesan(teks, kelas) {
  const d = document.createElement("div");
  d.className = "msg " + kelas; // "ai" = kiri, "me" = kanan
  d.textContent = teks;
  chat.appendChild(d);
  chat.scrollTop = chat.scrollHeight; // otomatis scroll ke bawah
  return d; // dikembalikan supaya isinya bisa diubah nanti
}

tambahPesan(
  "Halo, aku MindCare 💚\nDi sini kamu bebas bercerita, tanpa nama dan tanpa daftar. Apa yang sedang kamu rasakan hari ini?",
  "ai",
);
