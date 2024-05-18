let tablename;
async function fetchData() {
  try {
    const response = await fetch("/api/tables"); // Update with your actual endpoint
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    populateSidebar(data.data);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

function populateSidebar(tables) {
  const sidebar = document.querySelector(".sidebar");

  tables.forEach((table) => {
    if (table.name !== "sqlite_sequence") {
      const tableDiv = document.createElement("div");
      tableDiv.classList.add("sidebar_table_div");

      const img = document.createElement("img");
      img.src = "./icons/table.svg";

      const h1 = document.createElement("h1");
      h1.textContent = table.name;

      tableDiv.appendChild(img);
      tableDiv.appendChild(h1);

      sidebar.appendChild(tableDiv);
    }
  });

  // Add event listener for table selection
  const tableDivs = document.querySelectorAll(".sidebar_table_div");
  tableDivs.forEach((div) => {
    div.addEventListener("click", function () {
      tablename = this.querySelector("h1").textContent;
      fetchTableData(tablename);
    });
  });
}

async function fetchTableData(tableName) {
  try {
    const response = await fetch(`/api/tables/${tableName}`);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    if (data.bool) {
      displayTableData(data.data);
    } else {
      console.error("Error fetching table data:", data.error);
    }
  } catch (error) {
    console.error("Error fetching table data:", error);
  }
}

function displayTableData(data) {
  const mainBodyDiv = document.querySelector(".main_body");
  mainBodyDiv.innerHTML = ""; // Clear previous data

  const headerDiv = document.createElement("div");
  headerDiv.classList.add("main_body_header");

  if (data.length > 0) {
    const insertButton = document.createElement("button");
    insertButton.textContent = "Insert";
    insertButton.classList.add("insert_btn");
    // Add event listener to button
    insertButton.onclick = () => {
      window.location.href = `/insert/${tablename}`;
    };
    headerDiv.appendChild(insertButton);

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete table";
    deleteButton.classList.add("delete_btn");
    // Add event listener to button
    deleteButton.onclick = () => {
      fetch("/api/tables/table/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tablename }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          location.reload();
        })
        .catch((error) => {
          console.error("Error inserting data:", error);
        });
    };
    headerDiv.appendChild(deleteButton);
    mainBodyDiv.appendChild(headerDiv);
    const tableComponentDiv = document.createElement("div");
    tableComponentDiv.classList.add("table_component");
    tableComponentDiv.setAttribute("role", "region");
    tableComponentDiv.setAttribute("tabindex", "0");

    const table = document.createElement("table");

    const caption = document.createElement("caption");
    caption.textContent = tablename;
    table.appendChild(caption);

    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    Object.keys(data[0]).forEach((key) => {
      const th = document.createElement("th");
      th.textContent = key;
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    data.forEach((row) => {
      const tr = document.createElement("tr");
      Object.values(row).forEach((value) => {
        const td = document.createElement("td");
        td.textContent = value;
        tr.appendChild(td);
      });

      const editCell = document.createElement("td");
      const editIcon = document.createElement("img");
      editIcon.src = "./icons/edit.svg";
      editCell.appendChild(editIcon);
      editCell.onclick = () => {
        window.location.href = `/edit/${tablename}/${row.id}`;
      };
      tr.appendChild(editCell);

      const deleteCell = document.createElement("td");
      const deleteIcon = document.createElement("img");
      deleteIcon.src = "./icons/delete.svg";
      deleteCell.appendChild(deleteIcon);
      deleteCell.onclick = () => {
        fetch("/api/tables/delete", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ tablename, id: row.id }),
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error("Network response was not ok");
            }
            location.reload();
          })
          .catch((error) => {
            console.error("Error inserting data:", error);
          });
      };
      tr.appendChild(deleteCell);

      tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    tableComponentDiv.appendChild(table);
    mainBodyDiv.appendChild(tableComponentDiv);
  } else {
    const insertButton = document.createElement("button");
    insertButton.textContent = "Insert";
    insertButton.classList.add("insert_btn");
    // Add event listener to button
    insertButton.onclick = () => {
      window.location.href = `/insert/${tablename}`;
    };
    headerDiv.appendChild(insertButton);

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete table";
    deleteButton.classList.add("delete_btn");
    // Add event listener to button
    deleteButton.onclick = () => {
      fetch("/api/tables/table/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tablename }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          location.reload();
        })
        .catch((error) => {
          console.error("Error inserting data:", error);
        });
    };
    headerDiv.appendChild(deleteButton);
    mainBodyDiv.appendChild(headerDiv);
    const h1 = document.createElement("h1");
    h1.classList.add("text-white", "text-center", "text-[2vh]");
    h1.textContent = "No data available for this table.";
    mainBodyDiv.appendChild(h1);
  }
}

// Call fetchTables when the page loads
document.addEventListener("DOMContentLoaded", fetchData);

document.getElementById("add-input").addEventListener("click", function () {
  const container = document.getElementById("input-container");
  const inputDiv = document.createElement("div");
  inputDiv.classList.add("input-container");

  const inputType = document.getElementById("input-type").value;
  const input = document.createElement("input");
  input.type = inputType;
  input.placeholder = "Type here";
  input.classList.add("input", "input-bordered", "w-full", "m-2");

  inputDiv.appendChild(input);
  container.appendChild(inputDiv);
});

document.getElementById("get-values").addEventListener("click", function () {
  const inputs = document.querySelectorAll(".input-container input");
  const values = [];
  inputs.forEach((input) => {
    values.push({ type: input.type, value: input.value });
  });
  console.log(values);
});
