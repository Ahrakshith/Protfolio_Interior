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
   AUTO JSON → PINTEREST GALLERY
======================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const page = window.location.pathname.split("/").pop();

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
  if (!category) return;

  loadCategory(category);
});


async function loadCategory(category) {
  const container = document.getElementById(`${category}Gallery`);
  if (!container) return;

  const jsonURL = `/data/${category}.json`;

  try {
    const res = await fetch(jsonURL);
    const files = await res.json();

    files.forEach((file) => {
      const src = `/projects/${category}/${file}`;
      addImage(container, src);
    });

  } catch (err) {
    console.error(`❌ Could not load ${jsonURL}`, err);
  }
}


function addImage(container, src) {
  const img = document.createElement("img");
  img.src = src;
  img.loading = "lazy";
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
