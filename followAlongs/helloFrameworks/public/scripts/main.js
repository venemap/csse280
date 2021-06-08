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
rhit.variableName = "";
rhit.counter = 0;

/** function and class syntax examples */
rhit.functionName = function () {
	/** function body */
};
rhit.updateCounter = function(amt, isMult) {

	if (isMult){
		rhit.counter *= amt;
	} else{
		rhit.counter += amt;
	};
	//document.querySelector("#counter").innerHTML = `Count = ${rhit.counter}`;
	$("#counter").html(`Count = ${rhit.counter}`);
};

/* Main */
/** function and class syntax examples */
rhit.main = function () {

	console.log("Ready");
	const buttons = document.querySelectorAll("#counterButtons button");

	// for (const button of buttons){
	// 	button.onclick = (event) => {
	// 		const dataAmount = parseInt(button.dataset.amount);
	// 		const dataIsMultiplication = button.dataset.isMultiplication;
	// 		// console.log(`Amount: ${dataAmount} isMult: ${dataIsMultiplication}`);

	// 		rhit.updateCounter(dataAmount, dataIsMultiplication)
	// 	};
	// };
	
	$("#counterButtons button").click((event) => {
		const dataAmount = $(event.target).data("amount");
		const dataIsMultiplication = !!$(event.target).data("isMultiplication");
		// console.log(`Amount: ${dataAmount} isMult: ${dataIsMultiplication}`);
		rhit.updateCounter(dataAmount, dataIsMultiplication);
	})
};

rhit.main();

