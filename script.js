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
   PAGE TYPE DETECTION (Premium vs Normal)
======================================================= */

let IS_PREMIUM_PAGE = false;

document.addEventListener("DOMContentLoaded", () => {

  let page = window.location.pathname.split("/").pop();
  if (!page) page = "index";
  page = page.replace(".html", "");

  console.log("🔎 CURRENT PAGE:", page);

  if (page === "premium") {
    IS_PREMIUM_PAGE = true;
    console.log("🎨 PREMIUM IMAGE MODE ENABLED");
    
    loadCategory("premium-kitchen");
    loadCategory("premium-living");
    loadCategory("premium-bedroom");
    loadCategory("premium-dining");
    loadCategory("premium-bathroom");
    loadCategory("premium-furniture");
    return;
  }

  console.log("📂 NORMAL PAGE");
  loadCategory(page);
});



/* =======================================================
   PRELOAD FIRST IMAGES
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
   LOAD CATEGORY IMAGES (Premium uses clean mode)
======================================================= */

async function loadCategory(category) {
  console.log("\n----------------------------------------");
  console.log("📥 LOAD CATEGORY:", category);

  const container = document.getElementById(`${category}Gallery`);
  if (!container) return console.error("❌ Missing container:", category);

  const jsonURL = `/data/${category}.json`;
  console.log("📄 Fetching JSON:", jsonURL);

  try {
    const res = await fetch(jsonURL);
    if (!res.ok) return console.error("❌ JSON NOT FOUND:", jsonURL);

    const files = await res.json();
    if (!Array.isArray(files)) return;

    let imageUrls = files.map(f => `/projects/${category}/${f}`);

    console.log("🖼️ Found:", imageUrls.length);

    /* ---------- PREMIUM MODE → skip bad URLs ---------- */
    if (IS_PREMIUM_PAGE) {
      console.log("✨ Premium clean mode enabled — filtering out failed images");

      const testResults = await Promise.all(
        imageUrls.map(url => preloadImage(url))
      );

      imageUrls = testResults.filter(r => r.ok).map(r => r.url);

      console.log("✨ After cleanup →", imageUrls.length, "valid images");
    }

    /* ---------- PRELOAD FIRST 10 ---------- */
    const firstBatch = imageUrls.slice(0, 10);
    await Promise.all(firstBatch.map(preloadImage));

    firstBatch.forEach(src => addInstant(container, src));

    /* ---------- LAZY LOAD REST ---------- */
    const remaining = imageUrls.slice(10);
    remaining.forEach(src => addLazy(container, src));

    observeLazyImages();

  } catch (err) {
    console.error("❌ JSON Load Error:", err);
  }
}



/* =======================================================
   ADD IMAGE — INSTANT
======================================================= */

function addInstant(container, src) {
  if (!src) return;

  const img = document.createElement("img");
  img.src = src;
  img.classList.add("masonry-img");
  img.loading = "eager";

  img.onload = () => img.classList.add("loaded");
  img.onerror = () => console.warn("❌ Failed (instant):", src);

  img.onclick = () => openFullscreen(src);
  container.appendChild(img);
}



/* =======================================================
   ADD IMAGE — LAZY
======================================================= */

function addLazy(container, src) {
  if (!src) return;

  const img = document.createElement("img");
  img.dataset.src = src;
  img.classList.add("masonry-img");
  img.loading = "lazy";
  img.onclick = () => openFullscreen(src);

  container.appendChild(img);
}



/* =======================================================
   LAZY LOADING
======================================================= */

function observeLazyImages() {
  const lazyImgs = document.querySelectorAll("img[data-src]");

  const obs = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const img = entry.target;
      img.src = img.dataset.src;

      img.onload = () => img.classList.add("loaded");
      img.onerror = () => {
        console.warn("❌ Failed lazy load:", img.dataset.src);
        img.remove(); // remove failed image immediately
      };

      img.removeAttribute("data-src");
      observer.unobserve(img);
    });
  }, {
    rootMargin: "200px 0px",
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
