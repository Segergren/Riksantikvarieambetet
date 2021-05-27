let environmentFilterList = [];
let municipalityFilterList = [];
let currentlyViewingAInterest = null;
let filterLayers = [];

var resetStyle = {
  color: "#e6a72e",
  weight: 3,
  opacity: 1.0,
  fillColor: '#e6a72e',
  fillOpacity: 0.4
};

//Skapar en ny mapp med EPSG:3006
function CreateNewMap() {
  var crs = new L.Proj.CRS('EPSG:3006',
    '+proj=utm +zone=33 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs',
    {
      resolutions: [
        8192, 4096, 2048, 1024, 512, 256, 128,
        64, 32, 16, 8, 4, 2, 1, 0.5
      ],
      origin: [0, 0]
    }),
    map = new L.Map('mapid', {
      crs: crs,
      continuousWorld: true,
      worldCopyJump: false
    });
  map.setView([59.33258, 18.0649], 4);

  return map;
}

//Lägger till bakgrundskartan.
function AddBackgroundMap() {
  L.tileLayer('https://api.geosition.com/tile/osm-bright-3006/{z}/{x}/{y}.png', {
    maxZoom: 14,
    minZoom: 0,
    continuousWorld: false,
    attribution: 'Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>, Imagery &copy; 2013 <a href="http://www.kartena.se/">Kartena</a>'
  }).addTo(map);

  //Fyll kartan med län, kommuner och riksintressen
  fillMapWithNationalInterests();
  fillMapWithCounties();
  fillMapWithMunicipality();

  //När användaren flyttar på kartan
  map.on('zoomend', function () {
    updateResultTableOnMove();
  });
  map.on('dragend', function () {
    updateResultTableOnMove();
  });
}

//Uppdatera result-table när användaren flyttar på kartan
function updateResultTableOnMove() {
  let layersInsideZoomRange = getLayersInView();
  clearResultTable();
  let inserted = document.getElementsByClassName("collapsible").length;
  let filteredFeatures = [];
  searchNationalInterests().forEach(layer => {
    filteredFeatures.push(layer.feature);
  });

  layersInsideZoomRange.forEach(layer => {
    let nationalInterestInformation = inserted < 20 ? findConnectedInformation(layer) : null;
    if (nationalInterestInformation != null) {
      if (filteredFeatures.length > 0) {
        if (filteredFeatures.includes(layer)) {
          let addedInterest = addInterestToResultTable(nationalInterestInformation, layer, true);
          if (addedInterest != false) {
            inserted++;
          }
        }
      }
      else {
        let addedInterest = addInterestToResultTable(nationalInterestInformation, layer, true);
        if (addedInterest != false) {
          inserted++;
        }
      }
    }
  });
}

//Fyller kartan med län
function fillMapWithCounties() {
  var geoJsonStyle = {
    color: '#0800b3',
    weight: 1,
    opacity: 0.3,
    fillColor: '#0800b3',
    fillOpacity: 0
  };
  $.getJSON("https://o11.se/RAA/län.geojson", function (geojsonData) {
    L.Proj.geoJson(geojsonData, {
      onEachFeature: onEachFeatureCounties,
      style: geoJsonStyle
    }).addTo(map);
  });
}

//Fyller kartan med kommuner
function fillMapWithMunicipality() {
  var geoJsonStyle = {
    color: '#000000',
    weight: 1,
    opacity: 0.05,
    fillColor: '#000000',
    fillOpacity: 0,
  };
  $.getJSON("https://o11.se/RAA/kommun.geojson", function (geojsonData) {
    L.Proj.geoJson(geojsonData, {
      onEachFeature: onEachFeatureMunicipality,
      style: geoJsonStyle,
    }).addTo(map);

    loadMunicipalityList();
  });
}

//Fyller kartan med riksintressen
function fillMapWithNationalInterests() {
  var geoJsonStyle = {
    color: "#e6a72e",
    weight: 3,
    opacity: 1.0,
    fillColor: '#e6a72e',
    fillOpacity: 0.4
  };
  let nationalInterests = map.createPane('nationalInterests');
  $.getJSON("https://o11.se/RAA/geojson.geojson", function (geojsonData) {
    L.Proj.geoJson(geojsonData, {
      onEachFeature: onEachFeatureGeojson,
      style: geoJsonStyle,
      pane: nationalInterests
    }).addTo(map);
  });

}

//Highlightar på kartan samt i result-table
function highlightFeature(geoElement) {
  highlightOnResultTable(geoElement.target);
  highlightLayer(geoElement.target);
}

//Tar bort highlight på kartan och result-table
function resetHighlight(geoElement) {
  resetHighlightResultTable();
  if (currentlyViewingAInterest != geoElement.target && filterLayers.includes(geoElement.target.feature.properties.RI_id) == false) {
      if (filterLayers.length == 0) {
        resetLayer(geoElement.target);
      }
      else {
        dimLayer(geoElement.target);
      }
  }
}

//Lägger till län i sidopanelen samt i LIST_OF_COUNTIES-arrayen
function onEachFeatureCounties(feature, layer) {
  LIST_OF_COUNTIES.push(layer);
  LIST_OF_COUNTIES.sort(function (a, b) {
    if (a.feature.properties.namn < b.feature.properties.namn) { return -1; }
    if (a.feature.properties.namn > b.feature.properties.namn) { return 1; }
    return 0;
  })
  countyElement.innerHTML = '<option value="" selected="">Län</option>';
  LIST_OF_COUNTIES.forEach(layerCounty => {
    var countyOption = document.createElement('option');
    countyOption.innerHTML = layerCounty.feature.properties.namn + " län";
    countyOption.value = layerCounty.feature.properties.lanskod;
    countyElement.appendChild(countyOption);
  });
}

