# Project Overview: Full-Stack Inventory & Order Management System

Welcome to the deep dive of our application! This document is designed to give you a complete, top-down understanding of why this project exists, what problem it solves, and exactly how all the different files and folders work together to create a functioning web application.

---

## 1. The Problem Statement

Many small to medium businesses struggle with keeping track of their inventory and customer orders. Doing this manually (using spreadsheets or pen and paper) leads to several problems:
- **Overselling:** A customer buys an item that is actually out of stock because the spreadsheet wasn't updated.
- **Data Fragmentation:** Customer details are in one book, product prices are in another, and past orders are lost in a drawer.
- **Lack of Insights:** It's hard to quickly see how many products are running low on stock or how many total orders were placed today.

## 2. Our Solution

We built a **Full-Stack Web Application** to digitize and automate this process. 
- **Centralized Database:** All products, customers, and orders are stored securely in one place (a PostgreSQL database).
- **Automated Inventory:** When an order is placed, the system automatically checks if there is enough stock. If there is, it deducts the stock immediately. If not, it prevents the order.
- **User-Friendly Dashboard:** A modern, visual frontend allows staff to easily add products, register customers, place orders, and view low-stock alerts at a glance.

---

## 3. How Everything Connects (The Architecture)

Think of our application as a restaurant:
1. **The Frontend (React) = The Dining Area & Menu:** This is what the user sees and interacts with. They click buttons and fill out forms.
2. **The Backend API (FastAPI) = The Waiter & Kitchen:** The frontend can't talk to the database directly (for security reasons). Instead, it asks the backend. The backend receives the request, validates it, and performs the heavy lifting.
3. **The Database (PostgreSQL) = The Pantry:** This is where the actual data (ingredients) is securely stored permanently.

### The Data Flow (Example: Creating an Order)
1. **User Action:** The user clicks "Place Order" on the React Frontend (`Orders.jsx`).
2. **The Call:** The Frontend uses the `api/index.js` file to send an HTTP POST request containing the customer ID and chosen items to the Backend URL (`/orders`).
3. **The Router:** The Backend's `routers/orders.py` receives the request. It checks if the data looks correct according to the rules in `schemas.py`.
4. **The Worker:** The router passes the data to `crud.py` (the worker).
5. **Database Interaction:** `crud.py` checks `models.py` to understand the database structure, verifies stock levels, deducts the stock, saves the new order to the database, and returns the saved order.
6. **The Response:** The router sends the saved order back to the Frontend.
7. **UI Update:** React receives the success message and updates the screen so the user sees their new order in the table!

---

## 4. File-by-File Breakdown

Here is a detailed explanation of exactly what each file in the codebase does.

### A. The Backend (Python / FastAPI)

Located in the `/backend/app/` folder. This is the brain of the application.

*   **`main.py`**
    *   **What it does:** It is the starting point of the backend server.
    *   **How it connects:** It imports all the "routers" and attaches them to the main FastAPI application. It also sets up "CORS" (Cross-Origin Resource Sharing), which acts as a bouncer, allowing our specific React frontend to communicate with it securely.
*   **`database.py`**
    *   **What it does:** It sets up the physical connection to the PostgreSQL database.
    *   **How it connects:** It reads the `DATABASE_URL` environment variable to find the database on the network. It creates a `SessionLocal` factory that hands out temporary database connections to any router that needs to save or read data.
*   **`models.py`**
    *   **What it does:** It defines the physical blueprint for the database tables. 
    *   **How it connects:** It tells SQLAlchemy (our database tool) to create four tables: `products`, `customers`, `orders`, and `order_items`. It defines the columns (e.g., `price` is a Float, `name` is a String) and creates the links (Foreign Keys) between them, such as linking an `order` to a specific `customer`.
*   **`schemas.py`**
    *   **What it does:** It acts as a strict security guard for data entering and leaving the backend.
    *   **How it connects:** Before the backend accepts an order from the frontend, it checks `schemas.py` to ensure the data is shaped correctly (e.g., "Did they provide an email? Is the price greater than zero?"). It uses a library called Pydantic for this validation.
