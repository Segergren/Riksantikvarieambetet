class NationalInterest {
    constructor(element) {
        this.namn = element.Namn_RI;
        this.id = element.RI_ID;
        this.motivering = element.hasOwnProperty('motivering') ? element.motivering : false;
        this.uttryck = element.hasOwnProperty('Uttryck_för_RI') ? element.Uttryck_för_RI : false;
        this.kulturmiljötyper = element.hasOwnProperty('Kulturmiljötyper kursiverade i text') ? element["Kulturmiljötyper kursiverade i text"] : false;
        this.kulturmiljötyperParantes = element.hasOwnProperty('Kulturmiljötyper inom prantes') ? element["Kulturmiljötyper inom prantes"] : false;
        this.län = element.hasOwnProperty('Län') ? element.Län : false;
        this.kommun = element.hasOwnProperty('Kn') ? element.Kn : false;
        this.förstaRevidering = element["Tidigare revidering RAÄ"];
        this.sistaRevidering = element.hasOwnProperty('Senast_reviderad') ? element.Senast_reviderad : false;
        if(element.hasOwnProperty('Utredningsområde')){
            this.utredningsområde = (element.Utredningsområde.includes("x")) ? true : false;
        }
        else{
            this.utredningsområde = false;
        }
    }
}