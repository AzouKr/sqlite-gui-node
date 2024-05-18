async function createForm() {
  const insertButton = document.getElementById("insert_btn");
  const createButton = document.getElementById("create_table_btn");

  insertButton.onclick = () => {
    const fieldNameInput = document.querySelector(
      ".main_body .input_form_name"
    );
    const fieldName = fieldNameInput.value;
    const inputType = document.getElementById("input-type").value;
    const tableDataTbody = document.querySelector(
      ".main_body .table_component tbody"
    );

    if (!fieldName) {
      alert("Please enter the name of the field");
      return;
    }

    const newRow = document.createElement("tr");

    const nameCell = document.createElement("td");
    nameCell.innerText = fieldName;

    const typeCell = document.createElement("td");
    typeCell.innerText = inputType;

    newRow.appendChild(nameCell);
    newRow.appendChild(typeCell);

    tableDataTbody.appendChild(newRow);

    // Clear the field name input after adding
    fieldNameInput.value = "";
  };

  createButton.onclick = () => {
    const rows = document.querySelectorAll(
      ".main_body .table_component tbody tr"
    );
    const tableNameInput = document.querySelector(
      ".main_body input.input_form"
    );
    const tableName = tableNameInput.value;

    if (!tableName) {
      alert("Please enter the name of the table");
      return;
    }

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
        console.error("Error creating table:", error);
      });
  };
}

// Call createForm when the page loads
document.addEventListener("DOMContentLoaded", createForm);
