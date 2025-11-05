// Fetches the user document from Firebase and returns group data
import { db } from "./firebaseConfig.js";
import { doc, getDoc } from "firebase/firestore";
import { renderGroupSelection } from "./home.js";

export async function getUserGroupData(userDocSnap) {
  let groupDetails = [];
  if (userDocSnap.exists()) {
    const userData = userDocSnap.data();
    /*
      Each array entry is an object that looks like this:
      { groupName: "name as string",
        groupID: "id as string"
      }
    */

    if (userData.groupIDs && userData.groupIDs.length > 0) {
      for (let groupID of userData.groupIDs) {
        const groupDocRef = doc(db, "groups", groupID);
        const groupDocSnap = await getDoc(groupDocRef);
        if (groupDocSnap.exists()) {
          groupDetails.push({
            groupID: groupID,
            ...groupDocSnap.data(),
          });
        }
      }
    }
  }

  renderGroupSelection(groupDetails);
}
