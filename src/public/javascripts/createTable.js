async function createForm() {
  const insertButton = document.getElementById("insert_btn");
  const createButton = document.getElementById("create_table_btn");

  insertButton.onclick = () => {
    const fieldNameInput = document.querySelector(
      ".main_body .input_form_name"
    );
    const fieldName = fieldNameInput.value;
    const inputType = document.getElementById("input-type").value;
    const inputPk = document.getElementById("input-pk").value;
    const defaultValueInput = document.querySelector(
      ".create_box_bottom input[placeholder='Leave it empty for no default value']"
    );
    const defaultValue = defaultValueInput.value || "None";
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

    const pkCell = document.createElement("td");
    pkCell.innerText = inputPk ? "YES" : "NO";

    const defaultCell = document.createElement("td");
    defaultCell.innerText = defaultValue;

    newRow.appendChild(nameCell);
    newRow.appendChild(typeCell);
    newRow.appendChild(pkCell);
    newRow.appendChild(defaultCell);

    tableDataTbody.appendChild(newRow);

    // Clear the field name and default value inputs after adding
    fieldNameInput.value = "";
    defaultValueInput.value = "";

    // Reset the select inputs to their initial state
    document.getElementById("input-type").selectedIndex = 0;
    document.getElementById("input-pk").selectedIndex = 0;
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
      let defaultValue = cells[3].innerText;

      // Check if default value is a number (integer or real)
      if (!isNaN(defaultValue) && defaultValue !== "None") {
        defaultValue = Number(defaultValue);
      } else if (defaultValue === "None") {
        defaultValue = null;
      }

      return {
        name: cells[0].innerText,
        type: cells[1].innerText,
        pk: cells[2].innerText === "YES" ? "PRIMARY KEY AUTOINCREMENT" : "",
        default: defaultValue,
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
