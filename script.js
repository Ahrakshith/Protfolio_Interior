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
   JSON-BASED PINTEREST GALLERY — UNLIMITED IMAGES
======================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const page = window.location.pathname;

  if (page.includes("kitchen.html")) loadCategory("kitchen");
  if (page.includes("bedroom.html")) loadCategory("bedroom");
  if (page.includes("living.html")) loadCategory("living");
  if (page.includes("dining.html")) loadCategory("dining");
});


async function loadCategory(category) {
  const container = document.getElementById(`${category}Gallery`);
  if (!container) return;

  const jsonURL = `/data/${category}.json`;

  try {
    const res = await fetch(jsonURL);
    const files = await res.json();  // Array of filenames

    files.forEach(name => {
      const src = `/projects/${category}/${name}`;
      renderImage(container, src);
    });

  } catch (err) {
    console.error(`Failed to load ${category}.json`, err);
  }
}


/* Add image to Masonry grid */
function renderImage(container, src) {
  const img = document.createElement("img");
  img.loading = "lazy";
  img.src = src;
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
