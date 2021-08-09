/** namespace. */
var rhit = rhit || {};

// rhit.storage = rhit.storage || {};

// rhit.storage.MOVIEQUOTE_ID_KEY = "movieQuoteId";
// rhit.storage.getMovieQuoteId = function() {
// 	const mqId = sessionStorage.getItem(rhit.storage.MOVIEQUOTE_ID_KEY);
// 	if (!mqId) {
// 		console.log("no movie quote id in session storage");
// 	}
// 	return mqId;
// };
// rhit.storage.setMovieQuoteId = function(movieQuoteId) {
// 	sessionStorage.setItem(rhit.storage.MOVIEQUOTE_ID_KEY, movieQuoteId);
// };

/** globals */
rhit.variableName = "";


rhit.FB_MOVIEQUOTE_COLLECTION = "MovieQuotes";
rhit.FB_KEY_QUOTE = "quote";
rhit.FB_KEY_MOVIE = "movie";
rhit.FB_KEY_LAST_TOUCHED = "lastTouched";
rhit.fbMovieQuotesManager = null;
rhit.fbSingleQuoteManager = null;


function htmlToElement(html) {
	var template = document.createElement('template');
	html = html.trim();
	template.innerHTML = html;
	return template.content.firstChild;
}


rhit.ListPageController = class {
	constructor(){
		document.querySelector("#submitAddQuote").onclick = (event) => {
			const quote = document.querySelector("#inputQuote").value;
			const movie = document.querySelector("#inputMovie").value;

			rhit.fbMovieQuotesManager.add(quote, movie);	
		}

		$("#exampleModal").on("show.bs.modal", (event) => {
			//pre animation
			console.log("dialoge about to show");
			document.querySelector("#inputQuote").value = "";
			document.querySelector("#inputMovie").value = "";
		});
		$("#exampleModal").on("shown.bs.modal", (event) => {
			//post animation
			document.querySelector("#inputQuote").focus()
		});

		//start listening
		rhit.fbMovieQuotesManager.beginListening(this.updateList.bind(this));
	}

	_createCard(movieQuote){
		return htmlToElement(`<div id="quoteListContainer">
		<div class="card">
		  <div class="card-body">
			<h5 class="card-title">${movieQuote.quote}</h5>
			<h6 class="card-subtitle mb-2 text-muted">${movieQuote.movie}</h6>
		  </div>
		</div>
	  </div>`);
	}

	updateList(){
		console.log("I need to update the list of the page");
		console.log(`Num quotes = ${rhit.fbMovieQuotesManager.length}`);
		console.log(`Num quotes = `, rhit.fbMovieQuotesManager.getMovieQuoteAtIndex(0));

		// make a new quoteListContainer
		// fill the container with quotes using a loop
		const newList = htmlToElement('<div id="quoteListContainer"></div>');

		for(let i = 0; i < rhit.fbMovieQuotesManager.length; i++){
			const mq = rhit.fbMovieQuotesManager.getMovieQuoteAtIndex(i);
			const newCard = this._createCard(mq);

			newCard.onclick = (event) => {
				console.log(`you clicked on ${mq.id}`);
				//rhit.storage.setMovieQuoteId(mq.id);

				window.location.href = `/movieQuote.html?id=${mq.id}`;
			}

			newList.appendChild(newCard);
		}

		//remove old quoteListContainer
		const oldList = document.querySelector("#quoteListContainer");
		oldList.removeAttribute("id");

		oldList.hidden = true;
		//add in new quoteListContainer

		oldList.parentElement.appendChild(newList)
	}
}

rhit.MovieQuote = class {
	constructor(id, quote, movie) {
		this.id = id;
		this.quote = quote;
		this.movie = movie;
	}
}

rhit.DetailPageController = class {
	constructor() {
		
		console.log("Made detailPageController");

		document.querySelector("#submitEditQuote").onclick = (event) => {
			const quote = document.querySelector("#inputQuote").value;
			const movie = document.querySelector("#inputMovie").value;

			rhit.fbSingleQuoteManager.update(quote, movie);	
		}

		$("#editQuoteDialog").on("show.bs.modal", (event) => {
			//pre animation
			console.log("dialoge about to show");
			document.querySelector("#inputQuote").value = rhit.fbSingleQuoteManager.quote;
			document.querySelector("#inputMovie").value = rhit.fbSingleQuoteManager.movie;
		});
		$("#editQuoteDialog").on("shown.bs.modal", (event) => {
			//post animation
			document.querySelector("#inputQuote").focus()
		});

		document.querySelector("#submitDeleteQuote").onclick = (event) => {
			rhit.fbSingleQuoteManager.delete().then(function() {
				console.log("Document succesfully deleted");
				window.location.href = "/";
			}).catch(function(error) {
				console.error("Error removing docuemnt; ", error);
			});	

		}


		rhit.fbSingleQuoteManager.beginListening(this.updateView.bind(this));
	}
	updateView() {
		console.log("Updating view");
		document.querySelector("#cardQuote").innerHTML = rhit.fbSingleQuoteManager.quote;
		document.querySelector("#cardMovie").innerHTML = rhit.fbSingleQuoteManager.movie;
	}
}

