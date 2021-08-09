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
rhit.FB_KEY_AUTHOR = "author"
rhit.fbMovieQuotesManager = null;
rhit.fbSingleQuoteManager = null;
rhit.fbAuthManager = null;


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

		document.querySelector("#menuShowAllQuotes").onclick = (event) => {
				window.location.href= "/list.html";
		}
		document.querySelector("#menuShowMyQuotes").onclick = (event) => {
				window.location.href = `/list.html?uid=${rhit.fbAuthManager.uid}`;
		}
		document.querySelector("#menuSignOut").onclick = (event) => {
				rhit.fbAuthManager.signOut();
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

		document.querySelector("#menuSignOut").onclick = (event) => {
			rhit.fbAuthManager.signOut();
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
				window.location.href = "/list.html";
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

		if(rhit.fbSingleQuoteManager.author == rhit.fbAuthManager.uid) {
			document.querySelector("#menuEdit").style.display = "flex";
			document.querySelector("#menuDelete").style.display = "flex";
		}
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

	get author() {
		return this._documentSnapshot.get(rhit.FB_KEY_AUTHOR);
	}
}


rhit.FbMovieQuoteManager = class {
	constructor(uid) {
		this._documentSnapshots = [];
		this._ref = firebase.firestore().collection(rhit.FB_MOVIEQUOTE_COLLECTION);
		this._unsubscribe = null;
		this._uid = uid;
	}

	add(quote, movie){
		console.log(quote, movie);

		this._ref.add({
			[rhit.FB_KEY_QUOTE]: quote,
			[rhit.FB_KEY_MOVIE]: movie,
			[rhit.FB_KEY_AUTHOR]: rhit.fbAuthManager.uid,
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

		let query = this._ref.
		orderBy(rhit.FB_KEY_LAST_TOUCHED, "desc")
		.limit(30);

		if(this._uid) {
			query = query.where(rhit.FB_KEY_AUTHOR, "==", this._uid);
		}


		this._unsubscribe = query.onSnapshot((querySnapshot) => {
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

rhit.LoginPageController = class {
	constructor() {
		console.log("you have made the loginpagecontroller");
		document.querySelector("#rosefireButton").onclick = (event) => {
			rhit.fbAuthManager.signIn();
		}
	}

}

rhit.FBAuthManager = class {
	constructor() {
		this._user = null;
		console.log("you have made the auth manager");
	}

	beginListening(changeListener) {
		firebase.auth().onAuthStateChanged((user) => {
			this._user = user;
			changeListener();
		});

	}

	signIn() {
		console.log("TODO: Sign in using rosefire");

		Rosefire.signIn("7ced407f-62f9-46d7-9690-c404117558fb", (err, rfUser) => {
			if (err) {
				console.log("Rosefire error", err);
				return;
			}
			console.log("Rosefire success", rfUser);

		firebase.auth().signInWithCustomToken(rfUser.token).catch(function(error) {
			var errorCode = error.code; 
			var errorMessage = error.message; 
			if(errorCode === 'auth/invalid-custom-token') {
				alert("the token you provided is not valid")
			}
			else {
				console.error("Custom auth error", errorCode, errorMessage)
			}
		})
	});
	}
	signOut() {
		firebase.auth().signOut().catch((error) => {
			console.log("sign out error");
		})
	}
	get isSignedIn() {	
		return !!this._user;
	}
	get uid() {
		return this._user.uid;
	}
}

rhit.checkForRedirects = function() {
	console.log("in redirect page");
	if(document.querySelector("#loginPage") && rhit.fbAuthManager.isSignedIn) {
		window.location.href = "/list.html";
	}
	if(!document.querySelector("#loginPage") && !rhit.fbAuthManager.isSignedIn) {
		window.location.href = "/";
	}
}

rhit.initializePage = function() {
	const urlParams = new URLSearchParams(window.location.search);	

	if(document.querySelector("#mainPage")) {
		console.log("You are on the main page");
		//rhit.fbMovieQuoteManager
		const uid = urlParams.get("uid");
		//rhit.fbMovieQuoteManager		
		// new rhit.MainPageController();

	}

	if(document.querySelector("#listPage")){
		console.log("you are on the list page");
		const uid = urlParams.get("uid");
		console.log("got uid: ", uid);

		rhit.fbMovieQuotesManager = new rhit.FbMovieQuoteManager(uid);
		new rhit.ListPageController();
	}
	if(document.querySelector("#detailPage")){
		console.log("you are on the detail page");

		const movieQuoteId = urlParams.get("id");

		console.log(`Detail page for ${movieQuoteId}`);

		if(!movieQuoteId){
			console.log("ERROR!!! MISSING MOVIE QUOTE ID");
			window.location.href = "/";
		}

		rhit.fbSingleQuoteManager = new rhit.FbSingleQuoteManager(movieQuoteId);
		new rhit.DetailPageController();
	}
	if(document.querySelector("#loginPage")){
		console.log("you are on the loginPage");

		new rhit.LoginPageController();
	}

	// if(document.querySelector("#"))
}

/* Main */
/** function and class syntax examples */
rhit.main = function () {
	console.log("Ready");
	rhit.fbAuthManager = new rhit.FBAuthManager();
	rhit.fbAuthManager.beginListening((event) => {
		console.log("auth change callbakc fired. TODO: check for redirect and init the page");
		console.log("isSignedIn = ", rhit.fbAuthManager.isSignedIn);

		//check for redirects
		rhit.checkForRedirects();
		//page initializtation
		rhit.initializePage();
	})




};

rhit.main();
