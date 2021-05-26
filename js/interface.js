//När användaren klickar på att öppna/stänga kulturmiljötyper-listan
var selectedEnvironmentTypes = document.getElementById('culturalEnvironmentTypes');
selectedEnvironmentTypes.getElementsByClassName('anchor')[0].onclick = function (evt) {
  if (selectedEnvironmentTypes.classList.contains('visible'))
    selectedEnvironmentTypes.classList.remove('visible');
  else
    selectedEnvironmentTypes.classList.add('visible');
}

//Tar bort alla kulturmiljötyper-filters.
function resetFilterList() {
  environmentFilterList.length = 0;
  let fillFilter = document.getElementsByClassName("items")[0];
  fillFilter.innerHTML = "";
}

//Laddar in alla kulturmiljötyper till en array
function loadFilterList(element) {
  if (element != null && (element.hasOwnProperty("Kulturmiljötyper kursiverade i text") || element.hasOwnProperty("culturalEnvironmentTypes"))) {
    kulturSplit = "";
    if (element.hasOwnProperty("Kulturmiljötyper kursiverade i text")) {
      kulturSplit = element["Kulturmiljötyper kursiverade i text"].split(",");
    }
    else {
      kulturSplit = element["culturalEnvironmentTypes"].split(",");
    }
    kulturSplit.forEach(element => {
      element = String(element).trim().replace(".", "");
      element = element.charAt(0).toUpperCase() + element.slice(1);
      if (!environmentFilterList.includes(element) && element.length > 1 && !element.includes("Ingen information finns tillgänglig")) {
        environmentFilterList.push(element);
      }
    });
  }
}

//Fyller alla kulturmiljötyper till sidopanelen
function fillFilterList() {
  environmentFilterList.sort();
  let fillFilter = document.getElementsByClassName("items")[0];
  let filterHTMLBuilder = "";

  environmentFilterList.forEach(element => {
    filterHTMLBuilder += '<li><input type="checkbox" value="' + element + '" onclick="culturalEnvironmentFilter()"/>' + element + '</li>';
  });
  fillFilter.innerHTML = filterHTMLBuilder;
}

//När användaren klickar i/ur en kulturmiljötyp på sidopanelen
function culturalEnvironmentFilter() {
  let filteredNationalInterests = searchNationalInterests();
  dimAllLayers();
  if (filteredNationalInterests.length > 0) {
    filteredNationalInterests.forEach(layer => {
      highlightLayer(layer);
    });
  }
  else {
    resetAllLayers();
  }
}

//Uppdaterar texten uppe i högra hörnet för att visa hur många riksintressen sökningen ledde till
function showFoundInterests(filteredNationalInterests) {
  let searchResultText = document.getElementById("number-of-elements");
  if (filteredNationalInterests.length > 0) {
    searchResultText.innerText = "Vi hittade " + filteredNationalInterests.length + " " + (filteredNationalInterests.length != 1 ? "riksintressen" : "riksintresse") + " som matchade din filtrering.";
    searchResultText.style.visibility = 'visible';
  }
  else {
    searchResultText.style.visibility = 'hidden';
  }
}

//Laddar in alla kommuner till sidopanelen.
function loadMunicipalityList() {
  let countySearch = document.getElementById('county');
  if (countySearch.value.length == 0) {
    municipalityFilterList.length = 0;
    municipalityFilterList = [...LIST_OF_MUNICIPALITY];
  }

  municipalityFilterList.sort(function (a, b) {
    if (a.feature.properties.KnNamn < b.feature.properties.KnNamn) { return -1; }
    if (a.feature.properties.KnNamn > b.feature.properties.KnNamn) { return 1; }
    return 0;
  })
  municipalityElement.innerHTML = "";
  var municipalityListElement = document.createElement('option');
  municipalityListElement.innerHTML = "Kommun";
  municipalityListElement.value = "";
  municipalityElement.appendChild(municipalityListElement);

  municipalityFilterList.forEach(municipality => {
    var municipalityListElement = document.createElement('option');
    municipalityListElement.innerHTML = municipality.feature.properties.KnNamn;
    municipalityListElement.value = municipality.feature.properties.KnKod;
    municipalityElement.appendChild(municipalityListElement);
  });
}

