import { TagElement } from "/src/components/tagElement.js";

export class FilterItem extends HTMLElement {
  /* type should be one of 'complete', 'incomplete', or 'tag' */
  /* label is the text displayed next to the checkbox, which for
   * a tag filter is the name of the tag */
  constructor(label, type) {
    super();
    this.label = this.getAttribute("label") ?? label;
    this.type = this.getAttribute("type") ?? type;

    /* Convenience attribute. will be 'complete' | 'incomplete' | {tagname}
     * depending on filter type */
    this.value = this.type === "tag" ? this.label : this.type;

    this.render();
  }

  render() {
    this.innerHTML = `
          <input
            type="checkbox"
            class="form-check-input filter-item"
            value="${this.value}"
            id="${this.value}Filter"
          />
          <label for="${this.value}Filter" class="form-check-label">
            ${this.labelInnerHTML()}
          </label>
      `;
  }

  labelInnerHTML() {
    if (this.type !== "tag") {
      return this.label;
    }
    return new TagElement(this.label).outerHTML;
  }
}

customElements.define("filter-item", FilterItem);
