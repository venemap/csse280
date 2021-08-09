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

	firebase.auth().onAuthStateChanged((user) => {
		if(user) {
			var displayName = user.displayName;
			var email = user.email;
			var photoURL = user.photoURL;
			var isAnonymous = user.isAnonymous;
			var uid = user.uid;
			const phoneNumber = user.phoneNumber;


			console.log("the user is signed in", uid);
			console.log('displayName :>> ', displayName);
			console.log('email :>> ', email);
			console.log('photoURL :>> ', photoURL);

			console.log('uid :>> ', uid);
			console.log('phoneNumber :>> ', phoneNumber);
			console.log('isAnonymous :>> ', isAnonymous);
		}
		else {
			console.log("there is no user signed in");
		}
	});

	const inputEmailEl = document.querySelector("#inputEmail");
	const inputPwEl = document.querySelector("#inputPassword");
	
	document.querySelector("#signOutBtn").onclick = (event) => {
		console.log("sign out")

		firebase.auth().signOut().then(function() {
			console.log("you have signed out");

		}).catch(function(error) {
			console.log("error in signintg out");
		})
	}
	document.querySelector("#createAccountButton").onclick = (event) => {
		console.log(`create account: ${inputEmailEl.value} pw: ${inputPwEl.value}`)

		firebase.auth().createUserWithEmailAndPassword(inputEmailEl.value, inputPwEl.value).catch(function(error) {
			var errorCode = error.code;
			var errorMessage = error.message;
			console.log("create acount error", errorCode, errorMessage);
		})
	}
	document.querySelector("#logInButton").onclick = (event) => {
		console.log(`Log in for email: ${inputEmailEl.value} password: ${inputPwEl.value}`)

		firebase.auth().signInWithEmailAndPassword(inputEmailEl.value, inputPwEl.value).catch(function(error) {
			var errorCode = error.code;
			var errorMessage = error.message;

			console.log("Esiting account log in error", errorCode, errorMessage);
		})
	}

	document.querySelector("#anonymous").onclick = (event) => {
		console.log("clicked on anon");
		firebase.auth().signInAnonymously().catch(function(error) {
			var errorCode = error.code;
			var errorMsg = error.message;

			console.log('error in anonymous');
		})
	}

rhit.startFirebaseUI();
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
