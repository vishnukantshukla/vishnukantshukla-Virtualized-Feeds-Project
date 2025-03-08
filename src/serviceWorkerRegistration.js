export function register() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        const swUrl = '/service-worker.js';
        
        navigator.serviceWorker.register(swUrl)
          .then(registration => {
            console.log('ServiceWorker registration successful:', registration.scope);
            
            registration.onupdatefound = () => {
              const installingWorker = registration.installing;
              if (installingWorker == null) {
                return;
              }
              
              installingWorker.onstatechange = () => {
                if (installingWorker.state === 'installed') {
                  if (navigator.serviceWorker.controller) {
                    // New content is available; notify the user
                    console.log('New content is available and will be used when all tabs for this page are closed.');
                    
                    // Dispatch an event that can be caught by the app to show a notification
                    window.dispatchEvent(new CustomEvent('swUpdateAvailable'));
                  } else {
                    // Content is cached for offline use
                    console.log('Content is cached for offline use.');
                  }
                }
              };
            };
          })
          .catch(error => {
            console.error('Error during service worker registration:', error);
          });
        
        // Check for service worker updates at regular intervals
        setInterval(() => {
          navigator.serviceWorker.getRegistration().then(registration => {
            if (registration) registration.update();
          });
        }, 1000 * 60 * 60); // Check every hour
      });
    }
  }
  
  export function unregister() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready
        .then(registration => {
          registration.unregister();
        })
        .catch(error => {
          console.error(error.message);
        });
    }
  }