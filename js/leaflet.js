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


  FillMapWithNationalInterests();
  //FillMapWithLandscape();
  FillMapWithCounties();
  FillMapWithMunicipality();
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
    let nationalInterestInformation = FindConnectedInformation(layer);
    if (nationalInterestInformation != null && inserted < 3) {
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

//Fyller kartan med geodata från geojson
function FillMapWithCounties() {
  var geoJsonStyle = {
    color: '#0800b3',
    weight: 1,
    opacity: 0.3,
    fillColor: '#0800b3',
    fillOpacity: 0
  };
  $.getJSON("https://o11.se/RAA/län.geojson", function (data) {
    L.Proj.geoJson(data, {
      onEachFeature: onEachFeatureCounties,
      style: geoJsonStyle
    }).addTo(map);
  });


}

function FillMapWithLandscape() {
  var geoJsonStyle = {
    color: '#0800b3',
    weight: 1,
    opacity: 0,
    fillColor: '#0800b3',
    fillOpacity: 0
  };

  $.getJSON("https://o11.se/RAA/landskap.geojson", function (data) {
    L.Proj.geoJson(data, {
      onEachFeature: onEachFeatureLandscape,
      style: geoJsonStyle
    }).addTo(map)
  });
}

function FillMapWithMunicipality() {
  var geoJsonStyle = {
    color: '#000000',
    weight: 1,
    opacity: 0.05,
    fillColor: '#000000',
    fillOpacity: 0
  };
  $.getJSON("https://o11.se/RAA/kommun.geojson", function (data) {
    L.Proj.geoJson(data, {
      onEachFeature: onEachFeatureMunicipality,
      style: geoJsonStyle
    }).addTo(map);
    loadMunicipalityList();
  });
}

//Fyller kartan med geodata från geojson
function FillMapWithNationalInterests() {
  var geoJsonStyle = {
    color: "#e6a72e",
    weight: 3,
    opacity: 1.0,
    fillColor: '#e6a72e',
    fillOpacity: 0.4
  };
  let nationalInterests = map.createPane('nationalInterests');
  $.getJSON("https://o11.se/RAA/geojson.geojson", function (data) {
    L.Proj.geoJson(data, {
      onEachFeature: onEachFeatureGeojson,
      style: geoJsonStyle,
      pane: nationalInterests
    }).addTo(map);
  });

}

function highlightFeature(e) {
  highlightResultTable(e.target);
  highlightLayer(e.target);
}

function resetHighlight(e) {
  resetHighlightResultTable();
  if (currentlyViewingAInterest != e.target && filterLayers.includes(e.target.feature.properties.RI_id) == false) {
    hideHoverInfo();
    if (filterLayers.length == 0) {
      resetLayer(e.target);
    }
    else {
      dimLayer(e.target);
    }
  }
}

//Lägger till onhover och onclick-events
function onEachFeatureCounties(feature, layer) {
  var opt = document.createElement('option');
  opt.innerHTML = layer.feature.properties.LnNamn + " län";
  opt.value = layer.feature.properties.LnKod;
  countyElement.appendChild(opt);
  LIST_OF_COUNTIES.push(layer);
}

function onEachFeatureMunicipality(feature, layer) {
  LIST_OF_MUNICIPALITY.push(layer);
  municipalityFilterList.push(layer);
}

//Lägger till onhover och onclick-events
function onEachFeatureLandscape(feature, layer) {
  var opt = document.createElement('option');
  opt.innerHTML = layer.feature.properties.landskap;
  opt.value = layer.feature.properties.landskapskod;
  landscapeElement.appendChild(opt);
  //layer.bringToBack();
  LIST_OF_LANDSCAPE.push(layer);
}

//Lägger till onhover och onclick-events
function onEachFeatureGeojson(feature, layer) {
  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight,
    click: OnClickEvent,
  });
  //layer.bringToFront();
  LIST_OF_LAYERS.push(layer);
}


//Hittar informationen kopplat till en geodata
function FindConnectedInformation(e) {
  let selectedInformation;
  if (e.target != null) {
    NATIONAL_INTERESTS.forEach(element => {
      if (String(e.target.feature.properties.RI_id) == String(element.id)) {
        selectedInformation = element;
      }
    });
  }
  else if(e.feature != null){
    NATIONAL_INTERESTS.forEach(element => {
      if (String(e.feature.properties.RI_id) == String(element.id)) {
        selectedInformation = element;
      }
    });
  }
  else {
    NATIONAL_INTERESTS.forEach(element => {
      if (String(e.properties.RI_id) == String(element.id)) {
        selectedInformation = element;
      }
    });
  }
  return selectedInformation;
}

