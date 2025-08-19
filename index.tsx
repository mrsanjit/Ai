
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // CRITICAL: This MUST be a relative path.

// Ensure Recharts is globally available if not using explicit imports (CDNs make it global)
// For types, you might need to install @types/recharts if you were using npm modules.
// Since we use CDN, assume Recharts, PapaParse, XLSX, alasql, marked are on window.

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
// Added a comment to ensure a change is registered.
