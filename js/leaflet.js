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
  FillMapWithGeojson();
  FillMapWithCounties();
}

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
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

//Fyller kartan med geodata från geojson
function FillMapWithGeojson() {
  var geoJsonStyle = {
    color: "#e6a72e",
    weight: 3,
    opacity: 1.0,
    fillColor: '#e6a72e',
    fillOpacity: 0.4
  };

  $.getJSON("https://o11.se/RAA/geojson.geojson", function (data) {
    L.Proj.geoJson(data, {
      onEachFeature: onEachFeatureGeojson,
      style: geoJsonStyle
    }).addTo(map);
  });
}

//TODO: Funktionen gömmer sig bakom kartan.
function highlightFeature(e) {
  ShowHoverInfo(e.target.feature.properties.NAMN, e.target.feature.properties.RI_id);
}

function resetHighlight(e) {
  HideHoverInfo();
}

//Lägger till onhover och onclick-events
function onEachFeatureCounties(feature, layer) {
  var opt = document.createElement('option');
  opt.innerHTML = layer.feature.properties.LnNamn + " län";
  opt.value = layer.feature.properties.LnKod;
  countyElement.appendChild(opt);
  LIST_OF_COUNTIES.push(layer);
}

//Lägger till onhover och onclick-events
function onEachFeatureGeojson(feature, layer) {
  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight,
    click: OnClickEvent,
  });

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

//Visar popup när användaren klickar på ett riksintresse
function ShowPopUp(nationalInterestInformation, e) {
  let popupInformation = "";

  if (nationalInterestInformation != null && nationalInterestInformation.kulturmiljötyper != false) {

    //Ändrar miljötypen till riksintressets miljötyp
    if (nationalInterestInformation.kulturmiljötyper.includes(" ") || nationalInterestInformation.kulturmiljötyper.includes(",")) {
      popupInformation += `<p>Miljötyper: ${nationalInterestInformation.kulturmiljötyper}</p>`;
    }
    else {
      popupInformation += `<p>Miljötyp: ${nationalInterestInformation.kulturmiljötyper}</p>`;
    }
  }

  //Om information gällande län finns tillgängligt
  if (nationalInterestInformation != null && nationalInterestInformation.län != false) {
    //Ändrar län-texten till riksintressets län
    popupInformation += `<p>Län: ${nationalInterestInformation.län}</p>`;
  }
  //Om information gällande kommun finns tillgängligt
  if (nationalInterestInformation != null && nationalInterestInformation.kommun != false) {
    //Ändrar kommun-texten till riksintressets kommun
    popupInformation += `<p>Kommun: ${nationalInterestInformation.kommun}</p>`;
  }


  let popupHTMLInformation = `<div class='popup'><p class='name'>${nationalInterestInformation.namn}</p>${popupInformation} <p> ID: ${nationalInterestInformation.id}</p></div>`;

  //Lägger till en popup med namn, län, och kommun där användarens muspekare står
  L.popup()
    .setLatLng(e.latlng)
    .setContent(popupHTMLInformation)
    .openOn(map);
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
