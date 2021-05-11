class NationalInterest {
    constructor(element) {
        this.name = element.Namn_RI;
        this.id = element.RI_ID;
        this.reason = element.hasOwnProperty('motivering') ? element.motivering : false;
        this.expression = element.hasOwnProperty('Uttryck_för_RI') ? element.Uttryck_för_RI : false;
        this.culturalEnvironmentTypes = element.hasOwnProperty('Kulturmiljötyper kursiverade i text') ? element["Kulturmiljötyper kursiverade i text"] : false;
        this.culturalEnvironmentTypesParenthes = element.hasOwnProperty('Kulturmiljötyper inom prantes') ? element["Kulturmiljötyper inom prantes"] : false;
        this.county = element.hasOwnProperty('Län') ? element.Län : false;
        this.municipality = element.hasOwnProperty('Kn') ? element.Kn : false;
        this.firstRevision  = element["Tidigare revidering RAÄ"];
        this.latestRevision = element.hasOwnProperty('Senast_reviderad') ? element.Senast_reviderad : false;
        if(element.hasOwnProperty('Utredningsområde')){
            this.underInvestigation = (element.Utredningsområde.includes("x")) ? true : false;
        }
        else{
            this.underInvestigation = false;
        }
    }
}