export class CheckItem extends HTMLElement {
    constructor() {
        super();
        this.render();
        this.addEventListener("click", this.toggleCheck);
    }
    render() {
        this.classList.add("container", "rounded-3", "w-75", "my-2", "p-3", "d-flex", "align-items-center", "checklist-item");
        this.innerHTML = `
        <span
          class="material-icons-outlined icon-align align-self-end fs-1 me-2"
        >
          check_box_outline_blank
        </span>
         <span class="task-name"></span>`;
    }
    toggleCheck() {
        const icon = this.querySelector(".material-icons-outlined");
        if (this.classList.contains("checked")) {
            this.classList.remove("checked");
            icon.innerText = "check_box_outline_blank";
        } else {
            this.classList.add("checked");
            icon.innerText = "check_box";
        }
    }
}
customElements.define("check-item", CheckItem);