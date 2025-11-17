import { db } from "/src/firebaseConfig.js";
import {
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDoc,
} from "firebase/firestore";

export class CheckItem extends HTMLElement {
  constructor(uid, taskID, taskData, taskDate, isCompleted, reRenderChecklist) {
    super();
    this.uid = uid;
    this.taskID = taskID;
    this.taskData = taskData;
    this.taskDate = taskDate;
    this.isCompleted = isCompleted;
    this.reRenderChecklist = reRenderChecklist;
    this.addEventListener("click", this.toggleCheck);
    this.render();
    console.log(this.taskDate);
  }

  render() {
    this.classList.add(
      "container",
      "rounded-3",
      "w-75",
      "my-2",
      "p-3",
      "d-flex",
      "align-items-center",
      "checklist-item"
    );

    let iconText = "";
    if (this.isCompleted) {
      iconText = "check_box";
      this.classList.add("checked");
    } else {
      iconText = "check_box_outline_blank";
      this.classList.remove("checked");
    }

    this.innerHTML = `
        <div class="d-flex flex-column">
          <div class="d-flex align-items-center">
            <span
              class="material-icons-outlined icon-align align-self-end fs-1 me-2">
                ${iconText}
            </span>
            <span class="task-name"></span>
          </div>
        
          <div class="d-flex mt-2 ms-4 ps-4">
            <span>${this.taskDate}</span>
          </div> 
        </div>
        `;
  }
  async toggleCheck() {
    const icon = this.querySelector(".material-icons-outlined");
    if (this.classList.contains("checked")) {
      this.classList.remove("checked");
      icon.innerText = "check_box_outline_blank";
      this.removeCompletedTask();
    } else {
      this.classList.add("checked");
      icon.innerText = "check_box";
      this.addCompletedTask();
    }
    const groupDoc = doc(db, "groups", this.taskData.groupID);
    this.reRenderChecklist(await getDoc(groupDoc));
  }

  async addCompletedTask() {
    const userDocRef = doc(db, "users", this.uid);
    await updateDoc(userDocRef, {
      tasks: arrayUnion(this.taskID),
    });
  }

  async removeCompletedTask() {
    const userDocRef = doc(db, "users", this.uid);
    await updateDoc(userDocRef, {
      tasks: arrayRemove(this.taskID),
    });
  }
}
customElements.define("check-item", CheckItem);
