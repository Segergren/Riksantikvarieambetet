

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

function searchNationalInterests() {
  let nameAndIdSearch = document.getElementById('search');
  let countySearch = document.getElementById('county');
  let culturalEnvironmentTypeSearch = document.getElementsByClassName("items")[0];

  let foundByNameOrID = [];
  let foundByCounty = [];
  let foundByCultural = [];

  //Search by name or id
  if (nameAndIdSearch.value.length > 0) {
    map.eachLayer(function (layer) {
      if (layer.options.pane.className != undefined && (layer.options.pane.className.includes("leaflet-pane leaflet-nationalInterests-pane") && layer.hasOwnProperty("feature"))) {

        switch (String(nameAndIdSearch.value).toLowerCase()) {
          case String(layer.feature.properties.RI_id).toLowerCase():
            foundByNameOrID.push(layer);
            break;
          case String(layer.feature.properties.NAMN).toLowerCase():
            foundByNameOrID.push(layer);
            break;
        }
      }
    });
  }

  //Search by county
  if (countySearch.value.length > 0) {
    map.eachLayer(function (layer) {
      if (layer.options.pane.className != undefined && (layer.options.pane.className.includes("leaflet-pane leaflet-nationalInterests-pane") && layer.hasOwnProperty("feature"))) {
        if (String(layer.feature.properties.LANSKOD) == String(countySearch.value)) {
          foundByCounty.push(layer);
        }
      }
    });
  }

  //Search by cultural
  let filters = culturalEnvironmentTypeSearch.childNodes;
  let appliedFilters = [];

  //Get filters
  filters.forEach(filter => {
    if (filter.childNodes[0].checked) {
      appliedFilters.push(filter.childNodes[0].value);
    }
  });

  if (appliedFilters.length > 0) {
    map.eachLayer(function (layer) {
      if (layer.options.pane.className != undefined && (layer.options.pane.className.includes("leaflet-pane leaflet-nationalInterests-pane") && layer.hasOwnProperty("feature"))) {
        let informationElement = searchNameAndID(layer.feature.properties.RI_id);

        if (informationElement != null && informationElement.culturalEnvironmentTypes != false) {
          let layerHasFilter = false;
          appliedFilters.forEach(filter => {
            if (informationElement.culturalEnvironmentTypes.includes(filter)) {
              layerHasFilter = true;
            }
          });

          if (layerHasFilter) {
            foundByCultural.push(layer);
          }
        }
      }
    });
  }

  let filteredNationalInterests = [];

  //Check if national interest includes all filters
  filteredNationalInterests = filteredNationalInterests.concat(foundByNameOrID, foundByCounty, foundByCultural);

  //Ta bort dubletter
  filteredNationalInterests = filteredNationalInterests.reduce(function (a, b) { if (a.indexOf(b) < 0) a.push(b); return a; }, []);

  //Ta bort layer om det inte passar in i alla filter
  var i;
  for (i = filteredNationalInterests.length - 1; i >= 0; i -= 1) {

    //Om namn/id filter är på
    if (nameAndIdSearch.value.length > 0) {
      let found = foundByNameOrID.includes(filteredNationalInterests[i]);
      if (found == false) {
        filteredNationalInterests.splice(i, 1);
      }
    }

    //Om namn/id filter är på
    if (countySearch.value.length > 0) {
      let found = foundByCounty.includes(filteredNationalInterests[i]);
      if (found == false) {
        filteredNationalInterests.splice(i, 1);
      }
    }

    //Om kulturmiljö-filter är på
    if (appliedFilters.length > 0) {
      let found = foundByCultural.includes(filteredNationalInterests[i]);
      if (found == false) {
        filteredNationalInterests.splice(i, 1);
      }
    }
  };
  console.log(filteredNationalInterests);
  filterLayers.length = 0;
  filteredNationalInterests.forEach(layer => {
    filterLayers.push(layer.feature.properties.RI_id);
  });
  document.getElementById("showing").innerText = "Vi hittade " + filteredNationalInterests.length + " " + (filteredNationalInterests.length > 1 ? "riksintressen" : "riksintresse") + " som matchade din filtrering.";
  return filteredNationalInterests;
}


function showSearchedInput(element) {
  let information = document.getElementById('information');
  information.innerHTML = `<h2 id="name">${element.namn}</h2>
  <p id="id"><b>${element.id}</b></p>
  <p id="description">${element.motivering, element.uttryck}</p>`;
}