rhit.FbSingleQuoteManager = class {
	constructor(movieQuoteId) {
		this._documentSnapshot = {};
		this._unsubscribe = null;
		this._ref = firebase.firestore().collection(rhit.FB_MOVIEQUOTE_COLLECTION).doc(movieQuoteId);

		console.log(`Listening to ${this._ref.path}`);
	}

	beginListening(changeListener){
		this._ref.onSnapshot((doc) => {
			if(doc.exists) {
				console.log("Document data: ", doc.data());
				this._documentSnapshot = doc;
				changeListener();
			} else {
				console.log("No such document");
			}
		})
	}

	stopListening(){
		this._unsubscribe();
	}

	update(quote, movie) {
		console.log("upate quote");

		this._ref.update({
			[rhit.FB_KEY_QUOTE]: quote,
			[rhit.FB_KEY_MOVIE]: movie,
			[rhit.FB_KEY_LAST_TOUCHED]: firebase.firestore.Timestamp.now(),
		}).then(() => {
			console.log("Document succesfully updated");
		}).catch(function(error) {
			console.error("Error updating docuemt: ", error);
		});
	}

	delete() {
		return this._ref.delete();
	}

	get quote() {
		return this._documentSnapshot.get(rhit.FB_KEY_QUOTE);
	}

	get movie() {
		return this._documentSnapshot.get(rhit.FB_KEY_MOVIE);
	} 
}


rhit.FbMovieQuoteManager = class {
	constructor() {
		this._documentSnapshots = [];
		this._ref = firebase.firestore().collection(rhit.FB_MOVIEQUOTE_COLLECTION);
		this._unsubscribe = null;
	}

	add(quote, movie){
		console.log(quote, movie);

		this._ref.add({
			[rhit.FB_KEY_QUOTE]: quote,
			[rhit.FB_KEY_MOVIE]: movie,
			[rhit.FB_KEY_LAST_TOUCHED]: firebase.firestore.Timestamp.now(), 
		})
		.then(function (docRef) {
			console.log("Document written with ID: ", docRef);
		})
		.catch(function(error) {
			console.error("Error adding to document: ", error);
		});

	}

	beginListening(changeListener){
		this._unsubscribe = this._ref.orderBy(rhit.FB_KEY_LAST_TOUCHED, "desc").limit(30).onSnapshot((querySnapshot) => {
			console.log("MovieQuotes Update");

			this._documentSnapshots = querySnapshot.docs;

			querySnapshot.forEach((doc) => {
				console.log(doc.data());

			});

			changeListener();
			

		});
	}

	stopListening() {
		this._unsubscribe();
	}
	// update(id, quote, movie){} 
	// delete(id){}
	get length() {
		return this._documentSnapshots.length;
	}
	getMovieQuoteAtIndex(index){
		const docSnapshot = this._documentSnapshots[index];
		const mq = new rhit.MovieQuote(
			docSnapshot.id,
			docSnapshot.get(rhit.FB_KEY_QUOTE),
			docSnapshot.get(rhit.FB_KEY_MOVIE),
		);
		return mq;
	}

}
/** function and class syntax examples */
rhit.functionName = function () {
	/** function body */
};

rhit.ClassName = class {
	constructor() {

	}

	methodName() {

	}
}

/* Main */
/** function and class syntax examples */
rhit.main = function () {
	console.log("Ready");


	if(document.querySelector("#listPage")){
		console.log("you are on the list page");
		rhit.fbMovieQuotesManager = new rhit.FbMovieQuoteManager();
		new rhit.ListPageController();
	}
	if(document.querySelector("#detailPage")){
		console.log("you are on the detail page");

		// const movieQuoteId = rhit.storage.getMovieQuoteId();

		const queryString = window.location.search;
		console.log(queryString);
		const urlParams = new URLSearchParams(queryString);
		const movieQuoteId = urlParams.get("id");

		console.log(`Detail page for ${movieQuoteId}`);

		if(!movieQuoteId){
			console.log("ERROR!!! MISSING MOVIE QUOTE ID");
			window.location.href = "/";
		}

		rhit.fbSingleQuoteManager = new rhit.FbSingleQuoteManager(movieQuoteId);
		new rhit.DetailPageController();
	}


};

rhit.main();
