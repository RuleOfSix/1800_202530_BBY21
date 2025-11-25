// Fetches the user document from Firebase and returns group data
import { db } from "./firebaseConfig.js";
import { doc, getDoc } from "firebase/firestore";
import { renderGroupSelection } from "./home.js";

/* Fetches detailed group information corresponding to the user's group IDs
 * and updates the UI */
export async function getUserGroupData(userDocSnap) {
  let groupDetails = [];
  if (userDocSnap.exists()) {
    const userData = userDocSnap.data();

    /* If the user belongs to any groups, fetch the document for each one*/
    if (userData.groupIDs && userData.groupIDs.length > 0) {
      for (let groupID of userData.groupIDs) {
        const groupDocRef = doc(db, "groups", groupID);
        const groupDocSnap = await getDoc(groupDocRef);

        if (groupDocSnap.exists()) {
          /* Combine the group ID and the document data into a single object
           * and add it to the list */
          groupDetails.push({
            groupID: groupID,
            ...groupDocSnap.data(),
          });
        }
      }
    }
  }

  /* Pass the collected group details to the render function */
  renderGroupSelection(groupDetails);
}
