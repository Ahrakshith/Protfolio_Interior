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
   PINTEREST MASONRY ENGINE
======================================================= */

function createMasonryColumns(container, count) {
  container.innerHTML = ""; // clear previous content
  const columns = [];

  for (let i = 0; i < count; i++) {
    const col = document.createElement("div");
    col.className = "masonry-column";
    columns.push(col);
    container.appendChild(col);
  }

  return columns;
}

function getColumnCount() {
  const container = document.querySelector(".masonry-container");
  return parseInt(getComputedStyle(container).getPropertyValue("--columns")) || 3;
}



/* =======================================================
   LOAD CATEGORY IMAGES (true Pinterest layout)
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

    /* --- CREATE PINTEREST COLUMNS --- */
    const colCount = getColumnCount();
    let columns = createMasonryColumns(container, colCount);

    /* --- PRELOAD FIRST 10 IMAGES --- */
    const firstBatch = imageUrls.slice(0, 10);
    await Promise.all(firstBatch.map(preloadImage));

    firstBatch.forEach(src => placeImage(columns, src, true));

    /* --- LAZY LOAD REMAINING IMAGES --- */
    const remaining = imageUrls.slice(10);
    remaining.forEach(src => lazyPlace(columns, src));

    setupLazyObserver();

  } catch (err) {
    console.error("❌ JSON Load Error:", err);
  }

  /* --- Recalculate on resize --- */
  window.addEventListener("resize", () => {
    const newCount = getColumnCount();
    const allImgs = Array.from(container.querySelectorAll("img"));
    const columns = createMasonryColumns(container, newCount);
    allImgs.forEach(img => placeExisting(columns, img));
  });
}



/* =======================================================
   PLACE IMAGES INTO SHORTEST COLUMN
======================================================= */

function getShortestColumn(columns) {
  return columns.reduce((shortest, col) =>
    col.scrollHeight < shortest.scrollHeight ? col : shortest
  );
}

function placeImage(columns, src, preload = false) {
  const img = document.createElement("img");
  img.className = "masonry-img";
  img.loading = preload ? "eager" : "lazy";
  img.src = src;
  img.onclick = () => openFullscreen(src);

  img.onload = () => img.classList.add("loaded");

  const col = getShortestColumn(columns);
  col.appendChild(img);
}

function lazyPlace(columns, src) {
  const img = document.createElement("img");
  img.className = "masonry-img";
  img.dataset.src = src;
  img.onclick = () => openFullscreen(src);

  const col = getShortestColumn(columns);
  col.appendChild(img);
}

function placeExisting(columns, img) {
  const col = getShortestColumn(columns);
  col.appendChild(img);
}



/* =======================================================
   LAZY LOADING FOR REMAINING IMAGES
======================================================= */

function setupLazyObserver() {
  const lazyImgs = document.querySelectorAll("img[data-src]");

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const img = entry.target;
      img.src = img.dataset.src;
      img.removeAttribute("data-src");

      img.onload = () => img.classList.add("loaded");

      obs.unobserve(img);
    });
  }, {
    rootMargin: "300px 0px",
    threshold: 0.01
  });

  lazyImgs.forEach(img => obs.observe(img));
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
