"""
This file is the "Router" for Orders.
It defines the exact URLs (endpoints) that the frontend uses to create, read, and delete orders.
It acts as a middleman: it receives the web request, asks the 'crud' worker to do the job, 
and then sends the result back to the frontend.
"""

# 1. Importing necessary tools
# ---------------------------------------------------------
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

# Import our database helpers and data rules
from .. import crud, schemas
from ..database import get_db

# 2. Creating the Router
# ---------------------------------------------------------
# 'prefix="/orders"' means every endpoint below automatically starts with /orders
router = APIRouter(
    prefix="/orders",
    tags=["orders"], # Grouping in documentation
)

# 3. Defining Endpoints
# ---------------------------------------------------------

# CREATE AN ORDER
# When frontend sends a POST request to "/orders"...
@router.post("", response_model=schemas.Order, status_code=201)
def create_order(
    # The frontend must send data matching the 'OrderCreate' schema
    order: schemas.OrderCreate, 
    db: Session = Depends(get_db)
):
    # This is a very clean endpoint. All the complex logic (checking stock, reducing inventory, calculating totals)
    # is safely hidden away inside the 'crud.create_order' function. We just call it and return the result.
    return crud.create_order(db=db, order=order)

# READ ALL ORDERS
# When frontend sends a GET request to "/orders"...
@router.get("", response_model=List[schemas.Order])
def read_orders(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db)
):
    # Fetch a list of orders (useful for an admin dashboard)
    orders = crud.get_orders(db, skip=skip, limit=limit)
    return orders

# READ ONE ORDER
# When frontend sends a GET request to "/orders/123"...
@router.get("/{order_id}", response_model=schemas.Order)
def read_order(
    order_id: int, 
    db: Session = Depends(get_db)
):
    # Find that specific order
    db_order = crud.get_order(db, order_id=order_id)
    if db_order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    return db_order

# DELETE AN ORDER
# When frontend sends a DELETE request to "/orders/123"...
@router.delete("/{order_id}", status_code=204)
def delete_order(
    order_id: int, 
    db: Session = Depends(get_db)
):
    # Delete it. Because of the rules we set in models.py, this will automatically 
    # delete all the OrderItems attached to this order as well.
    db_order = crud.delete_order(db, order_id)
    if db_order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    return None
