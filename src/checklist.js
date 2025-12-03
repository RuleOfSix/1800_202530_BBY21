import { db } from "/src/firebaseConfig.js";
import { onAuthReady } from "/src/authentication.js";
import { CheckItem } from "/src/components/checkItem.js";
import { FilterItem } from "/src/components/filterItem.js";
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
  orderBy,
} from "firebase/firestore";

/* global constants and variables */
const addTaskButton = document.getElementById("addTaskButton");
const taskCreationMenu = document.getElementById("taskCreationMenu");
const taskDeletionMenu = document.getElementById("taskDeletionMenu");
const filterMenu = document.getElementById("filterMenu");
const completeFilter = document.getElementById("completeFilter");
const incompleteFilter = document.getElementById("incompleteFilter");
const tagFilterList = document.getElementById("tagFilterList");
const darkeningScreen = document.querySelector(".darkening-screen");
const nameInput = taskCreationMenu.querySelector("#taskName");
const dateInput = taskCreationMenu.querySelector("#taskDate");
const tagsInput = taskCreationMenu.querySelector("#taskTags");
const submitButton = taskCreationMenu.querySelector("#submitTask");
const filterButton = document.querySelector("#filterButton");
const cancelDeleteButton = taskDeletionMenu.querySelector("#cancelDelete");
const confirmDeleteButton = taskDeletionMenu.querySelector("#deleteTask");
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
const dueDateFormat = new Intl.DateTimeFormat("en-us", {
  weekday: "long",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
});
const dateHeaderFormat = new Intl.DateTimeFormat("en-us", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});
let uid;
let tagify;
let userCompletedTasks = [];
let taskItemToDelete = null;
let currentTags = [];

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

  /* Add click event listeners for task deletion modal */
  cancelDeleteButton.addEventListener("click", toggleTaskDeletionMenu);
  confirmDeleteButton.addEventListener("click", confirmDeleteTask);

  /* Set up callback to get user's uid when auth info loads */
  onAuthReady((user) => {
    if (!user) {
      location.href = `index`;
    }
    uid = user.uid;
    setUserCompletedTasks(uid);
  });

  setDate(curDate);

  /* Set up callback to render task list from group doc in
   * database, and re-render when the group doc changes */
  onSnapshot(groupDoc, renderTasks);

  /* Add click event listeners for task filter checkboxes */
  completeFilter.addEventListener("click", reRender);
  incompleteFilter.addEventListener("click", reRender);

  /* Add click event listeners to the buttons that shift the date */
  lowerDateButton.addEventListener("click", () => {
    shiftDate(-oneWeek);
  });
  raiseDateButton.addEventListener("click", () => {
    shiftDate(oneWeek);
  });
}

/* Gets completed tasks from users document and keeps the array updated */
function setUserCompletedTasks(uid) {
  const userDocRef = doc(db, "users", uid);
  onSnapshot(userDocRef, (userSnap) => {
    if (userSnap.exists()) {
      userCompletedTasks = userSnap.data().tasks;
    }
  });
}

/* Toggles the task creation form modal */
function toggleTaskCreationMenu() {
  taskCreationMenu.hidden = !taskCreationMenu?.hidden;
  darkeningScreen.hidden = !darkeningScreen?.hidden;
}

/* Toggles the filtering modal */
function toggleFilterMenu() {
  filterMenu.hidden = !filterMenu?.hidden;
  darkeningScreen.hidden = !darkeningScreen?.hidden;
}

/* Toggles the task deletion form modal */
function toggleTaskDeletionMenu() {
  taskDeletionMenu.hidden = !taskDeletionMenu?.hidden;
  darkeningScreen.hidden = !darkeningScreen?.hidden;

  /* Clear the target when closing the modal */
  if (taskDeletionMenu.hidden) {
    taskItemToDelete = null;
  }
}

/* Creates task in database, adds task to group, and closes task creation modal. */
function createTask() {
  const taskName = nameInput?.value?.trim() ?? "";
  const taskDoc = doc(collection(db, "tasks"));

  setDoc(taskDoc, {
    createdBy: uid,
    date: Timestamp.fromMillis(dateInput.valueAsNumber),
    groupID: groupID,
    name: taskName,
    tags: tagify.value,
  });

  updateDoc(groupDoc, {
    taskIDs: arrayUnion(taskDoc.id),
  });
  nameInput.value = "";
  dateInput.value = "";
  tagsInput.value = "";
  toggleTaskCreationMenu();
}

/* Callback function passed to CheckItem: opens the modal */
function openDeleteModal(deleteClickedItem) {
  taskItemToDelete = deleteClickedItem;
  toggleTaskDeletionMenu();
}

/* Function executed when 'confirm' is clicked in the modal */
function confirmDeleteTask() {
  if (taskItemToDelete) {
    taskItemToDelete.deleteTask();
  }
  toggleTaskDeletionMenu();
}

/* Renders all tasks in the group, and generates the tagify
 * autocomplete suggestion list. */
