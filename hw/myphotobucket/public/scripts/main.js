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

rhit.FB_IMAGECOLLECTION = "photobuckets";
rhit.FB_KEY_IMAGEURL = "imageUrl";
rhit.FB_KEY_CAPTION = "caption";
rhit.FB_KEY_LAST_TOUCHED = "lastTouched";
rhit.FB_KEY_AUTHOR = "author";
rhit.fbImageCaptionManager = null;
rhit.fbSingleImageCaptionManager = null;


function htmlToElement(html) {
	var template = document.createElement('template');
	html = html.trim();
	template.innerHTML = html;
	return template.content.firstChild;
}

rhit.ListPageController = class {
	constructor() {
		document.querySelector("#submitAddImage").onclick = (event) => {
			const url = document.querySelector("#inputURL").value;
			const caption = document.querySelector("#inputCaption").value;
			rhit.fbImageCaptionManager.add(url, caption);
		}

		document.querySelector("#menuShowAllQuotes").onclick = (event) => {
				window.location.href= "/index.html";
		}
		document.querySelector("#menuShowMyQuotes").onclick = (event) => {
				window.location.href = `index.html?uid=${rhit.fbAuthManager.uid}`;
		}
		document.querySelector("#menuSignOut").onclick = (event) => {
				rhit.fbAuthManager.signOut();
		}

		$("#exampleModal").on("show.bs.modal", (event) => {
			//pre animation
			console.log("dialoge about to show");
			document.querySelector("#inputURL").value = "";
			document.querySelector("#inputCaption").value = "";
		});
		$("#exampleModal").on("shown.bs.modal", (event) => {
			//post animation
			document.querySelector("#inputURL").focus()
		});

		rhit.fbImageCaptionManager.beginListening(this.updateList.bind(this));

	}
	_createPin(imageCaption){
		return htmlToElement(`
		<div class="pin" id="${imageCaption.id}">
			<img
				src="${imageCaption.url}"
				alt="TODO: FIX">
			<p class="caption">${imageCaption.caption}</p>
		</div>
		`);
	}

	updateList() {
		console.log("I need to update the list of the page");
		console.log(`Num quotes = ${rhit.fbImageCaptionManager.length}`);
		console.log(`Quote: `, rhit.fbImageCaptionManager.getImageAtIndex(0));

		const newList = htmlToElement('<div id="columns"></div>');

		for(let i = 0; i < rhit.fbImageCaptionManager.length; i++) {
			const im = rhit.fbImageCaptionManager.getImageAtIndex(i);
			const newPin = this._createPin(im);

			newPin.onclick = (event) => {
				console.log(`you clicked on ${im.id}`);

				window.location.href = `/image.html?id=${im.id}`;
			}

			newList.appendChild(newPin);
		}

		const oldList = document.querySelector("#columns");
		oldList.removeAttribute("id");

		oldList.hidden = true;

		oldList.parentElement.appendChild(newList);
	}

}

rhit.Image = class {
	constructor(id, url, caption) {
		this.id = id; 
		this.url = url;
		this.caption = caption;
	}
}

rhit.DetailPageController = class {
	constructor() {
		console.log("Made detailPageController");

		document.querySelector("#submitEditCaption").onclick = (event) => {
			console.log(document.querySelector("#editCaption"));
			const caption = document.querySelector("#editCaption").value;

			rhit.fbSingleImageCaptionManager.update(caption);
		}

	document.querySelector("#menuSignOut").onclick = (event) => {
			rhit.fbAuthManager.signOut();
	}

		$("#editCaptionDialog").on("show.bs.modal", (event) => {
			//pre animation
			console.log("dialoge about to show");
			document.querySelector("#editCaption").value = rhit.fbSingleImageCaptionManager.caption;
		});
		$("#editCaptionDialog").on("shown.bs.modal", (event) => {
			//post animation
			document.querySelector("#editCaption").focus()
		});

		document.querySelector("#submitDeleteImage").onclick = (event) => {
			rhit.fbSingleImageCaptionManager.delete().then(function() {
				console.log("Document succesfully deleted");
				window.location.href = "/";
			})
			.catch(function(error) {
				console.error("Error removing document: ", error);
			});

		}
		rhit.fbSingleImageCaptionManager.beginListening(this.updateView.bind(this));
	}
	updateView() {
		console.log("Updating View");
		console.log("URL: ", rhit.fbSingleImageCaptionManager.url);
		document.querySelector("#singleImage").src = rhit.fbSingleImageCaptionManager.url;
		document.querySelector(".caption").innerHTML = rhit.fbSingleImageCaptionManager.caption;

		if(rhit.fbSingleImageCaptionManager.author == rhit.fbAuthManager.uid) {
			document.querySelector("#menuEdit").style.display = "flex";
			document.querySelector("#menuDelete").style.display = "flex";
		}
	}
}

