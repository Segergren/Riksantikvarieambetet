//Hämtar data från json-filen till variabeln jsonData
function GetRiksintresseData(){
    $.getJSON('https://o11.se/RAA/data.json', function(data){
        jsonData = data.data;
        LoadRiksintresseDataToArray(jsonData);
    });
}

//Lägger in NationalInterest-elementen till nationalInterests-arrayen
function LoadRiksintresseDataToArray(jsonData){
    jsonData.forEach(element => {
        if(element.hasOwnProperty('RI_ID')){
            //X
            let elementNumbers = element.RI_ID.replace(/[^0-9]/g, "");
            if(elementNumbers <= 9){
                element.RI_ID = element.RI_ID.replace(elementNumbers, "0" + elementNumbers);
            }
            
            element.RI_ID = element.RI_ID.replace(" och ",", ");
            let RI_IDArray = element.RI_ID.split(", ");
            if(RI_IDArray.length > 1){
                console.log(RI_IDArray);
            }

            RI_IDArray.forEach(RI_IDItem => {
                tempElement = element;
                tempElement.RI_ID = RI_IDItem;
                NATIONAL_INTERESTS.push(new NationalInterest(tempElement));
            });
        }
        else{
            NATIONAL_INTERESTS.push(new NationalInterest(element));
        } 
    });
}