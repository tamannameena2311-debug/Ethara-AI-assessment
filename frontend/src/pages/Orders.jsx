/**
 * This is the Orders component, the most complex page in the frontend.
 * It shows a list of past orders, lets you view their details, and provides
 * a complex "Shopping Cart" style form to create a new order.
 */

// 1. Importing React Hooks
// ---------------------------------------------------------
import { useState, useEffect } from 'react';

// 2. Importing Icons and API Functions
// ---------------------------------------------------------
// We use an extra 'Eye' icon here for the "View Details" button
import { Plus, Trash2, Eye } from 'lucide-react';
import { getOrders, createOrder, deleteOrder, getProducts, getCustomers } from '../api';

const Orders = () => {
  // 3. Setting up State Variables
  // ---------------------------------------------------------
  
  // We need to store THREE lists of data from the database. 
  // We need orders to display them, but we ALSO need products and customers 
  // so the user can select them from drop-down menus when making a new order.
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  
  // Controls for our two different pop-up modals
  const [isModalOpen, setIsModalOpen] = useState(false);         // "Create Order" modal
  const [isViewModalOpen, setIsViewModalOpen] = useState(false); // "View Details" modal
  
  // Remembers which specific order the user clicked "View" on
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // 'formData' holds the state of the new order being built.
  // It starts with no customer selected, and an empty shopping cart (items: [])
  const [formData, setFormData] = useState({ customer_id: '', items: [] });
  
  // 'currentItem' holds the state of the specific product the user is currently 
  // looking at in the drop-down menu, before they click "Add to Cart"
  const [currentItem, setCurrentItem] = useState({ product_id: '', quantity: 1 });
  
  const [error, setError] = useState('');

  // 4. Helper Function: Fetch Initial Data
  // ---------------------------------------------------------
  const fetchInitialData = async () => {
    try {
      // We use Promise.all to fetch all three lists at the exact same time
      const [ordersRes, productsRes, customersRes] = await Promise.all([
        getOrders(), getProducts(), getCustomers()
      ]);
      setOrders(ordersRes.data);
      setProducts(productsRes.data);
      setCustomers(customersRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Run the fetch function exactly once when the page loads
  useEffect(() => {
    fetchInitialData();
  }, []);

  // 5. Shopping Cart Handlers
  // ---------------------------------------------------------
  
  // This runs when the user clicks "Add" next to a product drop-down
  const handleAddItem = () => {
    // If they haven't selected a product, or entered a 0 quantity, do nothing.
    if (!currentItem.product_id || currentItem.quantity < 1) return;
    
    // Check if this specific product is ALREADY in their cart
    const existingIndex = formData.items.findIndex(i => i.product_id === currentItem.product_id);
    
    // Make a copy of the current cart so we can safely modify it
    let newItems = [...formData.items];
    
    if (existingIndex >= 0) {
      // If the product is already in the cart, just increase the quantity
      newItems[existingIndex].quantity += currentItem.quantity;
    } else {
      // If it's a new product, push it to the end of the cart array
      newItems.push({ ...currentItem });
    }
    
    // Save the updated cart to our state
    setFormData({ ...formData, items: newItems });
    // Reset the drop-down so they can add another product
    setCurrentItem({ product_id: '', quantity: 1 });
  };

  // This runs if they click the little trash can NEXT TO A PRODUCT inside the cart
  const handleRemoveItem = (index) => {
    const newItems = [...formData.items];
    newItems.splice(index, 1); // Remove 1 item at the specific index position
    setFormData({ ...formData, items: newItems }); // Save the updated cart
  };

  // This dynamically calculates the total price of everything currently in the cart
  const calculateTotal = () => {
    return formData.items.reduce((total, item) => {
      // Find the actual product details so we can get its price
      const product = products.find(p => p.id == item.product_id);
      // Math: (Price * Quantity) added to the running Total
      return total + (product ? product.price * item.quantity : 0);
    }, 0); // 0 is the starting total
  };

  // 6. Main Form Submission Handler
  // ---------------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Basic validation before we bother the backend
    if (!formData.customer_id) {
      setError('Please select a customer');
      return;
    }
    if (formData.items.length === 0) {
      setError('Please add at least one product');
      return;
    }

    try {
      // Send the completed order data to the backend API
      await createOrder(formData);
      
      // Cleanup on success
      setIsModalOpen(false);
      setFormData({ customer_id: '', items: [] });
      fetchInitialData(); // Refresh the data to show the new order and updated stock levels
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred while creating order');
    }
  };

  // 7. Delete Order Handler
  // ---------------------------------------------------------
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to cancel/delete this order?')) {
      try {
        await deleteOrder(id);
        fetchInitialData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  // 8. Drawing the Screen
  // ---------------------------------------------------------
  return (
    <div className="animate-fade-in">
      
      {/* Header Area */}
      <div className="flex-between mb-6">
        <h1>Orders</h1>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} /> Create Order
        </button>
      </div>

      {/* Main Data Table showing past orders */}
      <div className="glass-panel" style={{overflowX: 'auto'}}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Total Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => {
              // The order only stores the customer_id (e.g., '14').
              // We need to look through our customers array to find the person with ID 14, 
              // so we can display their actual name on the screen.
              const customer = customers.find(c => c.id === order.customer_id);
              return (
                <tr key={order.id}>
                  <td>#{order.id}</td>
                  <td>{customer ? customer.full_name : 'Unknown'}</td>
                  
                  {/* Convert the raw database timestamp into a readable local date/time */}
                  <td>{new Date(order.created_at).toLocaleString()}</td>
                  
                  <td>${order.total_amount.toFixed(2)}</td>
                  <td>
                    <div className="flex gap-2">
                      {/* View Details Button */}
                      <button className="btn-outline" style={{padding: '0.4rem'}} onClick={() => {
                        setSelectedOrder(order); // Save this specific order to state
                        setIsViewModalOpen(true); // Open the View modal
                      }}>
                        <Eye size={16} />
                      </button>
                      
                      {/* Delete Button */}
                      <button className="btn-danger" style={{padding: '0.4rem'}} onClick={() => handleDelete(order.id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            
            {/* Empty state message */}
            {orders.length === 0 && (
              <tr>
                <td colSpan="5" style={{textAlign: 'center', padding: '2rem'}}>No orders found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 
        ====================================================
        MODAL 1: Create New Order Modal
        ====================================================
      */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
        }}>
          {/* Note: maxHeight and overflowY allow this modal to scroll if the cart gets really long */}
          <div className="glass-panel" style={{padding: '2rem', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto'}}>
            <h2 className="mb-4">Create New Order</h2>
            {error && <div className="mb-4 text-danger">{error}</div>}
            
            {/* Customer Selection Dropdown */}
            <div className="form-group">
              <label>Select Customer</label>
              <select className="form-control" value={formData.customer_id} onChange={e => setFormData({...formData, customer_id: parseInt(e.target.value)})}>
                <option value="">-- Select Customer --</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.full_name} ({c.email})</option>
                ))}
              </select>
            </div>

            {/* Shopping Cart Section */}
            <div className="glass-panel" style={{padding: '1rem', marginBottom: '1.5rem', backgroundColor: 'rgba(255,255,255,0.02)'}}>
              <h3 className="mb-4" style={{fontSize: '1.2rem'}}>Add Products</h3>
              
              {/* Product Selection Inputs */}
              <div className="flex gap-2 mb-4">
                <select className="form-control" style={{flex: 2}} value={currentItem.product_id} onChange={e => setCurrentItem({...currentItem, product_id: parseInt(e.target.value)})}>
                  <option value="">-- Select Product --</option>
                  {products.map(p => (
                    // If a product has 0 stock, we disable it so they can't select it!
                    <option key={p.id} value={p.id} disabled={p.stock_quantity === 0}>
                      {p.name} - ${p.price} (Stock: {p.stock_quantity})
                    </option>
                  ))}
                </select>
                
                {/* Quantity Input */}
                <input type="number" min="1" className="form-control" style={{flex: 1}} value={currentItem.quantity} onChange={e => setCurrentItem({...currentItem, quantity: parseInt(e.target.value)})} />
                
                {/* Add to Cart Button */}
                <button type="button" className="btn-primary" onClick={handleAddItem}>Add</button>
              </div>

              {/* If there are items in the cart, show the cart table */}
              {formData.items.length > 0 && (
                <table className="data-table mb-4">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Qty</th>
                      <th>Price</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.items.map((item, idx) => {
                      const p = products.find(prod => prod.id == item.product_id);
                      return (
                        <tr key={idx}>
                          <td>{p?.name}</td>
                          <td>{item.quantity}</td>
                          <td>${(p?.price * item.quantity).toFixed(2)}</td>
                          <td>
                            {/* Remove item from cart button */}
                            <button type="button" className="btn-danger" style={{padding: '0.2rem'}} onClick={() => handleRemoveItem(idx)}>
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
              
              {/* Display the calculated running total */}
              <div className="flex-between">
                <strong>Total Amount:</strong>
                <span className="text-accent" style={{fontSize: '1.2rem', fontWeight: 'bold'}}>${calculateTotal().toFixed(2)}</span>
              </div>
            </div>

            {/* Main Submit Buttons */}
            <div className="flex gap-4">
              <button className="btn-primary" style={{flex: 1, justifyContent: 'center'}} onClick={handleSubmit}>
                Place Order
              </button>
              <button className="btn-outline" onClick={() => setIsModalOpen(false)} style={{flex: 1}}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 
        ====================================================
        MODAL 2: View Order Details Modal
        ====================================================
        This modal is read-only. It just displays information about a past order.
      */}
      {isViewModalOpen && selectedOrder && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
        }}>
          <div className="glass-panel" style={{padding: '2rem', width: '100%', maxWidth: '500px'}}>
            <h2 className="mb-4">Order Details #{selectedOrder.id}</h2>
            
            {/* Header info */}
            <div className="mb-4">
              <p><strong>Customer:</strong> {customers.find(c => c.id === selectedOrder.customer_id)?.full_name}</p>
              <p><strong>Date:</strong> {new Date(selectedOrder.created_at).toLocaleString()}</p>
            </div>
            
            {/* List of items that were bought in this order */}
            <h4 className="mb-2">Items</h4>
            <table className="data-table mb-4">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Qty</th>
                </tr>
              </thead>
              <tbody>
                {selectedOrder.items.map((item, idx) => (
                  <tr key={idx}>
                    {/* Fallback to showing ID if the product name was somehow deleted from the database */}
                    <td>{products.find(p => p.id === item.product_id)?.name || `Product ID: ${item.product_id}`}</td>
                    <td>{item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div className="flex-between mb-6">
              <strong>Total Amount:</strong>
              <span className="text-accent" style={{fontSize: '1.2rem', fontWeight: 'bold'}}>${selectedOrder.total_amount.toFixed(2)}</span>
            </div>

            {/* Close Button */}
            <button className="btn-outline" onClick={() => setIsViewModalOpen(false)} style={{width: '100%'}}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