//Öppnar ett riksintresse i result-table (sidopanelen)
function openInResultTable(id) {
  var coll = document.getElementsByClassName("collapsible");
  var i;
  for (i = 0; i < coll.length; i++) {
    if (coll[i].value == id) {
      coll[i].classList.add("highlight");
      coll[i].classList.add("active");
      var content = coll[i].nextElementSibling;
      openResult(content);
      setTimeout(function(){ coll[i].nextElementSibling.scrollIntoView({behavior: "smooth", block: "end"}); }, 250);
      break;
    }
  }
}

//Tar bort alla highlights i result-table
function resetHighlightResultTable() {
  var coll = document.getElementsByClassName("collapsible");
  var i;
  for (i = 0; i < coll.length; i++) {
    if (!coll[i].classList.contains("active")) {
      coll[i].classList.remove("highlight");
    }
  }
}

//Highlightar ett riksintresse i result-table
function highlightOnResultTable(geoElement) {
  resetHighlightResultTable();
  var coll = document.getElementsByClassName("collapsible");
  var i;
  var foundInResultTable = false;
  for (i = 0; i < coll.length; i++) {
    if (coll[i].value == geoElement.feature.properties.RI_id) {
      coll[i].classList.add("highlight");
      foundInResultTable = true;
    }
  }

  if (!foundInResultTable) {
    /*if (coll.length >= 8) {
      for (i = coll.length; i > 0; i--) {
        if (!coll[i - 1].classList.contains("active")) {
          removeInterestFromResultTable(i);
          break;
        }
      }
    }
    */

    let nationalInterestInformation = findConnectedInformation(geoElement);
    if (nationalInterestInformation != null) {
      addInterestToResultTable(nationalInterestInformation);
      coll[coll.length - 1].classList.add("highlight");
    }
  }
}

//Tar bort samtliga riksintressen från result-table om de inte är aktiva
function clearResultTable() {
  var coll = document.getElementsByClassName("collapsible");
  for (i = 0; i < coll.length - 1; i++) {
    if (!coll[i].classList.contains("active")) {
      coll[i].parentElement.remove();
    }
  }
}

//Tar bort ett riksintresse från result-table baserat på index
function removeInterestFromResultTable(index) {
  let resultTable = document.getElementById("result-table");
  resultTable.childNodes[index].remove();
}

//Lägger till ett riksintresse till result-table om det inte är highlightat
function addInterestToResultTable(nationalInterestInformation) {
  let alreadyInTable = false;
  let resultTable = document.getElementById("result-table");
  resultTable.childNodes.forEach(childNodes => {
    if (childNodes.childNodes[1] instanceof HTMLButtonElement) {
      if (childNodes.childNodes[1].value == nationalInterestInformation.id) {
        alreadyInTable = true;
      }
    }
  });
  if (!alreadyInTable) {
    let htmlResult = `
    <button type="button" onmouseleave="resetHighlightFromResultTable('${nationalInterestInformation.id}')" onmouseover="highlightFromResultTable('${nationalInterestInformation.id}')" value="${nationalInterestInformation.id}" class="collapsible">${nationalInterestInformation.name}</button>
        <div class="content">
        <a onclick=navigateToPoint("${nationalInterestInformation.id}")>
        <img alt="map icon" src="./mapicon.png"
          width=50" height="50">
        </a>
          <p class="title"><b>ID</b></p>
          <p class="result-id">${nationalInterestInformation.id}</p>
          <p class="title"><b>Län</b></p>
          <p>${nationalInterestInformation.county}</p>
          <p class="title"><b>Kommun</b></p>
          <p>${nationalInterestInformation.municipality}</p>
          ${nationalInterestInformation.culturalEnvironmentTypes != false ? '<p class="title"><b>Kulturmiljötyper</b></p><p>' + nationalInterestInformation.culturalEnvironmentTypes + '</p>' : ''}
          ${nationalInterestInformation.reason != false ? '<p class="title"><b>Motivering</b></p> <p>' + nationalInterestInformation.reason + '</p>' : ''}
          ${nationalInterestInformation.expression != false ? '<p class="title"><b>Uttryck</b></p><p>' + nationalInterestInformation.expression + '</p>' : ''}
          ${nationalInterestInformation.underInvestigation != false ? '<p class="title"><b>Utredningsområde</b></p><p>' + nationalInterestInformation.underInvestigation + '</p>' : ''}
          ${nationalInterestInformation.firstRevision != false ? '<p class="title"><b>Tidigare revidering</b></p><p>' + nationalInterestInformation.firstRevision + '</p>' : ''}
          ${nationalInterestInformation.latestRevision != false ? '<p class="title"><b>Senaste revidering</b></p><p>' + nationalInterestInformation.latestRevision + '</p>' : ''}  
        </div>`;
    let newResult = document.createElement('div');
    newResult.innerHTML = htmlResult;
    resultTable.append(newResult);
    addResultAnimation(nationalInterestInformation.id);
  }
  else {
    return false;
  }
}
//När användaren uppdaterar sökning av namn/id
const searchElement = document.querySelector('#search');
searchElement.addEventListener('change', (event) => {
  let filteredNationalInterests = searchNationalInterests();
  dimAllLayers();
  filteredNationalInterests.forEach(layer => {
    highlightLayer(layer);
  });

  if (filteredNationalInterests.length == 1) {
    let informationElement = searchNameAndID(filteredNationalInterests[0].feature.properties.NAMN);
    if (informationElement != null) {
      flyToRiksintresse(informationElement);
    }
  }
});

