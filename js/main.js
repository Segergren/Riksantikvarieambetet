const NATIONAL_INTERESTS = [];
let LIST_OF_COUNTIES = [];
let LIST_OF_LANDSCAPE = [];
let LIST_OF_MUNICIPALITY = [];
let LIST_OF_LAYERS = [];
var map = CreateNewMap();
AddBackgroundMap();
window.onload = createTriggerOnLoad();

function addResultAnimation(id) {
  var coll = document.getElementsByClassName("collapsible");
  var i;
  window.originalClearTimeout = window.clearTimeout;
  for (i = 0; i < coll.length; i++) {
    if (coll[i].value == id) {
      coll[i].addEventListener("click", function () {
        this.classList.toggle("active");
        var content = this.nextElementSibling;
        if (content.style.maxHeight) {
          content.style.maxHeight = null;
          content.style.visibility = "hidden";
        } else {
          if (content != null) {
            openResult(content);
          }
        }
      });
    }
  }
}

function openResult(content) {
  content.style.maxHeight = content.scrollHeight + "px";
  content.style.visibility = "visible";
}