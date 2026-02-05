let db = [];
let lowerDB = [];
let charts = {};

async function loadDB() {
  const [res1, res2] = await Promise.all([
    fetch("/GD-Extreme-DB/data/db/db_data.txt"),
    fetch("/GD-Extreme-DB/data/db/lower_db_data.txt")
  ]);

  db = (await res1.text()).split("\n").filter(x => x);
  lowerDB = (await res2.text()).split("\n").filter(x => x);
  updateStats();
}

function searchDB() {
  const p = prefix.value.trim().toLowerCase();
  const s = suffix.value.trim().toLowerCase();

  if (!p && !s) {
    results.textContent = "Type to search...";
    return;
  }

  const resultsArr = [];

  for (let i = 0; i < lowerDB.length; i++) {
    const name = lowerDB[i];
    if (p && !name.startsWith(p)) continue;
    if (s && !name.endsWith(s)) continue;
    resultsArr.push(db[i]);
  }

  results.textContent = resultsArr.length ? resultsArr.join("\n") : "No match.";
}

function makeBar(id, labels, data) {
  if (charts[id]) charts[id].destroy();
  charts[id] = new Chart(document.getElementById(id), {
    type: 'bar',
    data: { labels, datasets: [{ data }] },
    options: {
      indexAxis: 'y',
      plugins: { legend: { display: false } },
      scales: { x: { beginAtZero: true } }
    }
  });
}

function countMap(arr) {
  let m = {};
  for (let a of arr) m[a] = (m[a] || 0) + 1;
  return m;
}

function updateStats() {
  const space = spaceToggle.checked;
  const caseStartOn = caseStart.checked;
  const caseEndOn = caseEnd.checked;
  const caseCharOn = caseChar.checked;

  // 길이
  let lengths = db.map(n => space ? n.length : n.replace(/\s/g,"").length);
  let lenMap = countMap(lengths);
  makeBar("lengthChart", Object.keys(lenMap), Object.values(lenMap));

  // 앞글자
  let start = db.map(n => caseStartOn ? n[0] : n[0].toLowerCase());
  makeBar("startChart", Object.keys(countMap(start)), Object.values(countMap(start)));

  // 뒷글자
  let end = db.map(n => caseEndOn ? n[n.length-1] : n[n.length-1].toLowerCase());
  makeBar("endChart", Object.keys(countMap(end)), Object.values(countMap(end)));

  // 대문자/소문자 시작
  let upper = db.filter(n => /^[A-Z]/.test(n)).length;
  let lower = db.filter(n => /^[a-z]/.test(n)).length;
  makeBar("caseChart", ["Uppercase", "Lowercase"], [upper, lower]);

  // 전체 문자 빈도
  let chars = [];
  for (let n of db)
    for (let c of n.replace(/\s/g,""))
      chars.push(caseCharOn ? c : c.toLowerCase());

  let charMap = countMap(chars);
  makeBar("charChart", Object.keys(charMap), Object.values(charMap));
}

const prefix = document.getElementById("prefix");
const suffix = document.getElementById("suffix");
const results = document.getElementById("results");

loadDB();
