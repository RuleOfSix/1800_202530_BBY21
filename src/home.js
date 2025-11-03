import { db } from "/src/firebaseConfig.js";
import { onAuthReady } from "/src/authentication.js";
import { addDoc, collection } from "firebase/firestore";
import { getUserGroupData } from "./group.js";

const addGroupButton = document.getElementById("addGroupButton");
const groupCreationMenu = document.getElementById("groupCreationMenu");
const darkeningScreen = document.querySelector(".darkening-screen");
const nameInput = groupCreationMenu.querySelector("#groupName");
const submitButton = groupCreationMenu.querySelector("#submitGroup");
let uid;

addGroupButton.addEventListener("click", toggleGroupCreationMenu);

submitButton.addEventListener("click", () => {
  const groupName = nameInput?.value?.trim() ?? "";
  addDoc(collection(db, "groups"), {
    name: groupName,
    taskIDs: [],
    userIDs: [uid],
  });
  toggleGroupCreationMenu();
});

onAuthReady((user) => {
  uid = user.uid;
});

function toggleGroupCreationMenu() {
  groupCreationMenu.hidden = !groupCreationMenu?.hidden;
  darkeningScreen.hidden = !darkeningScreen?.hidden;
}

// Based on user group status, the message will be shown.
onAuthReady(async (user) => {
  const groupStatusMsg = document.getElementById("groupStatusMsg");

  if (user) {
    try {
      const hasGroup = await getUserGroupData(user.noGroupUser);
      if (hasGroup) {
        groupStatusMsg.innerText = "Choose a group or make a new one";
      } else {
        groupStatusMsg.innerText = "Create a new group to get started";
      }
    } catch (error) {
      console.error("Failed to display group status: ", error);
      groupStatusMsg.innerText = "Error loading your data";
    }
  } else {
    // logout
    window.location.href = "./index.html";
  }
});
