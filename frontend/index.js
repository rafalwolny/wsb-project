document.addEventListener("DOMContentLoaded", () => {
  fetch("http://localhost:3000/search_all")
    .then(response => response.json())
    .then(data => console.log(data.rows))
});

const searchButton = document.querySelector(".search-btn");

searchButton.onclick = () => {
  const searchValue = document.querySelector('.search-text').value;
  // fetch("http://localhost:3000/search_book", searchValue)
  //   .then(response => response.json())
  //   .then(data => console.log(data.rows))
    
}