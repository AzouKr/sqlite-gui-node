async function fetchData() {
  try {
    const response = await fetch("/api/tables/local/query");
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    return data.data;
    // populateSidebar(data.data);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

async function createForm() {
  const queries = await fetchData();
  const selectElement = document.getElementById("querySelect");

  // Iterate over the array and create <option> elements
  queries.forEach((query) => {
    const option = document.createElement("option");
    option.value = query.sqlstatement;
    option.textContent = query.name;
    selectElement.appendChild(option);
  });
  selectElement.addEventListener("change", (event) => {
    console.log(event.target.value);
    const selectedValue = event.target.value;
    const textarea = document.getElementById("queryTextarea");
    textarea.textContent = selectedValue;
    document.getElementById("querySelect").selectedIndex = 0;
  });

  const button = document.getElementById("runButton");
  const savebutton = document.getElementById("saveQuery");
  savebutton.onclick = async () => {
    const name = document.getElementById("query_name").value;
    if (!name) {
      alert("Please give your query a name before saving it");
      return;
    }
    const sqlStatement = document.getElementById("queryTextarea").value;
    if (!sqlStatement) {
      alert("Please write your query before hitting saving it");
      return;
    }
    try {
      const response = await fetch("/api/tables/local/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, sqlStatement }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      console.log(response);
    } catch (error) {
      console.error(error);
    }
  };
  button.onclick = () => {
    const query = document.getElementById("queryTextarea").value;
    if (!query) {
      alert("Please enter the write your query before hitting run");
      return;
    }
    const table = document.getElementById("resultTable");
    const tableHead = table.querySelector("thead");
    const tableBody = document.querySelector("#resultTable tbody");
    const resultParagraph = document.getElementById("resultParagraph");

    // Clear previous results
    tableHead.innerHTML = "";
    tableBody.innerHTML = "";
    resultParagraph.textContent = "";

    fetch("/api/tables/query", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sqlQuery: query }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.type === "string") {
          resultParagraph.textContent = data.data;
        } else {
          if (data.data.length > 0) {
            // Generate table headers
            const headers = Object.keys(data.data[0]);
            const headerRow = document.createElement("tr");
            headers.forEach((header) => {
              const th = document.createElement("th");
              th.scope = "col";
              th.textContent = header;
              headerRow.appendChild(th);
            });
            tableHead.appendChild(headerRow);

            // Populate table rows
            data.data.forEach((row, index) => {
              const tr = document.createElement("tr");

              headers.forEach((header) => {
                const td = document.createElement("td");
                td.textContent = row[header];
                tr.appendChild(td);
              });
              console.log(tr);

              tableBody.appendChild(tr);
            });
          }
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert(
          "ERROR : SQL Query is incorrect \nCheck Your console for more info"
        );
      });
  };
}

// Call createForm when the page loads
document.addEventListener("DOMContentLoaded", createForm);
