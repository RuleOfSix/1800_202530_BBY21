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
    this.groupDoc = doc(db, "groups", this.taskData.groupID);
    this.userDoc = doc(db, "users", this.uid);
    this.taskDoc = doc(db, "tasks", this.taskID);
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
      "checklist-item",
    );

    let iconText = "";
    if (this.isCompleted) {
      iconText = "check_box";
      this.classList.add("checked");
    } else {
      iconText = "check_box_outline_blank";
      this.classList.remove("checked");
    }

    let deleteIconHTML = "";
    /* The person only who created the task can delete it. */
    if (this.createdBy === this.uid) {
      deleteIconHTML = ` <span class="material-symbols-outlined delete-icon btn-icon icon-align fs-1 p-1 ms-auto">
                        delete
                      </span>`;
    }

    this.innerHTML = `
          <div class="d-flex align-items-center w-100">
            <span
              class="material-icons-outlined check-icon icon-align ms-2 fs-1">
                ${iconText}
            </span>
            <div class="d-flex flex-column mt-2 ms-4">
              <span class="task-name fs-3"></span>
              <span class="fs-5 opacity-75">Due ${this.taskDate}</span>
            </div> 
            ${deleteIconHTML}
          </div>
        `;

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

    this.reRenderChecklist(await getDoc(this.groupDoc));
  }

  async addCompletedTask() {
    await updateDoc(this.userDoc, {
      tasks: arrayUnion(this.taskID),
    });
  }

  async removeCompletedTask() {
    await updateDoc(this.userDoc, {
      tasks: arrayRemove(this.taskID),
    });
  }

  async deleteTask() {
    await updateDoc(this.groupDoc, {
      taskIDs: arrayRemove(this.taskID),
    });

    await deleteDoc(this.taskDoc);
  }
}
customElements.define("check-item", CheckItem);
