/**
 * This is the Products page component.
 * It displays a table of all products, and includes a pop-up "Modal" form 
 * to let users create new products or edit existing ones.
 */

// 1. Importing React Hooks
// ---------------------------------------------------------
import { useState, useEffect } from 'react';

// 2. Importing Icons and API Functions
// ---------------------------------------------------------
// 'Plus' (add icon), 'Trash2' (delete icon), 'Edit' (pencil icon)
import { Plus, Trash2, Edit } from 'lucide-react';
import { getProducts, createProduct, deleteProduct, updateProduct } from '../api';

const Products = () => {
  // 3. Setting up State Variables
  // ---------------------------------------------------------
  // 'products' holds the list of products fetched from the database. It starts as an empty array [].
  const [products, setProducts] = useState([]);
  
  // 'isModalOpen' controls whether the pop-up form is visible (true) or hidden (false).
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // 'formData' holds whatever the user is currently typing into the pop-up form.
  const [formData, setFormData] = useState({ name: '', sku: '', price: '', stock_quantity: '' });
  
  // 'editingId' remembers WHICH product we are editing. If it is null, we know we are creating a NEW product instead.
  const [editingId, setEditingId] = useState(null);
  
  // 'error' holds any error messages from the backend (like "SKU already exists") to show to the user.
  const [error, setError] = useState('');

  // 4. Helper Function: Fetch Products
  // ---------------------------------------------------------
  const fetchProducts = async () => {
    try {
      const res = await getProducts(); // Call the backend
      setProducts(res.data);           // Save the resulting data into our 'products' state
    } catch (err) {
      console.error(err);
    }
  };

  // 5. Run on Page Load
  // ---------------------------------------------------------
  // Fetch the products immediately when the user visits this page.
  useEffect(() => {
    fetchProducts();
  }, []);

  // 6. Form Submission Handler
  // ---------------------------------------------------------
  // This runs when the user clicks the "Save" or "Update" button inside the modal form.
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevents the browser from reloading the page (default HTML form behavior)
    setError('');       // Clear any old error messages
    
    try {
      if (editingId) {
        // If editingId is NOT null, it means we are editing an existing product.
        await updateProduct(editingId, formData);
      } else {
        // If editingId IS null, it means we are creating a brand new product.
        await createProduct(formData);
      }
      
      // If successful, do cleanup:
      setIsModalOpen(false); // Close the modal
      setFormData({ name: '', sku: '', price: '', stock_quantity: '' }); // Clear the form fields
      setEditingId(null); // Reset the editing state
      fetchProducts(); // Re-fetch the list from the database so the new data shows up in the table
      
    } catch (err) {
      // If the backend threw an error (like HTTP 400), catch it and show the error message.
      setError(err.response?.data?.detail || 'An error occurred');
    }
  };

  // 7. Delete Handler
  // ---------------------------------------------------------
  const handleDelete = async (id) => {
    // window.confirm creates a browser pop-up asking "Are you sure?"
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id); // Tell backend to delete
        fetchProducts();         // Refresh the table
      } catch (err) {
        console.error(err);
      }
    }
  };

  // 8. Edit Helper
  // ---------------------------------------------------------
  // This runs when the user clicks the "Edit" (pencil) button next to a product.
  const openEditModal = (product) => {
    // We pre-fill the 'formData' with the existing product's details so they show up in the inputs.
    setFormData(product);
    setEditingId(product.id); // Remember which product we are editing
    setIsModalOpen(true);     // Open the modal
  };

  // 9. Drawing the Screen
  // ---------------------------------------------------------
  return (
    <div className="animate-fade-in">
      
      {/* Header section with Title and "Add Product" button */}
      <div className="flex-between mb-6">
        <h1>Products</h1>
        <button className="btn-primary" onClick={() => {
          setEditingId(null); // Ensure we are in "Create" mode
          setFormData({ name: '', sku: '', price: '', stock_quantity: '' }); // Empty the form
          setIsModalOpen(true); // Open it
        }}>
          <Plus size={18} /> Add Product
        </button>
      </div>

      {/* The Data Table */}
      <div className="glass-panel" style={{overflowX: 'auto'}}>
        <table className="data-table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Name</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* 
              We use '.map()' to loop through our 'products' array.
              For every product, we draw one table row (<tr>). 
            */}
            {products.map(product => (
              // React requires a unique 'key' when looping through items to keep track of them.
              <tr key={product.id}>
                <td>{product.sku}</td>
                <td>{product.name}</td>
                {/* '.toFixed(2)' ensures the price always shows two decimal places (e.g., $10.00) */}
                <td>${product.price.toFixed(2)}</td>
                <td>{product.stock_quantity}</td>
                
                {/* Status Badge: We use a complex logic to change the color and text based on stock amount */}
                <td>
                  <span className={`badge ${product.stock_quantity > 10 ? 'badge-success' : product.stock_quantity > 0 ? 'badge-warning' : 'badge-danger'}`}>
                    {product.stock_quantity > 10 ? 'In Stock' : product.stock_quantity > 0 ? 'Low Stock' : 'Out of Stock'}
                  </span>
                </td>
                
                {/* Action Buttons (Edit and Delete) */}
                <td>
                  <div className="flex gap-2">
                    <button className="btn-outline" style={{padding: '0.4rem'}} onClick={() => openEditModal(product)}>
                      <Edit size={16} />
                    </button>
                    <button className="btn-danger" style={{padding: '0.4rem'}} onClick={() => handleDelete(product.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            
            {/* If the products array is completely empty, show this friendly message instead. */}
            {products.length === 0 && (
              <tr>
                <td colSpan="6" style={{textAlign: 'center', padding: '2rem'}}>No products found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 
        The Pop-up Modal Form 
        Notice the `{isModalOpen && (...)}` syntax. This is called "Conditional Rendering".
        If 'isModalOpen' is true, React draws everything inside the parenthesis. If false, it draws nothing.
      */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, // Cover the entire screen
          backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', // Dim and blur the background
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 // Center the box
        }}>
          
          {/* The actual white box of the modal */}
          <div className="glass-panel" style={{padding: '2rem', width: '100%', maxWidth: '500px'}}>
            
            {/* Title changes dynamically based on whether editingId is set */}
            <h2 className="mb-4">{editingId ? 'Edit Product' : 'Add New Product'}</h2>
            
            {/* If there's an error message, show it in red */}
            {error && <div className="mb-4 text-danger">{error}</div>}
            
            {/* The Form */}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Product Name</label>
                {/* 
                  'onChange' fires every time the user types a letter. 
                  It updates the 'formData' state immediately so React knows what was typed.
                */}
                <input required type="text" className="form-control" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label>SKU</label>
                <input required type="text" className="form-control" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} />
              </div>
              <div className="grid grid-cols-2">
                <div className="form-group">
                  <label>Price ($)</label>
                  {/* 'parseFloat' converts the text the user types into a true decimal number */}
                  <input required type="number" step="0.01" min="0.01" className="form-control" value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} />
                </div>
                <div className="form-group">
                  <label>Stock Quantity</label>
                  {/* 'parseInt' converts the text into a whole integer number */}
                  <input required type="number" min="0" className="form-control" value={formData.stock_quantity} onChange={e => setFormData({...formData, stock_quantity: parseInt(e.target.value)})} />
                </div>
              </div>
              
              {/* Buttons */}
              <div className="flex gap-4" style={{marginTop: '1rem'}}>
                <button type="submit" className="btn-primary" style={{flex: 1, justifyContent: 'center'}}>
                  {editingId ? 'Update' : 'Save'} Product
                </button>
                {/* Cancel button simply changes isModalOpen to false, hiding the modal */}
                <button type="button" className="btn-outline" onClick={() => setIsModalOpen(false)} style={{flex: 1}}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
