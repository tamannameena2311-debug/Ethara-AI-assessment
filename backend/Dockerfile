# Docker is a tool that packages up our code and all its dependencies into a single, standard unit called a "Container".
# This Dockerfile is the recipe for creating that container.
# It ensures that our backend runs exactly the same way on every computer, whether it's your laptop or a massive cloud server.

# 1. Base Image
# ---------------------------------------------------------
# Think of this as the starting point. We don't want to build an operating system from scratch.
# We say: "Start with a tiny, lightweight version of Linux that already has Python 3.11 installed."
FROM python:3.11-slim

# 2. Working Directory
# ---------------------------------------------------------
# This tells Docker: "Inside this new container, create a folder called /app, 
# and make sure any subsequent commands are run from inside that folder."
WORKDIR /app

# 3. Environment Variables
# ---------------------------------------------------------
# PYTHONDONTWRITEBYTECODE: Stops Python from creating messy .pyc files inside our clean container.
ENV PYTHONDONTWRITEBYTECODE 1
# PYTHONUNBUFFERED: Ensures our Python print() statements show up instantly in the terminal log, rather than being delayed.
ENV PYTHONUNBUFFERED 1

# 4. System Dependencies
# ---------------------------------------------------------
# Sometimes Python packages need underlying C-code tools from the operating system to work correctly.
# For example, if we use PostgreSQL later, 'psycopg2' requires 'gcc' and 'libpq-dev'.
# This command updates the Linux package manager, installs those tools, and then cleans up to keep the container size small.
RUN apt-get update \
    && apt-get install -y --no-install-recommends gcc libpq-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# 5. Install Python Dependencies
# ---------------------------------------------------------
# First, we copy JUST the requirements.txt file from our computer into the container.
COPY requirements.txt .

# Then, we tell pip (Python's package manager) to install everything listed in that file.
# '--no-cache-dir' tells pip not to save the downloaded installation files, keeping our container smaller.
RUN pip install --no-cache-dir -r requirements.txt

# 6. Copy Application Code
# ---------------------------------------------------------
# Now we copy the REST of our code (main.py, models.py, etc.) into the container's /app folder.
# Why do we do this AFTER installing requirements? 
# Because code changes frequently, but requirements rarely do. Docker is smart: if requirements.txt didn't change, 
# it skips step 5 and just copies the new code, saving a lot of build time!
COPY . .

# 7. Expose Port
# ---------------------------------------------------------
# This doesn't actually publish the port, but it acts as documentation to tell anyone running this container:
# "Hey, this application expects to receive web traffic on port 8000."
EXPOSE 8000

# 8. Command to Run
# ---------------------------------------------------------
# This is the final command that actually starts our server when the container is turned on.
# 'uvicorn' is a lightning-fast web server that runs FastAPI applications.
# 'app.main:app' tells it to look in the 'app' folder, find 'main.py', and run the object named 'app'.
# '--host 0.0.0.0' tells it to listen for traffic from ANY IP address (required inside Docker).
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
