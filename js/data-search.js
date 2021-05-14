

function searchNameAndID(searchParameter) {
  let information = document.getElementById('information');
  let foundRiksintresse = null;
  try {
    NATIONAL_INTERESTS.forEach(informationDataElement => {
      if (foundRiksintresse == null) {
        switch (String(searchParameter).toLowerCase()) {
          case String(informationDataElement.id).toLowerCase():
            information.style.display = "block";
            foundRiksintresse = informationDataElement;
            showSearchedInput(informationDataElement);
          case String(informationDataElement.namn).toLowerCase():
            information.style.display = "block";
            foundRiksintresse = tinformationDataElementrue;
            showSearchedInput(informationDataElement);
        }
      }
    });
    if (foundRiksintresse == false) {
      information.style.display = "none";
    }
  }
  catch (error) {
    information.style.display = "none";
  }
  return foundRiksintresse;
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
  let information = document.getElementById('information');
  information.innerHTML = `<h2 id="name">${element.namn}</h2>
  <p id="id"><b>${element.id}</b></p>
  <p id="description">${element.motivering, element.uttryck}</p>`;
}





//https://rosettacode.org/wiki/Ray-casting_algorithm
function contains(bounds, lat, lng) {
  //https://rosettacode.org/wiki/Ray-casting_algorithm
  var count = 0;
  for (var b = 0; b < bounds.length; b++) {
    var vertex1 = bounds[b];
    var vertex2 = bounds[(b + 1) % bounds.length];
    if (west(vertex1, vertex2, lng, lat))
      ++count;
  }
  return count % 2;

  /**
   * @return {boolean} true if (x,y) is west of the line segment connecting A and B
   */
  function west(A, B, x, y) {
    if (A.y <= B.y) {
      if (y <= A.y || y > B.y ||
        x >= A.x && x >= B.x) {
        return false;
      } else if (x < A.x && x < B.x) {
        return true;
      } else {
        return (y - A.y) / (x - A.x) > (B.y - A.y) / (B.x - A.x);
      }
    } else {
      return west(B, A, x, y);
    }
  }
}

var square = { name: 'square', bounds: [{ x: 32.05898221582174, y: -28.31004731142091 }, { x: 32.05898221582174, y: -28.308044824292978 }, { x: 32.06134255975485, y: -28.308044824292978 }, { x: 32.06134255975485, y: -28.31004731142091 }] };

var shapes = [square];
var testPoints = [{ lng: 32.059904895722866, lat: -28.30970726909422 }, { lng: 32.059904895722866, lat: -28.308743809931784 }, { lng: 32.06089194864035, lat: -28.308743809931784 },
{ lng: 32.06089194864035, lat: -28.30970726909422 }];

function isInsideCounty(layerPoints, county) {
  for (var s = 0; s < shapes.length; s++) {
    var shape = shapes[s];
    for (var tp = 0; tp < testPoints.length; tp++) {
      var testPoint = testPoints[tp];
      console.log(JSON.stringify(testPoint) + '\tin ' + shape.name + '\t' + contains(shape.bounds, testPoint.lat, testPoint.lng));
    }
  }
}