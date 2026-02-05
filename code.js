let db = [];

async function loadDB() {
  const res = await fetch("/GD-Extreme-DB/data/db/db_data.txt");

  if (!res.ok) {
    document.getElementById("results").textContent = "DB load failed.";
    return;
  }

  const text = await res.text();
  db = text.split("\n").filter(x => x.length > 0);
}

function searchDB() {
  const prefix = document.getElementById("prefix").value.trim();
  const suffix = document.getElementById("suffix").value.trim();

  if (!prefix && !suffix) {
    document.getElementById("results").textContent = "Type to search...";
    return;
  }

  const results = db.filter(name => {
    if (prefix && !name.startsWith(prefix)) return false;
    if (suffix && !name.endsWith(suffix)) return false;
    return true;
  });

  document.getElementById("results").textContent =
    results.length ? results.join("\n") : "No match found.";
}

loadDB();
