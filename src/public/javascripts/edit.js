let tablename;
let userId;
document.addEventListener("DOMContentLoaded", async () => {
  const tableName = window.location.pathname.split("/")[2];
  tablename = tableName;
  const id = window.location.pathname.split("/")[3];
  userId = id;
  const response = await fetch(`/api/tables/getrecord/${tableName}/${id}`); // Correct endpoint
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  const data = await response.json();
  if (data.bool) {
    await fetchTableInfos(tableName, data.data[0]);
  } else {
    console.error("Error fetching table data:", data.error);
  }
});

async function fetchTableInfos(tableName, dataObject) {
  try {
    const response = await fetch(`/api/tables/infos/${tableName}`); // Correct endpoint
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    if (data.bool) {
      displayTableData(data.data, dataObject);
    } else {
      console.error("Error fetching table data:", data.error);
    }
  } catch (error) {
    console.error("Error fetching table data:", error);
  }
}

function getInputType(fieldType) {
  switch (fieldType.toUpperCase()) {
    case "INTEGER":
      return "number";
    case "TEXT":
      return "text";
    case "REAL":
      return "number"; // You might want to handle decimal types more precisely
    case "BLOB":
      return "file";
    default:
      return "text";
  }
}

function displayTableData(fields, dataObject) {
  const tableDataDiv = document.getElementById("table-data");
  tableDataDiv.innerHTML = ""; // Clear previous data

  if (fields.length > 0) {
    fields.forEach((field) => {
      if (field.field !== "id") {
        const label = document.createElement("label");
        label.classList.add("text-white", "text-[3vh]");
        label.textContent = field.field;
        tableDataDiv.appendChild(label);

        const br = document.createElement("br");
        tableDataDiv.appendChild(br);

        const input = document.createElement("input");
        input.type = getInputType(field.type);
        input.classList.add("w-full", "h-[5vh]", "rounded-sm", "p-2");
        input.id = `input-${field.field}`; // Set a unique ID for each input
        input.dataset.field = field.field; // Store the field name
        input.dataset.type = field.type; // Store the field type

        // Set placeholder and value with the corresponding value from dataObject
        if (dataObject && dataObject.hasOwnProperty(field.field)) {
          input.placeholder = dataObject[field.field];
          input.value = dataObject[field.field];
        }

        tableDataDiv.appendChild(input);

        const br2 = document.createElement("br");
        tableDataDiv.appendChild(br2);
      }
    });

    // Create button for insertion
    const button = document.createElement("button");
    button.textContent = "Edit";
    button.classList.add(
      "text-white",
      "text-[2vh]",
      "w-[10vh]",
      "h-[5vh]",
      "rounded-md",
      "bg-blue-600",
      "m-4"
    );
    button.addEventListener("click", () => {
      const inputs = document.querySelectorAll("input[id^='input-']");
      const dataArray = Array.from(inputs).map((input) => {
        let value = input.value;
        const type = input.dataset.type;

        // Use the value from dataObject if the input is not changed
        if (!value) {
          value = dataObject[input.dataset.field];
        }

        let formattedValue;
        if (type.toUpperCase() === "INTEGER" || type.toUpperCase() === "REAL") {
          formattedValue = parseFloat(value);
        } else {
          formattedValue = value;
        }

        return {
          field: input.dataset.field,
          value: formattedValue,
          type: type,
        };
      });

      // Send POST request to API
      fetch("/api/tables/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tablename, dataArray, userId }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          window.location.href = `/`;
        })
        .catch((error) => {
          console.error("Error inserting data:", error);
        });
    });
    tableDataDiv.appendChild(button);
  } else {
    const h1 = document.createElement("h1");
    h1.classList.add("text-white", "text-center", "text-[2vh]");
    h1.innerHTML = "No data available for this table.";
    tableDataDiv.appendChild(h1);
  }
}

function getInputType(fieldType) {
  switch (fieldType.toUpperCase()) {
    case "INTEGER":
    case "REAL":
      return "number";
    case "TEXT":
    default:
      return "text";
  }
}
