current script.js--> /* ============================
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

document.querySelectorAll(".fade-section").forEach(el => fadeObserver.observe(el));



/* =======================================================
   CLEAN URL → CATEGORY DETECTION
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
    furniture: "furniture"
  };

  const category = categoryMap[page];
  if (!category) return;

  loadCategory(category);
});



/* =======================================================
   PRELOAD FIRST 10 IMAGES (FAST)
======================================================= */

function preloadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = url;
    img.onload = () => resolve(url);
    img.onerror = () => reject(url);
  });
}



/* =======================================================
   LOAD CATEGORY IMAGES (Pinterest style)
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

    firstBatch.forEach(src => addImage(container, src));

    /* --- LAZY LOAD THE REST --- */
    const remaining = imageUrls.slice(10);
    remaining.forEach(src => {
      const img = document.createElement("img");
      img.dataset.src = src;
      img.loading = "lazy";
      img.onclick = () => openFullscreen(src);
      container.appendChild(img);
    });

    observeLazyImages();

  } catch (err) {
    console.error("❌ JSON Load Error:", err);
  }
}



/* =======================================================
   LAZY LOADING (smooth Pinterest scroll)
======================================================= */

function observeLazyImages() {
  const lazyImgs = document.querySelectorAll("img[data-src]");

  const obs = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute("data-src");
        observer.unobserve(img);
      }
    });
  }, {
    rootMargin: "300px 0px",   // load before entering screen
    threshold: 0.01
  });

  lazyImgs.forEach(img => obs.observe(img));
}



/* =======================================================
   ADD IMAGE TO DOM
======================================================= */

function addImage(container, src) {
  const img = document.createElement("img");
  img.src = src;
  img.loading = "eager";
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