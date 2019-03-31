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
var database = firebase.database();

var messagesList = document.getElementById("messages");
var messageForm = document.getElementById("message-form");
var messageInput = document.getElementById("message-input");

logoutButton.addEventListener("click", function(e) {
  auth.signOut();
});

auth.onAuthStateChanged(function(user) {
  // If the user is logged in, user will be an object (truthy).
  // Otherwise, it will be null (falsey).
  if (user) {
    // Logged in
    var messages = database.ref("messages").limitToLast(100);

    var userNav = document.getElementById("profile-name");
    var chip = document.createElement("button");
    chip.classList.add("badge");
    chip.classList.add("badge-pill");
    chip.classList.add("badge-primary");
    chip.textContent = user.displayName;

    chip.addEventListener("click", function(e) {
      console.log("CHIP CLICK");
    });

    userNav.appendChild(chip);

    // This event listener will be called for each item
    // that has been added to the list.
    // Use this to generate each chat message,
    // both on initial page load and whenver someone creates a new message.
    messages.on("child_added", function(data) {
      var id = data.key;
      var message = data.val();

      var messageText = message.text;
      var timestamp = message.timestamp;
      var displayName = message.displayName;

      // Create ul element
      var messageUl = document.createElement("ul");
      messageUl.id = id;
      messageUl.classList.add("messageList");

      // Create message li
      var messageLi = document.createElement("li");
      messageLi.classList.add("message-controls");
      messageLi.id = "messageList";
      messageLi.classList.add("card");
      var space = document.createElement("br");

      // Create primary list
      var messagePrime = document.createElement("span");
      messagePrime.id = "controls";

      // Create controls
      var controlsDiv = document.createElement("div");
      controlsDiv.classList.add("message-controls");

      // Create time stamp
      var messagesTime = document.createElement("span");
      messagesTime.classList.add("message-time");
      messagesTime.textContent = new Date(message.timestamp).toLocaleString();

      // Create user name
      var messagesName = document.createElement("span");
      messagesName.classList.add("message-author");
      messagesName.textContent = "\t" + auth.currentUser.displayName;

      // Create message text
      var messageParagraph = document.createElement("p");
      messageParagraph.classList.add("message-text");
      messageParagraph.innerText = messageText;

      // Create delete button
      var messageDeleteButton = document.createElement("button");
      messageDeleteButton.classList.add("btn");
      messageDeleteButton.classList.add("btn-primary");
      messageDeleteButton.classList.add("floatRight");
      messageDeleteButton.type = "button";
      messageDeleteButton.textContent = "Delete";
      messageDeleteButton.addEventListener("click", function(e) {
        messageDeleteButton.onclick = activateDeleteModal();
      });

      function activateDeleteModal() {
        // Open Modal

        $("#messageDeleteModal").modal({});
        var deleteConfirmButton = document.getElementById("deleteButton");

        // If the delete confirm button is clicked
        deleteConfirmButton.addEventListener("click", function(e) {
          console.log(deleteConfirmButton);

          // Connect to the firebase data
          var database = firebase.database();
          var messages = database.ref("messages");
          var id = data.key;
          messages.child(id).remove();
        });
      }

      // Append controls to message div
      messagePrime.appendChild(controlsDiv);

      // Append messagesTime to message control
      controlsDiv.appendChild(messagesTime);

      // Append messagesName to message control
      controlsDiv.appendChild(messagesName);

      // Append delete button to message control
      controlsDiv.appendChild(messageDeleteButton);

      // Append message text to message prime
      messagePrime.appendChild(messageParagraph);

      // Append message prime to message li
      messageLi.appendChild(messagePrime);

      // Append message li to message ul
      messageUl.appendChild(messageLi);
      messagesList.appendChild(messageUl);
      messagesList.appendChild(space);
    });

    // This event listener will be called whenever an item in the list is edited.
    // Use this to update the HTML of the message that was edited.
    messages.on("child_changed", function(data) {
      var id = data.key;
      var message = data.val();

      // Updates text
      document
        .getElementById(id)
        .getElementsByClassName("message-text")[0].innerText = message.text;
    });

    // This event listener will be called whenever an item in the list is deleted.
    // Use this to remove the HTML of the message that was deleted.
    messages.on("child_removed", function(data) {
      var id = data.key;
      document.getElementById(id).remove();
    });
  } else {
    // Logged out
    window.location.href = "index.html";
  }
});

// When the user submits the form to send a message,
// add the message to the list of messages.
messageForm.addEventListener("submit", function(e) {
  e.preventDefault();

  var user = auth.currentUser;
  var userId = user.uid;

  // Connect to the firebase data
  var database = firebase.database();

  // Get the ref for your messages list
  var messages = database.ref("messages");

  // Get the message the user entered
  var message = messageInput.value;

  // Create a new message and add it to the list.
  messages
    .push({
      displayName: user.displayName,
      userId: userId,
      text: message,
      timestamp: new Date().getTime() // unix timestamp in milliseconds
    })
    .then(function() {
      // message created succesfully

      messageInput.value = "";
    })
    .catch(function(error) {
      // message not created succesfully

      // initialize modal element
      var modalEl = document.createElement("div");
      modalEl.style.width = "400px";
      modalEl.style.height = "300px";
      modalEl.style.margin = "100px auto";
      modalEl.style.backgroundColor = "#fff";
      modalEl.appendChild((document.createElement("p").textContent = error));

      // show modal
      mui.overlay("on", modalEl);
    });
});
