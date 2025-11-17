import { db } from "/src/firebaseConfig.js";
import { onAuthReady } from "/src/authentication.js";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  getDoc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { getUserGroupData } from "/src/group.js";

const addGroupButton = document.getElementById("addGroupButton");
const groupCreationMenu = document.getElementById("groupCreationMenu");
const groupShareMenu = document.getElementById("groupShareMenu");
const darkeningScreen = document.querySelector(".darkening-screen");
const groupForm = groupCreationMenu.querySelector("#groupForm");
const nameInput = groupCreationMenu.querySelector("#groupName");
const submitButton = groupCreationMenu.querySelector("#submitGroup");
const groupErrorBlock = groupCreationMenu.querySelector("#groupErrorBlock");
const closeButton = groupCreationMenu.querySelector("close-button");
const groupStatusMsg = document.getElementById("groupStatusMsg");
const groupListContainer = document.getElementById("groupListContainer");
let uid;

addGroupButton.addEventListener("click", toggleGroupCreationMenu);

submitButton.addEventListener("click", async () => {
  groupErrorBlock.hidden = true;
  const groupName = nameInput?.value?.trim() ?? "";
  const groupNamePattern = /^[a-zA-Z0-9 ]{1,20}$/;
  if (groupName === "" || !groupNamePattern.test(groupName)) {
    groupErrorBlock.hidden = false;
    return;
  }
  const newGroupRef = await addDoc(collection(db, "groups"), {
    name: groupName,
    taskIDs: [],
    userIDs: [uid],
  });
  await updateDoc(doc(db, "users", uid), {
    groupIDs: arrayUnion(newGroupRef.id),
  });
  nameInput.value = "";
  toggleGroupCreationMenu();
});

// Make pressing "Enter" on the name input trigger a group submission
groupForm.addEventListener("submit", function (event) {
  submitButton.click();
  event.preventDefault();
});

// Clear error text when form is closed
closeButton.addEventListener("click", function (event) {
  groupErrorBlock.hidden = true;
});

onAuthReady(async (user) => {
  /* Immediately handle groupID query parameter (for joining a group) if it exists */
  const url = new URL(window.location.href);
  const groupID = url.searchParams.get("groupID");
  if (groupID && !user) {
    location.href = `login.html?groupID=${groupID}`;
    return;
  }
  if (groupID) {
    const userDoc = doc(db, "users", user.uid);
    const groupDoc = doc(db, "groups", groupID);
    await updateDoc(userDoc, { groupIDs: arrayUnion(groupID) });
    await updateDoc(groupDoc, { userIDs: arrayUnion(user.uid) });
    location.href = `checklist.html?groupID=${groupID}`;
    return;
  }
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

export function renderGroupSelection(groupDetails) {
  groupListContainer.innerHTML = ``;
  groupDetails.forEach((group) => {
    groupListContainer.innerHTML += `
        <div class="p-2 mb-4 bg-light rounded-4 m-5">
        <div class="container-fluid py-5 d-flex flex-column align-items-center">
          <h1 class="display-5 fw-bold text-center">
           <a id="group-link" groupID="${group.groupID}" href="/checklist.html?groupID=${group.groupID}" class="list-group-item list-group-item-action">
           ${group.name}
           
          </h1>
         <span class="material-icons-outlined float-end fs-1 icon-align btn-icon">
            more_vert
          </span>
        </div>
      </div>`;
  });
}

function toggleGroupCreationMenu() {
  groupCreationMenu.hidden = !groupCreationMenu?.hidden;
  darkeningScreen.hidden = !darkeningScreen?.hidden;
}

function toggleGroupShareMenu() {
  groupShareMenu.hidden = !groupShareMenu?.hidden;
  darkeningScreen.hidden = !darkeningScreen?.hidden;
}
