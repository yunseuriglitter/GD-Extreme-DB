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

// ===== Path helper (로컬/Pages 둘 다) =====
function basePath() {
  // GitHub Pages 프로젝트( /GD-Extreme-DB/ )면 그 베이스를 자동으로 잡음
  const parts = location.pathname.split("/").filter(Boolean);
  const repo = parts[0]; // e.g. "GD-Extreme-DB"
  // 로컬(예: /index.html)일 땐 parts[0]가 index.html일 수 있으니 안전장치:
  if (!repo || repo.includes(".html")) return "";
  return "/" + repo;
}

const BASE = basePath();

// ===== Load DBs =====
async function loadDB() {
  try {
    const [res1, res2] = await Promise.all([
      fetch(`${BASE}/data/db/db_data.txt`, { cache: "no-store" }),
      fetch(`${BASE}/data/db/lower_db_data.txt`, { cache: "no-store" })
    ]);

    if (!res1.ok || !res2.ok) {
      elResults.textContent = `DB load failed. (${res1.status}/${res2.status})`;
      return;
    }

    db = (await res1.text()).split("\n").filter(Boolean);
    lowerDB = (await res2.text()).split("\n").filter(Boolean);

    elResults.textContent = "Type to search...";
    // 통계는 실패해도 사전은 살도록 try로 분리
    try { updateStats(); } catch (e) { console.error(e); }
  } catch (e) {
    console.error(e);
    elResults.textContent = "DB load error.";
  }
}

// ===== Dictionary (case-insensitive search, original output) =====
function searchDB() {
  const p = elPrefix.value.trim().toLowerCase();
  const s = elSuffix.value.trim().toLowerCase();

  if (!p && !s) {
    elResults.textContent = "Type to search...";
    return;
  }

  if (!lowerDB.length || lowerDB.length !== db.length) {
    elResults.textContent = "DB not ready.";
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

// 이벤트 연결 (inline oninput 안 써도 되게 확실하게)
elPrefix.addEventListener("input", searchDB);
elSuffix.addEventListener("input", searchDB);

// ===== Charts =====
function makeBar(canvasId, labels, values) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  if (charts[canvasId]) charts[canvasId].destroy();

  charts[canvasId] = new Chart(ctx, {
    type: "bar",
    data: { labels, datasets: [{ data: values }] },
    options: {
      indexAxis: "y",
      plugins: {
        legend: { display: false },
        tooltip: { enabled: true }
      },
      scales: { x: { beginAtZero: true } }
    }
  });
}

function countMap(arr) {
  const m = Object.create(null);
  for (const a of arr) m[a] = (m[a] || 0) + 1;
  return m;
}

function topEntries(mapObj, limit = 36) {
  return Object.entries(mapObj)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);
}

function updateStats() {
  if (!db.length) return;

  const includeSpace = elSpaceToggle.checked;
  const startCase = elCaseStart.checked;
  const endCase = elCaseEnd.checked;
  const charCase = elCaseChar.checked;

  // 1) length
  const lengths = db.map(n => includeSpace ? n.length : n.replace(/\s/g, "").length);
  const lenMap = countMap(lengths);
  const lenPairs = Object.entries(lenMap).sort((a, b) => Number(a[0]) - Number(b[0]));
  makeBar("lengthChart", lenPairs.map(x => x[0]), lenPairs.map(x => x[1]));

  // 2) start
  const starts = db.map(n => {
    const c = n[0] || "";
    return startCase ? c : c.toLowerCase();
  });
  const startPairs = topEntries(countMap(starts), 36);
  makeBar("startChart", startPairs.map(x => x[0]), startPairs.map(x => x[1]));

  // 3) end
  const ends = db.map(n => {
    const c = n[n.length - 1] || "";
    return endCase ? c : c.toLowerCase();
  });
  const endPairs = topEntries(countMap(ends), 36);
  makeBar("endChart", endPairs.map(x => x[0]), endPairs.map(x => x[1]));

  // 4) uppercase vs lowercase start (numbers excluded)
  const upper = db.filter(n => /^[A-Z]/.test(n)).length;
  const lower = db.filter(n => /^[a-z]/.test(n)).length;
  makeBar("caseChart", ["Uppercase", "Lowercase"], [upper, lower]);

  // 5) char frequency (spaces excluded)
  const chars = [];
  for (const n of db) {
    for (const c of n.replace(/\s/g, "")) {
      chars.push(charCase ? c : c.toLowerCase());
    }
  }
  const charPairs = topEntries(countMap(chars), 36);
  makeBar("charChart", charPairs.map(x => x[0]), charPairs.map(x => x[1]));
}

// 토글 이벤트
elSpaceToggle.addEventListener("change", () => { try { updateStats(); } catch (e) { console.error(e); }});
elCaseStart.addEventListener("change", () => { try { updateStats(); } catch (e) { console.error(e); }});
elCaseEnd.addEventListener("change", () => { try { updateStats(); } catch (e) { console.error(e); }});
elCaseChar.addEventListener("change", () => { try { updateStats(); } catch (e) { console.error(e); }});

// start
loadDB();
