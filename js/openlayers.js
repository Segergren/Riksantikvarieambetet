function CreateNewMap() {
  return map = new ol.Map({
    target: 'map',
    layers: [
      new ol.layer.Tile({
        source: new ol.source.OSM()
      })
    ],
    view: new ol.View({
      projection: ol.proj.get('EPSG:3006'),
      center: ol.proj.fromLonLat([37.41, 8.82]),
      zoom: 4
    })
  });
}

//Fyller kartan med polygoner
function FillMap() {

    new ol.layer.Vector({
        title: 'added Layer',
        source: new ol.source.GeoJSON({
           projection : 'EPSG:3006',
           url: 'https://o11.se/RAA/geojson.geojson'
    })
  });
}

function createTriggerOnLoad() {

  //När bakgrundskartan har laddat klart
  map.on('style.load', function () {
    FillMap();
    AddNavigationControl();
    ChangeCursor('default');
    GetData();
  });

  //Lägger till zoom-kontroller uppe till höger.
  function AddNavigationControl() {
    map.addControl(new mapboxgl.NavigationControl());
  }

  //Ändrar muspekare till vanlig
  function ChangeCursor(cursorType) {
    map.getCanvas().style.cursor = cursorType;
  }

  //Tar in namn och id över hoverad riksintresse samt vissar upp den.
  function ShowHoverInfo(name, id) {
    let overlay = document.getElementById('map-overlay');
    overlay.innerHTML = `<p><b>${name}</b></p> 
                         <p>${id}</p>`;
    overlay.style.display = 'block';
  }

  //Gömmer hover-rutan
  function HideHoverInfo() {
    let overlay = document.getElementById('map-overlay');
    overlay.style.display = 'none';
  }

  //Malcolm gör ändringar --------------

  function FindConnectedInformation(e) {
    let selectedInformation;
    NATIONAL_INTERESTS.forEach(element => {
      if (String(e.RI_id) == String(element.id)) {
        selectedInformation = element;
      }
    });
    return selectedInformation;
  }


  function OnClickEvent(elementInformation, e) {
    let nationalInterestInformation = FindConnectedInformation(elementInformation);
    ShowPopUp(nationalInterestInformation, e);


  }

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
    new mapboxgl.Popup()
      .setLngLat(e.lngLat)
      .setHTML(popupHTMLInformation)
      .addTo(map);
  }



  //Kontrollerar om muspekaren går över ett riksintresse.
  map.on('mousemove', 'Riksintressen', function (e) {
    let elementInformation = e.features[0].properties;
    if (e.features.length > 0) {
      ChangeCursor('pointer');
      ShowHoverInfo(elementInformation.NAMN, elementInformation.RI_id);
    }
  });


  //När användaren rör musen ifrån ett riksintresse, 
  //byter muspekare till deafault peakare.
  //Samt gömmer hover-rutan
  map.on('mouseleave', 'Riksintressen', function () {
    ChangeCursor('default');
    HideHoverInfo();
  });

  //När användaren klickar på en polygon (riksintresse)
  map.on('click', 'Riksintressen', function (e) {

    let elementInformation = e.features[0].properties;
    OnClickEvent(elementInformation, e)


    /*
      var selectedInformation = null;
      let elementInformation = e.features[0].properties;
      //Itererar igenom alla riksintressen i JSON-filen
      NATIONAL_INTERESTS.forEach(element => {
          //Om riksintressets ID stämmer överens med riksintressets ID vid Index.
          if(String(elementInformation.RI_id).includes(String(element.id)) || String(element.id).includes(String(elementInformation.RI_id))){
            //Sätt riksintresset vid index till funktionsvariabeln selectedJSON.
            selectedInformation = element;
          }
      });
    
      //Ändrar titeln till riksintressets namn
      let popupInformation = "<div class='popup'><p class='name'>" + e.features[0].properties.NAMN + "</p>";
    
      if(selectedInformation != null && selectedInformation.kulturmiljötyper != false){
        
        //Ändrar miljötypen till riksintressets mijötyp
        if(selectedInformation.kulturmiljötyper.includes(" ") || selectedInformation.kulturmiljötyper.includes(",")){
          popupInformation += "<p>Miljötyper: " + selectedInformation.kulturmiljötyper  + "</p>";
        }
        else{
          popupInformation += "<p>Miljötyp: " + selectedInformation.kulturmiljötyper  + "</p>";
        }
      }
    
      //Om information gällande län finns tillgängligt
      if(selectedInformation != null && selectedInformation.län != false){
        //Ändrar län-texten till riksintressets län
        popupInformation += "<p>Län: " + selectedInformation.län  + "</p>";
      }
      //Om information gällande kommun finns tillgängligt
      if(selectedInformation != null && selectedInformation.kommun != false){
        //Ändrar kommun-texten till riksintressets kommun
        popupInformation += "<p>Kommun: " + selectedInformation.kommun + "</p>";
      }
      popupInformation += "</div>";
    
      //Lägger till en popup med namn, län, och kommun där användarens muspekare står
      new mapboxgl.Popup()
        .setLngLat(e.lngLat)
        .setHTML(popupInformation)
        .addTo(map);
    
      /* Ändrar texten under kartan */
    /*
    document.getElementById("name").innerText = e.features[0].properties.NAMN;
    document.getElementById("id").innerText = e.features[0].properties.RI_id;
  
    //Om beskrivning gällande riksintresset är tillgängligt
    if(selectedInformation != null && selectedInformation.uttryck != false){
      //Byt beskrivningen under kartan till riksintressets beskrivning
      document.getElementById("description").innerText = selectedInformation.uttryck;
    }
    else{
      if(selectedInformation != null){
        //Om motivering till "varför beskrivning ej finns tillgängligt", finns tillgänglig
        if(selectedInformation.motivering != false){
          //Skriv ut att beskrivning exkluderas samt motivering
          document.getElementById("description").innerText = "Information exkluderad.\n" + selectedInformation.motivering;
        }
        else{
          //Skriv ut att beskrivning exkluderas
          document.getElementById("description").innerText = "Information exkluderad.";
        }
      }
      else{
        //Skriv ut att beskrivning exkluderas
        document.getElementById("description").innerText = "Information exkluderad.";
      }
    }
  
    HideHoverInfo();
    */
  });

}
