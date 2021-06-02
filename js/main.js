const NATIONAL_INTERESTS = [];
let LIST_OF_COUNTIES = [];
let LIST_OF_MUNICIPALITY = [];
let LIST_OF_LAYERS = [];
var map = CreateNewMap();
AddBackgroundMap();
window.onload = getRiksintresseData();

//Ändra kartans storlek när hemsidan laddats klart. 
$(document).ready(function () {
  redraw();
});

//Ändra kartans storlek när användaren ändrar storlek på webbplatsen
$(window).resize(function () {
  redraw();
});

//Gör så att höjden på kartan blir lika lång som hemsidan är.
window.setInterval(function () {
    redraw();
}, 1000);
