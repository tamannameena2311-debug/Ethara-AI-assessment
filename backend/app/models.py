"""
This file defines the "Models" for our database. 
Think of a model as a blueprint for a table in our database. 
If we want a "products" table, we write a Product class here.
SQLAlchemy (our database tool) reads these classes and automatically creates the tables for us.
"""

# 1. Importing necessary components from SQLAlchemy
# ---------------------------------------------------------
# We import data types (Integer, String, Float, DateTime) so we can tell the database what kind of data goes in each column.
# 'Column' is used to define a single vertical column in our table.
# 'ForeignKey' is used to link one table to another (e.g., linking an order to a specific customer).
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime

# 'relationship' is a powerful SQLAlchemy feature. It lets us easily fetch related data.
# For example, if we have a customer, we can just say 'customer.orders' to get all their orders,
# instead of writing a complex database query.
from sqlalchemy.orm import relationship

# 'func' gives us access to database functions, like getting the current time automatically.
from sqlalchemy.sql import func

# We import the 'Base' class we created in database.py.
# All our model classes MUST inherit from this 'Base' so SQLAlchemy knows they are part of the database.
from .database import Base

# 2. Defining the Product Model
# ---------------------------------------------------------
class Product(Base):
    # '__tablename__' tells SQLAlchemy exactly what to name the table in the database.
    __tablename__ = "products"

    # 'id' is the primary key. It's a unique number for every product (like a barcode).
    # 'index=True' makes it faster for the database to search for products by their ID.
    id = Column(Integer, primary_key=True, index=True)
    
    name = Column(String, index=True)
    
    # 'unique=True' means no two products can have the same SKU (Stock Keeping Unit).
    sku = Column(String, unique=True, index=True)
    price = Column(Float)
    stock_quantity = Column(Integer)

# 3. Defining the Customer Model
# ---------------------------------------------------------
class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String)
    
    # We make email unique so we don't have duplicate accounts for the same person.
    email = Column(String, unique=True, index=True)
    phone_number = Column(String)

    # This creates a virtual relationship to the Order model.
    # It says: "One customer can have many orders".
    # 'back_populates="customer"' tells SQLAlchemy that there's a matching relationship on the Order side.
    # 'cascade="all, delete-orphan"' means if we delete a customer, we automatically delete all their orders too.
    orders = relationship("Order", back_populates="customer", cascade="all, delete-orphan")

# 4. Defining the Order Model
# ---------------------------------------------------------
class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    
    # This is a Foreign Key. It stores the 'id' of the customer who made this order.
    # This is how the database physically links this order row to a customer row.
    customer_id = Column(Integer, ForeignKey("customers.id"))
    total_amount = Column(Float)
    
    # 'server_default=func.now()' tells the database to automatically fill in this column
    # with the exact date and time the order was created. We don't have to provide it!
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # This relationship links back to the Customer model.
    customer = relationship("Customer", back_populates="orders")
    
    # An order can contain multiple different products.
    # This links the order to the specific items inside it.
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")

# 5. Defining the OrderItem Model
# ---------------------------------------------------------
# We need this table because one order can have many products, 
# and we need to remember how many of EACH product were ordered.
class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    
    # Links this item to a specific Order
    order_id = Column(Integer, ForeignKey("orders.id"))
    
    # Links this item to a specific Product
    product_id = Column(Integer, ForeignKey("products.id"))
    
    # How many of this specific product were bought in this order
    quantity = Column(Integer)

    # The relationships to make looking up data easier in Python
    order = relationship("Order", back_populates="items")
    product = relationship("Product")
