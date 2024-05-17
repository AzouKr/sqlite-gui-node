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
    const option = document.createElement("option");
    option.value = table.name;
    option.textContent = table.name;
    select.appendChild(option);
  });

  // Add event listener for table selection
  select.addEventListener("change", function () {
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
    const table = document.createElement("table");
    table.classList.add("w-full", "border", "border-gray-600", "text-white");

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
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    tableDataDiv.appendChild(table);
  } else {
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
