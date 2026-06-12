/**
 * A "Component" in React is like a custom, reusable LEGO block for a website.
 * This specific component creates the vertical Sidebar menu that sits on the 
 * left side of our application.
 */

// 1. Importing Routing Tools
// ---------------------------------------------------------
// Unlike a standard HTML <a> link which reloads the whole page,
// 'NavLink' is a special React router link. It changes the URL and the page content
// INSTANTLY without forcing the browser to refresh. 
// It also knows when it is "active" (meaning the user is currently on that page).
import { NavLink } from 'react-router-dom';

// 2. Importing Icons
// ---------------------------------------------------------
// 'lucide-react' is a library full of beautiful, standard icons.
// We import the specific icons we want to use next to our text links.
import { LayoutDashboard, Package, Users, ShoppingCart } from 'lucide-react';

// 3. Defining the Sidebar Component
// ---------------------------------------------------------
// We declare our component as an arrow function. 
const Sidebar = () => {
  // A React component must always 'return' the HTML (technically JSX) it wants to draw on the screen.
  return (
    // <aside> is an HTML tag meant for sidebar content.
    // 'className="sidebar"' connects this box to the CSS styles we wrote in index.css.
    <aside className="sidebar">
      
      {/* 
        This is the Logo area at the top of the sidebar. 
        It contains the 'Package' icon and our app name.
      */}
      <div className="sidebar-logo">
        {/* We use the imported Package icon, give it a class for styling, and set its size */}
        <Package className="icon" size={28} />
        <span>InventoryOS</span>
      </div>
      
      {/* 
        The Navigation area. 
        We use inline styles here to arrange the links in a vertical column ('flexDirection: column') 
        with a small gap between them.
      */}
      <nav style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
        
        {/* 
          A NavLink for the Dashboard.
          'to="/"' tells it where to go when clicked.
          The 'className' here is special. It's a function! 
          It checks if this link is currently 'isActive'. If it is, it adds the 'active' CSS class 
          (which might make the background blue to show the user where they are).
        */}
        <NavLink to="/" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={20} />
          Dashboard
        </NavLink>
        
        {/* NavLink for the Products page */}
        <NavLink to="/products" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
          <Package size={20} />
          Products
        </NavLink>
        
        {/* NavLink for the Customers page */}
        <NavLink to="/customers" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
          <Users size={20} />
          Customers
        </NavLink>
        
        {/* NavLink for the Orders page */}
        <NavLink to="/orders" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
          <ShoppingCart size={20} />
          Orders
        </NavLink>
        
      </nav>
    </aside>
  );
};

// We must export this component so that 'App.jsx' can import it and put it on the screen.
export default Sidebar;
