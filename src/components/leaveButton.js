import { db } from "/src/firebaseConfig.js";
import {
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDoc,
} from "firebase/firestore";




export class LeaveButton extends HTMLElement {
  constructor() {
    super();
    this.render();
    this.addEventListener("click", this.leaveGroup);
  }

  
async leaveGroup(){
  let uid = this.getAttribute("uid");
  let groupID = this.getAttribute("groupID");
  console.log(`"${uid}"`);
  console.log(`"${groupID}"`);
  const userDocRef = doc(db, "users", uid);
  const groupDocRef = doc(db, "groups", groupID);
  await updateDoc(userDocRef, { groupIDs: arrayRemove(groupID)});
  await updateDoc(groupDocRef, { userIDs: arrayRemove(uid)});
   location.reload();
}
  





  render() {
    this.innerHTML = `<span class="material-icons-outlined float-end fs-1 icon-align btn-icon">
            cancel
          </span>
    `;
  }
}
customElements.define("leave-button", LeaveButton);
