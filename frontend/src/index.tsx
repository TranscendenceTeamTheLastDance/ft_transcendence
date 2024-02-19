import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter as Router } from 'react-router-dom';

function clearCookies() {
  document.cookie = "access-token-cookie=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  document.cookie = "refresh-token-cookie=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

clearCookies();

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
    <Router>
      <App />
    </Router>
);
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();


/*<React.StrictMode>
</React.StrictMode> */