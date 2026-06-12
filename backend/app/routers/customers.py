"""
This file is a "Router".
A router's job is to define the exact URLs (endpoints) that the frontend can visit, 
and decide what should happen when a user visits them.
This specific router handles everything related to Customers.
"""

# 1. Importing necessary tools
# ---------------------------------------------------------
# 'APIRouter' is what we use to create these endpoints.
# 'Depends' is used for "Dependency Injection" (explained below).
# 'HTTPException' is used to send standard web errors back to the frontend.
from fastapi import APIRouter, Depends, HTTPException

# 'Session' is our database connection type.
from sqlalchemy.orm import Session

# 'List' lets us specify that an endpoint returns a list of items.
from typing import List

# We import our crud operations (the workers) and our schemas (the data rules).
from .. import crud, schemas

# We import 'get_db' which is the function that actually gives us a database session.
from ..database import get_db

# 2. Creating the Router
# ---------------------------------------------------------
# We create a router specifically for customers.
# 'prefix="/customers"' means every URL in this file will automatically start with "/customers".
# E.g., if we create a "/" endpoint here, its full URL is actually "http://our-api.com/customers/"
router = APIRouter(
    prefix="/customers",
    tags=["customers"], # This groups these endpoints together in the automatic documentation.
)

# 3. Defining Endpoints (The URLs)
# ---------------------------------------------------------

# @router.post("") means: When the frontend sends a POST request to "/customers"...
# 'response_model=schemas.Customer' means: We promise to send back data formatted like a Customer schema.
# 'status_code=201' is the standard web code for "Successfully Created".
@router.post("", response_model=schemas.Customer, status_code=201)
def create_customer(
    # We expect the frontend to send us data formatted as 'CustomerCreate'
    customer: schemas.CustomerCreate, 
    # 'Depends(get_db)' is Dependency Injection. 
    # It tells FastAPI: "Before you run this function, run 'get_db()' first, and give me the result."
    db: Session = Depends(get_db)
):
    # First, let's check if a customer with this email already exists.
    db_customer = crud.get_customer_by_email(db, email=customer.email)
    if db_customer:
        # If they do exist, we stop everything and throw an error.
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # If the email is new, we ask our CRUD worker to create the customer in the database.
    return crud.create_customer(db=db, customer=customer)


# @router.get("") means: When the frontend sends a GET request to "/customers"...
@router.get("", response_model=List[schemas.Customer])
def read_customers(
    # We allow the frontend to specify 'skip' and 'limit' in the URL (e.g. /customers?skip=10&limit=50)
    # Default is skip=0, limit=100.
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db)
):
    # Ask the CRUD worker to get the list of customers and return it.
    customers = crud.get_customers(db, skip=skip, limit=limit)
    return customers


# @router.get("/{customer_id}") means: We are expecting a specific ID in the URL, like "/customers/5".
@router.get("/{customer_id}", response_model=schemas.Customer)
def read_customer(
    # FastAPI automatically pulls the '5' from the URL and puts it in this variable.
    customer_id: int, 
    db: Session = Depends(get_db)
):
    # Ask the CRUD worker to find customer #5.
    db_customer = crud.get_customer(db, customer_id=customer_id)
    if db_customer is None:
        # If they don't exist, throw a 404 Not Found error.
        raise HTTPException(status_code=404, detail="Customer not found")
    return db_customer


# @router.delete("/{customer_id}") means: When the frontend sends a DELETE request to "/customers/5"...
# 'status_code=204' means "No Content" (successfully deleted, nothing to send back).
@router.delete("/{customer_id}", status_code=204)
def delete_customer(customer_id: int, db: Session = Depends(get_db)):
    # Ask the CRUD worker to delete the customer.
    db_customer = crud.delete_customer(db, customer_id)
    if db_customer is None:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    # We don't need to return any data on a successful delete.
    return None
