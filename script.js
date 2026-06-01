// ===== Glitch Prod — portfolio interactions =====

document.getElementById("year").textContent = new Date().getFullYear();

/* ---------- Sticky bar state ---------- */
const bar = document.getElementById("bar");
const onScroll = () => bar.classList.toggle("scrolled", window.scrollY > 12);
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

/* ---------- Popup vidéo ---------- */
const vlb = document.getElementById("vlb");
const vlbVideo = document.getElementById("vlbVideo");

function openVideo(src) {
  vlbVideo.src = src;
  vlb.hidden = false;
  document.body.style.overflow = "hidden";
  vlbVideo.currentTime = 0;
  vlbVideo.play().catch(() => {});
}
function closeVideo() {
  vlbVideo.pause();
  vlbVideo.removeAttribute("src");
  vlbVideo.load();
  vlb.hidden = true;
  document.body.style.overflow = "";
}
document.querySelectorAll("[data-video]").forEach((reel) => {
  reel.addEventListener("click", () => openVideo(reel.dataset.src));
});
document.getElementById("vlbClose").addEventListener("click", closeVideo);
vlb.addEventListener("click", (e) => { if (e.target === vlb) closeVideo(); });

/* ---------- Reveal on scroll (sections seulement) ---------- */
const io = new IntersectionObserver(
  (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }),
  { threshold: 0.05, rootMargin: "0px 0px -40px 0px" }
);
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

/* ---------- Galerie (depuis manifest.json) ---------- */
const gallery = document.getElementById("gallery");
let tiles = [];      // { src, brand, el }
let visible = [];    // photos affichées (ordre DOM)

fetch("/images/manifest.json")
  .then((r) => r.json())
  .then((items) => buildGallery(items))
  .catch(() => { gallery.innerHTML = '<p style="color:var(--muted)">Galerie indisponible.</p>'; });

function buildGallery(items) {
  const frag = document.createDocumentFragment();
  items.forEach((it, i) => {
    const tile = document.createElement("button");
    tile.className = "tile";
    tile.dataset.brand = it.brand;
    if (it.w && it.h) tile.style.aspectRatio = `${it.w} / ${it.h}`;
    tile.setAttribute("aria-label", `Agrandir la photo ${i + 1}`);

    const img = document.createElement("img");
    img.loading = "lazy";
    img.decoding = "async";
    // visibilité robuste : montrer dès que chargé (ou en cache, ou en erreur)
    const reveal = () => img.classList.add("loaded");
    img.addEventListener("load", reveal);
    img.addEventListener("error", reveal);
    img.src = "/" + it.file.replace(/^\//, "");
    if (img.complete && img.naturalWidth > 0) reveal();
    tile.appendChild(img);

    const entry = { src: img.src, brand: it.brand, el: tile };
    tile.addEventListener("click", () => openLightbox(entry));
    tiles.push(entry);
    frag.appendChild(tile);
  });
  gallery.appendChild(frag);
  visible = tiles.slice();
}

/* ---------- Filtres par marque ---------- */
function applyFilter(filter) {
  visible = tiles.filter((t) => filter === "all" || t.brand === filter);
  tiles.forEach((t) => t.el.classList.toggle("hide", !visible.includes(t)));
}
document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((t) => t.classList.remove("is-active"));
    tab.classList.add("is-active");
    applyFilter(tab.dataset.filter);
  });
});

/* ---------- Lightbox photo (navigue dans le set filtré) ---------- */
const lb = document.getElementById("lb");
const lbImg = document.getElementById("lbImg");
const lbCount = document.getElementById("lbCount");
let pos = 0;

function show(p) {
  pos = (p + visible.length) % visible.length;
  lbImg.src = visible[pos].src;
  lbCount.textContent = `${pos + 1} / ${visible.length}`;
}
function openLightbox(entry) {
  const p = visible.indexOf(entry);
  if (p === -1) return;
  show(p);
  lb.hidden = false;
  document.body.style.overflow = "hidden";
}
function closeLightbox() {
  lb.hidden = true;
  lbImg.src = "";
  document.body.style.overflow = "";
}

document.getElementById("lbClose").addEventListener("click", closeLightbox);
document.getElementById("lbPrev").addEventListener("click", (e) => { e.stopPropagation(); show(pos - 1); });
document.getElementById("lbNext").addEventListener("click", (e) => { e.stopPropagation(); show(pos + 1); });
lb.addEventListener("click", (e) => { if (e.target === lb) closeLightbox(); });

/* ---------- Clavier (photo + vidéo) ---------- */
document.addEventListener("keydown", (e) => {
  if (!vlb.hidden && e.key === "Escape") { closeVideo(); return; }
  if (lb.hidden) return;
  if (e.key === "Escape") closeLightbox();
  else if (e.key === "ArrowLeft") show(pos - 1);
  else if (e.key === "ArrowRight") show(pos + 1);
});

let startX = 0;
lb.addEventListener("touchstart", (e) => { startX = e.touches[0].clientX; }, { passive: true });
lb.addEventListener("touchend", (e) => {
  const dx = e.changedTouches[0].clientX - startX;
  if (Math.abs(dx) > 50) show(pos + (dx < 0 ? 1 : -1));
}, { passive: true });
