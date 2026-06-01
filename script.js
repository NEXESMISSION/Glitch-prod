// ===== Glitch Prod — portfolio interactions =====

document.getElementById("year").textContent = new Date().getFullYear();

/* ---------- Sticky bar state ---------- */
const bar = document.getElementById("bar");
const onScroll = () => bar.classList.toggle("scrolled", window.scrollY > 12);
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

/* ---------- Reels: tap to play, one at a time ---------- */
const reels = document.querySelectorAll("[data-video]");
function stopOthers(except) {
  reels.forEach((r) => {
    if (r === except) return;
    const v = r.querySelector("video");
    if (!v.paused) v.pause();
    r.classList.remove("playing");
  });
}
reels.forEach((reel) => {
  const video = reel.querySelector("video");
  reel.addEventListener("click", () => {
    if (reel.classList.contains("playing")) {
      video.pause();
      reel.classList.remove("playing");
      return;
    }
    stopOthers(reel);
    video.muted = false;
    video.currentTime = 0;
    video.play().catch(() => {});
    reel.classList.add("playing");
  });
  video.addEventListener("ended", () => reel.classList.remove("playing"));
});

/* ---------- Reveal on scroll (sections + tiles) ---------- */
const io = new IntersectionObserver(
  (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }),
  { threshold: 0.06, rootMargin: "0px 0px -40px 0px" }
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
    tile.className = "tile reveal";
    tile.dataset.brand = it.brand;
    tile.style.transitionDelay = (i % 12) * 0.03 + "s";
    if (it.w && it.h) tile.style.aspectRatio = `${it.w} / ${it.h}`;
    tile.setAttribute("aria-label", `Agrandir la photo ${i + 1}`);

    const img = document.createElement("img");
    img.src = "/" + it.file.replace(/^\//, "");
    img.alt = `Glitch Prod — ${it.brand} ${i + 1}`;
    img.loading = "lazy";
    img.decoding = "async";
    img.addEventListener("load", () => img.classList.add("loaded"));
    if (img.complete) img.classList.add("loaded");
    tile.appendChild(img);

    const entry = { src: img.src, brand: it.brand, el: tile };
    tile.addEventListener("click", () => openLightbox(entry));
    tiles.push(entry);
    frag.appendChild(tile);
    io.observe(tile);
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

/* ---------- Lightbox (navigue dans le set filtré) ---------- */
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

document.addEventListener("keydown", (e) => {
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
