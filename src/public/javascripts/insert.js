let tablename;

document.addEventListener("DOMContentLoaded", async () => {
  const tableName = window.location.pathname.split("/").pop();
  tablename = tableName;
  await fetchTableInfos(tableName);
});

async function fetchTableInfos(tableName) {
  try {
    const response = await fetch(`/api/tables/infos/${tableName}`); // Correct endpoint
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

function displayTableData(fields) {
  const mainBodyDiv = document.querySelector(".main_body");
  mainBodyDiv.innerHTML = ""; // Clear previous data

  const headerDiv = document.createElement("div");
  headerDiv.classList.add("main_body_header");

  const bodyTitle = document.createElement("h1");
  bodyTitle.classList.add("form-label");
  bodyTitle.textContent = "Insert new row :";
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
    input.classList.add("form-control");
    input.dataset.fieldType = field.type; // Store field type in dataset
    input.placeholder = field.field;
    mainBodyDiv.appendChild(input);

    const br2 = document.createElement("br");
    mainBodyDiv.appendChild(br2);
  });

  const insertButton = document.createElement("button");
  insertButton.textContent = "Insert";
  insertButton.classList.add("insert_btn");
  insertButton.addEventListener("click", async () => {
    const inputs = document.querySelectorAll(".form-control");
    const dataArray = Array.from(inputs).map((input) => {
      const value = input.value;
      const type = input.dataset.fieldType; // Retrieve field type from dataset
      return {
        field: input.placeholder,
        value: value,
        type: type, // Use field type instead of input type
      };
    });

    try {
      const response = await fetch("/api/tables/insert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tablename, dataArray }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      // Handle response if needed
      window.location.href = `/`;
    } catch (error) {
      console.error(error);
      alert(
        "ERROR : Check the columns with no default value if they are filled \nCheck Your console for more info"
      );
    }
  });

  mainBodyDiv.appendChild(insertButton);
}
