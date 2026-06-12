# Project Overview: Full-Stack Inventory & Order Management System

## 1. Project Introduction

This project is a comprehensive, full-stack web application designed to handle inventory tracking, customer management, and order processing. The application is built using a modern technology stack, ensuring scalability, reliability, and an intuitive user experience. 

### Live Deployment Links
- **Frontend Application (Vercel):** [https://ethara-ai-assessment-9gg730ynf-tamanna-s-projects3.vercel.app/](https://ethara-ai-assessment-9gg730ynf-tamanna-s-projects3.vercel.app/)
- **Backend API Documentation (Railway):** [https://ethara-ai-assessment-production-4266.up.railway.app/docs](https://ethara-ai-assessment-production-4266.up.railway.app/docs)

---

## 2. Problem Statement and Solution

### The Challenge
Many businesses rely on fragmented systems, such as disconnected spreadsheets, to manage their core operations. This approach leads to severe operational bottlenecks:
- **Inventory Discrepancies:** Without real-time synchronization, businesses risk overselling products that are out of stock.
- **Data Silos:** Customer information, product pricing, and order histories are stored in separate locations, making it difficult to retrieve a cohesive view of operations.
- **Lack of Analytics:** Identifying low-stock items or calculating total daily revenue requires manual, time-consuming data aggregation.

### The Solution
We developed a centralized **Full-Stack Inventory & Order Management System** to digitize and automate these workflows.
- **Unified Database Architecture:** All entities (Products, Customers, Orders) are relational and stored in a robust PostgreSQL database, ensuring data integrity.
- **Automated Transaction Logic:** When a new order is generated, the backend API automatically verifies product availability and atomically deducts the purchased quantities from the central inventory. If stock is insufficient, the transaction is securely rejected.
- **Real-Time Dashboard UI:** The React-based frontend provides staff with immediate access to critical metrics, including low-stock alerts, total revenue, and comprehensive data tables for managing the business.

---

## 3. System Architecture and Data Flow

The application utilizes a decoupled client-server architecture.

1. **The Client (React Frontend):** Runs in the user's browser. It handles rendering the user interface, managing local component state, capturing user inputs, and displaying data. It communicates with the server exclusively via HTTP REST APIs.
2. **The Server (FastAPI Backend):** Acts as the secure middleware. It exposes specific API endpoints, validates incoming JSON payloads, enforces business logic (like checking inventory levels), and executes queries against the database.
3. **The Database (PostgreSQL):** The persistent storage layer. It maintains the relational schema and enforces data integrity rules (like ensuring Product SKUs and Customer Emails are strictly unique).

### Example Data Flow: Creating a New Order
1. **User Interaction:** The user selects a customer and adds products to their cart on the `/orders` page in the React frontend.
2. **API Request:** The frontend triggers the `createOrder` function in `api/index.js`, sending a JSON `POST` request to the backend's `/orders` endpoint.
3. **Routing & Validation:** The backend's `routers/orders.py` intercepts the request. It uses Pydantic schemas (`schemas.py`) to validate that the incoming data contains a valid `customer_id` and a list of items with valid `quantities`.
4. **Execution Layer:** The router forwards the validated data to the `create_order` function in `crud.py`.
5. **Database Transaction:** 
   - `crud.py` queries the database to verify the customer exists.
   - It iterates through the requested products, checking if `stock_quantity` is sufficient.
   - It calculates the total price dynamically.
   - It creates a new `Order` record, creates multiple `OrderItem` records, and updates the `Product` records to deduct the stock.
   - These database operations are committed as a single transaction.
6. **Response:** The backend returns the newly created Order object as a JSON response to the frontend.
7. **State Update:** The React frontend receives the 201 Created response, closes the order modal, and re-fetches the latest data to update the UI tables seamlessly.

---

## 4. Database Schema

The system utilizes a relational database structure defined via SQLAlchemy ORM.

### 1. `products` Table
Stores all inventory items available for sale.
- `id` (Integer, Primary Key): Unique identifier for the product.
- `name` (String): The display name of the product.
- `sku` (String, Unique): Stock Keeping Unit, a unique internal barcode/identifier.
- `price` (Float): The cost per unit of the product.
- `stock_quantity` (Integer): The current amount of units available in the warehouse.

### 2. `customers` Table
Stores registered client profiles.
- `id` (Integer, Primary Key): Unique identifier for the customer.
- `full_name` (String): First and last name of the customer.
- `email` (String, Unique): Contact email, enforced as unique to prevent duplicate accounts.
- `phone_number` (String): Contact phone number.

### 3. `orders` Table
Stores the high-level details of a transaction.
- `id` (Integer, Primary Key): Unique identifier for the order invoice.
- `customer_id` (Integer, Foreign Key): Links the order to a specific user in the `customers` table.
- `total_amount` (Float): The final calculated cost of all items in the order.
- `created_at` (DateTime): Automatically generated timestamp of when the transaction occurred.

### 4. `order_items` Table
A junction table that maps individual products to specific orders, handling the many-to-many relationship.
- `id` (Integer, Primary Key): Unique identifier for the line item.
- `order_id` (Integer, Foreign Key): Links this item to a parent record in the `orders` table.
- `product_id` (Integer, Foreign Key): Links this item to a specific record in the `products` table.
- `quantity` (Integer): The number of units of this specific product purchased in this specific order.

*(Note: Deleting a Customer cascades and deletes their Orders. Deleting an Order cascades and deletes its OrderItems.)*

---

## 5. Comprehensive File Structure Breakdown

### A. The Backend API (Python / FastAPI)
Located in `/backend/app/`. This layer provides the secure API infrastructure.

*   **`main.py`**
    *   **Functionality:** The core application entry point. It initializes the FastAPI instance, configures CORS (Cross-Origin Resource Sharing) middleware to allow web browsers to securely request data from different domains, and binds all modular routers to the main application tree.
*   **`database.py`**
    *   **Functionality:** Manages the physical PostgreSQL database connection. It utilizes SQLAlchemy to create an `engine` (the core connection pool) and a `SessionLocal` factory, which provides isolated, temporary database sessions for individual API requests.
*   **`models.py`**
    *   **Functionality:** Defines the ORM (Object-Relational Mapping) classes. These Python classes strictly represent the tables detailed in the Database Schema section above, allowing the application to interact with the database using Python objects instead of raw SQL strings.
*   **`schemas.py`**
    *   **Functionality:** Defines Pydantic data models. While `models.py` defines how data is *stored*, `schemas.py` defines how data is *transmitted* over the network. It enforces strict type-checking and validation rules (e.g., ensuring an email string is formatted correctly, or a price is not negative) before data is allowed to reach the database execution layer.
*   **`crud.py`**
    *   **Functionality:** Houses the core business logic and database execution scripts (Create, Read, Update, Delete). Routers offload all complex database operations to these helper functions to maintain clean, modular architecture.
*   **`routers/` (products.py, customers.py, orders.py)**
    *   **Functionality:** These files separate the API endpoints logically by domain. They act as controllers: defining the URL paths (`GET /products`), injecting database dependencies, accepting the validated Pydantic schemas, routing the data to `crud.py`, and handling HTTP error responses (e.g., raising a 404 Not Found exception).

### B. The Client Interface (React / Vite)
Located in `/frontend/src/`. This layer provides the interactive graphical user interface.

*   **`main.jsx` & `App.jsx`**
    *   **Functionality:** `main.jsx` mounts the React application into the browser's Document Object Model (DOM). `App.jsx` establishes the global application layout (Sidebar and Main Content Area) and implements `react-router-dom` to dynamically swap out page components based on the current browser URL without triggering a full page reload.
*   **`api/index.js`**
    *   **Functionality:** A centralized networking module utilizing the `axios` library. It abstracts away raw HTTP requests, providing the rest of the React application with simple, clean JavaScript functions (like `getProducts()`) to interact with the backend API. It dynamically targets the Vercel production API URL or local development server based on environment variables.
*   **`components/Sidebar.jsx`**
    *   **Functionality:** A persistent UI component providing primary navigation links.
*   **`pages/Dashboard.jsx`**
    *   **Functionality:** The application overview. It utilizes `Promise.all` to fetch metrics from all major database tables concurrently. It calculates dynamic statistics such as 'Low Stock Alerts' and renders them into high-level summary cards.
*   **`pages/Products.jsx` & `pages/Customers.jsx`**
    *   **Functionality:** High-level management interfaces. They utilize React state (`useState`) to manage local data arrays and HTML form inputs. They implement asynchronous functions (`useEffect`) to fetch and render data tables, and provide interactive Modal overlays for creating, editing, or deleting records.
*   **`pages/Orders.jsx`**
    *   **Functionality:** The most complex UI component. It manages a sophisticated "Cart" state. It fetches available products and customers to populate selection forms, dynamically calculates cart totals locally based on selected quantities, and packages a complex, nested JSON object to submit to the backend for final transaction processing.

### C. Infrastructure
*   **`docker-compose.yml` & `Dockerfile`s**
    *   **Functionality:** These files define the containerization strategy, allowing the entire system to be built and run uniformly across different operating systems. The backend Dockerfile packages Python and dependencies. The frontend Dockerfile utilizes a multi-stage build: first using Node.js to compile the React code into optimized static HTML/JS assets, then serving those assets via a lightweight Nginx web server. `docker-compose.yml` orchestrates these isolated containers into a unified virtual network.
