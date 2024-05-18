let tablename;
async function fetchData() {
  try {
    const response = await fetch("/api/tables"); // Update with your actual endpoint
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    populateSelect(data.data);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

function populateSelect(tables) {
  const select = document.getElementById("tables");
  tables.forEach((table) => {
    if (table.name !== "sqlite_sequence") {
      const option = document.createElement("option");
      option.value = table.name;
      option.textContent = table.name;
      select.appendChild(option);
    }
  });

  // Add event listener for table selection
  select.addEventListener("change", function () {
    tablename = this.value;
    fetchTableData(this.value);
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
  const tableDataDiv = document.getElementById("table-data");
  tableDataDiv.innerHTML = ""; // Clear previous data

  if (data.length > 0) {
    // Create button for insertion
    const button = document.createElement("button");
    button.textContent = "Insert";
    button.classList.add(
      "text-white",
      "text-[2vh]",
      "w-[10vh]",
      "h-[5vh]",
      "rounded-md",
      "bg-blue-600",
      "m-4"
    );
    // Add event listener to button
    button.onclick = () => {
      window.location.href = `/insert/${tablename}`;
    };
    tableDataDiv.appendChild(button);
    // Create button for delete
    const deletebutton = document.createElement("button");
    deletebutton.textContent = "Delete Table";
    deletebutton.classList.add(
      "text-white",
      "text-[2vh]",
      "w-[20vh]",
      "h-[5vh]",
      "rounded-md",
      "bg-red-500",
      "m-4"
    );
    // Add event listener to button
    deletebutton.onclick = () => {
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
    tableDataDiv.appendChild(deletebutton);
    const div = document.createElement("div");
    div.classList.add("w-full", "overflow-auto");
    const table = document.createElement("table");
    table.classList.add(
      "w-[130vw]",
      "border",
      "border-gray-600",
      "text-white",
      "bg-black"
    );
    // Create table headers
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    Object.keys(data[0]).forEach((key) => {
      const th = document.createElement("th");
      th.textContent = key;
      th.classList.add("border", "border-gray-600", "text-left", "p-2");
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Create table body
    const tbody = document.createElement("tbody");
    data.forEach((row) => {
      const tr = document.createElement("tr");
      Object.values(row).forEach((value) => {
        const td = document.createElement("td");
        td.textContent = value;
        td.classList.add("border", "border-gray-600", "p-2");
        tr.appendChild(td);
      });
      const edit_td = document.createElement("td");
      edit_td.innerHTML = "Edit";
      edit_td.classList.add("border", "border-gray-600", "p-2");
      edit_td.onclick = () => {
        window.location.href = `/edit/${tablename}/${row.id}`;
      };
      tr.appendChild(edit_td);
      const delete_td = document.createElement("td");
      delete_td.innerHTML = "Delete";
      delete_td.classList.add("border", "border-gray-600", "p-2");
      delete_td.onclick = () => {
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
      tr.appendChild(delete_td);
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    div.appendChild(table);
    tableDataDiv.appendChild(div);
  } else {
    // Create button for insertion
    const button = document.createElement("button");
    button.textContent = "Insert";
    button.classList.add(
      "text-white",
      "text-[2vh]",
      "w-[10vh]",
      "h-[5vh]",
      "rounded-md",
      "bg-blue-600",
      "m-4"
    );
    // Add event listener to button
    button.onclick = () => {
      window.location.href = `/insert/${tablename}`;
    };
    tableDataDiv.appendChild(button);
    // Create button for delete
    const deletebutton = document.createElement("button");
    deletebutton.textContent = "Delete Table";
    deletebutton.classList.add(
      "text-white",
      "text-[2vh]",
      "w-[20vh]",
      "h-[5vh]",
      "rounded-md",
      "bg-red-500",
      "m-4"
    );
    // Add event listener to button
    deletebutton.onclick = () => {
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
    tableDataDiv.appendChild(deletebutton);
    const h1 = document.createElement("h1");
    h1.classList.add("text-white", "text-center", "text-[2vh]");
    h1.innerHTML = "No data available for this table.";
    tableDataDiv.appendChild(h1);
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
