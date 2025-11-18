// generate-json.js
const fs = require("fs");
const path = require("path");

// Where your image folders are:
const categoriesDir = path.join(__dirname, "projects");

// JSON output folder:
const dataOutputDir = path.join(__dirname, "data");

// Make data folder if missing
if (!fs.existsSync(dataOutputDir)) {
  fs.mkdirSync(dataOutputDir, { recursive: true });
}

console.log("🔍 Generating JSON from:", categoriesDir);

// List categories (folders inside /projects)
const categories = fs.readdirSync(categoriesDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

// For each category, generate a JSON file
categories.forEach((category) => {
  const folderPath = path.join(categoriesDir, category);

  const files = fs.readdirSync(folderPath)
    .filter((file) => {
      const ext = file.toLowerCase();
      return (
        ext.endsWith(".jpg") ||
        ext.endsWith(".jpeg") ||
        ext.endsWith(".png") ||
        ext.endsWith(".webp")
      );
    });

  const outputPath = path.join(dataOutputDir, `${category}.json`);
  fs.writeFileSync(outputPath, JSON.stringify(files, null, 2));

  console.log(`✔ ${category}.json created (${files.length} images)`);
});

console.log("✅ JSON generation complete.");
