// ===== Glitch Prod — minimal interactions =====

document.getElementById("year").textContent = new Date().getFullYear();

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
