const NATIONAL_INTERESTS = [];
let LIST_OF_COUNTIES = [];
let LIST_OF_LANDSCAPE = [];
let LIST_OF_MUNICIPALITY = [];
let LIST_OF_LAYERS = [];
var map = CreateNewMap();
AddBackgroundMap();
window.onload = createTriggerOnLoad();

$(document).ready(function () {
  redraw();
});

$(window).resize(function () {
  redraw();
});

let documentHeight = 0;
window.setInterval(function () {
  if (documentHeight != $('.sidepanel').height()) {
    documentHeight = $('.sidepanel').height();
  }
  redraw();
}, 100);
