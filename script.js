const CLIENT_ID = 'YOUR_CLIENT_ID.apps.googleusercontent.com';
const API_KEY = 'YOUR_API_KEY';
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];
const SCOPES = "https://www.googleapis.com/auth/calendar.events";

let gapiInited = false;
let gisInited = false;

const authorizeButton = document.getElementById("authorize_button");
const signoutButton = document.getElementById("signout_button");
const addTaskButton = document.getElementById("addTaskButton");
const taskListDiv = document.getElementById("taskList");

let tasks = [];

function handleClientLoad() {
  gapi.load('client:auth2', initClient);
}

function initClient() {
  gapi.client.init({
    apiKey: API_KEY,
    clientId: CLIENT_ID,
    discoveryDocs: DISCOVERY_DOCS,
    scope: SCOPES
  }).then(() => {
    gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
    updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
    authorizeButton.onclick = handleAuthClick;
    signoutButton.onclick = handleSignoutClick;
  }, (error) => {
    console.error("Error initializing Google API client:", error);
  });
}

function updateSigninStatus(isSignedIn) {
  if (isSignedIn) {
    authorizeButton.style.display = 'none';
    signoutButton.style.display = 'inline-block';
  } else {
    authorizeButton.style.display = 'inline-block';
    signoutButton.style.display = 'none';
  }
}

function handleAuthClick(event) {
  gapi.auth2.getAuthInstance().signIn();
}

function handleSignoutClick(event) {
  gapi.auth2.getAuthInstance().signOut();
}

function addTask(taskDesc, dateStr) {
  const id = Date.now().toString();
  tasks.push({ id, taskDesc, dateStr });
  renderTasks();
  addEventToCalendar(taskDesc, dateStr);
}

function renderTasks() {
  taskListDiv.innerHTML = '';
  tasks.forEach(t => {
    const div = document.createElement('div');
    div.className = 'taskItem';
    div.innerHTML = `<span>${t.taskDesc} — ${t.dateStr}</span> <button onclick="removeTask('${t.id}')">Remove</button>`;
    taskListDiv.appendChild(div);
  });
}

function removeTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  renderTasks();
}

function addEventToCalendar(summary, dateStr) {
  if (!gapi.auth2.getAuthInstance().isSignedIn.get()) {
    alert("Please sign in to Google to add to Calendar");
    return;
  }

  const startDateTime = new Date(dateStr + 'T09:00:00');
  const endDateTime = new Date(dateStr + 'T09:30:00');

  const event = {
    'summary': summary,
    'start': {
      'dateTime': startDateTime.toISOString(),
      'timeZone': 'Asia/Kolkata'
    },
    'end': {
      'dateTime': endDateTime.toISOString(),
      'timeZone': 'Asia/Kolkata'
    }
  };

  const request = gapi.client.calendar.events.insert({
    'calendarId': 'primary',
    'resource': event
  });

  request.execute(function(event) {
    console.log("Event created: " + event.htmlLink);
    alert("Calendar event created!");
  });
}

addTaskButton.addEventListener('click', () => {
  const taskDesc = document.getElementById('taskInput').value.trim();
  const dateStr = document.getElementById('dateInput').value;
  if (!taskDesc || !dateStr) {
    alert("Please enter both task and date");
    return;
  }
  addTask(taskDesc, dateStr);
  document.getElementById('taskInput').value = '';
  document.getElementById('dateInput').value = '';
});

handleClientLoad();
