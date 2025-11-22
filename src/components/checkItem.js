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
              <div class="tag-list hstack gap-1"></div>
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
    const tagList = this.querySelector(".tag-list");
    for (const tag of this.taskData.tags) {
      tagList.appendChild(this.createTagElement(tag));
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

  /* The parameter should be the entire tag object from
   * the database, NOT just the tag name.
   */
  createTagElement(tag) {
    const element = document.createElement("div");
    element.classList.add("tag", "rounded-3", "fs-6", "p-1", "text-center");
    element.style.backgroundColor = this.getTagColor(tag);
    element.innerText = tag.value;
    return element;
  }

  /* Chooses from one of 8 tag colors based on the given tag's name.
   */
  getTagColor(tag) {
    let sel = 0;
    for (let i = 0; i < tag.value.length; i++) {
      sel += tag.value.charCodeAt(i);
    }
    sel %= 8;
    switch (sel) {
      case 0:
        return "#006400"; // Dark green
      case 1:
        return "#922222"; // Maroon
      case 2:
        return "#ff9400"; // Orange
      case 3:
        return "#b60474"; // Medium violet red
      case 4:
        return "#CC00Cc"; // Fuchsia
      case 5:
        return "#00ced1"; // Dark Turquoise
      case 6:
        return "#2222ff"; // Blue
      case 7:
        return "#33cc33"; // Slightly softer blue i guess?
    }
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
