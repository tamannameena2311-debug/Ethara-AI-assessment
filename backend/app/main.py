"""
This is the main entry point for our backend application.
We are using a framework called "FastAPI", which makes it very easy and fast to build web APIs in Python.
Think of an API as a waiter in a restaurant. The frontend (the customer) gives the waiter an order, 
the waiter takes it to the kitchen (the backend database), and brings back the food (the data).

Let's break down what each part of this file does.
"""

# 1. Importing necessary tools and libraries
# ---------------------------------------------------------
# 'FastAPI' is the main class we use to create our web application.
from fastapi import FastAPI

# 'CORSMiddleware' is a security feature. Browsers normally block a web page from making requests 
# to a different domain than the one that served the web page (this is called Cross-Origin Resource Sharing or CORS).
# We need this middleware to tell the browser "Hey, it's okay for our React frontend to talk to this FastAPI backend".
from fastapi.middleware.cors import CORSMiddleware

# Here we import other files from our own project.
# The '.' means "look in the current folder".
# We import 'models' which contains the blueprints for our database tables.
from . import models

# We import 'engine' from 'database.py'. The engine is what actually connects to the database and talks to it.
from .database import engine

# We import 'routers'. A router is like a mini-FastAPI application. 
# Instead of putting all our code in one massive file, we split it up by topic: products, customers, and orders.
from .routers import products, customers, orders

# 2. Creating the Database Tables
# ---------------------------------------------------------
# This line tells SQLAlchemy (our database tool) to look at all the 'models' we defined
# and actually create the physical tables in the database if they don't exist yet.
# 'bind=engine' tells it to use the connection we set up earlier.
models.Base.metadata.create_all(bind=engine)

# 3. Initializing the FastAPI Application
# ---------------------------------------------------------
# We create a new FastAPI application and give it a title. This title will show up in the automatic documentation.
app = FastAPI(title="Inventory & Order Management API")

# 4. Configuring CORS (Cross-Origin Resource Sharing)
# ---------------------------------------------------------
# We add the CORSMiddleware to our application to allow our frontend to communicate with it.
app.add_middleware(
    CORSMiddleware,
    # 'allow_origins=["*"]' means we allow any website to talk to our API.
    # The "*" is a wildcard that means "everything".
    # Note: In a real, public-facing application, you should list the specific URLs of your frontend for security.
    allow_origins=["*"], 
    
    # 'allow_credentials=True' means we allow the frontend to send cookies or authorization headers.
    allow_credentials=True,
    
    # 'allow_methods=["*"]' means we allow all HTTP methods like GET (read data), POST (create data), PUT (update), DELETE (remove).
    allow_methods=["*"],
    
    # 'allow_headers=["*"]' means we allow the frontend to send any extra information headers in the request.
    allow_headers=["*"],
)

# 5. Connecting our Routers
# ---------------------------------------------------------
# We tell our main application to include the mini-applications (routers) we imported earlier.
# Now, if a user goes to a URL related to products, customers, or orders, 
# the main app knows exactly which file to send them to.
app.include_router(products.router)
app.include_router(customers.router)
app.include_router(orders.router)

# 6. Creating a Root Endpoint
# ---------------------------------------------------------
# '@app.get("/")' is a decorator. It tells FastAPI: "When someone visits the main, root URL (/) of our API using a GET request, run the function directly below this".
@app.get("/")
def root():
    # This function simply returns a dictionary, which FastAPI automatically converts into JSON format.
    # It's a nice way to quickly check if the API is running correctly.
    return {"message": "Welcome to the Inventory & Order Management API"}
