// Import the initialized Firebase Authentication object and Database object
import { auth, db } from "/src/firebaseConfig.js";

// Import specific functions from the Firebase Auth SDK
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

// Import Firestore functions to store user document on signup
import { doc, setDoc } from "firebase/firestore";

export async function loginUser(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function signupUser(name, email, password) {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password,
  );
  const user = userCredential.user;
  await updateProfile(user, { displayName: name });

  await setDoc(doc(db, "users", user.uid), {
    name: name,
    email: email,
    groupIDs: [],
    tasks: [],
  });

  return user;
}

export async function logoutUser() {
  await signOut(auth);
  window.location.href = "index";
}

export function checkAuthState() {
  onAuthStateChanged(auth, (user) => {
    if (window.location.pathname.endsWith("main")) {
      if (user) {
        const displayName = user.displayName || user.email;
        $("#welcomeMessage").text(`Hello, ${displayName}!`);
      } else {
        window.location.href = "index";
      }
    }
  });
}

export function onAuthReady(callback) {
  return onAuthStateChanged(auth, callback);
}

export function authErrorMessage(error) {
  const code = (error?.code || "").toLowerCase();

  const map = {
    "auth/invalid-credential": "Wrong email or password.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/user-not-found": "No account found with that email.",
    "auth/wrong-password": "Incorrect password.",
    "auth/too-many-requests": "Too many attempts. Try again later.",
    "auth/email-already-in-use": "Email is already in use.",
    "auth/weak-password": "Password too weak (min 6 characters).",
    "auth/missing-password": "Password cannot be empty.",
    "auth/network-request-failed": "Network error. Try again.",
  };

  return map[code] || "Something went wrong. Please try again.";
}