async function renderTasks(groupSnap) {
  /* Set group name */
  groupName.innerText = groupSnap.get("name");

  /* Array of every taskID in the group */
  const groupTasks = groupSnap.get("taskIDs");

  /* Clear checklist before re-rendering */
  checklist.innerHTML = "";

  /* To prevent error when there is no task */
  if (groupTasks.length == 0) {
    if (tagify) {
      tagify.whitelist = [];
    }
    return;
  }

  let filters = [];
  for (let filter of Array.from(tagFilterList.children)) {
    if (filter.firstElementChild.checked) {
      filters.push((task) =>
        task.taskData.tags.some(tagValueEquals({ value: filter.label })),
      );
    }
  }

  /* Get all tasks in the group */
  const taskQuery = query(
    collection(db, "tasks"),
    where("__name__", "in", groupTasks),
    orderBy("date", "asc"),
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
       * we can do it this way because we made CheckItem a
       * custom HTML element*/

      let taskItem = new CheckItem(
        uid,
        taskSnap.id,
        taskData,
        formatDueDate(taskData.date.toDate()),
        userCompletedTasks.includes(taskSnap.id),
        openDeleteModal,
        reRender,
      );

      let taskLabel = taskItem.querySelector(".task-name");
      taskLabel.innerText = taskData.name;

      if (taskItem.isCompleted) {
        completeTasks.push(taskItem);
      } else {
        incompleteTasks.push(taskItem);
      }
    }

    /* Update currentTags with new tags */
    for (const tag of taskData.tags) {
      if (!currentTags.some(tagValueEquals(tag))) {
        currentTags.push(tag);
        tagFilterList.appendChild(new FilterItem(tag.value, "tag"));
      }
    }
  });

  /* add incomplete tasks, then complete tasks to the checklist */
  const completionFilters = incompleteFilter.checked || completeFilter.checked;
  if (incompleteFilter.checked || !completionFilters) {
    incompleteTasks.filter(filterUnion(...filters)).forEach((taskItem) => {
      checklist.appendChild(taskItem);
    });
  }

  if (completeFilter.checked || !completionFilters) {
    completeTasks.filter(filterUnion(...filters)).forEach((taskItem) => {
      checklist.appendChild(taskItem);
    });
  }

  /* Set date at top of page to today's date */
  setDate(curDate);

  /* remove old tags from currentTags */
  const hasTag = (tag) => (checkItem) =>
    checkItem?.taskData?.tags?.some(tagValueEquals(tag));
  let dups = [];
  for (const tag of currentTags) {
    if (!Array.from(checklist.children).some(hasTag(tag))) {
      dups.push(tag);
      document.getElementById(`${tag.value}Filter`).parentElement.remove();
    }
  }
  currentTags = currentTags.filter((tag) => !dups.some(tagValueEquals(tag)));

  /* Add click event listeners to tag filters */
  for (let filter of Array.from(tagFilterList.children)) {
    filter.addEventListener("click", reRender);
  }

  /* The attribute name is confusing, but this sets the autocomplete
   * suggestion list for the tag input to the updated currentTags */
  tagify.whitelist = currentTags;
}

/* Sets the date header at the top of the page according to the date
 * represented by the given Date object. Formats the date header as a
 * range between the first and last days of the week.
 */
function setDate(date) {
  const partMap = ({ type, value }) => {
    if (["month", "day"].includes(type)) {
      return value;
    }
  };
  const [low, high] = weekBounds(date);
  const lowStr = dateHeaderFormat.formatToParts(low).map(partMap).join(" ");
  const highStr = dateHeaderFormat.formatToParts(high).map(partMap).join(" ");
  dateHeader.innerText = `${lowStr} - ${highStr}`;
}

function formatDueDate(date) {
  const dateParts = dueDateFormat.formatToParts(date);
  return dateParts
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
 * what it does in a pretty confusing way (keyword is 'closures'
 * if you're curious. */
function tagValueEquals(tag1) {
  return (tag2) => {
    return tag1.value === tag2.value;
  };
}

/* Helper method for filtering tasks based on if the timestamp
 * is in the same week as the given Date.
 */
function sameWeekAs(date) {
  const [lowBound, highBound] = weekBounds(date);
  return (task) => {
    /*  
    // In case of future due date debugging:
    console.log("Task: " + task.name);
    console.log("\tDue date: " + new Date(task.date.toMillis()));
    console.log("\tLow Bound: " + lowBound);
    console.log("\tHigh Bound: " + highBound);
    */
    const taskTime = task.date.toMillis();
    return taskTime >= lowBound.valueOf() && taskTime <= highBound.valueOf();
  };
}

async function reRender() {
  renderTasks(await getDoc(groupDoc));
}

function filterUnion(...filters) {
  return (obj) => {
    let result = filters.length == 0;
    for (filter of filters) {
      result ||= filter(obj);
    }
    return result;
  };
}

/* Helper function that returns an array of the first and last
 * days of the week the given Date is in, as Date objects */
function weekBounds(date) {
  const day = date.getDay();
  const lowBound = new Date(date.valueOf() - day * oneDay);
  lowBound.setUTCHours(0);
  lowBound.setUTCMinutes(0);
  lowBound.setUTCSeconds(0);
  lowBound.setUTCMilliseconds(0);
  const highBound = new Date(date.valueOf() + (6 - day) * oneDay);
  highBound.setUTCHours(0);
  highBound.setUTCMinutes(0);
  highBound.setUTCSeconds(0);
  highBound.setUTCMilliseconds(0);
  return [lowBound, highBound];
}
/* Call the initial page startup logic */
renderPage();
