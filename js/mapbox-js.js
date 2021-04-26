/*
  API-dokumentation
  https://docs.mapbox.com/mapbox-gl-js/api/
*/

//API-nyckel
mapboxgl.accessToken = 'pk.eyJ1Ijoib2xsZXNlZ2VyZ3JlbiIsImEiOiJja25rM2NpdWkwN2Z2MnFwbjJlbW45bHRqIn0.EXeF-Oh9YK5qGLpR_z0ruA';

/*Skapar en ny karta med "outdoors" som backgrundskarta.
  Användaren startar från mitten av Sverige med zoom 6
*/
var map = new mapboxgl.Map({
container: 'map',
style: 'mapbox://styles/mapbox/outdoors-v11', 
center: [16.321998712,62.38583179],
zoom: 6,
minZoom: 3.6
});


jsonDATA = null;

//När bakgrundskartan har laddat klart
map.on('style.load', function () {

    //Fyller kartan med polygoner
    map.addLayer({
            "id": "Riksintressen",
            "type": "fill",
            "source": {
                type: 'vector',
                url: 'mapbox://ollesegergren.0gutz198'
              },
            'source-layer': 'data_och_underlag_projektuppg-4rxszy',
            'minzoom':5,
            "paint": {
              "fill-color": "#e6a72e",
              "fill-opacity": 0.5
            }
        });
    //Lägger till zoom-kontroller uppe till höger.
    map.addControl(new mapboxgl.NavigationControl());
    //Ändrar muspekare till vanlig
    map.getCanvas().style.cursor = 'default';

    //Hämtar all informationsdata och returnerar det till instansvariabeln jsonDATA
    $.getJSON('https://o11.se/RAA/data.json', function(data){
        jsonDATA = data.data;
    });

    //Tar bort MapBox-logotypen
    document.getElementsByClassName("mapboxgl-ctrl-logo")[0].remove();
    //document.getElementsByClassName("mapboxgl-ctrl-bottom-right")[0].remove();
});

//Lagrar vilket riksintresse som användaren hovrar över
var hoveredRiksintresse = null;

//När användaren rör musen
map.on('mousemove', 'Riksintressen', function (e) {
  
  //Om musen är över ett riksintresse
  if (e.features.length > 0) {
    if (hoveredRiksintresse !== null) {
      //TODO: Kontrollera
      map.setFeatureState(
        { source: 'Riksintressen', id: hoveredRiksintresse, sourceLayer: "data_och_underlag_projektuppg-4rxszy" },
        { hover: false }
      );
    }

    //Lagrar riksintresset som användaren hovrar över
    hoveredRiksintresse = e.features[0].properties.RI_id;

    //Byter muspekare för att visa användaren att det går att klicka på polygonen
    map.getCanvas().style.cursor = 'pointer';

    //Ändrar texten på hover-rutan uppe i vänstra hörnet till namn samt ID.
    var overlay = document.getElementById('map-overlay');
    overlay.innerHTML = "<p><b>" + e.features[0].properties.NAMN + "</b></p>" + 
                        "<a>" + e.features[0].properties.RI_id + "</a>";
    //Visar hover-rutan
    overlay.style.display = 'block';
    //TODO: Kontrollera
    map.setFeatureState(
      { source: 'Riksintressen', id: hoveredRiksintresse, sourceLayer: "data_och_underlag_projektuppg-4rxszy"},
      { hover: true }
    );
  }
});

//När användaren rör musen ifrån ett riksintresse
map.on('mouseleave', 'Riksintressen', function () {
  //Byt muspekare till vanlig
  map.getCanvas().style.cursor = 'default';
  //Gömmer hover-rutan
  var overlay = document.getElementById('map-overlay');
  overlay.style.display = 'none';
});

//När användaren klickar på en polygon (riksintresse)
map.on('click', 'Riksintressen', function (e) {
  //Skapar en funktionsvariabel
  selectedJSON = null;

  //Itererar igenom alla riksintressen i JSON-filen
  jsonDATA.forEach(element => {
      //Om riksintressets ID stämmer överens med riksintressets ID vid Index.
      if(String(e.features[0].properties.RI_id).includes(String(element.RI_ID)) || String(element.RI_ID).includes(String(e.features[0].properties.RI_id))){
        //Sätt riksintresset vid index till funktionsvariabeln selectedJSON.
        selectedJSON = element;
      }
  });

  //Loggar nuvarande polygon, TA BORT SENARE
  console.log(selectedJSON);
  console.log(e.features[0].properties.RI_id);

  //Ändrar titeln till riksintressets namn
  areaInformation = "<div class='popup'><p class='name'>" + e.features[0].properties.NAMN + "</p>";
  
  //Om information gällande län finns tillgängligt
  if(selectedJSON != null && selectedJSON.hasOwnProperty('Län')){
    //Ändrar län-texten till riksintressets län
    areaInformation += "<p>Län: " + selectedJSON.Län  + "</p>";
  }
  //Om information gällande kommun finns tillgängligt
  if(selectedJSON != null && selectedJSON.hasOwnProperty('Kn')){
    //Ändrar kommun-texten till riksintressets kommun
    areaInformation += "<p>Kommun: " + selectedJSON.Kn + "</p>";
  }
  areaInformation += "</div>";

  //Lägger till en popup med namn, län, och kommun där användarens muspekare står
  new mapboxgl.Popup()
    .setLngLat(e.lngLat)
    .setHTML(areaInformation)
    .addTo(map);

  /* Ändrar texten under kartan */

  document.getElementById("name").innerText = e.features[0].properties.NAMN;
  document.getElementById("id").innerText = e.features[0].properties.RI_id;

  //Om beskrivning gällande riksintresset är tillgängligt
  if(selectedJSON != null && selectedJSON.hasOwnProperty('Uttryck_för_RI')){
    //Byt beskrivningen under kartan till riksintressets beskrivning
    document.getElementById("description").innerText = selectedJSON.Uttryck_för_RI;
  }
  else{
    //Om motivering till "varför beskrivning ej finns tillgängligt", finns tillgänglig
    if(selectedJSON.hasOwnProperty('Motivering')){
      //Skriv ut att beskrivning exkluderas samt motivering
      document.getElementById("description").innerText = "Information exkluderad.\n" + selectedJSON.Motivering;
    }
    else{
      //Skriv ut att beskrivning exkluderas
      document.getElementById("description").innerText = "Information exkluderad.";
    }
  }

  //Gömmer hover-rutan
  var overlay = document.getElementById('map-overlay');
  overlay.style.display = 'none';
});