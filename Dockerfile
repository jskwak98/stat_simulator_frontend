# Use an official Nginx image as a parent image
FROM nginx:alpine

# Copy static files to Nginx server
COPY . /usr/share/nginx/html

# Copy the config
COPY default.conf /etc/nginx/conf.d/default.conf

# Expose port 8080
EXPOSE 8080

# Start Nginx when the container launches
CMD ["nginx", "-g", "daemon off;"]
