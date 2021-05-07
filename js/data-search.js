

function searchNameAndID(searchParameter) {
  let information = document.getElementById('information');
  let foundRiksintresse = false;
  try {
    console.log("Searching: " + searchParameter);
    NATIONAL_INTERESTS.forEach(element => {
      if (foundRiksintresse == false) {
        switch (String(searchParameter).toLowerCase()) {
          case String(element.id).toLowerCase():
            information.style.display = "block";
            foundRiksintresse = true;
            showSearchedInput(element);
            break;
          case String(element.namn).toLowerCase():
            information.style.display = "block";
            foundRiksintresse = true;
            showSearchedInput(element);
            break;
        }
      }
    });
    if(foundRiksintresse == false){
      information.style.display = "none";
    }
  } 

  catch (error) {
    information.style.display = "none";
    console.log('ERROR: Search error');
  }
}

/*function searchInput() {
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
}*/

function showSearchedInput(element) {
  console.log("SEARCHED");
  let information = document.getElementById('information');
  information.innerHTML = `<h2 id="name">${element.namn}</h2>
  <p id="id"><b>${element.id}</b></p>
  <p id="description">${element.motivering, element.uttryck}</p>`;
}
