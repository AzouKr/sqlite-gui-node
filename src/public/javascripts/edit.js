let tablename;
let userId;

document.addEventListener("DOMContentLoaded", async () => {
  const pathParts = window.location.pathname.split("/");
  tablename = pathParts[2];
  userId = pathParts[3];
  const response = await fetch(`/api/tables/getrecord/${tablename}/${userId}`); // Correct endpoint
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  const data = await response.json();
  if (data.bool) {
    await fetchTableInfos(tablename, data.data[0]);
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
    case "REAL":
      return "number";
    case "TEXT":
    default:
      return "text";
  }
}

function displayTableData(fields, dataObject) {
  const mainBodyDiv = document.querySelector(".main_body");
  mainBodyDiv.innerHTML = ""; // Clear previous data

  const headerDiv = document.createElement("div");
  headerDiv.classList.add("main_body_header");

  const bodyTitle = document.createElement("h1");
  bodyTitle.classList.add("form-label");
  bodyTitle.textContent = "Edit the row :";
  headerDiv.appendChild(bodyTitle);

  mainBodyDiv.appendChild(headerDiv);

  fields.forEach((field) => {
    const label = document.createElement("label");
    label.classList.add("form-label");
    label.textContent = field.field;
    mainBodyDiv.appendChild(label);

    const br = document.createElement("br");
    mainBodyDiv.appendChild(br);

    const input = document.createElement("input");
    input.type = getInputType(field.type);
    input.classList.add("form-control");
    input.id = `input-${field.field}`; // Set a unique ID for each input
    input.dataset.field = field.field; // Store the field name
    input.dataset.type = field.type; // Store the field type

    // Set placeholder and value with the corresponding value from dataObject
    if (dataObject && dataObject.hasOwnProperty(field.field)) {
      input.placeholder = dataObject[field.field];
      input.value = dataObject[field.field];
    }

    mainBodyDiv.appendChild(input);

    const br2 = document.createElement("br");
    mainBodyDiv.appendChild(br2);
  });

  // Create button for editing
  const editButton = document.createElement("button");
  editButton.textContent = "Edit row";
  editButton.classList.add("insert_btn"); // Apply the class for styling
  editButton.addEventListener("click", () => {
    const inputs = document.querySelectorAll(".form-control");
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
        console.error("Error updating data:", error);
      });
  });

  mainBodyDiv.appendChild(editButton);
}
