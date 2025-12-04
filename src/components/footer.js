class Footer extends HTMLElement {
  constructor() {
    super();
    this.classList.add("fixed-bottom");
    this.render();
  }

  render() {
    this.innerHTML = `
      <nav class="navbar navbar-expand-lg navbar-light p-0 bg-info">
        <div class="container-fluid p-0 m-0 ">
          <ul
            class="navbar-nav container-fluid px-2 m-0 d-flex flex-row align-items-center justify-content-between"
          >
            <li class="nav-item d-flex flex-row justify-content-start">
            </li>
            <li class="nav-item d-flex flex-row justify-content-center">
              <a
                class="nav-link fs-5 d-flex flex-column align-items-center flex-lg-row"
                href="/main.html"
              >
                <span class="material-icons-outlined icon-align fs-1">home</span>&nbsp;Home
              </a>
            </li>
            <li class="nav-item d-flex flex-row justify-content-end">
              <a
                class="nav-link fs-5 d-flex flex-column align-items-center flex-lg-row d-none"
                href="wip.html"
              >
                <span class="material-icons-outlined icon-align fs-1">settings</span>&nbsp;Settings
              </a>
            </li>
          </ul>
        </div>
      </nav>
        `;
  }
}

customElements.define("footer-component", Footer);
