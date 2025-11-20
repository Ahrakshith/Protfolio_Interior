/* ============================
   NAVBAR + FADE
============================ */

function scrollToSection(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

window.addEventListener("scroll", () => {
  const nav = document.getElementById("navbar");
  window.scrollY > 80 ? nav.classList.add("scrolled") : nav.classList.remove("scrolled");
});

const fadeObserver = new IntersectionObserver(
  entries => entries.forEach(e => e.isIntersecting && e.target.classList.add("visible")),
  { threshold: 0.2 }
);
document.querySelectorAll(".fade-section").forEach(el => fadeObserver.observe(el));



/* ============================
   DETECT CATEGORY
============================ */

document.addEventListener("DOMContentLoaded", () => {
  let page = window.location.pathname.split("/").pop();
  if (!page) page = "index";
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
  if (category) loadCategory(category);
});



/* ============================
   PRELOAD FIRST 10 IMAGES
============================ */

function preloadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve(src);
    img.onerror = () => reject(src);
  });
}



/* ============================
   LOAD CATEGORY
============================ */

async function loadCategory(category) {
  const container = document.getElementById(`${category}Gallery`);
  if (!container) return;

  const jsonURL = `/data/${category}.json`;

  try {
    const res = await fetch(jsonURL);
    const files = await res.json();
    if (!Array.isArray(files)) return;

    const imageUrls = files.map(file => `/projects/${category}/${file}`);

    /* Preload first 10 */
    const firstBatch = imageUrls.slice(0, 10);
    await Promise.all(firstBatch.map(preloadImage));

    /* Create Masonry columns */
    createColumns(container);

    /* Insert first 10 instantly */
    firstBatch.forEach(src => addMasonryImage(container, src, true));

    /* Lazy-load rest */
    const remaining = imageUrls.slice(10);
    remaining.forEach(src => queueLazyImage(container, src));

    startLazyObserver();

  } catch (err) {
    console.error("Error loading JSON:", err);
  }
}



/* ============================
   CREATE MASONRY COLUMNS
============================ */

function createColumns(container) {
  container.innerHTML = "";

  const cols = parseInt(
    getComputedStyle(container).getPropertyValue("--columns")
  ) || 3;

  for (let i = 0; i < cols; i++) {
    const col = document.createElement("div");
    col.className = "masonry-column";
    container.appendChild(col);
  }
}



/* ============================
   MASONRY INSERTION (Pinterest)
============================ */

function getShortestColumn(container) {
  return [...container.children].sort((a, b) => a.offsetHeight - b.offsetHeight)[0];
}

function addMasonryImage(container, src, loadedInstant = false) {
  const img = document.createElement("img");
  img.className = "masonry-img";
  img.onclick = () => openFullscreen(src);

  if (loadedInstant) {
    // sharp image immediately
    img.src = src;
    img.classList.add("loaded");
  } else {
    // blur-up effect
    img.src = src;
    img.onload = () => img.classList.add("loaded");
  }

  const column = getShortestColumn(container);
  column.appendChild(img);
}



/* ============================
   LAZY LOADING (Pinterest-fast)
============================ */

let lazyQueue = [];

function queueLazyImage(container, src) {
  lazyQueue.push({ container, src });
}

function startLazyObserver() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const imgTag = entry.target;
      const src = imgTag.dataset.src;

      imgTag.src = src;

      imgTag.onload = () => imgTag.classList.add("loaded");
      observer.unobserve(imgTag);
    });
  }, {
    rootMargin: "300px 0px",
    threshold: 0.01
  });

  lazyQueue.forEach(item => {
    const img = document.createElement("img");
    img.className = "masonry-img";
    img.dataset.src = item.src;
    img.onclick = () => openFullscreen(item.src);

    getShortestColumn(item.container).appendChild(img);
    observer.observe(img);
  });

  lazyQueue = [];
}



/* ============================
   FULLSCREEN VIEWER
============================ */

function openFullscreen(src) {
  const modal = document.getElementById("fullscreenModal");
  const modalImg = document.getElementById("fullscreenImg");
  modalImg.src = src;
  modal.style.display = "flex";
}
