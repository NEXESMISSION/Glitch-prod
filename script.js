// ===== Glitch Prod — interactions =====

// Year
document.getElementById("year").textContent = new Date().getFullYear();

// Sticky nav background
const nav = document.getElementById("nav");
const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 40);
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

// Reveal on scroll
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("in");
        io.unobserve(e.target);
      }
    });
  },
  { threshold: 0.12 }
);
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

// Video cards: click to play with sound, only one at a time
const cards = document.querySelectorAll("[data-video]");

function stopAll(except) {
  cards.forEach((c) => {
    if (c === except) return;
    const v = c.querySelector("video");
    if (!v.paused) v.pause();
    c.classList.remove("playing");
    const hint = c.querySelector(".card__sound");
    if (hint) hint.hidden = true;
  });
}

cards.forEach((card) => {
  const video = card.querySelector("video");
  const hint = card.querySelector(".card__sound");

  // Desktop: muted preview on hover
  const canHover = window.matchMedia("(hover: hover)").matches;
  if (canHover) {
    card.addEventListener("mouseenter", () => {
      if (card.classList.contains("playing")) return;
      video.muted = true;
      video.play().catch(() => {});
    });
    card.addEventListener("mouseleave", () => {
      if (card.classList.contains("playing")) return;
      video.pause();
      video.currentTime = 0;
    });
  }

  // Click: full play with sound
  card.addEventListener("click", () => {
    if (card.classList.contains("playing")) {
      video.pause();
      card.classList.remove("playing");
      if (hint) hint.hidden = true;
      return;
    }
    stopAll(card);
    video.muted = false;
    video.currentTime = 0;
    video.play().catch(() => {});
    card.classList.add("playing");
    if (hint) hint.hidden = true;
  });

  video.addEventListener("ended", () => {
    card.classList.remove("playing");
  });
});
