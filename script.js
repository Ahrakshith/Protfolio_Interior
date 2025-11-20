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

  // If premium.html → load all premium sections
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

  // Normal category pages
  console.log("📂 NORMAL CATEGORY PAGE:", page);
  loadCategory(page);
});



/* =======================================================
   PRELOAD FIRST 10 IMAGES FAST
======================================================= */

function preloadImage(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = url;

    img.onload = () => {
      console.log("✅ Preloaded:", url);
      resolve({ url, ok: true });
    };
    img.onerror = () => {
      console.warn("❌ Failed to preload:", url);
      resolve({ url, ok: false });
    };
  });
}



/* =======================================================
   LOAD CATEGORY IMAGES (NORMAL + PREMIUM)
======================================================= */

async function loadCategory(category) {
  console.log("\n----------------------------------------");
  console.log("📥 LOAD CATEGORY:", category);

  const container = document.getElementById(`${category}Gallery`);
  console.log("🔍 Looking for container ID:", `${category}Gallery`);
  console.log("📦 Container found:", container);

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
    console.log("📁 JSON contents:", files);

    if (!Array.isArray(files)) {
      console.error("❌ JSON IS NOT AN ARRAY:", files);
      return;
    }

    const imageUrls = files.map(f => `/projects/${category}/${f}`);
    console.log("🖼️ Expected image URLs:", imageUrls);

    /* --- PRELOAD FIRST 10 --- */
    const firstBatch = imageUrls.slice(0, 10);
    console.log("🚀 Preloading first 10 images…");
    await Promise.all(firstBatch.map(preloadImage));

    /* Render first 10 instantly */
    firstBatch.forEach(src => addImage(container, src));

    /* --- LAZY LOAD REST --- */
    const remaining = imageUrls.slice(10);
    console.log("🕒 Remaining lazy images:", remaining.length);
    remaining.forEach(src => createLazyImage(container, src));

    observeLazyImages();

  } catch (err) {
    console.error("❌ JSON Load Error:", err);
  }
}



/* =======================================================
   CREATE LAZY IMAGE (blur-up)
======================================================= */

function createLazyImage(container, src) {
  console.log("🟡 Creating lazy image:", src);

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
  console.log("👀 Observing lazy images:", lazyImgs.length);

  const obs = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        console.log("📸 Lazy loading:", img.dataset.src);

        img.src = img.dataset.src;

        img.onload = () => {
          console.log("✅ Loaded:", img.src);
          img.classList.add("loaded");
        };

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
  console.log("🟢 Adding instant image:", src);

  const img = document.createElement("img");
  img.src = src;
  img.classList.add("masonry-img");
  img.loading = "eager";

  img.onload = () => {
    console.log("✔️ Instant image loaded:", src);
    img.classList.add("loaded");
  };

  img.onerror = () => {
    console.error("❌ Instant image failed:", src);
  };

  img.onclick = () => openFullscreen(src);

  container.appendChild(img);
}



/* =======================================================
   FULLSCREEN VIEWER
======================================================= */

function openFullscreen(src) {
  console.log("🔍 Opening fullscreen:", src);

  const modal = document.getElementById("fullscreenModal");
  const modalImg = document.getElementById("fullscreenImg");
  modalImg.src = src;
  modal.style.display = "flex";
}
