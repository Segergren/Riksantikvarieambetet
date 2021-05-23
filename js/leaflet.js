var selectedEnvironmentTypes = document.getElementById('culturalEnvironmentTypes');
selectedEnvironmentTypes.getElementsByClassName('anchor')[0].onclick = function (evt) {
  if (selectedEnvironmentTypes.classList.contains('visible'))
    selectedEnvironmentTypes.classList.remove('visible');
  else
    selectedEnvironmentTypes.classList.add('visible');
}

let environmentFilterList = [];
let municipalityFilterList = [];

var resetStyle = {
  color: "#e6a72e",
  weight: 3,
  opacity: 1.0,
  fillColor: '#e6a72e',
  fillOpacity: 0.4
};

let currentlyViewingAInterest = null;
let filterLayers = [];

function createTriggerOnLoad() {
  getRiksintresseData();
}

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
  L.tileLayer('http://api.geosition.com/tile/osm-bright-3006/{z}/{x}/{y}.png', {
    maxZoom: 14,
    minZoom: 0,
    continuousWorld: true,
    attribution: 'Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>, Imagery &copy; 2013 <a href="http://www.kartena.se/">Kartena</a>'
  }).addTo(map);


  fillMapWithNationalInterests();
  fillMapWithCounties();
  fillMapWithMunicipality();
  map.on('zoomend', function () {
    updateResultTableOnMove();
  });
  map.on('dragend', function () {
    updateResultTableOnMove();
  });
}

function updateResultTableOnMove() {
  let layersInsideZoomRange = getFeaturesInView();
  clearResultTable();
  let inserted = 0;
  let filteredFeatures = [];
  searchNationalInterests().forEach(layer => {
    filteredFeatures.push(layer.feature);
  });

  layersInsideZoomRange.forEach(layer => {
    let nationalInterestInformation = inserted < 3 ? findConnectedInformation(layer) : null;
    if (nationalInterestInformation != null) {
      if (filteredFeatures.length > 0) {
        if (filteredFeatures.includes(layer)) {
          inserted++;
          addInterestToResultTable(nationalInterestInformation, layer, true);
        }
      }
      else {
        inserted++;
        addInterestToResultTable(nationalInterestInformation, layer, true);
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
    fillOpacity: 0
  };
  $.getJSON("https://o11.se/RAA/kommun.geojson", function (geojsonData) {
    L.Proj.geoJson(geojsonData, {
      onEachFeature: onEachFeatureMunicipality,
      style: geoJsonStyle
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

function highlightFeature(geoElement) {
  highlightOnResultTable(geoElement.target);
  highlightLayer(geoElement.target);
}

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

//Lägger till onhover och onclick-events
function onEachFeatureCounties(feature, layer) {
  var countyOption = document.createElement('option');
  countyOption.innerHTML = layer.feature.properties.LnNamn + " län";
  countyOption.value = layer.feature.properties.LnKod;
  countyElement.appendChild(countyOption);
  LIST_OF_COUNTIES.push(layer);
}

function onEachFeatureMunicipality(feature, layer) {
  LIST_OF_MUNICIPALITY.push(layer);
  municipalityFilterList.push(layer);
}

//Lägger till onhover och onclick-events
function onEachFeatureGeojson(feature, layer) {
  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight,
    click: onInterestClickEvent,
  });
  LIST_OF_LAYERS.push(layer);
}

//Hittar informationen kopplat till en geodata
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

function onInterestClickEvent(geoElement) {
  let nationalInterestInformation = findConnectedInformation(geoElement);
  currentlyViewingAInterest = geoElement.target;
  showPopUp(nationalInterestInformation, geoElement);
}

function checkIfInsideCounty(nationalInterest, county) {
  let middle = [nationalInterest.getBounds()._southWest.lat + (Math.abs(nationalInterest.getBounds()._northEast.lat - nationalInterest.getBounds()._southWest.lat)), nationalInterest.getBounds()._southWest.lng + (Math.abs(nationalInterest.getBounds()._northEast.lng - nationalInterest.getBounds()._southWest.lng))]
  return county._bounds.contains(middle) ? true : false;
}

function highlightLayer(geoElement) {
  geoElement.setStyle({
    weight: 3,
    opacity: 1.0,
    fillOpacity: 0.4,
    color: '#D94E28',
    fillColor: '#D94E28'
  });
}

function resetLayer(geoElement) {
  geoElement.setStyle(
    resetStyle
  );
}

function resetAllLayers() {
  map.eachLayer(function (geoElement) {
    if (geoElement.options.pane.className != undefined && (geoElement.options.pane.className.includes("leaflet-pane leaflet-nationalInterests-pane") && geoElement.hasOwnProperty("feature"))) {
      geoElement.setStyle(
        resetStyle
      );
    }
  });
}

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

function flyToRiksintresse(informationElement) {
  geojsonElement = null;
  LIST_OF_LAYERS.forEach(layer => {
    if (layer.feature.properties.RI_id == informationElement.id || layer.feature.properties.NAMN == informationElement.namn) {
      geojsonElement = layer;
    }
  });

  map.flyToBounds(geojsonElement._bounds);
}

function flyToCounty(countyID) {
  geojsonElement = null;
  LIST_OF_COUNTIES.forEach(layer => {
    if (String(layer.feature.properties.LnKod) == String(countyID)) {
      geojsonElement = layer;
    }
  });

  map.flyToBounds(geojsonElement._bounds);
}

function flyToMunicipality(municipalityID) {
  geojsonElement = null;
  LIST_OF_MUNICIPALITY.forEach(layer => {
    if (String(layer.feature.properties.KnKod) == String(municipalityID)) {
      geojsonElement = layer;
    }
  });
  map.flyToBounds(geojsonElement._bounds);
}

function redraw() {
  var full_width = $('body').width();
  var left_width = $('.sidepanel').width();
  var left_height = $('.sidepanel').height();
  $('#mapid').width(full_width - left_width - 1);
  $("#mapid").height(left_height);
}