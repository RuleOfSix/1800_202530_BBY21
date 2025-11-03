import { db } from "/src/firebaseConfig.js";
import { onAuthReady } from "/src/authentication.js";
import { addDoc, collection } from "firebase/firestore";

const addGroupButton = document.getElementById("addGroupButton");
const groupCreationMenu = document.getElementById("groupCreationMenu");
const darkeningScreen = document.querySelector(".darkening-screen");
const nameInput = groupCreationMenu.querySelector("#groupName");
const submitButton = groupCreationMenu.querySelector("#submitGroup");
let uid;

addGroupButton.addEventListener("click", () => {
  groupCreationMenu.hidden = !groupCreationMenu?.hidden;
  darkeningScreen.hidden = !darkeningScreen?.hidden;
});

submitButton.addEventListener("click", () => {
  const groupName = nameInput?.value?.trim() ?? "";
  addDoc(collection(db, "groups"), {
    taskIDs: [],
    userIDs: [uid],
  });
});

onAuthReady((user) => {
  uid = user.uid;
});
