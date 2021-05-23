function searchNameAndID(searchParameter) {
  let foundRiksintresse = null;
  try {
    NATIONAL_INTERESTS.forEach(informationDataElement => {
      if (foundRiksintresse == null) {
        switch (String(searchParameter).toLowerCase()) {
          case String(informationDataElement.id).toLowerCase():
            foundRiksintresse = informationDataElement;
          case String(informationDataElement.namn).toLowerCase():
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

function searchNationalInterests() {
  let nameAndIdSearch = document.getElementById('search');
  let countySearch = document.getElementById('county');
  let municipalitySearch = document.getElementById('municipality');
  let culturalEnvironmentTypeSearch = document.getElementsByClassName("items")[0];

  let foundByNameOrID = [];
  let foundByCounty = [];
  let foundByMunicipality = [];
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

  //Search by municipality
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


function getFeaturesInView() {
  var features = [];
  map.eachLayer(function (layer) {
    if (layer.options.pane.className != undefined && (layer.options.pane.className.includes("leaflet-pane leaflet-nationalInterests-pane") && layer.hasOwnProperty("feature"))) {
      if (map.getBounds().contains(layer._bounds._northEast) || map.getBounds().contains(layer._bounds._southWest)) {
        features.push(layer.feature);
      }
    }
  });
  return features;
}

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

//FILTER
function culturalEnvironmentFilter() {
  let filterElement = document.getElementsByClassName("items")[0];
  let filters = filterElement.childNodes;
  let appliedFilters = [];

  filters.forEach(filter => {
    if (filter.childNodes[0].checked) {
      appliedFilters.push(filter.childNodes[0].value);
    }
  });

  let filteredNationalInterests = searchNationalInterests();
  dimAllLayers();
  filteredNationalInterests.forEach(layer => {
    highlightLayer(layer);
  });
}

function seachByCulturalEnvironments(appliedFilters) {
  if (appliedFilters.length > 0) {
    filterApplied = true;
    dimAllLayers();
  }
  else {
    filterApplied = false;
    resetAllLayers();
  }
  filterLayers.length = 0;

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
          highlightLayer(layer);
          filterLayers.push(layer.feature.properties.RI_id);
        }
      }
    }
  });
}