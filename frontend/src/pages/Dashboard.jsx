/**
 * This component represents the "Dashboard" page.
 * It's the first page users see when they log in. It provides a quick summary 
 * of the entire system (total products, orders, low stock, etc.).
 */

// 1. Importing React Hooks
// ---------------------------------------------------------
// 'useState' lets us create "variables" that React watches. When these variables change, 
// React automatically redraws the screen to show the new data.
// 'useEffect' lets us run some code automatically exactly once when the page first loads 
// (perfect for fetching data from the API!).
import { useState, useEffect } from 'react';

// 2. Importing Icons and API Functions
// ---------------------------------------------------------
import { Package, Users, ShoppingCart, AlertTriangle } from 'lucide-react';

// We import the helper functions we built in 'api/index.js' to talk to the backend.
import { getProducts, getCustomers, getOrders } from '../api';

const Dashboard = () => {
  // 3. Setting up State
  // ---------------------------------------------------------
  // We create a state variable called 'stats' and set its initial values to 0.
  // 'setStats' is the function we will use later to update these numbers.
  const [stats, setStats] = useState({
    products: 0,
    customers: 0,
    orders: 0,
    lowStock: 0
  });

  // 4. Fetching Data when the page loads
  // ---------------------------------------------------------
  // The code inside 'useEffect' runs as soon as the Dashboard appears on the screen.
  useEffect(() => {
    // We define an 'async' function because talking to the internet takes time.
    // 'async/await' lets our code wait patiently for the backend to reply.
    const fetchData = async () => {
      try {
        // Promise.all lets us send ALL THREE requests to the backend at the exact same time,
        // rather than waiting for products to finish before asking for customers. It's much faster!
        const [productsRes, customersRes, ordersRes] = await Promise.all([
          getProducts(),
          getCustomers(),
          getOrders()
        ]);

        // We pull the actual data out of the backend's response.
        const products = productsRes.data;
        
        // We calculate how many products have low stock (less than 10 items left).
        // '.filter()' creates a new list containing only the items that match our rule.
        // '.length' counts how many items are in that new list.
        const lowStockProducts = products.filter(p => p.stock_quantity < 10).length;

        // Finally, we update our 'stats' state with the real numbers we just calculated.
        // React sees this change and instantly updates the numbers on the screen!
        setStats({
          products: products.length,
          customers: customersRes.data.length,
          orders: ordersRes.data.length,
          lowStock: lowStockProducts
        });
      } catch (error) {
        // If the backend is down or the internet disconnects, we log an error so the app doesn't crash completely.
        console.error("Error fetching dashboard data:", error);
      }
    };

    // We actually call the function we just defined above.
    fetchData();
  }, []); // The empty array [] means: "Only run this useEffect ONCE when the page first loads."

  // 5. Drawing the Screen
  // ---------------------------------------------------------
  return (
    // 'className="animate-fade-in"' is a custom CSS class that makes the page fade in smoothly.
    <div className="animate-fade-in">
      <h1>Dashboard</h1>
      <p className="mb-6" style={{color: 'var(--text-secondary)'}}>Welcome back! Here's an overview of your inventory system.</p>

      {/* 
        This div uses CSS Grid to lay out our 4 statistic cards side-by-side. 
      */}
      <div className="grid grid-cols-4">
        
        {/* Card 1: Total Products */}
        <div className="glass-panel stat-card">
          <div className="stat-title">
            Total Products
            <Package size={20} color="var(--accent)" />
          </div>
          {/* Notice how we use {stats.products} here. React will automatically insert the number! */}
          <div className="stat-value">{stats.products}</div>
        </div>
        
        {/* Card 2: Total Customers */}
        <div className="glass-panel stat-card">
          <div className="stat-title">
            Total Customers
            <Users size={20} color="var(--success)" />
          </div>
          <div className="stat-value">{stats.customers}</div>
        </div>
        
        {/* Card 3: Total Orders */}
        <div className="glass-panel stat-card">
          <div className="stat-title">
            Total Orders
            <ShoppingCart size={20} color="var(--warning)" />
          </div>
          <div className="stat-value">{stats.orders}</div>
        </div>
        
        {/* Card 4: Low Stock Alerts */}
        <div className="glass-panel stat-card">
          <div className="stat-title">
            Low Stock Alerts
            <AlertTriangle size={20} color="var(--danger)" />
          </div>
          {/* We make the number red (text-danger) to draw attention to it */}
          <div className="stat-value text-danger">{stats.lowStock}</div>
        </div>
        
      </div>
    </div>
  );
};

export default Dashboard;
