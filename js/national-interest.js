class NationalInterest {
    constructor(element) {
        this.name = element.Namn_RI;
        this.id = element.RI_ID;
        this.reason = element.hasOwnProperty('motivering') ? element.motivering : "<i>Ingen information finns tillgänglig</i>";
        this.expression = element.hasOwnProperty('Uttryck_för_RI') ? element.Uttryck_för_RI : "<i>Ingen information finns tillgänglig</i>";
        this.culturalEnvironmentTypes = element.hasOwnProperty('Kulturmiljötyper kursiverade i text') ? element["Kulturmiljötyper kursiverade i text"] : "<i>Ingen information finns tillgänglig</i>";
        this.culturalEnvironmentTypesParenthes = element.hasOwnProperty('Kulturmiljötyper inom prantes') ? element["Kulturmiljötyper inom prantes"] : false;
        this.county = element.hasOwnProperty('Län') ? element.Län : false;
        this.municipality = element.hasOwnProperty('Kn') ? element.Kn : false;
        this.firstRevision = element.hasOwnProperty('Tidigare revidering RAÄ') ? convertDateFormat(element["Tidigare revidering RAÄ"]) : "<i>Ingen information finns tillgänglig</i>";
        this.latestRevision = element.hasOwnProperty('Senast_reviderad') ? convertDateFormat(element.Senast_reviderad) : false;
        if (element.hasOwnProperty('Utredningsområde')) {
            this.underInvestigation = (element.Utredningsområde.includes("x")) ? "Ja" : "Nej";
        }
        else {
            this.underInvestigation = false;
        }
    }
}
function convertDateFormat(inDate) {
    try {
        var splittedDate = inDate.split("/");
        splittedDate[2] > String(new Date().getFullYear()).substring(0, 2) ? splittedDate[2] = "19" + splittedDate[2] : splittedDate[2] = "20" + splittedDate[2];
        var convertedDate = new Date(`${splittedDate[2]}-${splittedDate[0]}-${splittedDate[1]}`);
        return convertedDate.toISOString().slice(0, 10);
    }
    catch {
        return inDate;
    }
}