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
  bodyTitle.classList.add("body_title");
  bodyTitle.textContent = "Insert new row :";
  headerDiv.appendChild(bodyTitle);

  mainBodyDiv.appendChild(headerDiv);

  fields.forEach((field) => {
    if (field.field !== "id") {
      const label = document.createElement("label");
      label.classList.add("input_label");
      label.textContent = field.field;
      mainBodyDiv.appendChild(label);

      const br = document.createElement("br");
      mainBodyDiv.appendChild(br);

      const input = document.createElement("input");
      input.classList.add("input_form");
      input.type = getInputType(field.type);
      input.placeholder = field.field;
      mainBodyDiv.appendChild(input);

      const br2 = document.createElement("br");
      mainBodyDiv.appendChild(br2);
    }
  });

  const insertButton = document.createElement("button");
  insertButton.textContent = "Insert";
  insertButton.classList.add("insert_btn");
  insertButton.addEventListener("click", () => {
    const inputs = document.querySelectorAll(".input_form");
    const dataArray = Array.from(inputs).map((input) => {
      const value = input.value;
      return {
        field: input.placeholder,
        value: value,
        type: input.type,
      };
    });
    // Send POST request to API
    fetch("/api/tables/insert", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tablename, dataArray }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        // Handle response if needed
        window.location.href = `/`;
      })
      .catch((error) => {
        console.error("Error inserting data:", error);
      });
  });

  mainBodyDiv.appendChild(insertButton);
}
