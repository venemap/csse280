/**
 * @fileoverview
 * Provides the JavaScript interactions for all pages.
 *
 * @author 
 * Peter Venema
 */

var rhit = rhit || {};

rhit.map = [0,0];

rhit.updateView = function () {
	document.getElementById("currentLoc").innerHTML = `(${rhit.map})`;
	document.getElementById("pathHistory").innerHTML += `<li>(${rhit.map})</li>`;
};

/* Main */
/** function and class syntax examples */
rhit.main = function () {
	console.log("Ready");


	const buttons = document.querySelectorAll(".directional");

	for (const btn of buttons){
		btn.onclick = (event) => {
			const buttonDirection = parseInt(btn.dataset.index);
			switch(buttonDirection){
				case 0:
					rhit.map[0] += 1;
					break;
				case 1:
					rhit.map[1] -= 1;
					break;
				case 2:
					rhit.map[1] += 1;
					break;
				case 3:
					rhit.map[0] -= 1;
					break;
				default:
					console.log("invalid buttonPress");
					break;
			}
			rhit.updateView();
		}
	}
};

rhit.main();
