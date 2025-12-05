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

    /* State about the task passed down from checklist.js */
    this.uid = uid;
    this.taskID = taskID;
    this.taskData = taskData;
    this.taskDate = taskDate;
    this.isCompleted = isCompleted;

    /* Callbacks to commmunicate back up to checklist.js */
    this.openDeleteModal = openDeleteModal;
    this.reRenderChecklist = reRenderChecklist;

    /* Relevant firestore document references for later use */
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

    /* Check date to mark urgent */
    let today = new Date(Date.now());
    today.setHours(0, 0, 0, 0);
    today.setUTCHours(0, 0, 0, 0);
    if (this.taskData.date.toDate().getTime() === today.getTime()) {
      this.classList.add("urgent");
    }

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
    if (this.taskData.createdBy === this.uid) {
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
              <div class="tag-list hstack gap-1 flex-wrap"></div>
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
      this.markIncomplete();
    } else {
      this.classList.add("checked");
      icon.innerText = "check_box";
      this.markComplete();
    }

    this.reRenderChecklist();
  }

  /* Adds the task ID to the user's completed tasks array in Firestore */
  async markComplete() {
    await updateDoc(this.userDoc, {
      tasks: arrayUnion(this.taskID),
    });
  }

  /* Removes the task ID from ther user's completed tasks array in Firestore
   * Used when unchecking a task */
  async markIncomplete() {
    await updateDoc(this.userDoc, {
      tasks: arrayRemove(this.taskID),
    });
  }

  /* Removes the task from the group's list and deletes the task document */
  async deleteTask() {
    await updateDoc(this.groupDoc, {
      taskIDs: arrayRemove(this.taskID),
    });

    await deleteDoc(this.taskDoc);
  }
}

customElements.define("check-item", CheckItem);
