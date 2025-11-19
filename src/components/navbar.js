import { onAuthReady, logoutUser } from "/src/authentication.js";
import { getAuth, onAuthStateChanged } from "firebase/auth";

class Navbar extends HTMLElement {
  constructor() {
    super();
    this.isLoggedIn = false;
    this.render();
    this.updateFirstItem();

    onAuthReady(async (user) => {
      if (user) {
        this.isLoggedIn = true;
      } else {
        this.isLoggedIn = false;
      }
      this.render();
      this.updateFirstItem();
    });
  }

  // Generate the profile item HTML only if the user is logged in.
  buildProfileHTML() {
    if (this.isLoggedIn) {
      return ` <li class="nav-item d-flex flex-row justify-content-end">
              <a id="logout"
                class="nav-link fs-5 d-flex flex-column align-items-center flex-lg-row"
                href="/index.html"
              >
                <span class="material-icons-outlined icon-align fs-1">logout</span>&nbsp;Logout
              </a>
            </li>`;
    } else {
      return " <li> </li>";
    }
  }

  render() {
    const profileItemHTML = this.buildProfileHTML();
    this.innerHTML = `
      <nav class="navbar navbar-expand-lg navbar-light p-0 bg-info">
        <div class="container-fluid p-0 m-0">
          <ul
            class="navbar-nav container-fluid px-2 m-0 d-flex flex-row align-items-center justify-content-between"
          >
            <li class="nav-item d-flex flex-row justify-content-start">
              <a
                class="nav-link fs-5 d-flex flex-column align-items-center flex-lg-row"
                href="#"
              >
                <span class="material-icons-outlined icon-align fs-1">notifications</span>&nbsp;Notifications
              </a>
            </li>
            <li class="nav-item d-flex flex-row justify-content-center" id="firstNavbarItem">
              <a
                class="nav-link fs-5 d-flex flex-column align-items-center flex-lg-row d-none"
                href="#"
              >
                <!--determined by js-->
              </a>
            </li>
           
            
            ${profileItemHTML}
          </ul>
        </div>
      </nav>
        `;
    if (this.isLoggedIn) {
      this.querySelector("#logout").addEventListener("click", logoutUser);
    }
  }

  updateFirstItem() {
    const curPage = window.location.pathname;

    const firstItem = this.querySelector("#firstNavbarItem").firstElementChild;
    if (curPage === "/checklist.html") {
      firstItem.innerHTML = `
		<span class="material-icons-outlined icon-align fs-1">calendar_month</span>&nbsp;Calendar
		`;
      firstItem.href = "/calendar.html";
    } else if (curPage === "/calendar.html") {
      firstItem.innerHTML = `
		<span class="material-icons-outlined icon-align fs-1">checklist</span>&nbsp;Checklist
		`;
      firstItem.href = "/checklist.html";
    } else {
      firstItem.innerHTML = "";
      firstItem.href = "#";
    }
  }
}

customElements.define("navbar-component", Navbar);
