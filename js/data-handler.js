//Hämtar data från json-filen till variabeln jsonData
function getRiksintresseData() {
    $.getJSON('https://o11.se/RAA/data.json', function (data) {
        jsonData = data.data;
        loadRiksintresseDataToArray(jsonData);
    });
}
//Lägger in NationalInterest-elementen till nationalInterests-arrayen
function loadRiksintresseDataToArray(jsonData) {
    jsonData.forEach(element => {
        if (element.hasOwnProperty('RI_ID')) {
            //X
            let elementNumbers = element.RI_ID.replace(/[^0-9]/g, "");
            if (elementNumbers <= 9) {
                element.RI_ID = element.RI_ID.replace(elementNumbers, "0" + elementNumbers);
            }

            element.RI_ID = element.RI_ID.replace(" och ", ", ");
            let RI_IDArray = element.RI_ID.split(", ");
            if (RI_IDArray.length > 1) {
                console.log(RI_IDArray);
            }

            RI_IDArray.forEach(RI_IDItem => {
                tempElement = element;
                tempElement.RI_ID = RI_IDItem;
                NATIONAL_INTERESTS.push(new NationalInterest(tempElement));
            });
        }
        else {
            NATIONAL_INTERESTS.push(new NationalInterest(element));
        }

        loadFilterList(element);
    });
    fillFilterList();
}

function loadMunicipalityList(){
    let countySearch = document.getElementById('county');
    if(countySearch.value.length == 0){
        municipalityFilterList.length = 0;
        municipalityFilterList = [...LIST_OF_MUNICIPALITY];
    }

    municipalityFilterList.sort(function(a, b){
        if(a.feature.properties.KnNamn < b.feature.properties.KnNamn) { return -1; }
        if(a.feature.properties.KnNamn > b.feature.properties.KnNamn) { return 1; }
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

function resetFilterList(){
    environmentFilterList.length = 0;
    let fillFilter = document.getElementsByClassName("items")[0];
    fillFilter.innerHTML = "";
}

function loadFilterList(element){
    if (element != null && (element.hasOwnProperty("Kulturmiljötyper kursiverade i text") || element.hasOwnProperty("culturalEnvironmentTypes"))) {
        kulturSplit = "";
        if(element.hasOwnProperty("Kulturmiljötyper kursiverade i text")){
            kulturSplit = element["Kulturmiljötyper kursiverade i text"].split(",");
        }
        else{
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

function fillFilterList(){
    environmentFilterList.sort();
    let fillFilter = document.getElementsByClassName("items")[0];
    let filterHTMLBuilder = "";
    
    environmentFilterList.forEach(element => {
        filterHTMLBuilder += '<li><input type="checkbox" value="' + element + '" onclick="culturalEnvironmentFilter()"/>' + element + '</li>';
    });
    fillFilter.innerHTML = filterHTMLBuilder;
}