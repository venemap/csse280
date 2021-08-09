/**
 * @fileoverview
 * Provides the JavaScript interactions for all pages.
 *
 * @author 
 * PUT_YOUR_NAME_HERE
 */

/** namespace. */
var rhit = rhit || {};

/** globals */
rhit.variableName = "";
rhit.gameCounter = 0;

/** function and class syntax examples */
rhit.functionName = function () {
	/** function body */
};

rhit.PageController = class {
	constructor() {
		this.game = new rhit.Game();
		console.log("hello");
		const cells = document.querySelectorAll(".btnGame");
		for (const cell of cells){
			cell.onclick = (event) => {
				const buttonIndex = parseInt(cell.dataset.index);
				this.game.pressedButtonAtIndex(buttonIndex);
				this.updateView();
				console.log(buttonIndex);
			}
		}

		document.querySelector("#newGameButton").onclick = (event) => {
			this.game = new rhit.Game()
			this.updateView();
			
		}

		this.updateView();
	}

	updateView() {
		const cells = document.querySelectorAll(".btnGame");
		cells.forEach((cell, index) => {
			cell.innerHTML = this.game.getMarkAtIndex(index);
			if(cell.innerHTML == "1") {
				cell.style.backgroundColor = "gold";
				cell.style.color = "black";	
			}
			else{
				cell.style.backgroundColor = "#424242";
				cell.style.color = "white";
			}
		});
		if(this.game.state == rhit.Game.GAME_STATE.WON){
			document.querySelector("#gameStateText").innerHTML = `You won in ${rhit.gameCounter} moves!`;
			return;
		}
		if(rhit.gameCounter == 0) document.querySelector("#gameStateText").innerHTML = "Make the buttons match";
		else if(rhit.gameCounter == 1) document.querySelector("#gameStateText").innerHTML = `You have taken ${rhit.gameCounter} move so far`;
		else document.querySelector("#gameStateText").innerHTML = `You have taken ${rhit.gameCounter} moves so far`;

	}
}

rhit.Game = class {

	static NUM_BUTTONS = 7;
	static LIGHT_STATE = {
		ON: "1",
		OFF: "0"
	}

	static GAME_STATE = {
		IN_PROGRESS: "0",
		WON: "1"
	}

	constructor() {
		this.board = [];
		this.state = rhit.Game.GAME_STATE.IN_PROGRESS;
		//Init construction of solved board
		for (let k = 0; k < 7; k++) {
			this.board.push(rhit.Game.LIGHT_STATE.ON);
		}
		this.randomize();
		rhit.gameCounter = 0;
	}

	randomize() {
		for (let i = 0; i < 15; i++){
			this.pressedButtonAtIndex(Math.floor(Math.random() * rhit.Game.NUM_BUTTONS));
		}

		//if the game starts as won, trivialy randomize
		if(this._checkForGameOver()) {
			this.state = rhit.Game.GAME_STATE.IN_PROGRESS;
			this.pressedButtonAtIndex(Math.floor(Math.random() * rhit.Game.NUM_BUTTONS));
		}
	}

	pressedButtonAtIndex(buttonIndex){
		if(this.state == rhit.Game.GAME_STATE.WON) return;
		//console.log(this.board);
		rhit.gameCounter += 1;

		this.swapState(buttonIndex);

		if(buttonIndex == 0){
			this.swapState(buttonIndex + 1);
			
		}
		else if(buttonIndex == 6){
			this.swapState(buttonIndex - 1);
		}
		else {
			this.swapState(buttonIndex-1);
			this.swapState(buttonIndex+1);
		}
		this._checkForGameOver()
	}

	swapState(buttonIndex) {
		if(this.board[buttonIndex] == rhit.Game.LIGHT_STATE.ON) 
			this.board[buttonIndex] = rhit.Game.LIGHT_STATE.OFF
		else this.board[buttonIndex] = rhit.Game.LIGHT_STATE.ON
	}

	_checkForGameOver(){
		let temp = "";
		for(let i = 0; i < rhit.Game.NUM_BUTTONS; i++){
			temp = temp.concat(this.board[i].toString())
		}

		if(temp == "0000000" || temp == "1111111") {
			this.state = rhit.Game.GAME_STATE.WON;
			return 1;
		}
	}

	getMarkAtIndex(buttonIndex){
		return this.board[buttonIndex]
	}

	getState() {
		return this.state;
	}
}




/* Main */
/** function and class syntax examples */
rhit.main = function () {
	console.log("Ready");
	new rhit.PageController();
};

rhit.main();
