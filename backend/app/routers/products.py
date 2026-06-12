"""
This file is the "Router" for Products.
It defines the exact URLs (endpoints) that the frontend uses to create, read, update, and delete products.
Just like the other routers, it acts as a traffic cop, directing incoming web requests
to the correct worker functions in the 'crud.py' file.
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
# 'prefix="/products"' means every endpoint below automatically starts with /products
router = APIRouter(
    prefix="/products",
    tags=["products"],
)

# 3. Defining Endpoints
# ---------------------------------------------------------

# CREATE A PRODUCT
# Method: POST, URL: /products
@router.post("", response_model=schemas.Product, status_code=201)
def create_product(product: schemas.ProductCreate, db: Session = Depends(get_db)):
    # 1. Check if a product with this exact SKU (barcode) already exists
    db_product = crud.get_product_by_sku(db, sku=product.sku)
    if db_product:
        # If it does, stop and throw an error. SKUs must be unique!
        raise HTTPException(status_code=400, detail="SKU already registered")
        
    # 2. If it's a new SKU, tell the crud worker to save it to the database
    return crud.create_product(db=db, product=product)

# READ ALL PRODUCTS
# Method: GET, URL: /products
@router.get("", response_model=List[schemas.Product])
def read_products(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    # Ask the crud worker for the list of products (with optional pagination)
    products = crud.get_products(db, skip=skip, limit=limit)
    return products

# READ ONE PRODUCT
# Method: GET, URL: /products/5
@router.get("/{product_id}", response_model=schemas.Product)
def read_product(product_id: int, db: Session = Depends(get_db)):
    # Ask the crud worker to find product number 5
    db_product = crud.get_product(db, product_id=product_id)
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return db_product

# UPDATE A PRODUCT
# Method: PUT, URL: /products/5
@router.put("/{product_id}", response_model=schemas.Product)
def update_product(
    product_id: int, 
    # Notice we expect 'ProductUpdate' data here. It means the frontend doesn't HAVE
    # to send all the data, just the pieces they want to change.
    product: schemas.ProductUpdate, 
    db: Session = Depends(get_db)
):
    # Ask the crud worker to perform the update
    db_product = crud.update_product(db, product_id, product)
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return db_product

# DELETE A PRODUCT
# Method: DELETE, URL: /products/5
@router.delete("/{product_id}", status_code=204)
def delete_product(product_id: int, db: Session = Depends(get_db)):
    # Ask the crud worker to delete product number 5
    db_product = crud.delete_product(db, product_id)
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return None
