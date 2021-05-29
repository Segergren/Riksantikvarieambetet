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
let documentHeight = 0;
window.setInterval(function () {
  if (documentHeight != $('.sidepanel').height()) {
    documentHeight = $('.sidepanel').height();
    redraw();
  }
}, 1000);
