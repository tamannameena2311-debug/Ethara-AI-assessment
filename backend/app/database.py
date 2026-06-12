"""
This file handles the connection to our database.
Whenever our API needs to save or read data (like a new order or a list of products), 
it uses the setup in this file to talk to the database.

Let's understand the components here.
"""

# 1. Importing necessary libraries
# ---------------------------------------------------------
# 'os' is a standard Python library that lets us interact with the operating system,
# for example, to read environment variables (which are like secret settings hidden on the computer).
import os

# 'SQLAlchemy' is our chosen library for interacting with the database. 
# It's an ORM (Object-Relational Mapper), which means it lets us write Python code 
# instead of complex SQL database queries.
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# 2. Database URL Setup
# ---------------------------------------------------------
# Here we try to get the 'DATABASE_URL' from the computer's environment variables.
# This is where production databases (like PostgreSQL on Render) provide their connection link.
# If 'DATABASE_URL' is not found (like when we are testing locally), it defaults to 'sqlite:///./sql_app.db'.
# SQLite is a very simple database that just saves everything into a single file ('sql_app.db') on your computer.
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./sql_app.db")

# 3. Connection Arguments
# ---------------------------------------------------------
# SQLite has a quirk: by default, it doesn't like multiple "threads" (processes) talking to it at once.
# But FastAPI handles many requests at the same time using different threads.
# So, if we are using SQLite, we pass 'check_same_thread: False' to tell SQLite to relax and allow it.
# If we are using a real database like PostgreSQL, we don't need this, so we pass an empty dictionary {}.
connect_args = {"check_same_thread": False} if SQLALCHEMY_DATABASE_URL.startswith("sqlite") else {}

# 4. Creating the Engine
# ---------------------------------------------------------
# The 'engine' is the core of SQLAlchemy. It's the actual mechanism that connects 
# to the database URL we provided and executes our requests.
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args=connect_args
)

# 5. Creating a Session Factory
# ---------------------------------------------------------
# Think of a 'Session' as a single, temporary conversation with the database.
# 'sessionmaker' creates a factory that will generate these new sessions whenever we need one.
# 'autocommit=False' means we have to manually tell the database when to save our changes permanently.
# 'autoflush=False' means SQLAlchemy won't try to prematurely send changes to the database before we are ready.
# 'bind=engine' links these sessions to the engine we created above.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 6. Creating the Base Class
# ---------------------------------------------------------
# 'declarative_base()' returns a base class. 
# In our 'models.py' file, we will create Python classes that represent our database tables (like Product, Customer).
# All of those classes will inherit from this 'Base', so SQLAlchemy knows they are part of our database structure.
Base = declarative_base()

# 7. Database Dependency Function
# ---------------------------------------------------------
# This function is used by our FastAPI routes. 
# Whenever a route needs to talk to the database, it calls this function.
def get_db():
    # 1. Create a new session (start a new conversation with the database)
    db = SessionLocal()
    try:
        # 2. 'yield' the session. This hands the session over to the route so it can use it.
        # It's like pausing this function while the route does its work.
        yield db
    finally:
        # 3. No matter what happens (even if an error occurs in the route), 
        # this 'finally' block ensures the session is closed when the route is finished.
        # This is super important to prevent "memory leaks" and keep the application running smoothly.
        db.close()
