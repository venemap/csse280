/**
 * @fileoverview
 * Provides the JavaScript interactions for all pages.
 *
 * @author 
 * Peter Venema
 */

/** namespace. */
var rhit = rhit || {};

/** globals */
rhit.counter = 0;

rhit.updateFavNum = function(amt) {
  if(amt==0) rhit.counter = 0;
  else rhit.counter += amt;
	$("#counterLabel").html(`${rhit.counter}`);
};
rhit.updateFavColor = function(color) {
  console.log(color);
  element = $("#favoriteColorBox");
  element.css("backgroundColor", color)
  element.html(`${color}`);
}

/* Main */
/** function and class syntax examples */
rhit.main = function () {

	document.querySelector("#decButton").onclick = (event) => {
        rhit.updateFavNum(-1)
      };
    document.querySelector("#incButton").onclick = (event) => {
        rhit.updateFavNum(1)
      };
    document.querySelector("#resetButton").onclick = (event) => {
        rhit.updateFavNum(0);
      };
    document.querySelector("#blue").onclick = (event) => {
      rhit.updateFavColor("blue");
    }
    document.querySelector("#green").onclick = (event) => {
      rhit.updateFavColor("green");
    }
    document.querySelector("#red").onclick = (event) => {
      rhit.updateFavColor("red");
    }
    document.querySelector("#purple").onclick = (event) => {
      rhit.updateFavColor("purple");
    }
};

rhit.main();

