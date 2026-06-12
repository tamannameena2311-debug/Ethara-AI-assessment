"""
This file defines our "Schemas" using a library called Pydantic.
While 'models.py' defined how data is saved in the database, 
'schemas.py' defines how data should look when it comes IN from the user (like a form submission) 
and how it should look when it goes OUT to the user (like sending data to the frontend).

This helps us automatically validate data. For example, if a user tries to create a product 
with a price of "banana", Pydantic will catch the error because we said price must be a float (number).
"""

# 1. Importing necessary components
# ---------------------------------------------------------
# 'BaseModel' is the building block for our schemas. 
# 'Field' lets us add extra rules, like "price must be greater than zero".
# 'EmailStr' automatically checks if an email address actually looks like a valid email (e.g., has an @ symbol).
from pydantic import BaseModel, Field, EmailStr

# 'List' lets us specify that we are expecting a list of items, not just one.
# 'Optional' means a piece of data isn't required; it could be left out.
from typing import List, Optional

# 'datetime' allows us to work with dates and times.
from datetime import datetime

# 2. Product Schemas
# ---------------------------------------------------------

# This is the "Base" schema for a Product. It contains the core information every product has.
class ProductBase(BaseModel):
    name: str
    sku: str
    # 'gt=0' means "Greater Than 0". A price can't be negative or zero.
    price: float = Field(gt=0)
    # 'ge=0' means "Greater than or Equal to 0". Stock can be 0, but not negative.
    stock_quantity: int = Field(ge=0)

# Schema used when creating a new product. 
# We inherit from ProductBase because creating a product requires exactly those same fields.
class ProductCreate(ProductBase):
    pass

# Schema used when updating a product.
# We use 'Optional' here because maybe the user just wants to change the price, 
# but wants to leave the name and sku the same. We don't force them to send everything again.
class ProductUpdate(BaseModel):
    name: Optional[str] = None
    sku: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    stock_quantity: Optional[int] = Field(None, ge=0)

# Schema used when reading a product from the database to send to the frontend.
class Product(ProductBase):
    # When sending a product out, we definitely want to include its ID.
    id: int
    
    # This configuration tells Pydantic: "Hey, you are going to receive data from a SQLAlchemy database model. 
    # Don't freak out, just read its attributes and convert it."
    class Config:
        from_attributes = True

# 3. Customer Schemas
# ---------------------------------------------------------

class CustomerBase(BaseModel):
    full_name: str
    # EmailStr will throw an error if the user sends "not-an-email"
    email: EmailStr
    phone_number: str

# Expected data when a new customer signs up
class CustomerCreate(CustomerBase):
    pass

# Data sent to the frontend when asking for customer details
class Customer(CustomerBase):
    id: int
    class Config:
        from_attributes = True

# 4. Order Schemas
# ---------------------------------------------------------

# When a user places an order, they send a list of items. 
# This schema defines what ONE of those items should look like in their request.
class OrderItemCreate(BaseModel):
    product_id: int
    # You must order at least 1 item
    quantity: int = Field(gt=0)

# How an order item looks when we send it back to the frontend to display
class OrderItem(BaseModel):
    id: int
    product_id: int
    quantity: int
    class Config:
        from_attributes = True

# Expected data when the user clicks "Checkout" or "Place Order".
class OrderCreate(BaseModel):
    # We need to know who is ordering...
    customer_id: int
    # ...and what they are ordering. Note that it's a 'List' (array) of 'OrderItemCreate' objects.
    items: List[OrderItemCreate]

# How an entire order looks when we send it to the frontend (e.g., for an Order History page).
class Order(BaseModel):
    id: int
    customer_id: int
    total_amount: float
    created_at: datetime
    # We include all the individual items that belong to this order.
    items: List[OrderItem]
    class Config:
        from_attributes = True
