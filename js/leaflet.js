function createTriggerOnLoad() {
  GetData();
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
}

var style = {
  "color": "#ff7800",
  "weight": 5,
  "opacity": 0.65
};

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
      onEachFeature: onEachFeature,
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
function onEachFeature(feature, layer) {
  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight,
    click: OnClickEvent,
  });
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


/* // UI EVENTS \\ */
const searchElement = document.querySelector('#search');
searchElement.addEventListener('change', (event) => {
  searchNameAndID(event.target.value);
});