//Lägger till kommun i sidopanelen och i LIST_OF_MUNICIPALITY-arrayen
function onEachFeatureMunicipality(feature, layer) {
  LIST_OF_MUNICIPALITY.push(layer);
  municipalityFilterList.push(layer);
}

//Lägger till onhover och onclick-events på varje riksintresse
function onEachFeatureGeojson(feature, layer) {
  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight,
    click: onInterestClickEvent,
  });
  LIST_OF_LAYERS.push(layer);
}

//Hittar informationen kopplat till en geodata (layer)
function findConnectedInformation(geoElement) {
  let returnInfoData;
  if (geoElement.target != null) {
    NATIONAL_INTERESTS.forEach(elementInfoData => {
      if (String(geoElement.target.feature.properties.RI_id) == String(elementInfoData.id)) {
        returnInfoData = elementInfoData;
      }
    });
  }
  else if (geoElement.feature != null) {
    NATIONAL_INTERESTS.forEach(elementInfoData => {
      if (String(geoElement.feature.properties.RI_id) == String(elementInfoData.id)) {
        returnInfoData = elementInfoData;
      }
    });
  }
  else {
    NATIONAL_INTERESTS.forEach(elementInfoData => {
      if (String(geoElement.properties.RI_id) == String(elementInfoData.id)) {
        returnInfoData = elementInfoData;
      }
    });
  }
  return returnInfoData;
}

//När en användare klickar på ett riksintresse
function onInterestClickEvent(geoElement) {
  let nationalInterestInformation = findConnectedInformation(geoElement);
  currentlyViewingAInterest = geoElement.target;
  showPopUp(nationalInterestInformation, geoElement);
}

//Highlightar en layer
function highlightLayer(geoElement) {
  geoElement.setStyle({
    weight: 3,
    opacity: 1.0,
    fillOpacity: 0.4,
    color: '#D94E28',
    fillColor: '#D94E28'
  });
}

//Tar bort highlight och dim från ett layer
function resetLayer(geoElement) {
  geoElement.setStyle(
    resetStyle
  );
}

//Tar bort highlight och dim från samtliga layers
function resetAllLayers() {
  map.eachLayer(function (geoElement) {
    if (geoElement.options.pane.className != undefined && (geoElement.options.pane.className.includes("leaflet-pane leaflet-nationalInterests-pane") && geoElement.hasOwnProperty("feature"))) {
      geoElement.setStyle(
        resetStyle
      );
    }
  });
}

//Dimmar ett layer
function dimLayer(geoElement) {
  var dimStyle = {
    color: "#e6a72e",
    weight: 3,
    opacity: 0.3,
    fillColor: '#e6a72e',
    fillOpacity: 0.2
  };

  if (geoElement.options.pane.className != undefined && (geoElement.options.pane.className.includes("leaflet-pane leaflet-nationalInterests-pane") && geoElement.hasOwnProperty("feature"))) {
    geoElement.setStyle(
      dimStyle
    );
  }
}

//Dimmar samtliga layers
function dimAllLayers() {
  var dimStyle = {
    color: "#e6a72e",
    weight: 3,
    opacity: 0.3,
    fillColor: '#e6a72e',
    fillOpacity: 0.2
  };

  map.eachLayer(function (geoElement) {
    if (geoElement.options.pane.className != undefined && (geoElement.options.pane.className.includes("leaflet-pane leaflet-nationalInterests-pane") && geoElement.hasOwnProperty("feature"))) {
      geoElement.setStyle(
        dimStyle
      );
    }
  });
}

//Visar popup när användaren klickar på ett riksintresse
function showPopUp(nationalInterestInformation, geoElement) {
  if (nationalInterestInformation == null) {
    return;
  }
  let popupHTMLInformation = `<div class='popup'><p class='name'>${nationalInterestInformation.name}</p><p>ID: ${nationalInterestInformation.id}</p><a onclick="openInResultTable('${nationalInterestInformation.id}')">Visa mer</a></div>`;

  //Lägger till en popup med namn, län, och kommun där användarens muspekare står
  let popup = L.popup()
    .setLatLng(geoElement.latlng)
    .setContent(popupHTMLInformation)
    .openOn(map);

  popup.on('remove', function () {
    currentlyViewingAInterest = null;
    resetHighlight(geoElement);
  });
}

//Navigera till ett riksintresse efter att ha hämtat informationen om den
function navigateToPoint(id) {
  let informationElement = searchNameAndID(id);
  flyToRiksintresse(informationElement);
}

//Flytta kartan till ett riksintresse
function flyToRiksintresse(informationElement) {
  geojsonElement = null;
  LIST_OF_LAYERS.forEach(layer => {
    if (layer.feature.properties.RI_id == informationElement.id || layer.feature.properties.NAMN == informationElement.namn) {
      geojsonElement = layer;
    }
  });

  map.flyToBounds(geojsonElement._bounds);
}

//Flytta kartan till ett län
function flyToCounty(countyID) {
  geojsonElement = null;
  LIST_OF_COUNTIES.forEach(layer => {
    if (String(layer.feature.properties.lanskod) == String(countyID)) {
      geojsonElement = layer;
    }
  });

  map.flyToBounds(geojsonElement._bounds);
}

//Flytta kartan till en kommun
function flyToMunicipality(municipalityID) {
  geojsonElement = null;
  LIST_OF_MUNICIPALITY.forEach(layer => {
    if (String(layer.feature.properties.kommunkod) == String(municipalityID)) {
      geojsonElement = layer;
    }
  });
  map.flyToBounds(geojsonElement._bounds);
}