if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(registration => {
      console.log('Service Worker registered with scope:', registration.scope);
    }).catch(err => {
      console.log('Service Worker registration failed:', err);
    });
  });
}

let tasks = [];

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadTasks() {
  const savedTasks = localStorage.getItem('tasks');
  if (savedTasks) {
    tasks = JSON.parse(savedTasks);
  } else {
    tasks = [];
  }
}

function addTask(taskContent, startTime, endTime, notifyWithSound) {
  const dateParts = startTime.split('-');
  const timeParts = document.getElementById('startTimeTime').value.split(':');

  const newTask = {
    content: taskContent,
    startTime: new Date(dateParts[0], dateParts[1] - 1, dateParts[2], timeParts[0], timeParts[1]),
    endTime: endTime + ' ' + document.getElementById('endTimeTime').value,
    notifyWithSound
  };

  tasks.push(newTask);
  renderTasks();

  // Only schedule notifications if PushManager is supported
  if (notifyWithSound && 'PushManager' in window) {
    const now = new Date();
    const timeUntilStart = newTask.startTime - now;

    if (timeUntilStart > 0) {
      setTimeout(() => {
        const audio = new Audio('icons/notifSound.mp3');
        audio.play();

        if (Notification.permission === 'granted') {
          new Notification('Task Reminder', {
            body: `It's time to start your task: "${newTask.content}"`,
            icon: 'icons/bell.png'
          });
        }
      }, timeUntilStart);
    }
  }
  saveTasks();
}

function formatDateWithoutTimezone(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

function renderTasks() {
  const taskListElement = document.getElementById('taskList');
  taskListElement.innerHTML = '';
  tasks.forEach((task, index) => {
    const newTaskElement = document.createElement('li');
    const startTime = new Date(task.startTime);
    newTaskElement.textContent = `${task.content} (Start: ${formatDateWithoutTimezone(startTime)}, End: ${task.endTime})`;

    if (task.notifyWithSound && 'PushManager' in window) {
      const notificationBell = document.createElement('span');
      notificationBell.innerHTML = ' &#128276;';
      newTaskElement.appendChild(notificationBell);
    }

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.onclick = () => deleteTask(index);
    newTaskElement.appendChild(deleteButton);

    taskListElement.appendChild(newTaskElement);
  });
}

function deleteTask(index) {
  tasks.splice(index, 1);
  renderTasks();
  saveTasks();
}

document.getElementById('taskForm').addEventListener('submit', event => {
  event.preventDefault();

  const taskContent = document.getElementById('newTask').value.trim();
  const startTime = document.getElementById('startTime').value;
  const endTime = document.getElementById('endTime').value;
  const notifyWithSound = document.getElementById('notificationCheckbox').checked;

  if (taskContent && startTime && endTime) {
    addTask(taskContent, startTime, endTime, notifyWithSound);
  }
});

document.getElementById('taskList').addEventListener('click', event => {
  if (event.target.tagName.toLowerCase() === 'button') {
    const index = Array.from(event.target.parentElement.parentElement.children).indexOf(event.target.parentElement);
    deleteTask(index);
  }
});

if (Notification.permission !== 'granted') {
  Notification.requestPermission().then(permission => {
    if (permission === 'granted') {
     
    }
  });
}

function addTaskToSync(task) {
  const tasksToSync = JSON.parse(localStorage.getItem('tasksToSync') || '[]');
  tasksToSync.push(task);
  localStorage.setItem('tasksToSync', JSON.stringify(tasksToSync));
}

loadTasks();
renderTasks();