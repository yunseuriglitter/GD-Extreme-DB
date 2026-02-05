const fs = require("fs");

const inputPath = "../data/raw/raw_data.txt";
const outputPath = "../data/db/db_data.txt";

const raw = fs.readFileSync(inputPath, "utf-8").split("\n");

function cleanName(name) {
  return name
    .trim()                      // 좌우 공백 제거
    .replace(/\s*\(.*?\)\s*$/, ""); // 끝 (~~~) 제거
}

const cleaned = raw
  .map(cleanName)
  .filter(x => x.length > 0); // 빈 줄 제거

fs.writeFileSync(outputPath, cleaned.join("\n"));

console.log("DB 생성 완료:", cleaned.length, "개 저장됨");
