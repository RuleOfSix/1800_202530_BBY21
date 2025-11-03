import { db } from "/src/firebaseConfig.js";
import { onAuthReady } from "/src/authentication.js";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  arrayUnion,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";

const addTaskButton = document.getElementById("addTaskButton");
const taskCreationMenu = document.getElementById("taskCreationMenu");
const darkeningScreen = document.querySelector(".darkening-screen");
const nameInput = taskCreationMenu.querySelector("#taskName");
const dateInput = taskCreationMenu.querySelector("#taskDate");
const tagsInput = taskCreationMenu.querySelector("#taskTags");
const submitButton = taskCreationMenu.querySelector("#submitTask");
const url = new URL(window.location.href);
const groupID = url.searchParams.get("groupID");
const groupDoc = doc(db, "groups", groupID);
let uid;
let currentTags = [];

const tagify = new Tagify(tagsInput, {
  whitelist: currentTags,
  dropdown: {
    enabled: 0,
  },
});

addTaskButton.addEventListener("click", toggleTaskCreationMenu);

submitButton.addEventListener("click", () => {
  const taskName = nameInput?.value?.trim() ?? "";
  const taskDoc = doc(collection(db, "tasks"));

  setDoc(taskDoc, {
    date: Timestamp.fromMillis(dateInput.valueAsNumber),
    groupID: groupID,
    name: taskName,
    tags: tagify.value,
  });

  updateDoc(groupDoc, {
    taskIDs: arrayUnion(taskDoc.id),
  });
  toggleTaskCreationMenu();
});

function toggleTaskCreationMenu() {
  taskCreationMenu.hidden = !taskCreationMenu?.hidden;
  darkeningScreen.hidden = !darkeningScreen?.hidden;
}

onAuthReady((user) => {
  uid = user.uid;
});

onSnapshot(groupDoc, async (snap) => {
  currentTags = [];
  const groupTasks = snap.get("taskIDs");
  for (const task of groupTasks) {
    const taskDoc = doc(db, "tasks", task);
    const taskSnap = await getDoc(taskDoc);
    const taskData = taskSnap?.data();
    for (const tag of taskData.tags) {
      if (!currentTags.some(tagValueEquals(tag))) {
        currentTags.push(tag);
      }
    }
  }
  tagify.whitelist = currentTags;
  console.log(currentTags);
});

function tagValueEquals(tag1) {
  return (tag2) => {
    return tag1.value === tag2.value;
  };
}
