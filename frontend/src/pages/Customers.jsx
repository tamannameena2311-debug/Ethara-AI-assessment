/**
 * This component represents the "Customers" page.
 * It is very similar to the Products page, but slightly simpler since we only
 * allow creating and deleting customers (not editing them, for the sake of simplicity).
 */

// 1. Importing React Hooks
// ---------------------------------------------------------
import { useState, useEffect } from 'react';

// 2. Importing Icons and API Functions
// ---------------------------------------------------------
import { Plus, Trash2 } from 'lucide-react';
import { getCustomers, createCustomer, deleteCustomer } from '../api';

const Customers = () => {
  // 3. Setting up State Variables
  // ---------------------------------------------------------
  // 'customers' holds our list of people.
  const [customers, setCustomers] = useState([]);
  
  // 'isModalOpen' controls the visibility of the "Add Customer" pop-up.
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // 'formData' holds the text the user types into the Add Customer form.
  const [formData, setFormData] = useState({ full_name: '', email: '', phone_number: '' });
  
  // 'error' holds any error messages from the backend (like "Email already in use").
  const [error, setError] = useState('');

  // 4. Helper Function: Fetch Customers
  // ---------------------------------------------------------
  const fetchCustomers = async () => {
    try {
      const res = await getCustomers();
      setCustomers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // 5. Run on Page Load
  // ---------------------------------------------------------
  useEffect(() => {
    fetchCustomers();
  }, []);

  // 6. Form Submission Handler
  // ---------------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear old errors
    try {
      // Send the new customer data to the backend
      await createCustomer(formData);
      
      // If it worked, clean up the screen
      setIsModalOpen(false);
      setFormData({ full_name: '', email: '', phone_number: '' });
      
      // Refresh the table to show the new person
      fetchCustomers();
    } catch (err) {
      // If it failed (e.g., duplicate email), show the error
      setError(err.response?.data?.detail || 'An error occurred');
    }
  };

  // 7. Delete Handler
  // ---------------------------------------------------------
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await deleteCustomer(id);
        fetchCustomers();
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
        <h1>Customers</h1>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} /> Add Customer
        </button>
      </div>

      {/* The Data Table */}
      <div className="glass-panel" style={{overflowX: 'auto'}}>
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>Phone Number</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* Loop through all customers and draw a row for each one */}
            {customers.map(customer => (
              <tr key={customer.id}>
                {/* Notice we added a '#' before the ID to make it look like a reference number */}
                <td>#{customer.id}</td>
                <td>{customer.full_name}</td>
                <td>{customer.email}</td>
                <td>{customer.phone_number}</td>
                <td>
                  {/* Delete button. Notice we pass the specific customer's ID to the handleDelete function */}
                  <button className="btn-danger" style={{padding: '0.4rem'}} onClick={() => handleDelete(customer.id)}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            
            {/* What to show if the database is completely empty */}
            {customers.length === 0 && (
              <tr>
                <td colSpan="5" style={{textAlign: 'center', padding: '2rem'}}>No customers found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 
        The Pop-up Modal Form
        This block of HTML only exists if 'isModalOpen' is true.
      */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
        }}>
          <div className="glass-panel" style={{padding: '2rem', width: '100%', maxWidth: '500px'}}>
            <h2 className="mb-4">Add New Customer</h2>
            
            {/* Error display box */}
            {error && <div className="mb-4 text-danger">{error}</div>}
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Full Name</label>
                {/* 
                  'onChange' uses a cool trick called "Spread Syntax" (...formData).
                  It means: "Keep everything currently in formData exactly the same, 
                  BUT overwrite the 'full_name' piece with whatever the user just typed."
                */}
                <input required type="text" className="form-control" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                {/* Using type="email" gives us free validation. The browser won't let them submit "hello" without an @ */}
                <input required type="email" className="form-control" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input required type="text" className="form-control" value={formData.phone_number} onChange={e => setFormData({...formData, phone_number: e.target.value})} />
              </div>
              
              <div className="flex gap-4" style={{marginTop: '1rem'}}>
                <button type="submit" className="btn-primary" style={{flex: 1, justifyContent: 'center'}}>
                  Save Customer
                </button>
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

export default Customers;
