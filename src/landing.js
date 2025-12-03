import { onAuthReady } from "/src/authentication.js";

onAuthReady((user) => {
  if (user) {
    location.href = `main`;
  }
});
