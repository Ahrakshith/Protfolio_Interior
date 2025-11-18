/* ============================
   NAVBAR + FADE (UNCHANGED)
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
   JSON-BASED PINTEREST GALLERY — AUTO FOR ALL CATEGORIES
======================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const page = window.location.pathname;

  // Page → Category mapping
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

  // Detect current page
  for (const file in categoryMap) {
    if (page.includes(file)) {
      loadCategory(categoryMap[file]);
      break;
    }
  }
});


/* Load images from auto-generated JSON */
async function loadCategory(category) {
  const container = document.getElementById(`${category}Gallery`);
  if (!container) return;

  const jsonURL = `/data/${category}.json`;

  try {
    const res = await fetch(jsonURL);
    const files = await res.json(); // an array of filenames

    files.forEach(filename => {
      const src = `/projects/${category}/${filename}`;
      addImage(container, src);
    });

  } catch (err) {
    console.error(`❌ Failed to load ${category}.json`, err);
  }
}


/* Add each image to Masonry grid */
function addImage(container, src) {
  const img = document.createElement("img");
  img.src = src;
  img.loading = "lazy";
  img.onclick = () => openFullscreen(src);

  container.appendChild(img);
}



/* =======================================================
   FULLSCREEN VIEWER (MODAL)
======================================================= */

function openFullscreen(src) {
  const modal = document.getElementById("fullscreenModal");
  const modalImg = document.getElementById("fullscreenImg");

  modalImg.src = src;
  modal.style.display = "flex";
}
