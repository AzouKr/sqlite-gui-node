async function createForm() {
  const button = document.getElementById("runButton");
  button.onclick = () => {
    const query = document.getElementById("queryTextarea").value;
    if (!query) {
      alert("Please enter the write your query before hitting run");
      return;
    }
    const table = document.getElementById("resultTable");
    const tableHead = table.querySelector("thead");
    const tableBody = document.querySelector("#resultTable tbody");
    const resultParagraph = document.getElementById("resultParagraph");

    // Clear previous results
    tableHead.innerHTML = "";
    tableBody.innerHTML = "";
    resultParagraph.textContent = "";

    fetch("/api/tables/query", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sqlQuery: query }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.type === "string") {
          resultParagraph.textContent = data.data;
        } else {
          if (data.data.length > 0) {
            // Generate table headers
            const headers = Object.keys(data.data[0]);
            const headerRow = document.createElement("tr");
            headers.forEach((header) => {
              const th = document.createElement("th");
              th.scope = "col";
              th.textContent = header;
              headerRow.appendChild(th);
            });
            tableHead.appendChild(headerRow);

            // Populate table rows
            data.data.forEach((row, index) => {
              const tr = document.createElement("tr");

              headers.forEach((header) => {
                const td = document.createElement("td");
                td.textContent = row[header];
                tr.appendChild(td);
              });
              console.log(tr);

              tableBody.appendChild(tr);
            });
          }
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert(
          "ERROR : SQL Query is incorrect \nCheck Your console for more info"
        );
      });
  };
}

// Call createForm when the page loads
document.addEventListener("DOMContentLoaded", createForm);
