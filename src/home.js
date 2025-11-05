import { db } from "/src/firebaseConfig.js";
import { onAuthReady } from "/src/authentication.js";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  getDoc,
} from "firebase/firestore";
import { getUserGroupData } from "/src/group.js";

const addGroupButton = document.getElementById("addGroupButton");
const groupCreationMenu = document.getElementById("groupCreationMenu");
const darkeningScreen = document.querySelector(".darkening-screen");
const nameInput = groupCreationMenu.querySelector("#groupName");
const submitButton = groupCreationMenu.querySelector("#submitGroup");
let uid;
const groupStatusMsg = document.getElementById("groupStatusMsg");
const groupListContainer = document.getElementById("groupListContainer");

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
  if (!user) {
    location.href = "index.html";
    return;
  }

  uid = user.uid;
  onSnapshot(doc(db, "users", uid), getUserGroupData);
  onSnapshot(doc(db, "users", uid), renderGroupStatusMsg);
});

function renderGroupStatusMsg(userDocSnap) {
  if (userDocSnap.exists()) {
    const userData = userDocSnap.data();
    if (userData.groupIDs && userData.groupIDs.length > 0) {
      groupStatusMsg.innerText = "Choose a group or make a new one";
    } else {
      groupStatusMsg.innerText = "Create a new group to get started";
    }
  } else {
    console.error("User data missing from database.");
  }
}

export async function renderGroupSelection(groupDetails) {
  try {
    groupDetails.forEach((group) => {
      groupListContainer.innerHTML += `
        <div class="p-2 mb-4 bg-light rounded-4 m-5">
        <div class="container-fluid py-5 d-flex flex-column align-items-center">
          <h1 class="display-5 fw-bold text-center">
           <a href="/checklist.html?groupID=${group.groupID}" class="list-group-item list-group-item-action">
           ${group.name}
          </h1>
        </div>
      </div>`;
    });
  } catch (error) {
    console.log("Error renering group list: ", error);
  }
}

function toggleGroupCreationMenu() {
  groupCreationMenu.hidden = !groupCreationMenu?.hidden;
  darkeningScreen.hidden = !darkeningScreen?.hidden;
}
