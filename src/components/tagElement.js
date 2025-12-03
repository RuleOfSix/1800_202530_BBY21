export class TagElement extends HTMLElement {
  constructor(name) {
    super();
    this.name = this.getAttribute("name") ?? (this.innerText || name);
    this.render();
  }

  render() {
    this.classList.add("rounded-3", "fs-6", "p-1", "text-center");
    this.style.backgroundColor = this.getColor();
    this.innerText = this.name;
  }

  getColor() {
    let sel = 0;
    for (let i = 0; i < this.name.length; i++) {
      sel += this.name.charCodeAt(i);
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
}
customElements.define("task-tag", TagElement);
