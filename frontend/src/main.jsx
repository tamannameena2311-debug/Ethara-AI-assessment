/**
 * main.jsx is the absolute starting point of our entire React frontend.
 * When you open the website, the browser downloads an empty 'index.html' file.
 * This file (main.jsx) is the JavaScript that runs immediately and "injects" our entire
 * React application into that empty HTML file.
 */

// 1. Importing Core React Libraries
// ---------------------------------------------------------
// 'React' is the core library that lets us build user interfaces.
import React from 'react'

// 'ReactDOM' is the specific tool that takes our React code and actually puts it 
// onto the webpage (the DOM - Document Object Model).
import ReactDOM from 'react-dom/client'

// 2. Importing Our Application
// ---------------------------------------------------------
// 'App' is the main component of our website (defined in App.jsx). 
// It contains the layout, the sidebar, and all the different pages.
import App from './App.jsx'

// 3. Importing Global Styles
// ---------------------------------------------------------
// 'index.css' contains the CSS styles that we want applied to the ENTIRE website 
// (like setting the background color or the default font).
import './index.css'

// 4. Injecting React into the Webpage
// ---------------------------------------------------------
// 'document.getElementById('root')' goes into the index.html file and finds a specific
// empty box with the id "root".
// '.render(...)' takes our React code and crams it inside that empty box.
ReactDOM.createRoot(document.getElementById('root')).render(
  // <React.StrictMode> is a helper tool for developers.
  // It doesn't show up on the screen, but it acts like a strict teacher,
  // double-checking our code for potential bugs and warning us in the console.
  <React.StrictMode>
    {/* This is our main application component */}
    <App />
  </React.StrictMode>,
)