function OnClickEvent(e) {
  let nationalInterestInformation = FindConnectedInformation(e);
  currentlyViewingAInterest = e.target;
  ShowPopUp(nationalInterestInformation, e);
}

function checkIfInsideCounty(nationalInterest, county) {
  let middle = [nationalInterest.getBounds()._southWest.lat + (Math.abs(nationalInterest.getBounds()._northEast.lat - nationalInterest.getBounds()._southWest.lat)), nationalInterest.getBounds()._southWest.lng + (Math.abs(nationalInterest.getBounds()._northEast.lng - nationalInterest.getBounds()._southWest.lng))]
  if (county._bounds.contains(middle)) {
    return true;
  }
  else {
    return false;
  }
}

function openInResultTable(id){
  var coll = document.getElementsByClassName("collapsible");
  var i;
  for (i = 0; i < coll.length; i++) {
    if(coll[i].value == id){
      coll[i].classList.add("highlight");
      coll[i].classList.add("active");
      var content = coll[i].nextElementSibling;
      openResult(content);
    }
  }
}

function resetHighlightResultTable() {
  var coll = document.getElementsByClassName("collapsible");
  var i;
  for (i = 0; i < coll.length; i++) {
    coll[i].classList.remove("highlight");
  }
}

function highlightResultTable(layer) {
  console.log(layer.feature.properties.RI_id);
  resetHighlightResultTable();
  var coll = document.getElementsByClassName("collapsible");
  var i;
  var foundInResultTable = false;
  for (i = 0; i < coll.length; i++) {
    if (coll[i].value == layer.feature.properties.RI_id) {
      coll[i].classList.add("highlight");
      foundInResultTable = true;
    }
  }
  if(!foundInResultTable){
    if(coll.length >= 3){
      removeInterestFromResultTable(2);
    }

    let nationalInterestInformation = FindConnectedInformation(layer);
    if(nationalInterestInformation != null){
      addInterestToResultTable(nationalInterestInformation);
      coll[coll.length-1].classList.add("highlight");
    }
  }
}

function highlightLayer(layer) {
  layer.setStyle({
    weight: 3,
    opacity: 1.0,
    fillOpacity: 0.4,
    color: '#D94E28',
    fillColor: '#D94E28'
  });
}

function resetLayer(layer) {
  layer.setStyle(
    resetStyle
  );
}

function resetAllLayers() {
  map.eachLayer(function (layer) {
    if (layer.options.pane.className != undefined && (layer.options.pane.className.includes("leaflet-pane leaflet-nationalInterests-pane") && layer.hasOwnProperty("feature"))) {
      layer.setStyle(
        resetStyle
      );
    }
  });
}

