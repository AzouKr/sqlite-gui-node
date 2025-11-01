let pk_count = 1;

async function fetchData() {
  try {
    const response = await fetch(`${window.BASE_URL}/api/tables`);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    const select = document.getElementById("input-table");
    // // Create and append the default option
    const defaultOption = document.createElement("option");
    defaultOption.selected = true;
    defaultOption.textContent = "Open this select menu";
    defaultOption.value = "";
    select.appendChild(defaultOption);
    // // Create and append the other options
    data.data.forEach((table) => {
      if (table.name !== "sqlite_sequence" && table.name !== "query") {
        const option = document.createElement("option");
        option.value = table.name;
        option.textContent = table.name; // or use any other text you need, like converting numbers to words
        select.appendChild(option);
      }
    });
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

async function fetchTableInfos(tableName) {
  try {
    const response = await fetch(`${window.BASE_URL}/api/tables/all/infos/${tableName}`); // Correct endpoint
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    if (data.bool) {
      const select = document.getElementById("column-table");
      // // Create and append the default option
      const defaultOption = document.createElement("option");
      defaultOption.selected = true;
      defaultOption.textContent = "Open this select menu";
      defaultOption.value = "";
      select.appendChild(defaultOption);
      // // Create and append the other options
      data.data.forEach((table) => {
        const option = document.createElement("option");
        option.value = table.field;
        option.textContent = table.field; // or use any other text you need, like converting numbers to words
        select.appendChild(option);
      });
    } else {
      console.error("Error fetching table data:", data.error);
    }
  } catch (error) {
    console.error("Error fetching table data:", error);
  }
}

async function createForm() {
  fetchData();
  const insertButton = document.getElementById("insert_btn");
  const createButton = document.getElementById("create_table_btn");
  const queryButton = document.getElementById("query_table_btn");
  const default_div = document.getElementById("default-input-div");
  const table_div = document.getElementById("table-input-div");
  const columns_div = document.getElementById("Columns");
  const fk_div = document.getElementById("fk-input-div");

  const selectElement = document.getElementById("input-pk");
  selectElement.addEventListener("change", (event) => {
    if (event.target.value === "PRIMARY KEY") {
      default_div.style.display = "none";
      fk_div.style.display = "none";
    } else {
      default_div.style.display = "block";
      fk_div.style.display = "block";
    }
  });

  const fkElement = document.getElementById("input-fk");
  fkElement.addEventListener("change", (event) => {
    if (event.target.value === "yes") {
      default_div.style.display = "none";
      table_div.style.display = "block";
    } else {
      default_div.style.display = "block";
      table_div.style.display = "none";
    }
  });

  const tableElement = document.getElementById("input-table");
  tableElement.addEventListener("change", (event) => {
    if (event.target.value !== "") {
      fetchTableInfos(event.target.value);
      columns_div.style.display = "block";
    } else {
      columns_div.style.display = "none";
    }
  });
  const selectElement2 = document.getElementById("input-type");
  const selectElement3 = document.getElementById("pk-input-div");
  const date_alert = document.getElementById("date_alert");
  selectElement2.addEventListener("change", (event) => {
    if (event.target.value === "DATE") {
      default_div.style.display = "none";
      selectElement3.style.display = "none";
      date_alert.style.display = "block";
    } else {
      default_div.style.display = "block";
      selectElement3.style.display = "block";
      date_alert.style.display = "none";
    }
  });

  insertButton.onclick = () => {
    const fieldNameInput = document.getElementById("input_form_name");
    const fieldName = fieldNameInput.value;
    const inputType = document.getElementById("input-type").value;
    const inputPk = document.getElementById("input-pk").value;
    const inputFK = document.getElementById("input-fk").value;
    const inputTable = document.getElementById("input-table").value;
    const columnTable = document.getElementById("column-table").value;
    const defaultValueInput = document.getElementById("default-input");
    const defaultValue = defaultValueInput.value || "None";
    const tableDataTbody = document.querySelector(
      ".main_body .table_component tbody"
    );

    if (!fieldName) {
      alert("Please enter the name of the field");
      return;
    }
    if (inputPk === "PRIMARY KEY") {
      if (pk_count === 2) {
        alert("A table must have a maximum one primary key");
        return;
      } else {
        pk_count++;
      }
    }

    if (inputFK === "yes") {
      if (inputTable === "") {
        alert("Make sur you select table of the foreign key");
        return;
      }
      if (columnTable === "") {
        alert("Make sur you select column of the foreign key");
        return;
      }
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

    const fkCell = document.createElement("td");
    fkCell.innerText =
      inputTable === ""
        ? "No"
        : `FOREIGN KEY(${fieldName}) REFERENCES ${inputTable}(${columnTable})`;

    newRow.appendChild(nameCell);
    newRow.appendChild(typeCell);
    newRow.appendChild(pkCell);
    newRow.appendChild(defaultCell);
    newRow.appendChild(fkCell);

    tableDataTbody.appendChild(newRow);

    // Clear the field name and default value inputs after adding
    fieldNameInput.value = "";
    defaultValueInput.value = "";

    // Reset the select inputs to their initial state
    document.getElementById("input-type").selectedIndex = 0;
    document.getElementById("input-pk").selectedIndex = 0;
    document.getElementById("input-fk").selectedIndex = 0;
    document.getElementById("input-table").selectedIndex = 0;
    document.getElementById("column-table").selectedIndex = 0;
    default_div.style.display = "block";
    table_div.style.display = "none";
    columns_div.style.display = "none";
    selectElement3.style.display = "block";
    fk_div.style.display = "block";
  };

  createButton.onclick = () => {
    const rows = document.querySelectorAll(
      ".main_body .table_component tbody tr"
    );
    const tableNameInput = document.getElementById("table-name");
    const tableName = tableNameInput.value;

    if (rows.length < 2) {
      alert("Please create at least 2 columns for the table");
      return;
    }

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
        pk: cells[2].innerText === "YES" ? "PRIMARY KEY" : "",
        fk: cells[4].innerText,
        default: defaultValue,
      };
    });

    fetch(`${window.BASE_URL}/api/tables/create`, {
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
        window.location.href = `${window.BASE_URL}/home`;
      })
      .catch((error) => {
        console.error("Error creating table:", error);
      });
  };

  queryButton.onclick = async () => {
    const rows = document.querySelectorAll(
      ".main_body .table_component tbody tr"
    );
    const tableNameInput = document.getElementById("table-name");
    const tableName = tableNameInput.value;
    if (rows.length < 2) {
      alert("Please create at least 2 columns for the table");
      return;
    }

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
        pk: cells[2].innerText === "YES" ? "PRIMARY KEY" : "",
        fk: cells[4].innerText,
        default: defaultValue,
      };
    });

    try {
      await fetch(`${window.BASE_URL}/api/tables/generate/create`${window.BASE_URL}, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tableName, data }),
      })
        .then((response) => response.json())
        .then((data) => {
          // Handle response if needed
          //window.location.href = `/`;
          // console.log(data);
          const textarea = document.createElement("textarea");
          textarea.setAttribute("readonly", true);
          textarea.style.marginTop = "2vh";
          textarea.style.width = "100%";
          textarea.style.padding = "1vh";
          textarea.setAttribute("id", "queryTextarea");
          textarea.setAttribute("rows", "3");
          textarea.textContent = data;
          const divarea = document.getElementById("textare_container");
          divarea.appendChild(textarea);
        });
    } catch (error) {
      console.error(error);
      alert(
        "ERROR : Check the columns with no default value if they are filled \nCheck Your console for more info"
      );
    }
  };
}

// Call createForm when the page loads
document.addEventListener("DOMContentLoaded", createForm);
