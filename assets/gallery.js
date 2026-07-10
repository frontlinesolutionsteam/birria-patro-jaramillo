/* ===================== GALLERY LIGHTBOX ===================== */
let galleryImages = [];
let galleryIndex = 0;

function openLightbox(index) {
  galleryIndex = index;
  const overlay = document.getElementById("lightboxOverlay");
  const img = document.getElementById("lightboxImg");
  if (!overlay || !img) return;
  img.src = galleryImages[galleryIndex].src;
  img.alt = galleryImages[galleryIndex].alt;
  overlay.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeLightbox() {
  const overlay = document.getElementById("lightboxOverlay");
  if (!overlay) return;
  overlay.classList.remove("open");
  document.body.style.overflow = "";
}

function showLightboxDelta(delta) {
  if (!galleryImages.length) return;
  galleryIndex = (galleryIndex + delta + galleryImages.length) % galleryImages.length;
  const img = document.getElementById("lightboxImg");
  img.src = galleryImages[galleryIndex].src;
  img.alt = galleryImages[galleryIndex].alt;
}

document.addEventListener("DOMContentLoaded", () => {
  const items = document.querySelectorAll("[data-gallery-item]");
  if (!items.length) return;

  galleryImages = Array.from(items).map((el) => {
    const img = el.querySelector("img");
    return { src: img.src, alt: img.alt };
  });

  items.forEach((el, i) => {
    el.addEventListener("click", () => openLightbox(i));
  });

  const overlay = document.getElementById("lightboxOverlay");
  const closeBtn = document.getElementById("lightboxClose");
  const prevBtn = document.getElementById("lightboxPrev");
  const nextBtn = document.getElementById("lightboxNext");

  if (closeBtn) closeBtn.addEventListener("click", closeLightbox);
  if (prevBtn) prevBtn.addEventListener("click", () => showLightboxDelta(-1));
  if (nextBtn) nextBtn.addEventListener("click", () => showLightboxDelta(1));
  if (overlay) {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeLightbox();
    });
  }

  document.addEventListener("keydown", (e) => {
    if (!overlay || !overlay.classList.contains("open")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowRight") showLightboxDelta(1);
    if (e.key === "ArrowLeft") showLightboxDelta(-1);
  });
});
