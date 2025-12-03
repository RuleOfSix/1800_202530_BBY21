import { db } from "/src/firebaseConfig.js";
import { TagElement } from "/src/components/tagElement.js";
import {
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDoc,
  deleteDoc,
} from "firebase/firestore";

/* A custom HTML element representing a single task item in the checklist */
export class CheckItem extends HTMLElement {
  constructor(
    uid,
    taskID,
    taskData,
    taskDate,
    isCompleted,
    openDeleteModal,
    reRenderChecklist,
  ) {
    super();
    this.uid = uid;
    this.taskID = taskID;
    this.taskData = taskData;
    this.taskDate = taskDate;
    this.createdBy = taskData.createdBy;
    this.isCompleted = isCompleted;
    this.openDeleteModal = openDeleteModal;
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

    /* Determine the initial icon state based on completion status */
    let iconText = "";
    if (this.isCompleted) {
      iconText = "check_box";
      this.classList.add("checked");
    } else {
      iconText = "check_box_outline_blank";
      this.classList.remove("checked");
    }

    /* Only the person who created the task can see the delete button */
    let deleteIconHTML = "";
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
              <span class="fs-6 opacity-75">Due ${this.taskDate}</span>
              <div class="tag-list hstack gap-1"></div>
            </div> 
            ${deleteIconHTML}
          </div>
        `;

    const deleteIcon = this.querySelector(".delete-icon");
    if (deleteIcon) {
      deleteIcon.addEventListener("click", () => {
        /* Trigger the callback to open the delete modal in checklist.js */
        this.openDeleteModal(this);
      });
    }
    const tagList = this.querySelector(".tag-list");
    for (const tag of this.taskData.tags) {
      tagList.appendChild(new TagElement(tag.value));
    }
  }

  async toggleCheck(event) {
    /* Check if the clicked the element is the delete icon
     * If so, exit immediately to prevent toggling the check status during delation */
    if (event.target.closest(".delete-icon")) {
      return;
    }
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

    this.reRenderChecklist();
  }

  /* Adds the task ID to the user's completed tasks array in Firestore */
  async addCompletedTask() {
    await updateDoc(this.userDoc, {
      tasks: arrayUnion(this.taskID),
    });
  }

  /* Removes the task ID from ther user's completed tasks array in Firestore
   * Used when unchecking a task */
  async removeCompletedTask() {
    await updateDoc(this.userDoc, {
      tasks: arrayRemove(this.taskID),
    });
  }

  /* Deletes the task from the group's list and removes the task document */
  async deleteTask() {
    await updateDoc(this.groupDoc, {
      taskIDs: arrayRemove(this.taskID),
    });

    await deleteDoc(this.taskDoc);
  }
}
customElements.define("check-item", CheckItem);
