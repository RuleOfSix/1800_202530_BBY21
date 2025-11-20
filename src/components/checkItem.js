import { db } from "/src/firebaseConfig.js";
import {
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDoc,
  deleteDoc,
} from "firebase/firestore";

export class CheckItem extends HTMLElement {
  constructor(uid, taskID, taskData, taskDate, isCompleted, reRenderChecklist) {
    super();
    this.uid = uid;
    this.taskID = taskID;
    this.taskData = taskData;
    this.taskDate = taskDate;
    this.createdBy = taskData.createdBy;
    this.isCompleted = isCompleted;
    this.reRenderChecklist = reRenderChecklist;
    this.addEventListener("click", this.toggleCheck);
    this.render();
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

    let deleteIcon = "";
    /* The person only who created the task can delete it. */
    if (this.createdBy === this.uid) {
      deleteIcon = ` <span class="material-symbols-outlined delete-icon btn-icon icon-align align-self-end fs-1 p-1 ms-auto">
                        delete
                      </span>`;
    }

    this.innerHTML = `
        <div class="d-flex flex-column w-100">
          <div class="d-flex align-items-center">
            <span
              class="material-icons-outlined icon-align align-self-end fs-1 me-2">
                ${iconText}
            </span>
            <span class="task-name fs-3"></span>
            ${deleteIcon}
          </div>
          <div class="d-flex mt-2 ms-4 ps-4">
            <span class="fs-4">Due ${this.taskDate}</span>
          </div> 
        </div>
        `;

    this.deleteIconClick();
  }

  deleteIconClick() {
    const deleteIcon = this.querySelector(".delete-icon");
    if (deleteIcon) {
      deleteIcon.addEventListener("click", () => {
        /* change it to modal instead. */
        if (confirm("Do you want to delete this task?")) {
          this.deleteTask();
        }
      });
    }
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

  async deleteTask() {
    const groupDocRef = doc(db, "groups", this.taskData.groupID);
    const taskDocRef = doc(db, "tasks", this.taskID);

    await updateDoc(groupDocRef, {
      taskIDs: arrayRemove(this.taskID),
    });

    await deleteDoc(taskDocRef);
  }
}
customElements.define("check-item", CheckItem);
