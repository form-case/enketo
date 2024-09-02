import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

// Registrar el Service Worker si está soportado
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').then(registration => {
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }).catch(error => {
      console.log('ServiceWorker registration failed: ', error);
    });
  });
}

ReactDOM.render(<App />, document.getElementById('root'));
