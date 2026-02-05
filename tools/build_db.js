const fs = require("fs");
const path = require("path");

const rawPath = path.join(__dirname, "../data/raw/raw_data.txt");
const dbPath = path.join(__dirname, "../data/db/db_data.txt");
const lowerPath = path.join(__dirname, "../data/db/lower_db_data.txt");

const raw = fs.readFileSync(rawPath, "utf-8").split("\n");

// 1️⃣ 정제 함수
function clean(name) {
  return name.trim().replace(/\s*\(.*?\)\s*$/, "");
}

// 2️⃣ 정제 + 빈 줄 제거
let cleaned = raw.map(clean).filter(x => x.length > 0);

// 3️⃣ 오름차순 정렬 (사전식)
cleaned.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));

// 4️⃣ db_data.txt 저장
fs.writeFileSync(dbPath, cleaned.join("\n"));

// 5️⃣ lower_db_data.txt 저장 (db 기준 소문자)
const lower = cleaned.map(x => x.toLowerCase());
fs.writeFileSync(lowerPath, lower.join("\n"));

console.log("DB 생성 완료");
console.log("원본:", cleaned.length, "개");
console.log("lower:", lower.length, "개");
