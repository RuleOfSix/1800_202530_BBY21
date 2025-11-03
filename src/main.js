import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css"; //webpack uses file-loader to handle font files
import "bootstrap";
import "../styles/style.css";
import { auth } from "./firebaseConfig.js";
import { onAuthStateChanged } from "firebase/auth";
import { getUserGroupData } from "./group.js";

const body = document.querySelector("body");
body.setAttribute("theme", "dark");

// Based on user group status, the message will be shown.
onAuthStateChanged(auth, async (user) => {
  const groupStatusMsg = document.getElementById("groupStatusMsg");

  if (user) {
    try {
      const hasGroup = await getUserGroupData(user.noGroupUser);

      if (hasGroup) {
        groupStatusMsg.innerHTML = "Choose a group or <br> make a new one";
      } else {
        groupStatusMsg.innerHTML = "Create a new group <br> to get started";
      }
    } catch (error) {
      console.error("Failed to display group status: ", error);
      groupStatusMsg.innerText = "Error loading your data";
    }
  } else {
    // logout
    window.location.href = "./login.html";
  }
});
