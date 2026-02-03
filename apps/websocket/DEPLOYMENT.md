# WebSocket Server Deployment Guide

**Domain:** `ws.taxyciti.net`
**Infrastructure:** AWS EC2 (Ubuntu 22.04/24.04 LTS)
**Container:** Docker
**Reverse Proxy:** Nginx with Let's Encrypt SSL

---

## 🏗 Step 1: Build & Push Image (Local Machine)

Run these commands from the **root** of your monorepo to build the WebSocket server image and push it to Docker Hub.

```bash
# 1. Login to Docker Hub (if not already logged in)
docker login

# 2. Build the image (targeting Linux AMD64 for AWS EC2)
docker build --platform linux/amd64 -f apps/websocket/Dockerfile -t mmpotulo28/taxiciti-websocket:latest .

# 3. Push to Docker Hub
docker push mmpotulo28/taxiciti-websocket:latest
```

---

## ☁️ Step 2: Launch AWS EC2 Instance

1.  **Log in to AWS Console** > **EC2** > **Launch Instance**.
2.  **Name:** `TaxiCity-WebSocket`
3.  **OS:** **Ubuntu Server 24.04 LTS** (or 22.04).
4.  **Instance Type:** `t3.micro` (or `t2.micro` for Free Tier).
5.  **Key Pair:** Select your existing key or create a new one (download the `.pem` file).
6.  **Network Settings (Security Group)**:
    - Create a new security group.
    - **Inbound Rules:**
        - **SSH (TCP 22):** Source `My IP` (Recommended) or `0.0.0.0/0`.
        - **HTTP (TCP 80):** Source `0.0.0.0/0` (Anywhere).
        - **HTTPS (TCP 443):** Source `0.0.0.0/0` (Anywhere).
    - *Note: We do NOT need to open port 3001 externally because Nginx will handle the traffic on 443 and proxy it internally.*

---

## 🌍 Step 3: Configure DNS

1.  Go to your DNS Provider (Route53, GoDaddy, Cloudflare).
2.  Create a new **A Record**:
    - **Name:** `ws` (subdomain)
    - **Value:** `<YOUR_EC2_PUBLIC_IP>` (e.g., `54.123.45.67`)
    - **TTL:** Automatic or 300 seconds.

---

## 💻 Step 4: Server Setup (SSH)

SSH into your new instance:

```bash
chmod 400 path/to/your-key.pem
ssh -i path/to/your-key.pem ubuntu@<YOUR_EC2_PUBLIC_IP>
```

### 1. Install Docker & Nginx

Run the following commands on the server:

```bash
# Update Config
sudo apt-get update
sudo apt-get upgrade -y

# Install tools
sudo apt-get install -y nginx certbot python3-certbot-nginx

# Install Docker
sudo apt-get install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Setup Permissions (avoid sudo for docker)
sudo usermod -aG docker $USER
```

**⚠️ Important:** Log out and log back in for group permissions to take effect.

```bash
exit
ssh -i path/to/your-key.pem ubuntu@<YOUR_EC2_PUBLIC_IP>
```

---

## 🚀 Step 5: Run WebSocket Server

Pull and run the container on the server.

```bash
# Pull the latest image
docker pull mmpotulo28/taxiciti-websocket:latest

# Run the container attached to the host network or mapping port 3001
# We map public 3001 to internal 3001, but Nginx will talk to localhost:3001
docker run -d \
  --name websocket-server \
  --restart always \
  -p 3001:3001 \
  mmpotulo28/taxiciti-websocket:latest
```

Check if it's running:
```bash
docker ps
```

---

## 🔒 Step 6: Configure Nginx & SSL

We need to tell Nginx to forward `ws.taxyciti.net` traffic to our Docker container running on port 3001, and upgrade the connection to WebSocket.

### 1. Create Nginx Configuration

Create a specific config file for the subdomain:

```bash
sudo nano /etc/nginx/sites-available/ws.taxyciti.net
```

**Paste the following configuration exactly:**

```nginx
server {
    server_name ws.taxyciti.net;

    location / {
        # Forward to Docker container on port 3001
        proxy_pass http://localhost:3001;

        # WebSocket Support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        # Headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Save and exit (`Ctrl+X`, then `Y`, then `Enter`).

### 2. Enable Site & Restart Nginx

```bash
# Link the config to sites-enabled
sudo ln -s /etc/nginx/sites-available/ws.taxyciti.net /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### 3. Setup SSL (HTTPS/WSS)

Use Certbot to automatically fetch a certificate and update the Nginx config.

```bash
sudo certbot --nginx -d ws.taxyciti.net
```

- Enter your email address for renewal notices.
- Agree to the Terms of Service.
- Certbot will obtain the certificate and modify your nginx config to listen on port 443.

---

## ✅ Step 7: Verify Connection

Your WebSocket server is now deployed at **`wss://ws.taxyciti.net`**.

You can verify connection using a tool like Postman, or a simple JS snippet in your browser console:

```javascript
const ws = new WebSocket('wss://ws.taxyciti.net');

ws.onopen = () => console.log('✅ Connected to Secure WebSocket!');
ws.onmessage = (e) => console.log('📩 Message:', e.data);
ws.onerror = (e) => console.error('❌ Error:', e);
ws.onclose = () => console.log('⚠️ Disconnected');
```

### Troubleshooting
- **502 Bad Gateway:** The Docker container isn't running or isn't on port 3001. Check `docker ps` and `docker logs websocket-server`.
- **403 Forbidden:** Nginx permissions or firewall issues.
- **Connection Failed:** Check AWS Security Groups (Port 443/80 open) and Nginx service status (`sudo systemctl status nginx`).
