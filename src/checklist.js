import { db } from "/src/firebaseConfig.js";
import { onAuthReady } from "/src/authentication.js";
import { CheckItem } from "/src/components/checkItem.js";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  arrayUnion,
  onSnapshot,
  Timestamp,
  query,
  where,
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
const lowerDateButton = document.getElementById("lower-date");
const raiseDateButton = document.getElementById("raise-date");
const oneDay = 1000 * 60 * 60 * 24; /* Exactly one day in milliseconds */
const oneWeek = oneDay * 7; /* Exactly 7 days in milliseconds */
const dateFormat = new Intl.DateTimeFormat("en-us", {
  weekday: "long",
  month: "long",
  day: "numeric",
});
let uid;
let tagify;
let userCompletedTasks = [];

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
    setUserCompletedTasks(uid);
  });

  function setUserCompletedTasks(uid) {
    const userDocRef = doc(db, "users", uid);
    onSnapshot(userDocRef, (userSanp) => {
      if (userSanp.exists()) {
        userCompletedTasks = userSanp.data().tasks;
      }
    });
  }

  /* Set up callback to render task list from group doc in
   * database, and re-render when the group doc changes */
  onSnapshot(groupDoc, renderTasks);

  /* Set date at top of page to today's date */
  setDate(curDate);

  /* Add click event listeners to the buttons that shift the date */
  lowerDateButton.addEventListener("click", () => {
    shiftDate(-oneWeek);
  });
  raiseDateButton.addEventListener("click", () => {
    shiftDate(oneWeek);
  });
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
  /* Set group name */
  groupName.innerText = groupSnap.get("name");

  /* Going to build an array to hold a list of every
   * tag present in the group for autocomplete suggestions */
  let currentTags = [];

  /* Array of every taskID in the group */
  const groupTasks = groupSnap.get("taskIDs");

  /* To prevent error when there is no task */
  if (groupTasks.length == 0) {
    if (tagify) {
      tagify.whitelist = [];
    }
    return;
  }

  /* Get all tasks in the group */
  const taskQuery = query(
    collection(db, "tasks"),
    where("__name__", "in", groupTasks)
  );
  const taskQuerySnap = await getDocs(taskQuery);

  /* Clear checklist before re-rendering */
  checklist.innerHTML = "";
  let incompleteTasks = [];
  let completeTasks = [];

  /* Iterate over every task in the group */
  taskQuerySnap.forEach((taskSnap) => {
    /* Get the task data */
    const taskData = taskSnap?.data();

    /* Only add tasks that are due the current week */
    if (sameWeekAs(curDate)(taskData)) {
      /* Make a new checklist item with the task's name;
       * we can do it this way becaue we made CheckItem a
       * custom HTML element*/
      let taskItem = new CheckItem();
      taskItem.taskID = taskSnap.id;
      taskItem.uid = uid;

      const isCompleted = userCompletedTasks.includes(taskSnap.id);
      taskItem.isCompleted = isCompleted;
      taskItem.render();

      let taskLabel = taskItem.querySelector(".task-name");
      taskLabel.innerText = taskData.name;

      /* Add the new checklist item to the checklist */
      // checklist.appendChild(taskItem);
      if (isCompleted) {
        completeTasks.push(taskItem);
      } else {
        incompleteTasks.push(taskItem);
      }
    }

    /* This loop builds the deduplicated list of every tag
     * in the group */
    for (const tag of taskData.tags) {
      if (!currentTags.some(tagValueEquals(tag))) {
        currentTags.push(tag);
      }
    }
  });

  incompleteTasks.forEach((taskItem) => {
    checklist.appendChild(taskItem);
  });

  completeTasks.forEach((taskItem) => {
    checklist.appendChild(taskItem);
  });

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

/* Changes the current date by the specified number of milliseconds, then 
   calls setDate with the new value of the current date. */
async function shiftDate(ms) {
  curDate.setTime(curDate.valueOf() + ms);
  setDate(curDate);
  /* Re-render the tasks if we've already loaded auth info */
  if (uid) {
    renderTasks(await getDoc(doc(db, "groups", groupID)));
  }
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

/* Helper method for filtering tasks based on if the timestamp
 * is in the same week as the given Date.
 */
function sameWeekAs(date) {
  const day = date.getDay();
  const lowBound = new Date(date.valueOf() - day * oneDay);
  lowBound.setHours(0);
  lowBound.setMinutes(0);
  lowBound.setSeconds(0);
  lowBound.setMilliseconds(0);
  const highBound = new Date(date.valueOf() + (6 - day) * oneDay);
  highBound.setHours(23);
  highBound.setMinutes(59);
  highBound.setSeconds(59);
  highBound.setMilliseconds(999);
  return (task) => {
    const taskTime = task.date.toMillis();
    return taskTime >= lowBound.valueOf() && taskTime <= highBound.valueOf();
  };
}

/* Call the initial page startup logic */
renderPage();
