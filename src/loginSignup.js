// -------------------------------------------------------------
// src/loginSignup.js
// -------------------------------------------------------------
// Part of the COMP1800 Projects 1 Course (BCIT).
// Starter code provided for students to use and adapt.
// Manages the login/signup form behaviour and redirects.
//
// BBY21 notes: This code has been largely left as-is to focus on
// our core functionality; the only minor change is adding some
// redirect logic to support the flow of clicking a group link ->
// being redirected to log in/sign up if not currently logged in ->
// automatically being added to the group after logging in.
// -------------------------------------------------------------

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";

import {
  loginUser,
  signupUser,
  authErrorMessage,
} from "/src/authentication.js";

// --- Login and Signup Page ---
// Handles toggling between Login/Signup views and form submits
// using plain DOM APIs for simplicity and maintainability.

function initAuthUI() {
  // --- DOM Elements ---
  const alertEl = document.getElementById("authAlert");
  const loginView = document.getElementById("loginView");
  const signupView = document.getElementById("signupView");
  const toSignupBtn = document.getElementById("toSignup");
  const toLoginBtn = document.getElementById("toLogin");
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");
  const url = new URL(window.location.href);
  const groupID = url.searchParams.get("groupID");

  // Essentially: preserve groupID parameter when redirecting if such a parameter exists.
  // This is what enables the group links to function even after being redirected to log in
  const redirectUrl = groupID ? `main?groupID=${groupID}` : "main";

  // --- Helper Functions ---
  // Toggle element visibility
  function setVisible(el, visible) {
    el.classList.toggle("d-none", !visible);
  }

  // Show error message with accessibility and auto-hide
  let errorTimeout;
  function showError(msg) {
    alertEl.textContent = msg || "";
    alertEl.classList.remove("d-none");
    clearTimeout(errorTimeout);
    errorTimeout = setTimeout(hideError, 5000); // Auto-hide after 5s
  }

  // Hide error message
  function hideError() {
    alertEl.classList.add("d-none");
    alertEl.textContent = "";
    clearTimeout(errorTimeout);
  }

  // Enable/disable submit button for forms
  function setSubmitDisabled(form, disabled) {
    const submitBtn = form?.querySelector('[type="submit"]');
    if (submitBtn) submitBtn.disabled = disabled;
  }

  // --- Event Listeners ---
  // Toggle buttons
  toSignupBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    hideError();
    setVisible(loginView, false);
    setVisible(signupView, true);
    signupView?.querySelector("input")?.focus();
  });

  toLoginBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    hideError();
    setVisible(signupView, false);
    setVisible(loginView, true);
    loginView?.querySelector("input")?.focus();
  });

  // Login form submit
  loginForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideError();
    const email = document.querySelector("#loginEmail")?.value?.trim() ?? "";
    const password = document.querySelector("#loginPassword")?.value ?? "";
    if (!email || !password) {
      showError("Please enter your email and password.");
      return;
    }
    setSubmitDisabled(loginForm, true);
    try {
      await loginUser(email, password);
      location.href = redirectUrl;
    } catch (err) {
      showError(authErrorMessage(err));
      console.error(err);
    } finally {
      setSubmitDisabled(loginForm, false);
    }
  });

  // Signup form submit
  signupForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideError();
    const name = document.querySelector("#signupName")?.value?.trim() ?? "";
    const email = document.querySelector("#signupEmail")?.value?.trim() ?? "";
    const password = document.querySelector("#signupPassword")?.value ?? "";
    if (!name || !email || !password) {
      showError("Please fill in name, email, and password.");
      return;
    }
    setSubmitDisabled(signupForm, true);
    try {
      await signupUser(name, email, password);
      location.href = redirectUrl;
    } catch (err) {
      showError(authErrorMessage(err));
      console.error(err);
    } finally {
      setSubmitDisabled(signupForm, false);
    }
  });
}

// --- Initialize UI on DOMContentLoaded ---
document.addEventListener("DOMContentLoaded", initAuthUI);
