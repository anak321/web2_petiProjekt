const CACHE_NAME = 'task-reminder-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  // Add other assets and resources you want to cache
];

// Cache on install
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Clear cache on activate
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Serve from cache, falling back to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
      .catch(() => {
        return caches.match('/offline.html');
      })
  );
});

// Handle background sync
self.addEventListener('sync', event => {
  if (event.tag === 'sync-tasks') {
    console.log('Background sync for tasks started');
    event.waitUntil(syncTasks());
  }
});

async function syncTasks() {
  // Retrieve the tasks that need to be synced from local storage
  const tasksToSync = JSON.parse(localStorage.getItem('tasksToSync') || '[]');

  // If there are tasks to sync, send them to the server
  if (tasksToSync.length > 0) {
    try {
      const response = await fetch('/api/tasks/sync', {
        method: 'POST',
        body: JSON.stringify(tasksToSync),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to sync tasks with the server');
      }

      // If the sync is successful, clear the tasksToSync as they are now synced
      localStorage.setItem('tasksToSync', JSON.stringify([]));
      console.log('Tasks have been successfully synced with the server');
    } catch (error) {
      console.error('Error syncing tasks:', error);
    }
  } else {
    console.log('No tasks to sync');
  }
}


// Listen for push notifications
self.addEventListener('push', event => {
  const data = event.data.json();
  const title = data.title || 'New Task';
  const options = {
    body: data.body || 'You have a new task to check.',
    icon: '/icons/bell.png',
    badge: '/icons/favicon-32x32.png'
  };

  event.waitUntil(showNotification(title, options));
});

// Function to show notifications
function showNotification(title, options) {
  if (Notification.permission === 'granted') {
    self.registration.showNotification(title, options);
  }
}
