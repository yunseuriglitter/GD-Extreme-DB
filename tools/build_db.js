const fs = require("fs");
const path = require("path");

const rawPath = path.join(__dirname, "../data/raw/raw_data.txt");
const dbPath = path.join(__dirname, "../data/db/db_data.txt");
const lowerPath = path.join(__dirname, "../data/db/lower_db_data.txt");

const raw = fs.readFileSync(rawPath, "utf-8").split("\n");

function clean(name) {
  return name.trim().replace(/\s*\(.*?\)\s*$/, "");
}

const cleaned = raw.map(clean).filter(x => x);

// 표시용 DB
fs.writeFileSync(dbPath, cleaned.join("\n"));

// 검색용 DB (소문자)
fs.writeFileSync(lowerPath, cleaned.map(x => x.toLowerCase()).join("\n"));

console.log("DB 생성 완료:", cleaned.length);
