//Sök efter riksintresse med hjälp av ID eller namn
function searchNameAndID(searchParameter) {
  let foundRiksintresse = null;
  try {
    NATIONAL_INTERESTS.forEach(informationDataElement => {
      if (foundRiksintresse == null) {
        if (String(searchParameter).toLowerCase() == String(informationDataElement.id).toLowerCase()) {
          foundRiksintresse = informationDataElement;
        }
        else if (String(informationDataElement.name).toLowerCase().includes(String(searchParameter).toLowerCase())){
          foundRiksintresse = informationDataElement;
        }
      }
    });
  }
  catch (error) {
    console.log(error);
  }
  return foundRiksintresse;
}

//Söker alla riksintressen med filtrering
function searchNationalInterests() {
  let nameAndIdSearch = document.getElementById('search');
  let countySearch = document.getElementById('county');
  let municipalitySearch = document.getElementById('municipality');
  let culturalEnvironmentTypeSearch = document.getElementsByClassName("items")[0];

  let foundByNameOrID = [];
  let foundByCounty = [];
  let foundByMunicipality = [];
  let foundByCultural = [];

  //Om filtrering med namn/id är aktiv
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

  //Om filtrering med kommun är aktiv
  if (municipalitySearch.value.length > 0 && municipalitySearch.options[municipalitySearch.selectedIndex].text != "Kommun") {
    map.eachLayer(function (layer) {
      if (layer.options.pane.className != undefined && (layer.options.pane.className.includes("leaflet-pane leaflet-nationalInterests-pane") && layer.hasOwnProperty("feature"))) {
        let informationElement = searchNameAndID(layer.feature.properties.RI_id);
        if (informationElement != null && (String(informationElement.municipality) == String(municipalitySearch.options[municipalitySearch.selectedIndex].text))) {
          foundByMunicipality.push(layer);
        }
      }
    });
  }

  //Om filtrering med län är aktiv
  if (countySearch.value.length > 0) {
    map.eachLayer(function (layer) {
      if (layer.options.pane.className != undefined && (layer.options.pane.className.includes("leaflet-pane leaflet-nationalInterests-pane") && layer.hasOwnProperty("feature"))) {
        if (String(layer.feature.properties.LANSKOD) == String(countySearch.value)) {
          foundByCounty.push(layer);
        }
      }
    });
  }


  let filters = culturalEnvironmentTypeSearch.childNodes;
  let appliedFilters = [];

  //Hämta filter
  filters.forEach(filter => {
    if (filter.childNodes[0].checked) {
      appliedFilters.push(filter.childNodes[0].value);
    }
  });

  //Om filtrering med kulturmiljötyper är aktiv 
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

  //Om riksintresset innehåller alla filter
  filteredNationalInterests = filteredNationalInterests.concat(foundByNameOrID, foundByMunicipality, foundByCounty, foundByCultural);

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

    //Om län-filter är på
    if (countySearch.value.length > 0) {
      let found = foundByCounty.includes(filteredNationalInterests[i]);
      if (found == false) {
        filteredNationalInterests.splice(i, 1);
      }
    }

    //Om kommun-filter är på
    if (municipalitySearch.value.length > 0) {
      let found = foundByMunicipality.includes(filteredNationalInterests[i]);
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
  
  filterLayers.length = 0;
  filteredNationalInterests.forEach(layer => {
    filterLayers.push(layer.feature.properties.RI_id);
  });

  showFoundInterests(filteredNationalInterests);
  return filteredNationalInterests;
}

//Returnerar lista med layers som befinner sig innanför användarens karta
function getLayersInView() {
  var layersList = [];
  map.eachLayer(function (layer) {
    if (layer.options.pane.className != undefined && (layer.options.pane.className.includes("leaflet-pane leaflet-nationalInterests-pane") && layer.hasOwnProperty("feature"))) {
      if (map.getBounds().contains(layer._bounds._northEast) || map.getBounds().contains(layer._bounds._southWest)) {
        layersList.push(layer.feature);
      }
    }
  });
  return layersList;
}

//Highlightar alla layers innanför en kommun
function highlightInterestsInsideCounty(countyID) {
  dimAllLayers();
  filterLayers.length = 0;
  map.eachLayer(function (layer) {
    if (layer.options.pane.className != undefined && (layer.options.pane.className.includes("leaflet-pane leaflet-nationalInterests-pane") && layer.hasOwnProperty("feature"))) {
      if (layer.feature.properties.LANSKOD == countyID) {
        resetLayer(layer);
        filterLayers.push(layer);
      }
    }
  });
}

//Söker efter layers att highlighta och flytta användaren dit
function searchWithHighlight(flyTo) {
  resetFilterList();
  let filteredNationalInterests = searchNationalInterests();
  dimAllLayers();

  filteredNationalInterests.forEach(layer => {
    highlightLayer(layer);
    loadFilterList(searchNameAndID(layer.feature.properties.RI_id));
  });

  if (flyTo == "municipality") {
    if (municipalityElement.value.length > 0) {
      flyToMunicipality(municipalityElement.value);
    }
    else {
      if (countyElement.value.length > 0) {
        flyToCounty(countyElement.value);
      }
      else {

      }
    }
  } else if (flyTo == "county") {
    if (countyElement.value.length > 0) {
      flyToCounty(countyElement.value);
    }
  }
  fillFilterList();

  if (municipalityElement.value.length == 0 && countyElement.value.length == 0) {
    resetAllLayers();
    map.eachLayer(function (layer) {
      if (layer.options.pane.className != undefined && (layer.options.pane.className.includes("leaflet-pane leaflet-nationalInterests-pane") && layer.hasOwnProperty("feature"))) {
        loadFilterList(searchNameAndID(layer.feature.properties.RI_id));
      }
    });
    fillFilterList();
    searchNationalInterests();
  }
}