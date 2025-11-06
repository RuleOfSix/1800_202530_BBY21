import { db } from "/src/firebaseConfig.js";
import { onAuthReady } from "/src/authentication.js";
import { CheckItem } from "/src/components/checkItem.js";
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

/* global constants and variables */
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
const checklist = document.getElementById("checklist-container");
const groupName = document.getElementById("group-name");
const curDate = new Date(Date.now());
const dateHeader = document.getElementById("cur-date");
const dateFormat = new Intl.DateTimeFormat("en-us", {
  weekday: "long",
  month: "long",
  day: "numeric",
});
let uid;
let tagify;

/* All the setup code that gets run once when the page loads */
function renderPage() {
  /* Set up tag input in group creation form */
  tagify = new Tagify(tagsInput, {
    whitelist: [],
    dropdown: {
      enabled: 0,
    },
  });

  /* Add click event listeners for buttons using the functions below */
  addTaskButton.addEventListener("click", toggleTaskCreationMenu);
  submitButton.addEventListener("click", createTask);

  /* Set up callback to get user's uid when auth info loads */
  onAuthReady((user) => {
    uid = user.uid;
  });

  /* Set up callback to render task list from group doc in
   * database, and re-render when the group doc changes */
  onSnapshot(groupDoc, renderTasks);

  /* Set date at top of page to today's date */
  setDate(curDate);
}

/* Toggles the task creation form modal */
function toggleTaskCreationMenu() {
  taskCreationMenu.hidden = !taskCreationMenu?.hidden;
  darkeningScreen.hidden = !darkeningScreen?.hidden;
}

/* Creates task in database, adds task to group, and closes task creation modal. */
function createTask() {
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
}

/* Renders all tasks in the group, and generates the tagify
 * autocomplete suggestion list. */
async function renderTasks(groupSnap) {
  /* Going to build an array to hold a list of every
   * tag present in the group for autocomplete suggestions */
  let currentTags = [];

  /* Array of every taskID in the group */
  const groupTasks = groupSnap.get("taskIDs");

  /* Clear checklist before re-rendering */
  checklist.innerHTML = "";

  for (const task of groupTasks) {
    /* Get the task data */
    const taskDoc = doc(db, "tasks", task);
    const taskSnap = await getDoc(taskDoc);
    const taskData = taskSnap?.data();

    /* Make a new checklist item with the task's name;
     * we can do it this way becaue we made CheckItem a
     * custom HTML element*/
    let taskItem = new CheckItem();
    let taskLabel = taskItem.querySelector(".task-name");
    taskLabel.innerText = taskData.name;

    /* Add the new checklist item to the checklist */
    checklist.appendChild(taskItem);

    /* This loop builds the deduplicated list of every tag
     * in the group */
    for (const tag of taskData.tags) {
      if (!currentTags.some(tagValueEquals(tag))) {
        currentTags.push(tag);
      }
    }
  }

  /* The attribute name is confusing, but this sets the autocomplete
   * suggestion list for the tag input to the list of the tags
   * that we just built. */
  tagify.whitelist = currentTags;
}

/* Sets the date at the top of the page to the date represented by the given Date object */
function setDate(date) {
  const dateParts = dateFormat.formatToParts(date);
  dateHeader.innerText = dateParts
    .map(({ type, value }) => {
      if (type === "weekday") {
        return value + ",";
      } else if (["month", "day"].includes(type)) {
        return value;
      }
    })
    .join(" ");
}

/* Don't worry about this too much. Just a helper method for
 * filtering through tags to not add duplicates when
 * making a list of all tags in the group, but it does
 * what it does in a pretty confusing way. Just leave it
 * be. */
function tagValueEquals(tag1) {
  return (tag2) => {
    return tag1.value === tag2.value;
  };
}

/* Call the initial page startup logic */
renderPage();
