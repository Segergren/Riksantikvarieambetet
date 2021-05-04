

function searchInput() {
  let input = document.getElementById('myInput');
  let selectedInformation = input.value.toUpperCase();
  let information = document.getElementById('information');
  information.style.display = "none";
  try {
    NATIONAL_INTERESTS.forEach(element => {
      if (String(selectedInformation) == String(element.id)) {
        selectedInformation = element;
        information.style.display = "block";
      }
    });
      showSearchedInput(selectedInformation);
  } catch (error) {
    console.log('ERROR: Search error');
  }
}

function showSearchedInput(element) {
  let information = document.getElementById('information');
  information.innerHTML = `<h2 id="name">${element.namn}</h2>
  <p id="id"><b>${element.id}</b></p>
  <p id="description">${element.motivering, element.uttryck}</p>`;
}
