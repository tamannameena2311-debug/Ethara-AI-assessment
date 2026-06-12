# Dockerfile for Frontend
# This uses a "Multi-Stage Build". 
# Stage 1: We use a heavy computer environment (Node.js) to build our React code into plain HTML/JS.
# Stage 2: We throw away the heavy environment and just use a tiny, lightning-fast web server (Nginx) to serve those static files.
# This makes our final container incredibly small and fast.

# ==========================================
# STAGE 1: Build the React application
# ==========================================
# We start with 'Node.js', which is the tool required to understand and build React code.
# 'as build' gives this stage a name so we can refer back to it later.
FROM node:20-alpine as build

# Create a folder called /app inside the container and work from there
WORKDIR /app

# First, copy ONLY the package.json files. 
# These files list the exact versions of the libraries our React app needs (like 'react-router-dom', 'axios', etc.)
COPY package*.json ./

# Tell Node to read package.json and download/install all those libraries.
RUN npm install

# Now, copy all of our actual source code (App.jsx, Dashboard.jsx, etc.) into the container
COPY . .

# We set up an Argument and Environment Variable.
# This allows our deployment service (like Vercel or Render) to inject the live backend URL 
# at the exact moment the frontend is being built, so the frontend knows where to send requests.
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Tell Node to run Vite's build process. 
# This squishes all our code down into a folder called 'dist' full of optimized HTML, CSS, and JS.
RUN npm run build


# ==========================================
# STAGE 2: Serve the application with Nginx
# ==========================================
# We start a BRAND NEW, completely empty container using Nginx.
# Nginx is an incredibly fast, industry-standard web server.
FROM nginx:alpine

# The Magic Step: We reach back into the "build" stage we created earlier, 
# grab ONLY the finished, optimized 'dist' folder, and drop it into Nginx's public folder.
# We completely throw away Node.js and all the messy source code!
COPY --from=build /app/dist /usr/share/nginx/html

# Because we are using React Router, we need a special Nginx rule.
# If a user refreshes the page while on "http://myapp.com/products", Nginx will look for a folder 
# called "products" and crash (Error 404). 
# This rule tells Nginx: "If you can't find a file, just serve index.html and let React figure out the routing!"
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Document that this container expects traffic on port 80 (the standard web port)
EXPOSE 80

# The command to start the Nginx web server and keep it running in the foreground
CMD ["nginx", "-g", "daemon off;"]
