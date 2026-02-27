let tablename;
let userId;
let id_label;

document.addEventListener("DOMContentLoaded", async () => {
  const pathParts = window.location.pathname.split("/");
  tablename = pathParts[2];
  id_label = pathParts[3];
  userId = pathParts[4];
  const response = await fetch(
    `/api/tables/getrecord/${tablename}/${id_label}/${userId}`,
  ); // Correct endpoint
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

  const boxContainer = document.createElement("div");
  boxContainer.classList.add("create_box_container_two");
  mainBodyDiv.appendChild(boxContainer);

  fields.forEach((field) => {
    const createBox = document.createElement("div");
    createBox.classList.add("create_box_two");
    const label = document.createElement("label");
    label.classList.add("form-label");
    label.textContent = field.field;
    label.setAttribute("for", `input-${field.field}`);
    createBox.appendChild(label);

    if (field.fk === undefined) {
      const input = document.createElement("input");
      input.classList.add("form-control");
      input.classList.add("input_box_multi");
      input.setAttribute("id", field.field);
      input.dataset.fieldType = field.type; // Store field type in dataset
      input.dataset.field = field.field;
      input.type = getInputType(field.type);
      input.placeholder = field.field;
      // Set placeholder and value with the corresponding value from dataObject
      if (dataObject && dataObject.hasOwnProperty(field.field)) {
        input.value = dataObject[field.field];
      }
      createBox.appendChild(input);
    } else {
      // Create the select element
      const select = document.createElement("select");
      select.className = "form-select";
      select.classList.add("input_box_multi");
      select.dataset.fieldType = field.type; // Store field type in dataset
      select.dataset.field = field.field;
      select.setAttribute("id", field.field);
      select.placeholder = field.field;
      select.setAttribute("aria-label", "Default select example");
      // // Create and append the default option
      const defaultOption = document.createElement("option");
      defaultOption.selected = true;
      defaultOption.textContent = "Open this select menu";
      select.appendChild(defaultOption);
      // // Create and append the other options
      field.fk.forEach((num) => {
        const option = document.createElement("option");
        option.value = num;
        option.textContent = num; // or use any other text you need, like converting numbers to words
        select.appendChild(option);
      });
      if (dataObject && dataObject.hasOwnProperty(field.field)) {
        select.value = dataObject[field.field];
      }
      createBox.appendChild(select);
    }

    const br2 = document.createElement("br");
    createBox.appendChild(br2);
    boxContainer.appendChild(createBox);
  });

  // Create button for editing
  const editButton = document.createElement("button");
  editButton.textContent = "Edit row";
  editButton.classList.add("insert_btn"); // Apply the class for styling
  editButton.addEventListener("click", () => {
    const inputs = document.querySelectorAll(".input_box_multi");
    const dataArray = Array.from(inputs).map((input) => {
      let value = input.value;
      const type = input.dataset.fieldType;

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
      body: JSON.stringify({ tablename, dataArray, userId, id_label }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        window.location.href = `/home`;
      })
      .catch((error) => {
        console.error("Error updating data:", error);
      });
  });

  mainBodyDiv.appendChild(editButton);

  const getQueryButton = document.createElement("button");
  getQueryButton.textContent = "Get query";
  getQueryButton.classList.add("insert_btn");
  getQueryButton.addEventListener("click", async () => {
    const inputs = document.querySelectorAll(".input_box_multi");
    let id_name;
    let count = 0;
    const dataArray = Array.from(inputs).map((input) => {
      if (count === 0) {
        id_name = input.placeholder;
        count++;
      }
      const value = input.value;
      const type = input.dataset.fieldType; // Retrieve field type from dataset
      return {
        field: input.placeholder,
        value: value,
        type: type, // Use field type instead of input type
      };
    });

    try {
      const response = await fetch("/api/tables/generate/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tablename, dataArray, userId, id_label }),
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
        "ERROR : Check the columns with no default value if they are filled \nCheck Your console for more info",
      );
    }
  });

  mainBodyDiv.appendChild(getQueryButton);
  const textareaContainer = document.createElement("div");
  textareaContainer.style.width = "100%";
  textareaContainer.setAttribute("id", "textare_container");
  mainBodyDiv.appendChild(textareaContainer);
}
