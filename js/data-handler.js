//Hämtar data från json-filen till variabeln jsonData
function GetRiksintresseData() {
    $.getJSON('https://o11.se/RAA/data.json', function (data) {
        jsonData = data.data;
        LoadRiksintresseDataToArray(jsonData);
    });
}
//Lägger in NationalInterest-elementen till nationalInterests-arrayen
function LoadRiksintresseDataToArray(jsonData) {

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

        if (element.hasOwnProperty("Kulturmiljötyper kursiverade i text")) {
            let kulturSplit = element["Kulturmiljötyper kursiverade i text"].split(",");
            kulturSplit.forEach(element => {
                element = String(element).trim().replace(".", "");
                element = element.charAt(0).toUpperCase() + element.slice(1);
                if (!environmentFilterList.includes(element) && element.length > 1) {
                    environmentFilterList.push(element);
                }
            });
        }

    });
    environmentFilterList.sort();
    let fillFilter = document.getElementsByClassName("items")[0];
    let filterHTMLBuilder = "";
    environmentFilterList.forEach(element => {
        filterHTMLBuilder += '<li><input type="checkbox" onclick="culturalEnvironmentFilter()"/>' + element + '</li>';
    });
    fillFilter.innerHTML = filterHTMLBuilder;
}