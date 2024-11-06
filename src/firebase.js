import firebase from "firebase/app"; // Import the firebase app
import "firebase/auth"; // Import Firebase Authentication
import "firebase/firestore"; // Import Cloud Firestore
import "firebase/storage"; // Import Firebase Storage


const firebaseConfig = {
	apiKey: "AIzaSyDk1ObnriGEj9DAtDaS7TK3TB3vlOePM7M",
	authDomain: "fyp-mgmt-spm.firebaseapp.com",
	projectId: "fyp-mgmt-spm",
	storageBucket: "fyp-mgmt-spm.firebasestorage.app",
	messagingSenderId: "964557885004",
	appId: "1:964557885004:web:d80c85d796376f3e8a2ee9",
	measurementId: "G-ENMFH97JQP",
};


const app = firebase.initializeApp(firebaseConfig);
const auth = app.auth();
const db = app.firestore();
const storage = app.storage(); // Initialize Firebase Storage
const googleProvider = new firebase.auth.GoogleAuthProvider();

// Sign in and check or create account in Firestore
const signInWithGoogle = async () => {
	try {
		const response = await auth.signInWithPopup(googleProvider);
		const user = response.user;
		console.log(`User ID - ${user.uid}`);

		// Check if the user already exists in the 'users' collection
		const querySnapshot = await db
			.collection("users")
			.where("uid", "==", user.uid)
			.get();

		if (querySnapshot.docs.length === 0) {
			// User does not exist, create a new user document
			await db.collection("users").add({
				uid: user.uid,
				enrolledClassrooms: [], // You can modify this field based on your app's logic
				photoURL: user.photoURL, // Store the user's profile photo URL
				displayName: user.displayName, // Optionally store the user's display name
			});
		} else {
			// User exists, you can optionally update user info if needed
			const userDoc = querySnapshot.docs[0];
			await userDoc.ref.update({
				photoURL: user.photoURL, // Update the user's profile photo URL
				displayName: user.displayName, // Update the display name if needed
			});
		}

		console.log("User signed in and data stored/updated in Firestore");
	} catch (err) {
		alert(err.message);
	}
};


const logout = () => {
  auth.signOut();
};

export { app, auth, db, storage, signInWithGoogle, logout }; // Export storage
