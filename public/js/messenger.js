/*
 * This file should contain code for the following tasks:
 * 1. Display the list of chat messages.
 * 2. Send a new message.
 * 3. Allow a user to edit and delete their own messages.
 * 4. Allow a user to log out.
 * 5. Redirect a user to index.html if they are not logged in.
 */

console.log("MESSENGER");

var logoutButton = document.getElementById("logout");
var auth = firebase.auth();
var path = window.location.pathname;
var page = path.split("/").pop();

logoutButton.addEventListener("click", function(e) {
  auth.signOut();
});

auth.onAuthStateChanged(function(user) {
  // If the user is logged in, user will be an object (truthy).
  // Otherwise, it will be null (falsey).
  if (user) {
    // Logged in
  } else {
    // Logged out
    console.log("LOG OUT");
    window.location.href = "index.html";
  }
});
