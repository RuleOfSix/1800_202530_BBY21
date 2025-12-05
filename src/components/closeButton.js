/*
 * This is a reusable component for the close button
 * of modals that I made for utility; it assumes itself
 * to be inside a modal and has built-in behavior to close the modal
 * */
class CloseButton extends HTMLElement {
  constructor() {
    super();
    this.render();
    this.addEventListener("click", this.closeParent);
  }

  render() {
    this.classList.add("position-absolute", "top-0", "end-0", "m-1");
    this.innerHTML = `
      <a class="close-button">
        <span class="material-icons-outlined fs-1">cancel</span>
      </a>
    `;
  }

  closeParent() {
    /* Hide the modal */
    this.parentNode.hidden = true;

    /* ".darkening-screen" is the class of the element used to darken
     * out the rest of the screen behind a modal */
    const darkeningScreen = document.querySelector(".darkening-screen");
    if (darkeningScreen) {
      darkeningScreen.hidden = true;
    }
  }
}

customElements.define("close-button", CloseButton);
