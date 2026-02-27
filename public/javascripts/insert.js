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

  const boxContainer = document.createElement("div");
  boxContainer.classList.add("create_box_container_two");
  mainBodyDiv.appendChild(boxContainer);

  fields.forEach((field) => {
    const createBox = document.createElement("div");
    createBox.classList.add("create_box_two");

    const label = document.createElement("label");
    label.classList.add("form-label");
    label.textContent = field.field;
    label.setAttribute("for", field.field);
    createBox.appendChild(label);

    if (field.fk === undefined) {
      const input = document.createElement("input");
      input.classList.add("form-control");
      input.classList.add("input_box_multi");
      input.setAttribute("id", field.field);
      input.dataset.fieldType = field.type; // Store field type in dataset
      input.type = getInputType(field.type);
      input.placeholder = field.field;
      createBox.appendChild(input);
    } else {
      // Create the select element
      const select = document.createElement("select");
      select.className = "form-select";
      select.classList.add("input_box_multi");
      select.dataset.fieldType = field.type; // Store field type in dataset
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
      createBox.appendChild(select);
    }
    const br2 = document.createElement("br");
    createBox.appendChild(br2);
    boxContainer.appendChild(createBox);
  });

  const insertButton = document.createElement("button");
  insertButton.textContent = "Insert";
  insertButton.classList.add("insert_btn");
  insertButton.addEventListener("click", async () => {
    const inputs = document.querySelectorAll(".input_box_multi");
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
      window.location.href = `/home`;
    } catch (error) {
      console.error(error);
      alert(
        "ERROR : Check the columns with no default value if they are filled \nCheck Your console for more info",
      );
    }
  });

  mainBodyDiv.appendChild(insertButton);

  const getQueryButton = document.createElement("button");
  getQueryButton.textContent = "Get query";
  getQueryButton.classList.add("insert_btn");
  getQueryButton.addEventListener("click", async () => {
    const inputs = document.querySelectorAll(".input_box_multi");
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
      const response = await fetch("/api/tables/generate/insert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tablename, dataArray }),
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
