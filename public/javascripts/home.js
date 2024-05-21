let tablename;

async function fetchData() {
  try {
    const response = await fetch("/api/tables");
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

      const h1 = document.createElement("h1");
      h1.textContent = table.name;

      tableDiv.appendChild(h1);

      sidebar.appendChild(tableDiv);
    }
  });

  const tableDiv = document.createElement("div");
  tableDiv.classList.add("sidebar_table_div_end");
  sidebar.appendChild(tableDiv);

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

  const insertButton = document.createElement("button");
  insertButton.textContent = "Insert";
  insertButton.classList.add("insert_btn");
  insertButton.onclick = () => {
    window.location.href = `/insert/${tablename}`;
  };
  headerDiv.appendChild(insertButton);

  const deleteButton = document.createElement("button");
  deleteButton.textContent = "Delete table";
  deleteButton.classList.add("delete_btn");
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
        console.error("Error deleting table:", error);
      });
  };
  headerDiv.appendChild(deleteButton);
  mainBodyDiv.appendChild(headerDiv);

  const tableTitle = document.createElement("h1");
  tableTitle.classList.add("form-label", "fs-4", "text");
  tableTitle.textContent = tablename;
  mainBodyDiv.appendChild(tableTitle);

  const tableContainer = document.createElement("div");
  tableContainer.classList.add("table_container");

  if (data.length > 0) {
    const tableComponentDiv = document.createElement("div");
    tableComponentDiv.classList.add("table_component");
    tableComponentDiv.setAttribute("role", "region");
    tableComponentDiv.setAttribute("tabindex", "0");

    const table = document.createElement("table");
    table.classList.add("table", "table-striped", "table-hover");

    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    Object.keys(data[0]).forEach((key) => {
      const th = document.createElement("th");
      th.scope = "col";
      th.textContent = key;
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    data.forEach((row) => {
      const tr = document.createElement("tr");

      Object.values(row).forEach((value, index) => {
        const td = document.createElement("td");
        if (index === 0) {
          const th = document.createElement("th");
          th.scope = "row";
          th.textContent = value;
          tr.appendChild(th);
          tr.setAttribute("id", value);
        } else {
          td.textContent = value;
          tr.appendChild(td);
        }
      });
      tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    tableComponentDiv.appendChild(table);
    tableContainer.appendChild(tableComponentDiv);

    const fixedTableDiv = document.createElement("div");
    fixedTableDiv.classList.add("fixed-table");

    const fixedTable = document.createElement("table");
    fixedTable.classList.add("table", "table-striped", "table-hover");

    const fixedThead = document.createElement("thead");
    const fixedHeaderRow = document.createElement("tr");
    const editTh = document.createElement("th");
    editTh.scope = "col";
    editTh.textContent = "Edit";
    fixedHeaderRow.appendChild(editTh);
    const deleteTh = document.createElement("th");
    deleteTh.scope = "col";
    deleteTh.textContent = "Delete";
    fixedHeaderRow.appendChild(deleteTh);
    fixedThead.appendChild(fixedHeaderRow);
    fixedTable.appendChild(fixedThead);

    const fixedTbody = document.createElement("tbody");
    data.forEach((row) => {
      const fixedTr = document.createElement("tr");
      const editTd = document.createElement("td");
      const editIcon = document.createElement("img");
      editIcon.src = "./icons/edit.svg";
      editIcon.classList.add("action-icon");
      editIcon.style.height = "2vh";
      editIcon.onclick = () => {
        window.location.href = `/edit/${tablename}/${row.id}`;
      };
      editTd.appendChild(editIcon);
      fixedTr.appendChild(editTd);

      const deleteTd = document.createElement("td");
      const deleteIcon = document.createElement("img");
      deleteIcon.src = "./icons/delete.svg";
      deleteIcon.classList.add("action-icon");
      deleteIcon.style.height = "2vh";
      deleteIcon.onclick = () => {
        fetch("/api/tables/delete", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tablename,
            id: row.id,
          }),
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error("Network response was not ok");
            }
            const tr = document.getElementById(row.id);
            tr.remove();
            fixedTr.remove();
          })
          .catch((error) => {
            console.error("Error deleting data:", error);
          });
      };
      deleteTd.appendChild(deleteIcon);
      fixedTr.appendChild(deleteTd);
      fixedTbody.appendChild(fixedTr);
    });

    fixedTable.appendChild(fixedTbody);
    fixedTableDiv.appendChild(fixedTable);
    tableContainer.appendChild(fixedTableDiv);

    mainBodyDiv.appendChild(tableContainer);
  } else {
    const h1 = document.createElement("h1");
    h1.style.color = "black";
    h1.style.textAlign = "center";
    h1.textContent = "No data available for this table.";
    mainBodyDiv.appendChild(h1);
  }
}

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
});
