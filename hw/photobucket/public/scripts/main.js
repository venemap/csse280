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
}

rhit.FbImageCaptionManager = class {
	constructor() {
		this._documentSnapshots = [];
		this._ref = firebase.firestore().collection(rhit.FB_IMAGECOLLECTION);
		this._unsubscribe = null;
	}

	add(url, caption) {
		console.log(url, caption);

		this._ref.add({
			[rhit.FB_KEY_IMAGEURL]: url,
			[rhit.FB_KEY_CAPTION]: caption,
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
		this._unsubscribe = this._ref.limit(30).onSnapshot((querySnapshot) => {
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
}

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
		rhit.fbImageCaptionManager = new rhit.FbImageCaptionManager();
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

};

rhit.main();
