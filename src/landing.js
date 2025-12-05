import { onAuthReady } from "/src/authentication.js";

/* Redirect user to group selection if they're already logged in */
onAuthReady((user) => {
  if (user) {
    location.href = `main`;
  }
});
