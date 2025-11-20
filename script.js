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

  console.log("🔎 CURRENT PAGE:", page);

  if (page === "premium") {
    console.log("🎨 PREMIUM PAGE DETECTED → Loading all premium sections");
    loadCategory("premium-kitchen");
    loadCategory("premium-living");
    loadCategory("premium-bedroom");
    loadCategory("premium-dining");
    loadCategory("premium-bathroom");
    loadCategory("premium-furniture");
    return;
  }

  console.log("📂 NORMAL CATEGORY PAGE:", page);
  loadCategory(page);
});



/* =======================================================
   PRELOAD FIRST 10 IMAGES
======================================================= */

function preloadImage(url) {
  return new Promise((resolve) => {
    if (!url) return resolve({ url, ok: false });

    const img = new Image();
    img.src = url;

    img.onload = () => resolve({ url, ok: true });
    img.onerror = () => resolve({ url, ok: false });
  });
}



/* =======================================================
   LOAD CATEGORY IMAGES
======================================================= */

async function loadCategory(category) {
  console.log("\n----------------------------------------");
  console.log("📥 LOAD CATEGORY:", category);

  const container = document.getElementById(`${category}Gallery`);
  if (!container) {
    console.error("❌ ERROR: Container NOT FOUND for:", category);
    return;
  }

  const jsonURL = `/data/${category}.json`;
  console.log("📄 Fetching JSON:", jsonURL);

  try {
    const res = await fetch(jsonURL);
    if (!res.ok) {
      console.error("❌ JSON NOT FOUND:", jsonURL);
      return;
    }

    const files = await res.json();
    if (!Array.isArray(files)) {
      console.error("❌ JSON IS NOT AN ARRAY:", files);
      return;
    }

    const imageUrls = files
      .map(f => `/projects/${category}/${f}`)
      .filter(url => url && url !== "undefined" && url !== "/projects//");

    console.log("🖼️ Cleaned image URLs:", imageUrls);

    /* --- PRELOAD FIRST 10 --- */
    const firstBatch = imageUrls.slice(0, 10);
    await Promise.all(firstBatch.map(preloadImage));

    /* Add only those that successfully preloaded */
    firstBatch.forEach(src => addInstantVerified(container, src));

    /* --- LAZY LOAD REST --- */
    const remaining = imageUrls.slice(10);
    remaining.forEach(src => addLazyVerified(container, src));

    observeLazyImages();

  } catch (err) {
    console.error("❌ JSON Load Error:", err);
  }
}



/* =======================================================
   VERIFIED INSTANT IMAGE (skip bad URLs)
======================================================= */

function addInstantVerified(container, src) {
  if (!src) return;

  const test = new Image();
  test.src = src;

  test.onload = () => {
    const img = document.createElement("img");
    img.src = src;
    img.classList.add("masonry-img", "loaded");
    img.loading = "eager";
    img.onclick = () => openFullscreen(src);
    container.appendChild(img);
  };

  test.onerror = () => {
    console.warn("❌ Skipping bad instant image:", src);
  };
}



/* =======================================================
   VERIFIED LAZY IMAGE (skip bad URLs)
======================================================= */

function addLazyVerified(container, src) {
  if (!src) return;

  const test = new Image();
  test.src = src;

  test.onload = () => {
    const img = document.createElement("img");
    img.dataset.src = src;
    img.classList.add("masonry-img");
    img.loading = "lazy";
    img.onclick = () => openFullscreen(src);
    container.appendChild(img);
  };

  test.onerror = () => {
    console.warn("❌ Skipping bad lazy image:", src);
  };
}



/* =======================================================
   LAZY LOADING (Pinterest style)
======================================================= */

function observeLazyImages() {
  const lazyImgs = document.querySelectorAll("img[data-src]");
  console.log("👀 Observing lazy images:", lazyImgs.length);

  const obs = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const img = entry.target;
      img.src = img.dataset.src;

      img.onload = () => img.classList.add("loaded");
      img.removeAttribute("data-src");

      observer.unobserve(img);
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
