async function createForm() {
  const insertButton = document.getElementById("insert-field-btn");
  const createButton = document.getElementById("create-btn");
  insertButton.onclick = () => {
    const fieldName = document.getElementById("field-name").value;
    const inputType = document.getElementById("input-type").value;
    const tableDataTbody = document.getElementById("table-data");

    if (!fieldName) {
      alert("Please enter the name of the field");
      return;
    }

    const newRow = document.createElement("tr");

    const nameCell = document.createElement("td");
    nameCell.className = "border border-gray-600 text-left p-2";
    nameCell.innerText = fieldName;

    const typeCell = document.createElement("td");
    typeCell.className = "border border-gray-600 text-left p-2";
    typeCell.innerText = inputType;

    newRow.appendChild(nameCell);
    newRow.appendChild(typeCell);

    tableDataTbody.appendChild(newRow);

    // Clear the field name input after adding
    document.getElementById("field-name").value = "";
  };

  createButton.onclick = () => {
    const rows = document.querySelectorAll("#table-data tr");
    const tableName = document.getElementById("table-name").value;

    const data = Array.from(rows).map((row) => {
      const cells = row.querySelectorAll("td");
      return {
        name: cells[0].innerText,
        type: cells[1].innerText,
      };
    });
    fetch("/api/tables/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tableName, data }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        // Handle response if needed
        window.location.href = `/`;
      })
      .catch((error) => {
        console.error("Error inserting data:", error);
      });
  };
}

// Call fetchTables when the page loads
document.addEventListener("DOMContentLoaded", createForm);
