let db = [];
let lowerDB = [];
const charts = {};

// ===== DOM =====
const elPrefix = document.getElementById("prefix");
const elSuffix = document.getElementById("suffix");
const elResults = document.getElementById("results");

const elSpaceToggle = document.getElementById("spaceToggle");
const elCaseStart = document.getElementById("caseStart");
const elCaseEnd = document.getElementById("caseEnd");
const elCaseChar = document.getElementById("caseChar");

// ===== 경로 자동 대응 (GitHub Pages/로컬) =====
function basePath() {
  const parts = location.pathname.split("/").filter(Boolean);
  const repo = parts[0];
  if (!repo || repo.includes(".html")) return "";
  return "/" + repo;
}
const BASE = basePath();

// ===== DB 로드 =====
async function loadDB() {
  try {
    const [res1, res2] = await Promise.all([
      fetch(`${BASE}/data/db/db_data.txt`, { cache: "no-store" }),
      fetch(`${BASE}/data/db/lower_db_data.txt`, { cache: "no-store" })
    ]);

    db = (await res1.text()).split("\n").filter(Boolean);
    lowerDB = (await res2.text()).split("\n").filter(Boolean);

    elResults.textContent = "Type to search...";
    updateStats();
  } catch (e) {
    elResults.textContent = "DB load error.";
    console.error(e);
  }
}

// ===== 사전 검색 =====
function searchDB() {
  const p = elPrefix.value.trim().toLowerCase();
  const s = elSuffix.value.trim().toLowerCase();

  if (!p && !s) {
    elResults.textContent = "Type to search...";
    return;
  }

  const out = [];
  for (let i = 0; i < lowerDB.length; i++) {
    const name = lowerDB[i];
    if (p && !name.startsWith(p)) continue;
    if (s && !name.endsWith(s)) continue;
    out.push(db[i]);
  }

  elResults.textContent = out.length ? out.join("\n") : "No match found.";
}

elPrefix.addEventListener("input", searchDB);
elSuffix.addEventListener("input", searchDB);

// ===== 그래프 생성 =====
function makeBar(canvasId, labels, values) {
  if (charts[canvasId]) charts[canvasId].destroy();

  charts[canvasId] = new Chart(document.getElementById(canvasId), {
    type: "bar",
    data: { labels, datasets: [{ data: values }] },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false, // ⭐ 높이 CSS 적용되게
      plugins: { legend: { display: false } },
      scales: { x: { beginAtZero: true } }
    }
  });
}

function countMap(arr) {
  const m = {};
  for (let a of arr) m[a] = (m[a] || 0) + 1;
  return m;
}

// ===== 통계 계산 =====
function updateStats() {
  if (!db.length) return;

  const includeSpace = elSpaceToggle.checked;
  const startCase = elCaseStart.checked;
  const endCase = elCaseEnd.checked;
  const charCase = elCaseChar.checked;

  // 1️⃣ 글자수
  const lengths = db.map(n => includeSpace ? n.length : n.replace(/\s/g,"").length);
  const lenMap = countMap(lengths);
  const lenPairs = Object.entries(lenMap).sort((a,b)=>a[0]-b[0]);
  makeBar("lengthChart", lenPairs.map(x=>x[0]), lenPairs.map(x=>x[1]));

  // 2️⃣ 시작 대/소문자
  const upper = db.filter(n => /^[A-Z]/.test(n)).length;
  const lower = db.filter(n => /^[a-z]/.test(n)).length;
  makeBar("caseChart", ["Uppercase", "Lowercase"], [upper, lower]);

  // 3️⃣ 앞글자
  const starts = db.map(n => startCase ? n[0] : n[0].toLowerCase());
  const startMap = countMap(starts);
  makeBar("startChart", Object.keys(startMap), Object.values(startMap));

  // 4️⃣ 뒷글자
  const ends = db.map(n => endCase ? n[n.length-1] : n[n.length-1].toLowerCase());
  const endMap = countMap(ends);
  makeBar("endChart", Object.keys(endMap), Object.values(endMap));

  // 5️⃣ 글자 빈도
  let chars = [];
  for (let n of db)
    for (let c of n.replace(/\s/g,""))
      chars.push(charCase ? c : c.toLowerCase());

  const charMap = countMap(chars);
  makeBar("charChart", Object.keys(charMap), Object.values(charMap));
}

// 토글 이벤트
elSpaceToggle.addEventListener("change", updateStats);
elCaseStart.addEventListener("change", updateStats);
elCaseEnd.addEventListener("change", updateStats);
elCaseChar.addEventListener("change", updateStats);

loadDB();