function dimLayer(layer) {
  var dimStyle = {
    color: "#e6a72e",
    weight: 3,
    opacity: 0.3,
    fillColor: '#e6a72e',
    fillOpacity: 0.2
  };

  if (layer.options.pane.className != undefined && (layer.options.pane.className.includes("leaflet-pane leaflet-nationalInterests-pane") && layer.hasOwnProperty("feature"))) {
    layer.setStyle(
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

  map.eachLayer(function (layer) {
    if (layer.options.pane.className != undefined && (layer.options.pane.className.includes("leaflet-pane leaflet-nationalInterests-pane") && layer.hasOwnProperty("feature"))) {
      layer.setStyle(
        dimStyle
      );
    }
  });
}

//Visar popup när användaren klickar på ett riksintresse
function ShowPopUp(nationalInterestInformation, e) {
  if (nationalInterestInformation == null) {
    return;
  }

  let popupHTMLInformation = `<div class='popup'><p class='name'>${nationalInterestInformation.name}</p><p>ID: ${nationalInterestInformation.id}</p><a onclick="openInResultTable('${nationalInterestInformation.id}')">Visa mer</a></div>`;

  //Lägger till en popup med namn, län, och kommun där användarens muspekare står
  let popup = L.popup()
    .setLatLng(e.latlng)
    .setContent(popupHTMLInformation)
    .openOn(map);

  popup.on('remove', function () {
    currentlyViewingAInterest = null;
    resetHighlight(e);
    hideMoreInformation();
  });
}

function clearResultTable() {
  let resultTable = document.getElementById("result-table");
  resultTable.innerHTML = "";
}

function removeInterestFromResultTable(index){
  let resultTable = document.getElementById("result-table");
  resultTable.childNodes[index].remove();
}

function addInterestToResultTable(nationalInterestInformation, e, open) {
  let resultTable = document.getElementById("result-table");
  let htmlResult = `
  <button type="button" value="${nationalInterestInformation.id}" class="collapsible">${nationalInterestInformation.name}</button>
      <div class="content">
        <p class="title"><b>ID</b></p>
        <p class="result-id">${nationalInterestInformation.id}</p>
        <p class="title"><b>Län</b></p>
        <p>${nationalInterestInformation.county}</p>
        <p class="title"><b>Kommun</b></p>
        <p>${nationalInterestInformation.municipality}</p>`;

  if (nationalInterestInformation.culturalEnvironmentTypes != false) {
    htmlResult += `<p class="title"><b>Kulturmiljötyper</b></p>
                        <p>${nationalInterestInformation.culturalEnvironmentTypes}</p>`;
  }
  if (nationalInterestInformation.reason != false) {
    htmlResult += `<p class="title"><b>Motivering</b></p>
                        <p>${nationalInterestInformation.reason}</p>`
  }
  if (nationalInterestInformation.expression != false) {
    htmlResult += `<p class="title"><b>Uttryck</b></p>
                         <p>${nationalInterestInformation.expression}</p>`
  }
  if (nationalInterestInformation.underInvestigation != false) {
    htmlResult += `<p class="title"><b>Utredningsområde</b></p>
                         <p>${nationalInterestInformation.underInvestigation}</p>`
  }
  if (nationalInterestInformation.firstRevision != false) {
    htmlResult += `<p class="title"><b>Tidigare revidering</b></p>
                        <p>${nationalInterestInformation.firstRevision}</p>`;
  }
  if (nationalInterestInformation.latestRevision != false) {
    htmlResult += `<p class="title"><b>Senaste revidering</b></p>
                         <p>${nationalInterestInformation.latestRevision}</p>`;
  }
  htmlResult += '</div>';
  //resultTable.innerHTML += htmlResult;

  let newResult = document.createElement('div');
  newResult.innerHTML = htmlResult;
  resultTable.append(newResult);
  addResultAnimation(nationalInterestInformation.id);
}



function hideMoreInformation() {
  let informationDiv = document.getElementById("information");
  informationDiv.style.display = 'none';
}


//Gömmer hover-rutan
function hideHoverInfo() {
  let overlay = document.getElementById('map-overlay');
  overlay.style.display = 'none';
}

//Tar in namn och id över hoverad riksintresse samt vissar upp den.
function showHoverInfo(name, id) {
  let overlay = document.getElementById('map-overlay');
  overlay.innerHTML = `<p><b>${name}</b></p> 
                       <p>${id}</p>`;
  overlay.style.display = 'block';
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

  //highlightInterestsInsideCounty(countyID)

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

function flyToLandscape(landscapeID) {
  geojsonElement = null;
  LIST_OF_LANDSCAPE.forEach(layer => {
    if (String(layer.feature.properties.landskapskod) == String(landscapeID)) {
      geojsonElement = layer;
    }
  });
  map.flyToBounds(geojsonElement._bounds);
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

/* // UI EVENTS \\ */
const searchElement = document.querySelector('#search');
searchElement.addEventListener('change', (event) => {
  let filteredNationalInterests = searchNationalInterests();
  dimAllLayers();
  filteredNationalInterests.forEach(layer => {
    highlightLayer(layer);
  });

  let informationElement = searchNameAndID(event.target.value);
  flyToRiksintresse(informationElement);
});

const countyElement = document.querySelector('#county');
countyElement.addEventListener('change', (event) => {

  municipalityFilterList.length = 0;
  LIST_OF_MUNICIPALITY.forEach(municipality => {
    if (String(municipality.feature.properties.KnKod).substring(0, 2) == String(countyElement.value)) {
      municipalityFilterList.push(municipality);
    }
  });
  loadMunicipalityList();
  searchWithHighlight(event, "county");
});

const municipalityElement = document.querySelector('#municipality');
municipalityElement.addEventListener('change', (event) => {
  searchWithHighlight(event, "municipality");
});

function searchWithHighlight(event, flyTo) {
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


/*const landscapeElement = document.querySelector('#landscape');
landscapeElement.addEventListener('change', (event) => {
  FlyToLandscape(landscapeElement.value);
});*/

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

  //seachByCulturalEnvironments(appliedFilters);
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

$(document).ready(function () {
  redraw();
});

$(window).resize(function () {
  redraw();
});

let documentHeight = 0;
window.setInterval(function () {
  if (documentHeight != $('.sidepanel').height()) {
    documentHeight = $('.sidepanel').height();
  }
  redraw();
}, 100);

function redraw() {
  var full_width = $('body').width();
  var left_width = $('.sidepanel').width();
  var left_height = $('.sidepanel').height();
  $('#mapid').width(full_width - left_width - 1);
  $("#mapid").height(left_height);
}