/**
 * This file is the "Telephone" that our frontend uses to call our backend API.
 * Whenever we need data from the database (like a list of products), 
 * our React components don't talk to the database directly. 
 * Instead, they use the functions in this file to send an HTTP request to our FastAPI backend.
 */

// 1. Importing Axios
// ---------------------------------------------------------
// 'axios' is a very popular library that makes it easy to send web requests.
// It's like a smarter, easier-to-use version of the browser's built-in 'fetch' command.
import axios from 'axios';

// 2. Setting the Base URL
// ---------------------------------------------------------
// This tells axios WHERE our backend is living.
// 'import.meta.env.VITE_API_URL' looks for an environment variable. 
// When we deploy to the internet (like Vercel), we set this to our live backend URL (e.g., https://my-backend.railway.app).
// If that variable doesn't exist (like when we are testing locally), it defaults to 'http://localhost:8000'.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// 3. Creating the API Instance
// ---------------------------------------------------------
// We create a special, pre-configured version of axios called 'api'.
// Now, instead of typing "axios.get('http://localhost:8000/products')", 
// we can just type "api.get('/products')" and it automatically knows the first part of the address.
const api = axios.create({
  baseURL: API_URL,
});


// 4. API Helper Functions
// ---------------------------------------------------------
// Below are individual functions for every single action our frontend might want to take.
// We "export" them so that any page in our React app can import and use them.

// --- PRODUCTS ---
// Sends a GET request to /products to fetch all products
export const getProducts = () => api.get('/products');

// Sends a GET request to /products/5 to fetch product number 5
export const getProduct = (id) => api.get(`/products/${id}`);

// Sends a POST request to /products, taking a 'data' object (like name, price, sku) to create a new product
export const createProduct = (data) => api.post('/products', data);

// Sends a PUT request to /products/5 to update the data for product number 5
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);

// Sends a DELETE request to /products/5 to permanently delete product number 5
export const deleteProduct = (id) => api.delete(`/products/${id}`);


// --- CUSTOMERS ---
// Sends a GET request to /customers to fetch all customers
export const getCustomers = () => api.get('/customers');

// Sends a GET request to /customers/10 to fetch customer number 10
export const getCustomer = (id) => api.get(`/customers/${id}`);

// Sends a POST request to /customers to create a new customer account
export const createCustomer = (data) => api.post('/customers', data);

// Sends a DELETE request to /customers/10 to delete customer number 10
export const deleteCustomer = (id) => api.delete(`/customers/${id}`);


// --- ORDERS ---
// Sends a GET request to /orders to fetch all placed orders
export const getOrders = () => api.get('/orders');

// Sends a GET request to /orders/99 to fetch the details of order number 99
export const getOrder = (id) => api.get(`/orders/${id}`);

// Sends a POST request to /orders to process a new order checkout
export const createOrder = (data) => api.post('/orders', data);

// Sends a DELETE request to /orders/99 to cancel/delete order number 99
export const deleteOrder = (id) => api.delete(`/orders/${id}`);

// Finally, we export the configured 'api' object itself, just in case we need to make 
// a custom request somewhere else in the app that isn't defined above.
export default api;
