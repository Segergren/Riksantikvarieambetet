var resetStyle = {
  color: "#e6a72e",
  weight: 3,
  opacity: 1.0,
  fillColor: '#e6a72e',
  fillOpacity: 0.4
};


function createTriggerOnLoad() {
  GetRiksintresseData();
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
    }).addTo(map)});
}

function FillMapWithMunicipality() {
  var geoJsonStyle = {
    color: '#7f0000',
    weight: 1,
    opacity: 0,
    fillColor: '#7f0000',
    fillOpacity: 0
  };
  $.getJSON("https://o11.se/RAA/kommun.geojson", function (data) {
    L.Proj.geoJson(data, {
      onEachFeature: onEachFeatureMunicipality,
      style: geoJsonStyle
    }).addTo(map);
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

//TODO: Funktionen gömmer sig bakom kartan.
function highlightFeature(e) {
  ShowHoverInfo(e.target.feature.properties.NAMN, e.target.feature.properties.RI_id);
  setSelectedLayer(e.target);
}

function resetHighlight(e) {
  HideHoverInfo();
  resetLayer(e.target);
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
  var opt = document.createElement('option');
  opt.innerHTML = layer.feature.properties.KnNamn;
  opt.value = layer.feature.properties.KnKod;
  municipalityElement.appendChild(opt);
  LIST_OF_MUNICIPALITY.push(layer);
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
  NATIONAL_INTERESTS.forEach(element => {
    if (String(e.target.feature.properties.RI_id) == String(element.id)) {
      selectedInformation = element;
    }
  });
  return selectedInformation;
}

function OnClickEvent(e) {
  let nationalInterestInformation = FindConnectedInformation(e);
  ShowPopUp(nationalInterestInformation, e);
}

function setSelectedLayer(layer){
  layer.setStyle({
    color: '#D94E28',
    fillColor: '#D94E28'
  });
}

function resetLayer(layer){
  layer.setStyle(
    resetStyle
    );
}

function resetAllLayers(){
  map.eachLayer(function(layer){
    if(layer.options.pane.className != undefined && (layer.options.pane.className.includes("leaflet-pane leaflet-nationalInterests-pane") && layer.hasOwnProperty("feature"))){
      console.log(layer);
      layer.setStyle(
        resetStyle
      );
    }
  });
}

//Visar popup när användaren klickar på ett riksintresse
function ShowPopUp(nationalInterestInformation, e) {
  let popupHTMLInformation = `<div class='popup'><p class='name'>${nationalInterestInformation.name}</p><p>ID: ${nationalInterestInformation.id}</p><a href="#information">Visa mer</a></div>`;

  //Lägger till en popup med namn, län, och kommun där användarens muspekare står
  L.popup()
    .setLatLng(e.latlng)
    .setContent(popupHTMLInformation)
    .openOn(map);

  ShowMoreInformation(nationalInterestInformation, e);
}

function ShowMoreInformation(nationalInterestInformation,e){
  console.log(nationalInterestInformation);
  console.log(e);

  let informationDiv = document.getElementById("information");
  informationBuilder = "";
  if(nationalInterestInformation.name != false){
    informationBuilder+=`<h2>${nationalInterestInformation.name}</h2>`;
  }
  if(nationalInterestInformation.id != false){
    informationBuilder+=`<p><b>ID:</b> ${nationalInterestInformation.id}</p>`;
  }
  if(nationalInterestInformation.county != false){
    informationBuilder+=`<p><b>Län:</b> ${nationalInterestInformation.county}</p>`;
  }
  if(nationalInterestInformation.municipality != false){
    informationBuilder+=`<p><b>Kommun:</b> ${nationalInterestInformation.municipality}</p>`;
  }
  if(nationalInterestInformation.culturalEnvironmentTypes != false){
    informationBuilder+=`<p><b>Kulturmiljötyper:</b> ${nationalInterestInformation.culturalEnvironmentTypes}</p>`;
  }
  if(nationalInterestInformation.reason != false){
    informationBuilder+=`<p><b>Motivering:</b> ${nationalInterestInformation.reason}</p>`;
  }
  if(nationalInterestInformation.expression != false){
    informationBuilder+=`<p><b>Uttryck:</b> ${nationalInterestInformation.expression}</p>`;
  }
  informationBuilder+=`<p><b>Utredningsområde:</b> ${nationalInterestInformation.underInvestigation ? "Ja":"Nej"}</p>`;
  if(nationalInterestInformation.firstRevision != false){
    informationBuilder+=`<p><b>Tidigare revidering:</b> <i>${nationalInterestInformation.firstRevision}</i></p>`;
  }
  if(nationalInterestInformation.latestRevision != false){
    informationBuilder+=`<p><b>Senaste revidering:</b> <i>${nationalInterestInformation.latestRevision}</i></p>`;
  }
  
  informationDiv.innerHTML = informationBuilder;
}

//Gömmer hover-rutan
function HideHoverInfo() {
  let overlay = document.getElementById('map-overlay');
  overlay.style.display = 'none';
}

//Tar in namn och id över hoverad riksintresse samt vissar upp den.
function ShowHoverInfo(name, id) {
  let overlay = document.getElementById('map-overlay');
  overlay.innerHTML = `<p><b>${name}</b></p> 
                       <p>${id}</p>`;
  overlay.style.display = 'block';
}

function FlyToRiksintresse(informationElement) {
  geojsonElement = null;
  LIST_OF_LAYERS.forEach(layer => {

    if (layer.feature.properties.RI_id == informationElement.id || layer.feature.properties.NAMN == informationElement.namn) {
      geojsonElement = layer;
    }
  });

  map.flyToBounds(geojsonElement._bounds);
}

function FlyToCounty(countyID) {
  geojsonElement = null;
  LIST_OF_COUNTIES.forEach(layer => {
    if (String(layer.feature.properties.LnKod) == String(countyID)) {
      geojsonElement = layer;
    }
  });
  map.flyToBounds(geojsonElement._bounds);
}

function FlyToMunicipality(municipalityID) {
  geojsonElement = null;
  LIST_OF_MUNICIPALITY.forEach(layer => {
    if (String(layer.feature.properties.KnKod) == String(municipalityID)) {
      geojsonElement = layer;
    }
  });
  map.flyToBounds(geojsonElement._bounds);
}

function FlyToLandscape(landscapeID) {
  geojsonElement = null;
  LIST_OF_LANDSCAPE.forEach(layer => {
    if (String(layer.feature.properties.landskapskod) == String(landscapeID)) {
      geojsonElement = layer;
    }
  });
  map.flyToBounds(geojsonElement._bounds);
}

/* // UI EVENTS \\ */
const searchElement = document.querySelector('#search');
searchElement.addEventListener('change', (event) => {
  let informationElement = searchNameAndID(event.target.value);
  FlyToRiksintresse(informationElement);
});

const countyElement = document.querySelector('#county');
countyElement.addEventListener('change', (event) => {
  FlyToCounty(countyElement.value);
});

const municipalityElement = document.querySelector('#municipality');
municipalityElement.addEventListener('change', (event) => {
  FlyToMunicipality(municipalityElement.value);
});

/*const landscapeElement = document.querySelector('#landscape');
landscapeElement.addEventListener('change', (event) => {
  FlyToLandscape(landscapeElement.value);
});*/