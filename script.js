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

document.querySelectorAll(".fade-section").forEach(el => fadeObserver.observe(el));



/* =======================================================
   CLEAN URL → CATEGORY DETECTION
======================================================= */

document.addEventListener("DOMContentLoaded", () => {
  let page = window.location.pathname.split("/").pop();
  console.log("📄 Raw Page:", page);

  if (!page || page === "") page = "index";

  page = page.replace(".html", "");
  console.log("📄 Normalized Page:", page);

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
  console.log("📂 Mapped Category:", category);

  if (!category) return;
  loadCategory(category);
});



/* =======================================================
   FAST IMAGE LOADER (PRELOAD FIRST 6, LAZY REST)
======================================================= */

function preloadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = url;
    img.onload = () => resolve(url);
    img.onerror = () => reject(url);
  });
}



async function loadCategory(category) {
  const containerId = `${category}Gallery`;
  const container = document.getElementById(containerId);

  console.log("📌 Container:", containerId, container);

  if (!container) return;

  const jsonURL = `/data/${category}.json`;
  console.log("📥 Fetch JSON:", jsonURL);

  try {
    const res = await fetch(jsonURL);
    const files = await res.json();

    console.log("📁 JSON Files:", files);

    if (!Array.isArray(files)) return;

    const imageUrls = files.map(f => `/projects/${category}/${f}`);

    // 🔥 PRELOAD ONLY FIRST 6 IMAGES
    const firstBatch = imageUrls.slice(0, 6);
    console.log("⏳ Preloading first 6:", firstBatch);

    await Promise.all(firstBatch.map(preloadImage));

    // Render first 6 instantly
    firstBatch.forEach(src => addImage(container, src));

    // 🔥 Lazy-load the remaining ones using IntersectionObserver
    const remaining = imageUrls.slice(6);

    remaining.forEach(src => {
      const img = document.createElement("img");
      img.dataset.src = src; // not loading yet
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
   LAZY LOADING (Loads images only when visible)
======================================================= */

function observeLazyImages() {
  const lazyImgs = document.querySelectorAll("img[data-src]");

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute("data-src");
        obs.unobserve(img);
      }
    });
  });

  lazyImgs.forEach(img => obs.observe(img));
}



/* =======================================================
   ADD IMAGE TO DOM
======================================================= */

function addImage(container, src) {
  const img = document.createElement("img");
  img.src = src;
  img.loading = "eager"; // safe because preloaded
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
