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
    this.parentNode.hidden = true;
    const darkeningScreen = document.querySelector(".darkening-screen");
    if (darkeningScreen) {
      darkeningScreen.hidden = true;
    }
  }
}

customElements.define("close-button", CloseButton);
