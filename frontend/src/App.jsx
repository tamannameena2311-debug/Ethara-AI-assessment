/**
 * App.jsx is the "Frame" or "Shell" of our application.
 * Imagine a house: this file builds the walls and the hallways, 
 * and decides which room (page) you enter when you open a specific door (URL).
 */

// 1. Importing Routing Tools
// ---------------------------------------------------------
// 'react-router-dom' is the standard library used to create multiple "pages" in a single-page React app.
// 'BrowserRouter' (which we rename to 'Router' for short) listens to the URL in the browser's address bar.
// 'Routes' is like a switchboard that looks through all our defined routes.
// 'Route' defines a single path (like "/products") and what to show when the user goes there.
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// 2. Importing Our Custom Components and Pages
// ---------------------------------------------------------
// 'Sidebar' is the navigation menu that will stay constantly visible on the left side of the screen.
import Sidebar from './components/Sidebar';

// These are our actual pages. When a user clicks a link, one of these will load.
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Customers from './pages/Customers';
import Orders from './pages/Orders';

function App() {
  return (
    // <Router> must wrap our entire application so it can detect URL changes anywhere.
    <Router>
      {/* 
        This div is the main container for our layout. 
        It uses CSS Flexbox (defined in index.css) to put the Sidebar on the left, 
        and the main content area on the right. 
      */}
      <div className="layout-container">
        
        {/* The Sidebar is placed OUTSIDE the <Routes>. 
            This is a crucial trick! It means the sidebar will NEVER disappear, 
            no matter which page the user clicks to. */}
        <Sidebar />
        
        {/* This <main> tag is where the actual page content will be injected. */}
        <main className="main-content">
          
          {/* <Routes> looks at the current URL and decides which <Route> below is a match. */}
          <Routes>
            {/* If the URL is exactly "/" (the home page), show the <Dashboard /> component */}
            <Route path="/" element={<Dashboard />} />
            
            {/* If the URL is "/products", show the <Products /> component */}
            <Route path="/products" element={<Products />} />
            
            {/* If the URL is "/customers", show the <Customers /> component */}
            <Route path="/customers" element={<Customers />} />
            
            {/* If the URL is "/orders", show the <Orders /> component */}
            <Route path="/orders" element={<Orders />} />
          </Routes>
          
        </main>
      </div>
    </Router>
  );
}

// We must "export" the App function so that main.jsx can import it and use it.
export default App;
