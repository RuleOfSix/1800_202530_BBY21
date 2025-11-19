import { db } from "/src/firebaseConfig.js";
import {
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDoc,
} from "firebase/firestore";




export class ShareButton extends HTMLElement {
  constructor() {
    super();
    this.render();
  }






  render() {
    this.innerHTML = `<span class="material-icons-outlined float-left fs-1 icon-align btn-icon">
            share
          </span>
    `;
  }
}
customElements.define("share-button", ShareButton);
