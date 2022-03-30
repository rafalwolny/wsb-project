const loadTable = (result) => {
  const table = document.querySelector(".table-body");
  const notFoundResponse = `<tr><td class="table-mnzm">Book not found</td></tr>`;
  if (result.length == 0) {
    table.innerHTML = notFoundResponse;
    return;
  }

  let html = "";
  const tableLength = result.length >= 10 ? 10 : result.length;

  for(i = 0; i < tableLength; i++) {
    html += `<tr>`;
    html += `<td class="table-mnzm">${result[i].book_title}</td>`;
    html += `<td class="table-mnzm">${result[i].book_author}</td>`;
    html += `<td class="table-mnzm">${result[i].book_year}</td>`;
    html += `<td class="table-mnzm"><button id="button-delete" class="button" type="button">Delete</button></td>`;
    html += `</tr>`;
  }

  table.innerHTML = html;
}

const searchAll = () => {
  fetch("http://localhost:3000/search_all")
    .then(response => response.json())
    .then(data => loadTable(data.result))
}

document.addEventListener("DOMContentLoaded", searchAll());

const searchButton = document.querySelector("#button-search");

searchButton.onclick = () => {
  const searchValue = document.querySelector(".search-text").value;
  if (searchValue) {
    fetch("http://localhost:3000/search_book/" + searchValue)
      .then(response => response.json())
      .then(data => loadTable(data.result))
  } else searchAll();
}
