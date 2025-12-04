import { onAuthReady, logoutUser } from "/src/authentication.js";
import { getAuth, onAuthStateChanged } from "firebase/auth";

class Navbar extends HTMLElement {
  constructor() {
    super();
    this.isLoggedIn = false;
    this.render();

    onAuthReady(async (user) => {
      if (user) {
        this.isLoggedIn = true;
      } else {
        this.isLoggedIn = false;
      }
      this.render();
    });
  }

  // Generate the logout button only if the user is logged in.
  buildProfileHTML() {
    if (this.isLoggedIn) {
      return `
        <li class="nav-item d-flex flex-row justify-content-end">
          <a
            id="logout"
            class="nav-link fs-5 d-flex flex-column align-items-center flex-lg-row"
            href="/index.html"
          >
            <span class="material-icons-outlined icon-align fs-1">logout</span>&nbsp;Logout
          </a>
        </li>`;
    } else {
      return `<li class="nav-item">&nbsp;</li>`;
    }
  }

  render() {
    this.innerHTML = `
      <nav class="navbar navbar-expand-lg navbar-light p-0 bg-info">
        <div class="container-fluid p-0 m-0">
          <ul
            class="navbar-nav container-fluid px-3 m-0 py-0 d-flex flex-row align-items-center justify-content-between"
          >
            <li class="nav-item d-flex flex-row justify-content-start">
              <a
                class="nav-link fs-5 d-flex flex-column align-items-center flex-lg-row"
                href="${document.referrer}"
              >
                <span class="material-icons-outlined icon-align fs-1">arrow_back_ios</span>&nbsp;Back
              </a>
            </li>
            <li class="nav-item d-flex flex-row justify-content-center" id="appName">
              <span class="fs-1 fw-bold">ListingHub</span>
            </li>
            ${this.buildProfileHTML()}
          </ul>
        </div>
      </nav>
        `;
    if (this.isLoggedIn) {
      this.querySelector("#logout").addEventListener("click", logoutUser);
    }
  }
}

customElements.define("navbar-component", Navbar);
