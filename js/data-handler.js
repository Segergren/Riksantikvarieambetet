//Hämtar data från json-filen till variabeln jsonData
function GetData(){
    $.getJSON('https://o11.se/RAA/data.json', function(data){
        jsonData = data.data;
        LoadDataToArray(jsonData);
    });
}

//Lägger in NationalInterest-elementen till nationalInterests-arrayen
function LoadDataToArray(jsonData){
    jsonData.forEach(element => {
        NATIONAL_INTERESTS.push(new NationalInterest(element));
    });
}