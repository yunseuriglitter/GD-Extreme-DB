const fs = require("fs");
const path = require("path");

const rawPath = path.join(__dirname, "../data/raw/raw_data.txt");
const dbPath = path.join(__dirname, "../data/db/db_data.txt");
const lowerPath = path.join(__dirname, "../data/db/lower_db_data.txt");

if (!fs.existsSync(rawPath)) {
  console.error("raw_data.txt not found");
  process.exit(1);
}

const raw = fs.readFileSync(rawPath, "utf-8").split("\n");

// 정제
function clean(name) {
  return name.trim().replace(/\s*\(.*?\)\s*$/, "");
}

let cleaned = raw.map(clean).filter(x => x.length > 0);

// 정렬 (사전순)
cleaned.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));

// 저장 (원본)
fs.writeFileSync(dbPath, cleaned.join("\n"), "utf-8");

// 저장 (lower)
const lower = cleaned.map(x => x.toLowerCase());
fs.writeFileSync(lowerPath, lower.join("\n"), "utf-8");

console.log("✔ DB 생성 완료");
console.log("db_data:", cleaned.length);
console.log("lower_db_data:", lower.length);
