import { TagElement } from "/src/components/tagElement.js";

/* This component handles all types of filters (completion, incompletion, and tag),
 * so this just handles the display logic while checklist.js actually constructs
 * the filtering logic by checking the types and labels of each selected filter.
 */
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

  /* The text next to the checkbox should either be the label passed in (for the completion
   * and incompletion filters at the top of the filter menu), or a TagElement constructed
   * from the name of the tag (which is also passed into the FilterItem as the 'label' attribute)
   */
  labelInnerHTML() {
    if (this.type !== "tag") {
      return this.label;
    }
    return new TagElement(this.label).outerHTML;
  }
}

customElements.define("filter-item", FilterItem);
