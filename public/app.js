async function loadCandidates() {
  const response = await fetch("/api/candidates");
  const data = await response.json();

  const list = document.getElementById("list");
  const loading = document.getElementById("loading");
  const errorBox = document.getElementById("error");

  loading.classList.add("hidden");

  if (!data.candidates || data.candidates.length === 0) {
    list.innerHTML = "<p>No placement candidates found.</p>";
    return;
  }

  list.innerHTML = data.candidates
    .map(
      (item) => `
        <article class="card">
          <div class="meta">
            <span class="badge">${item.confidence}</span>
            <span class="type">${item.type}</span>
          </div>
          <h3>${item.subject}</h3>
          <p><strong>From:</strong> ${item.sender}</p>
          <p><strong>Date:</strong> ${new Date(item.dateTime).toLocaleString()}</p>

          <div class="actions">
            <button class="approve" data-id="${item.id}" data-title="${item.subject}" data-datetime="${item.dateTime}">
              Approve
            </button>
            <button class="reject" data-id="${item.id}">
              Reject
            </button>
          </div>
        </article>
      `
    )
    .join("");

  document.querySelectorAll(".approve").forEach((button) => {
    button.addEventListener("click", async () => {
      const { id, title, datetime } = button.dataset;

      const result = await fetch("/api/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          title,
          dateTime: datetime
        })
      });

      const resultData = await result.json();

      if (resultData.ok) {
        button.closest(".card").remove();
      } else {
        errorBox.textContent = resultData.error || "Approval failed.";
        errorBox.classList.remove("hidden");
      }
    });
  });

  document.querySelectorAll(".reject").forEach((button) => {
    button.addEventListener("click", () => {
      button.closest(".card").remove();
    });
  });
}

loadCandidates();
