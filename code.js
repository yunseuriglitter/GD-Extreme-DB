let db = [];

async function loadDB() {
  const res = await fetch("data/db/db_data.txt");
  const text = await res.text();
  db = text.split("\n").filter(x => x.length > 0);
}

function searchDB() {
  const prefix = document.getElementById("prefix").value;
  const suffix = document.getElementById("suffix").value;

  let results = db.filter(name =>
    name.startsWith(prefix) && name.endsWith(suffix)
  );

  // 오름차순 정렬
  results.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));

  document.getElementById("results").textContent =
    results.length ? results.join("\n") : "No match found.";
}

loadDB();

