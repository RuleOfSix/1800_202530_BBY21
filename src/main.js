import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css"; //webpack uses file-loader to handle font files
import "bootstrap";
import "../styles/style.css";

import "./calendar.js";

const body = document.querySelector("body");
body.setAttribute("theme", "dark");
