import React from 'react';
import ReactDOM from 'react-dom/client';
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

// Selecciona el elemento donde se montará la aplicación React
const rootElement = document.getElementById('root');

// Crea la raíz utilizando createRoot (nuevo en React 18)
const root = ReactDOM.createRoot(rootElement);

// Renderiza la aplicación dentro del elemento seleccionado
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
