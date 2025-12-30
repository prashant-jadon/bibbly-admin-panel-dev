# bearound Admin Panel - Deployment Guide

This guide provides step-by-step instructions for deploying the bearound Admin Panel on a virtual machine using Docker and Nginx.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Server Setup](#server-setup)
3. [Docker Installation](#docker-installation)
4. [Application Deployment](#application-deployment)
5. [SSL Certificate Setup](#ssl-certificate-setup)
6. [Environment Configuration](#environment-configuration)
7. [Running the Application](#running-the-application)
8. [Monitoring & Logs](#monitoring--logs)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- A Linux-based virtual machine (Ubuntu 20.04+ recommended)
- Domain name pointed to your server IP (e.g., `admin.bearound.com`)
- Root or sudo access to the server
- At least 2GB RAM and 20GB storage
- Backend API server running and accessible

---

## Server Setup

### 1. Update System Packages

```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Install Essential Tools

```bash
sudo apt install -y curl wget git vim htop ufw
```

### 3. Configure Firewall

```bash
# Enable firewall
sudo ufw enable

# Allow SSH
sudo ufw allow 22

# Allow HTTP and HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Check status
sudo ufw status
```

---

## Docker Installation

### 1. Install Docker

```bash
# Install dependencies
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# Add Docker GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add Docker repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io

# Start and enable Docker
sudo systemctl start docker
sudo systemctl enable docker

# Add your user to docker group
sudo usermod -aG docker $USER
```

### 2. Install Docker Compose

```bash
# Download latest Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Make executable
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker-compose --version
```

### 3. Re-login to Apply Group Changes

```bash
# Log out and log back in, or run:
newgrp docker
```

---

## Application Deployment

### 1. Clone the Repository

```bash
# Create app directory
sudo mkdir -p /opt/bearound
sudo chown -R $USER:$USER /opt/bearound
cd /opt/bearound

# Clone the repository (or copy files)
git clone <your-repository-url> .

# Or upload files via SCP
# scp -r ./adminpanel user@server:/opt/bearound/
```

### 2. Navigate to Admin Panel Directory

```bash
cd /opt/bearound/adminpanel
```

### 3. Create Environment File

```bash
cat > .env << 'EOF'
# Admin Panel Configuration
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api.bearound.com/api/v1

# Docker Configuration
COMPOSE_PROJECT_NAME=bearound-admin
EOF
```

---

## SSL Certificate Setup

### Option A: Using Let's Encrypt (Recommended for Production)

```bash
# Install Certbot
sudo apt install -y certbot

# Create directory for certbot
sudo mkdir -p /var/www/certbot

# Get certificate (replace with your domain)
sudo certbot certonly --standalone -d admin.bearound.com

# Copy certificates to nginx ssl directory
sudo cp /etc/letsencrypt/live/admin.bearound.com/fullchain.pem ./nginx/ssl/
sudo cp /etc/letsencrypt/live/admin.bearound.com/privkey.pem ./nginx/ssl/

# Set proper permissions
sudo chown -R $USER:$USER ./nginx/ssl/
chmod 600 ./nginx/ssl/*.pem
```

### Option B: Self-Signed Certificate (For Testing Only)

```bash
# Create self-signed certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ./nginx/ssl/privkey.pem \
  -out ./nginx/ssl/fullchain.pem \
  -subj "/CN=admin.bearound.com"
```

### Auto-Renewal Script (For Let's Encrypt)

```bash
# Create renewal script
cat > /opt/bearound/renew-certs.sh << 'EOF'
#!/bin/bash
certbot renew --quiet
cp /etc/letsencrypt/live/admin.bearound.com/fullchain.pem /opt/bearound/adminpanel/nginx/ssl/
cp /etc/letsencrypt/live/admin.bearound.com/privkey.pem /opt/bearound/adminpanel/nginx/ssl/
docker-compose -f /opt/bearound/adminpanel/docker-compose.yml restart nginx
EOF

chmod +x /opt/bearound/renew-certs.sh

# Add to crontab (runs at 2:30 AM daily)
(crontab -l 2>/dev/null; echo "30 2 * * * /opt/bearound/renew-certs.sh") | crontab -
```

---

## Environment Configuration

### Update nginx configuration for your domain

Edit `nginx/conf.d/default.conf` and replace `admin.bearound.com` with your actual domain:

```bash
sed -i 's/admin.bearound.com/your-domain.com/g' nginx/conf.d/default.conf
```

### Update API URL

Make sure the `NEXT_PUBLIC_API_URL` in `.env` points to your backend API:

```bash
# Edit .env file
nano .env

# Update this line:
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api/v1
```

---

## Running the Application

### 1. Build and Start Services

```bash
# Build the Docker image
docker-compose build

# Start all services in detached mode
docker-compose up -d
```

### 2. Check Service Status

```bash
# View running containers
docker-compose ps

# Check logs
docker-compose logs -f
```

### 3. Verify Deployment

```bash
# Check if admin panel is accessible
curl -I http://localhost:3000

# Check nginx
curl -I http://localhost
```

Visit `https://admin.bearound.com` (or your domain) in a browser.

---

## Monitoring & Logs

### View Logs

```bash
# All services
docker-compose logs -f

# Admin panel only
docker-compose logs -f adminpanel

# Nginx only
docker-compose logs -f nginx

# View nginx access logs
tail -f nginx/logs/access.log

# View nginx error logs
tail -f nginx/logs/error.log
```

### Monitor Resource Usage

```bash
# Docker stats
docker stats

# System resources
htop
```

### Health Checks

```bash
# Check container health
docker inspect --format='{{.State.Health.Status}}' bearound-adminpanel
docker inspect --format='{{.State.Health.Status}}' bearound-nginx
```

---

## Common Commands

### Start/Stop Services

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Restart services
docker-compose restart

# Restart a specific service
docker-compose restart adminpanel
```

### Update Application

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose build --no-cache
docker-compose up -d
```

### Clean Up

```bash
# Remove all containers and images
docker-compose down --rmi all

# Prune unused Docker resources
docker system prune -a
```

---

## Troubleshooting

### Issue: Container Won't Start

```bash
# Check logs
docker-compose logs adminpanel

# Check for port conflicts
sudo lsof -i :3000
sudo lsof -i :80
```

### Issue: 502 Bad Gateway

1. Check if the admin panel container is running:
   ```bash
   docker-compose ps
   ```

2. Check admin panel logs:
   ```bash
   docker-compose logs adminpanel
   ```

3. Verify network connectivity:
   ```bash
   docker network ls
   docker network inspect bearound-network
   ```

### Issue: SSL Certificate Errors

1. Verify certificate files exist:
   ```bash
   ls -la nginx/ssl/
   ```

2. Check certificate validity:
   ```bash
   openssl x509 -in nginx/ssl/fullchain.pem -text -noout
   ```

### Issue: API Connection Failed

1. Verify API URL in `.env`:
   ```bash
   cat .env | grep API_URL
   ```

2. Test API connectivity from container:
   ```bash
   docker exec bearound-adminpanel wget -qO- https://your-api-domain.com/api/v1/health
   ```

### Issue: Permission Denied

```bash
# Fix nginx ssl directory permissions
sudo chown -R $USER:$USER nginx/
chmod -R 755 nginx/
chmod 600 nginx/ssl/*.pem
```

---

## Production Checklist

- [ ] Domain DNS configured correctly
- [ ] SSL certificates installed and valid
- [ ] Firewall configured (ports 80, 443, 22)
- [ ] Environment variables set correctly
- [ ] Backend API accessible
- [ ] Automatic SSL renewal configured
- [ ] Log rotation configured
- [ ] Monitoring/alerting set up
- [ ] Backup strategy in place

---

## Support

For issues or questions:
- Check the logs first: `docker-compose logs -f`
- Review nginx error logs: `tail -f nginx/logs/error.log`
- Verify all environment variables are set correctly

---

*Last updated: December 2024*

