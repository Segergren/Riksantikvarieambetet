const NATIONAL_INTERESTS = [];
let LIST_OF_COUNTIES = [];
let LIST_OF_LANDSCAPE = [];
let LIST_OF_MUNICIPALITY = [];
let LIST_OF_LAYERS = [];
var map = CreateNewMap();
AddBackgroundMap();
window.onload = createTriggerOnLoad();

var coll = document.getElementsByClassName("collapsible");
var i;

for (i = 0; i < coll.length; i++) {
  coll[i].addEventListener("click", function() {
    this.classList.toggle("active");
    var content = this.nextElementSibling;
    if (content.style.maxHeight){
      content.style.maxHeight = null;
      setTimeout(function(){ 
        content.style.visibility = "hidden";
       }, 200);
    } else {
      content.style.maxHeight = content.scrollHeight + "px";
      content.style.visibility = "visible"; 
    }
  });
}