*   **`crud.py`**
    *   **What it does:** CRUD stands for Create, Read, Update, Delete. This file contains all the "worker" functions that actually talk to the database.
    *   **How it connects:** When a router wants to find a product, it doesn't write database code itself; it calls `get_product()` from `crud.py`. This file handles all the complex logic, like looping through an order to deduct stock from the product table before saving the order table.
*   **`routers/products.py`, `customers.py`, `orders.py`**
    *   **What they do:** These files define the exact URLs (endpoints) the frontend can visit, like `GET /products` or `POST /orders`.
    *   **How they connect:** They receive web traffic from `main.py`, validate the incoming JSON data using `schemas.py`, pass the validated data to the worker functions in `crud.py`, and then send the result back to the frontend as a JSON response.

### B. The Frontend (React / Vite)

Located in the `/frontend/src/` folder. This is the user interface.

*   **`main.jsx`**
    *   **What it does:** The absolute starting point of the frontend.
    *   **How it connects:** It grabs the empty `index.html` file provided by the browser and injects the entire React application (`App.jsx`) into it. It also loads the global CSS styles.
*   **`App.jsx`**
    *   **What it does:** It acts as the structural frame of the website.
    *   **How it connects:** It uses `react-router-dom` to act as a switchboard. It always displays the `Sidebar` component on the left, but looks at the URL (e.g., `/products`) to decide which Page component (e.g., `Products.jsx`) to display on the right.
*   **`api/index.js`**
    *   **What it does:** It is the "telephone" used to call the backend.
    *   **How it connects:** It uses a library called `axios`. Instead of the React pages having to write complex network code, they just import a simple function from here like `getProducts()`. This file knows the URL of the backend and handles formatting the HTTP requests.
*   **`components/Sidebar.jsx`**
    *   **What it does:** A reusable visual component that draws the left-hand navigation menu.
    *   **How it connects:** It uses `NavLink` to change the browser URL without reloading the page, seamlessly switching between Dashboard, Products, Customers, and Orders.
*   **`pages/Dashboard.jsx`**
    *   **What it does:** The welcome page showing a summary of the system.
    *   **How it connects:** When it loads, it uses `api/index.js` to fetch all products, customers, and orders simultaneously. It calculates totals and low-stock alerts, saving the results into React `state` variables to display on the screen.
*   **`pages/Products.jsx` & `Customers.jsx`**
    *   **What they do:** They display a data table of records and provide a pop-up form to add or delete records.
    *   **How they connect:** They map over the data arrays provided by the backend to draw table rows. When the user submits the form, they package the input data and send it to the backend via `api/index.js`.
*   **`pages/Orders.jsx`**
    *   **What it does:** The most complex page. It shows past orders and provides a "shopping cart" interface to create new ones.
    *   **How it connects:** It fetches products and customers from the backend to populate drop-down menus. As the user selects items and quantities, it saves them in a local "cart" state array, calculating the total price dynamically. Upon submission, it sends the complex nested data structure to the backend's `/orders` endpoint.

### C. Infrastructure & Containerization

Located in the root and respective subfolders. These files package the app so it runs anywhere.

*   **`backend/Dockerfile` & `frontend/Dockerfile`**
    *   **What they do:** They act as recipes to package the code into isolated boxes called "Containers".
    *   **How they connect:** The backend Dockerfile installs Python and requirements.txt. The frontend Dockerfile is a "multi-stage build": it uses Node.js to squish the React code into optimized HTML files, then throws Node.js away and puts those HTML files into a tiny, lightning-fast Nginx web server container.
*   **`docker-compose.yml`**
    *   **What it does:** The orchestra conductor.
    *   **How it connects:** Instead of starting the database, backend, and frontend manually one by one, this file defines how they all start together. It creates a private virtual network so the backend can securely talk to the database using the name `db`, and maps ports so your computer can access the frontend on port `80` and the backend on `8000`.