rhit.FbSingleImageCaptionManager = class {
	constructor(imageCaptionId) {
		this._documentSnapshot = {};
		this._unsubscribe = null;
		this._ref = firebase.firestore().collection(rhit.FB_IMAGECOLLECTION).doc(imageCaptionId);

		console.log((`Listening to ${this._ref.path}`));
	}

	beginListening(changeListener) {
		this._ref.onSnapshot((doc) => {
			if(doc.exists) {
				console.log("Document data: ", doc.data());
				this._documentSnapshot = doc;
				changeListener();
			} else {
				console.log("No such object");
			}
		})
	}

	stopListening() {
		this._unsubscribe();
	}

	update(caption) {
		console.log("Update caption");

		this._ref.update({
			[rhit.FB_KEY_CAPTION]: caption,
			[rhit.FB_KEY_LAST_TOUCHED]: firebase.firestore.Timestamp.now(),
		})
		.then(() => {
			console.log("Document succesfully updated");
		})
		.catch(function(error) {
			console.error("Error updating document: ", error);
		});
	}

	delete() {
		return this._ref.delete();
	}

	get caption() {
		return this._documentSnapshot.get(rhit.FB_KEY_CAPTION);
	}

	get url() {
		return this._documentSnapshot.get(rhit.FB_KEY_IMAGEURL);
	}

	get author() {
		return this._documentSnapshot.get(rhit.FB_KEY_AUTHOR);
	}
}

rhit.FbImageCaptionManager = class {
	constructor(uid) {
		this._documentSnapshots = [];
		this._ref = firebase.firestore().collection(rhit.FB_IMAGECOLLECTION);
		this._unsubscribe = null;
		this._uid = uid;
	}

	add(url, caption) {
		console.log(url, caption);

		this._ref.add({
			[rhit.FB_KEY_IMAGEURL]: url,
			[rhit.FB_KEY_CAPTION]: caption,
			[rhit.FB_KEY_AUTHOR]: rhit.fbAuthManager.uid,
			[rhit.FB_KEY_LAST_TOUCHED]: firebase.firestore.Timestamp.now(),
		})
		.then(function(docRef) {
			console.log("Document written with ID: ", docRef);
		})
		.catch(function(error) {
			console.error("Error adding to document", error);
		})
	}

	beginListening(changeListener) {

		let query = this._ref.
		orderBy(rhit.FB_KEY_LAST_TOUCHED, "desc")
		.limit(30);

			if(this._uid) {
				query = query.where(rhit.FB_KEY_AUTHOR, "==", this._uid);
			}

		this._unsubscribe = query.onSnapshot((querySnapshot) => {
			console.log("ImageCaption Update");

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

	getImageAtIndex(index) {
		const docSnapshot = this._documentSnapshots[index];
		const im = new rhit.Image(
			docSnapshot.id, 
			docSnapshot.get(rhit.FB_KEY_IMAGEURL),
			docSnapshot.get(rhit.FB_KEY_CAPTION),
		);
		return im;
	}

	get length() {
		return this._documentSnapshots.length;
	}

	get uid() {
		return this._documentSnapshot.get(rhit.FB_KEY_AUTHOR);
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

		Rosefire.signIn("bb5b1947-56bc-4a69-9cca-5bf16efb60ea", (err, rfUser) => {
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
		window.location.href = "/index.html";
	}
	if(!document.querySelector("#loginPage") && !rhit.fbAuthManager.isSignedIn) {
		window.location.href = "/login.html";
	}
}


/* Main */
/** function and class syntax examples */
rhit.main = function () {
	console.log("Ready");

	const urlParams = new URLSearchParams(window.location.search);	


	rhit.fbAuthManager = new rhit.FBAuthManager();
	rhit.fbAuthManager.beginListening((event) => {
		console.log("auth change callbakc fired. TODO: check for redirect and init the page");
		console.log("isSignedIn = ", rhit.fbAuthManager.isSignedIn);

		//check for redirects
		rhit.checkForRedirects();
		//page initializtation
		// rhit.initializePage();
	})

	if(document.querySelector("#listPage")){
		console.log("you are on the list page");
		const uid = urlParams.get("uid");
		console.log("got uid: ", uid);
		rhit.fbImageCaptionManager = new rhit.FbImageCaptionManager(uid);
		new rhit.ListPageController();

		// rhit.fbMovieQuotesManager = new rhit.FbMovieQuoteManager();
		// new rhit.ListPageController();
	}

	if(document.querySelector("#detailPage")) {
		console.log("you are on details page");

		const queryString = window.location.search;
		console.log(queryString);

		const urlParams = new URLSearchParams(queryString);
		const imageCaptionId = urlParams.get("id");

		console.log(`Details page for ${imageCaptionId}`);

		if(!imageCaptionId) {
			console.log("ERROR! MISSING IMAGECAPTIONID");
			window.location.href = "/";
		}

		rhit.fbSingleImageCaptionManager = new rhit.FbSingleImageCaptionManager(imageCaptionId);
		new rhit.DetailPageController();
	}

	if(document.querySelector("#loginPage")){
		console.log("you are on the loginPage");

		new rhit.LoginPageController();

		rhit.startFirebaseUI();
	}



};

rhit.startFirebaseUI = function() {
	var uiConfig = {
		signInSuccessUrl: '/',
		signInOptions: [
			firebase.auth.GoogleAuthProvider.PROVIDER_ID,
			firebase.auth.EmailAuthProvider.PROVIDER_ID,
			firebase.auth.PhoneAuthProvider.PROVIDER_ID,
			firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID 
		],

		tosUrl: '<your-tos-url>',

		privacyPolicyUrl: function() {
			window.location.assign('<your-privacy-p0olicy-url>');
		}
	};

	var ui = new firebaseui.auth.AuthUI(firebase.auth());

	ui.start('#firebaseui-auth-container', uiConfig);
}

rhit.main();
