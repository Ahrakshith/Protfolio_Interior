/**
 * AUTO-GENERATE JSON FILES FOR ALL CATEGORIES
 * Scans /public/projects/<category> and outputs /public/data/<category>.json
 */

const fs = require("fs");
const path = require("path");

const categoriesDir = path.join(__dirname, "public", "projects");
const dataOutputDir = path.join(__dirname, "public", "data");

// Ensure data directory exists
if (!fs.existsSync(dataOutputDir)) {
  fs.mkdirSync(dataOutputDir, { recursive: true });
}

console.log("🔍 Auto-generating JSON for categories...");

const categories = fs.readdirSync(categoriesDir);

categories.forEach((category) => {
  const folderPath = path.join(categoriesDir, category);

  // Skip non-folders
  if (!fs.lstatSync(folderPath).isDirectory()) return;

  const files = fs.readdirSync(folderPath).filter((file) => {
    const ext = file.toLowerCase();
    return ext.endsWith(".jpg") || ext.endsWith(".jpeg") || ext.endsWith(".png") || ext.endsWith(".webp");
  });

  const outputPath = path.join(dataOutputDir, `${category}.json`);
  fs.writeFileSync(outputPath, JSON.stringify(files, null, 2));

  console.log(`✔ ${category}.json generated (${files.length} images)`);
});

console.log("✅ JSON generation complete.");