//När användaren uppdaterar sökning av län
const countyElement = document.querySelector('#county');
countyElement.addEventListener('change', () => {
  municipalityFilterList.length = 0;
  LIST_OF_MUNICIPALITY.forEach(municipality => {
    if (String(municipality.feature.properties.KnKod).substring(0, 2) == String(countyElement.value)) {
      municipalityFilterList.push(municipality);
    }
  });
  loadMunicipalityList();
  searchWithHighlight("county");
});

//När användaren uppdaterar sökning av kommun
const municipalityElement = document.querySelector('#municipality');
municipalityElement.addEventListener('change', () => {
  searchWithHighlight("municipality");
});

//Lägg till ett riksintresse i result-table
function addResultAnimation(id) {
  var coll = document.getElementsByClassName("collapsible");
  var i;
  window.originalClearTimeout = window.clearTimeout;
  for (i = 0; i < coll.length; i++) {
    if (coll[i].value == id) {
      coll[i].addEventListener("click", function () {
        this.classList.toggle("active");
        this.classList.toggle("highlight");
        var content = this.nextElementSibling;
        if (content.style.maxHeight) {
          content.style.maxHeight = null;
          content.style.visibility = "hidden";
        } else {
          if (content != null) {
            openResult(content);
          }
        }
      });
    }
  }
}

//Öppna ett resultat
function openResult(content) {
  content.style.maxHeight = content.scrollHeight + "px";
  content.style.visibility = "visible";
}

//Ändrar kartans storlek och result-table höjden när användaren ändrar webbläsarens storlek 
function redraw() {
  var full_width = $('body').width();
  var left_width = $('.sidepanel').width();
  var left_height = $('.sidepanel').height();
  $('#mapid').width(full_width - left_width - 1);
  $("#mapid").height(left_height);

  var resultElement = document.getElementById("result-table").getBoundingClientRect();
  document.getElementById("result-table").style.maxHeight = String(Math.round(window.innerHeight-resultElement.top)) + "px";
  var sidePanelElement = document.getElementsByClassName("sidepanel")[0];
  var anchorElement = document.getElementsByClassName("anchor")[0];
  var selectionElements = document.getElementsByClassName("selection");
  anchorElement.style.minWidth = String(sidePanelElement.offsetWidth - 95) + "px";
  for (let index = 0; index < selectionElements.length; index++) {
    const element = selectionElements[index];
      element.style.minWidth = String(sidePanelElement.offsetWidth - 90) + "px";
    
  }
  

}

function highlightFromResultTable(id) {
  map.eachLayer(function (geoElement) {
    if (geoElement.options.pane.className != undefined && (geoElement.options.pane.className.includes("leaflet-pane leaflet-nationalInterests-pane") && geoElement.hasOwnProperty("feature"))) {
      if (geoElement.feature.properties.RI_id == id) {
        highlightLayer(geoElement);
      }
    }
  });
}

function resetHighlightFromResultTable(id) {
  map.eachLayer(function (geoElement) {
    if (geoElement.options.pane.className != undefined && (geoElement.options.pane.className.includes("leaflet-pane leaflet-nationalInterests-pane") && geoElement.hasOwnProperty("feature"))) {
      if (geoElement.feature.properties.RI_id == id) {
        if (currentlyViewingAInterest != geoElement && filterLayers.includes(geoElement.feature.properties.RI_id) == false) {
          if (filterLayers.length == 0) {
            resetLayer(geoElement);
          }
          else {
            dimLayer(geoElement);
          }
        }
      }
    }
  });
}

