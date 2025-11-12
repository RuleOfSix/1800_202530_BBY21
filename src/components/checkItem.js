import { db } from "/src/firebaseConfig.js";
import { doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";

export class CheckItem extends HTMLElement {
  constructor() {
    super();

    this.uid = null;
    this.taskID = null;
    this.isCompleted = false;
    this.addEventListener("click", this.toggleCheck);
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
        <span
          class="material-icons-outlined icon-align align-self-end fs-1 me-2"
        >
          ${iconText}
        </span>
         <span class="task-name"></span>`;
  }
  toggleCheck() {
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
