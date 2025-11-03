// Fetches the user document from Firebase and returns group data
import { db } from "./firebaseConfig.js";
import { doc, getDoc } from "firebase/firestore";

export async function getUserGroupData(noGroupUser) {
  const userDocRef = doc(db, "users", "noGroupUser");
  const userDocSnap = await getDoc(userDocRef);
  let hasGroup = false;

  if (userDocSnap.exists()) {
    const userData = userDocSnap.data();
    if (userData.groupIDs && userData.groupIDs.length > 0) {
      hasGroup = true;
      return hasGroup;
    } else {
      return hasGroup;
    }
  } else {
    console.error("User document does not exisit in Firesotre.");
  }
}
