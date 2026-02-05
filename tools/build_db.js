const fs = require("fs");
const path = require("path");

const inputPath = path.join(__dirname, "../data/raw/raw_data.txt");
const outputPath = path.join(__dirname, "../data/db/db_data.txt");

const raw = fs.readFileSync(inputPath, "utf-8").split("\n");

function cleanName(name) {
  return name.trim().replace(/\s*\(.*?\)\s*$/, "");
}

const cleaned = raw
  .map(cleanName)
  .filter(x => x.length > 0)
  .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));

fs.writeFileSync(outputPath, cleaned.join("\n"));
console.log("DB 생성 완료 (정렬됨):", cleaned.length);
