import { db } from "/src/firebaseConfig.js";
import {
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDoc,
} from "firebase/firestore";

/*
 * Button for sharing groups, made as a custom
 * element for the ease of programmtically adding
 * to each group listing in main.html
 */
export class ShareButton extends HTMLElement {
  constructor() {
    super();
    this.render();
  }

  render() {
    this.innerHTML = `
      <span class="material-icons-outlined float-left fs-1 icon-align btn-icon">
        share
      </span>
    `;
  }
}
customElements.define("share-button", ShareButton);
