/* ============================
   NAVBAR + FADE
============================ */

function scrollToSection(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

window.addEventListener("scroll", () => {
  const nav = document.getElementById("navbar");
  if (window.scrollY > 80) nav.classList.add("scrolled");
  else nav.classList.remove("scrolled");
});

const fadeObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add("visible");
    });
  },
  { threshold: 0.2 }
);

document.querySelectorAll(".fade-section").forEach(el =>
  fadeObserver.observe(el)
);



/* =======================================================
   CLEAN URL → CATEGORY DETECTION (NORMAL + PREMIUM)
======================================================= */

document.addEventListener("DOMContentLoaded", () => {
  let page = window.location.pathname.split("/").pop();
  if (!page || page === "") page = "index";

  page = page.replace(".html", "");

  const categoryMap = {
    kitchen: "kitchen",
    bedroom: "bedroom",
    living: "living",
    dining: "dining",
    bathroom: "bathroom",
    office: "office",
    outdoor: "outdoor",
    commercial: "commercial",
    furniture: "furniture",

    /* NEW PREMIUM SUPPORT */
    "premium-kitchen": "premium-kitchen",
    "premium-bedroom": "premium-bedroom",
    "premium-dining": "premium-dining",
    "premium-furniture": "premium-furniture",
    "premium-living": "premium-living",
    "premium-bathroom": "premium-bathroom"
  };

  const category = categoryMap[page];
  if (!category) return;

  loadCategory(category);
});



/* =======================================================
   PRELOAD FIRST 10 IMAGES FAST
======================================================= */

function preloadImage(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = url;

    img.onload = () => resolve({ url, ok: true });
    img.onerror = () => resolve({ url, ok: false });
  });
}



/* =======================================================
   LOAD CATEGORY IMAGES (NORMAL + PREMIUM)
======================================================= */

async function loadCategory(category) {
  const container = document.getElementById(`${category}Gallery`);
  if (!container) return;

  const jsonURL = `/data/${category}.json`;

  try {
    const res = await fetch(jsonURL);
    const files = await res.json();
    if (!Array.isArray(files)) return;

    const imageUrls = files.map(f => `/projects/${category}/${f}`);

    /* --- PRELOAD FIRST 10 --- */
    const firstBatch = imageUrls.slice(0, 10);
    await Promise.all(firstBatch.map(preloadImage));

    /* Render first 10 instantly */
    firstBatch.forEach(src => addImage(container, src));

    /* --- LAZY LOAD THE REST --- */
    const remaining = imageUrls.slice(10);
    remaining.forEach(src => createLazyImage(container, src));

    /* Start observing */
    observeLazyImages();

  } catch (err) {
    console.error("❌ JSON Load Error:", err);
  }
}



/* =======================================================
   CREATE LAZY IMAGE (blur-up)
======================================================= */

function createLazyImage(container, src) {
  const img = document.createElement("img");
  img.dataset.src = src;
  img.classList.add("masonry-img");
  img.loading = "lazy";
  img.onclick = () => openFullscreen(src);

  container.appendChild(img);
}



/* =======================================================
   LAZY LOADING (smooth Pinterest effect)
======================================================= */

function observeLazyImages() {
  const lazyImgs = document.querySelectorAll("img[data-src]");

  const obs = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;

        img.src = img.dataset.src;

        img.onload = () => img.classList.add("loaded");
        img.removeAttribute("data-src");

        observer.unobserve(img);
      }
    });
  }, {
    rootMargin: "300px 0px",
    threshold: 0.01
  });

  lazyImgs.forEach(img => obs.observe(img));
}



/* =======================================================
   ADD IMAGE TO DOM (instant-on)
======================================================= */

function addImage(container, src) {
  const img = document.createElement("img");
  img.src = src;
  img.classList.add("masonry-img");
  img.loading = "eager";

  img.onload = () => img.classList.add("loaded");
  img.onclick = () => openFullscreen(src);

  container.appendChild(img);
}



/* =======================================================
   FULLSCREEN VIEWER
======================================================= */

function openFullscreen(src) {
  const modal = document.getElementById("fullscreenModal");
  const modalImg = document.getElementById("fullscreenImg");
  modalImg.src = src;
  modal.style.display = "flex";
}
