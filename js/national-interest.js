class NationalInterest {
    constructor(element) {
        this.name = element.Namn_RI;
        this.id = element.RI_ID;
        this.reason = element.hasOwnProperty('motivering') ? element.motivering : "<i>Ingen information finns tillgänglig</i>";
        this.expression = element.hasOwnProperty('Uttryck_för_RI') ? element.Uttryck_för_RI : "<i>Ingen information finns tillgänglig</i>";
        this.culturalEnvironmentTypes = element.hasOwnProperty('Kulturmiljötyper kursiverade i text') ? element["Kulturmiljötyper kursiverade i text"] : "<i>Inget information finns tillgänglig</i>";
        this.culturalEnvironmentTypesParenthes = element.hasOwnProperty('Kulturmiljötyper inom prantes') ? element["Kulturmiljötyper inom prantes"] : false;
        this.county = element.hasOwnProperty('Län') ? element.Län : false;
        this.municipality = element.hasOwnProperty('Kn') ? element.Kn : false;
        this.firstRevision  = element.hasOwnProperty('Tidigare revidering RAÄ') ? element["Tidigare revidering RAÄ"] : "<i>Ingen information finns tillgänglig</i>";
        this.latestRevision = element.hasOwnProperty('Senast_reviderad') ? element.Senast_reviderad : false;
        if(element.hasOwnProperty('Utredningsområde')){
            this.underInvestigation = (element.Utredningsområde.includes("x")) ? true : false;
        }
        else{
            this.underInvestigation = false;
        }
    }
}