const request = indexedDB.open("budget_tracker", 1);
let db;
request.onupgradeneeded = ({ target }) => {
  let db = target.result;
  db.createObjectStore("Waiting", { autoIncrement: true });
};
request.onsuccess = ({ target }) => {
  db = target.result;
  if (navigator.onLine) {
    checkDatabase();
  }
};
request.onerror = function (event) {
};
function saveRecord(record) {
  const transaction = db.transaction(["Waiting"],);
  const store = transaction.objectStore("Waiting");
  store.add(record);
}
function checkDatabase() {
  const transaction = db.transaction(["Waiting"],);
  const store = transaction.objectStore("Waiting");
  const getAll = store.getAll();

  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          return response.json();
        })
        .then(() => {
          const transaction = db.transaction(["Waiting"],);
          const store = transaction.objectStore("Waiting");
          store.clear();
        });
    }
  };
}
window.addEventListener("online", checkDatabase);
