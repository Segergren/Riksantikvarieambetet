function searchInput() {
  let input = document.getElementById('myInput');
  let selectedInformation = input.value;
  try {
    NATIONAL_INTERESTS.forEach(element => {
      if (String(selectedInformation) == String(element.id)) {
        selectedInformation = element;
      }
    });
    showSearchedInput(selectedInformation);
  } catch (error) {
    console.log('ERROR: Search error');
  }
}

function showSearchedInput(element) {
  
  console.log(element.namn);
  let information = document.getElementById('information');
  if(element != null) {
    information.innerHTML = `<h2 id="name">${element.namn}</h2>
    <p id="id"><b>${element.id}</b></p>
    <p id="description">${element.motivering, element.uttryck}</p>`
  } else {
    information.style.display = 'none';
  }

}
