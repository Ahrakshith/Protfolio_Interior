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
   AUTO JSON → PINTEREST GALLERY (WITH DEBUG LOGGING)
======================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const page = window.location.pathname.split("/").pop();
  console.log("📄 Current Page:", page);

  const categoryMap = {
    "kitchen.html": "kitchen",
    "bedroom.html": "bedroom",
    "living.html": "living",
    "dining.html": "dining",
    "bathroom.html": "bathroom",
    "office.html": "office",
    "outdoor.html": "outdoor",
    "commercial.html": "commercial",
    "furniture.html": "furniture"
  };

  const category = categoryMap[page];
  console.log("📂 Mapped Category:", category);

  if (!category) {
    console.warn("⚠ No category found for:", page);
    return;
  }

  loadCategory(category);
});


async function loadCategory(category) {
  const containerId = `${category}Gallery`;
  console.log("🔎 Searching container:", containerId);

  const container = document.getElementById(containerId);
  console.log("📌 Container Found:", container);

  if (!container) {
    console.error("❌ ERROR: Container not found:", containerId);
    return;
  }

  const jsonURL = `/data/${category}.json`;
  console.log("📥 Fetching JSON from:", jsonURL);

  try {
    const res = await fetch(jsonURL);
    console.log("📦 JSON Response Status:", res.status);

    const files = await res.json();
    console.log("📁 JSON Content:", files);

    if (!Array.isArray(files)) {
      console.error("❌ JSON format invalid! Expected an array.");
      return;
    }

    if (files.length === 0) {
      console.warn("⚠ JSON loaded but EMPTY. No images found.");
    }

    files.forEach((filename) => {
      const src = `/projects/${category}/${filename}`;
      console.log("🖼 Creating Image Element for:", src);
      addImage(container, src);
    });

  } catch (err) {
    console.error("❌ JSON Fetch Error:", err);
  }
}


function addImage(container, src) {
  console.log("➡️ addImage() called for:", src);

  const img = document.createElement("img");
  img.src = src;

  img.onload = () => console.log("✔ Image Loaded:", src);
  img.onerror = () => console.error("❌ Failed to Load:", src);

  img.loading = "lazy";
  img.onclick = () => openFullscreen(src);

  container.appendChild(img);
  console.log("📌 Appended to DOM:", src);
}



/* =======================================================
   FULLSCREEN VIEWER
======================================================= */

function openFullscreen(src) {
  console.log("🔍 Opening fullscreen for:", src);

  const modal = document.getElementById("fullscreenModal");
  const modalImg = document.getElementById("fullscreenImg");

  modalImg.src = src;
  modal.style.display = "flex";
}
