// generate-json.js
const fs = require("fs");
const path = require("path");

const categoriesDir = path.join(__dirname, "projects"); // <-- root projects
const dataOutputDir = path.join(__dirname, "data");

// Ensure data directory exists
if (!fs.existsSync(dataOutputDir)) {
  fs.mkdirSync(dataOutputDir, { recursive: true });
}

console.log("🔍 Auto-generating JSON for categories from:", categoriesDir);

if (!fs.existsSync(categoriesDir)) {
  console.error("❌ categoriesDir missing:", categoriesDir);
  process.exit(0); // don't fail the build harshly — optional
}

const categories = fs.readdirSync(categoriesDir, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name);

categories.forEach((category) => {
  const folderPath = path.join(categoriesDir, category);
  const files = fs.readdirSync(folderPath)
    .filter((file) => {
      const ext = file.toLowerCase();
      return ext.endsWith(".jpg") || ext.endsWith(".jpeg") || ext.endsWith(".png") || ext.endsWith(".webp");
    });

  const outputPath = path.join(dataOutputDir, `${category}.json`);
  fs.writeFileSync(outputPath, JSON.stringify(files, null, 2));
  console.log(`✔ ${category}.json generated (${files.length} images)`);
});

console.log("✅ JSON generation complete.");
