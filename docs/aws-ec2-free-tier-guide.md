# AWS EC2 Free Tier Deployment Guide with HTTPS & Custom Domains

This guide covers deploying TaxiCity to an **AWS EC2 t2.micro** instance (Free Tier) with **HTTPS (SSL)** and **Custom Domains** using Nginx as a reverse proxy.

## Overview

1.  **Build Images** (Targeting Linux/AMD64).
2.  **Launch EC2** (Ubuntu Server).
3.  **Configure DNS** (Point domains to EC2).
4.  **Setup Server** (Docker, Swap Memory).
5.  **Deploy Apps** (Docker Compose).
6.  **Setup Nginx & SSL** (Reverse Proxy, Certbot).

---

## 🏗 Step 0: Build Images for Production

**Crucial Step:** Since your server uses Intel/AMD architecture (`linux/amd64`) and you are likely developing on a Mac (`linux/arm64`), you **must** build with the `--platform` flag.

Run these commands on your **Local Machine**:

```bash
# Build User App
docker build --platform linux/amd64 -f apps/user/Dockerfile -t mmpotulo28/taxyciti-user:latest .

# Build Driver App
docker build --platform linux/amd64 -f apps/driver/Dockerfile -t mmpotulo28/taxyciti-driver:latest .

# Push to Docker Hub
docker push mmpotulo28/taxyciti-user:latest
docker push mmpotulo28/taxyciti-driver:latest
```

---

## 🛠 Step 1: Launch EC2 Instance

1.  **Log in to AWS Console** > **EC2** > **Launch Instance**.
2.  **Name:** `TaxiCity-Server`
3.  **OS:** Ubuntu Server 24.04 LTS (HVM).
4.  **Instance Type:** `t2.micro` (Free Tier Eligible).
5.  **Key Pair:** Create a new key pair (e.g., `taxyciti-key`). **Download the .pem file** and keep it safe.
6.  **Network Settings**:
    - Allow **SSH** traffic from **Anywhere** (or My IP).
    - Allow **HTTP** traffic from the internet.
    - Allow **HTTPS** traffic from the internet.
7.  **Launch Instance**.

### Configure Security Group (Firewall)

For security, we will only expose web ports (80/443) and SSH (22). The Next.js apps (3000/3001) will process traffic internally via Nginx.

1.  Go to **EC2 Dashboard** > **Instances** > Select Instance > **Security** tab > Click **Security Group**.
2.  **Edit Inbound Rules**:
    - **SSH** (TCP 22) | Source: `0.0.0.0/0` (or your IP)
    - **HTTP** (TCP 80) | Source: `0.0.0.0/0`
    - **HTTPS** (TCP 443) | Source: `0.0.0.0/0`
    - _(Remove any rules for 3000 or 3001 if they exist)_.

### Allocate Elastic IP (Static IP)

To prevent your IP from changing if you restart the server:

1.  Go to **EC2 Dashboard** > **Network & Security** > **Elastic IPs**.
2.  **Allocate Elastic IP address**.
3.  Select the new IP > **Actions** > **Associate Elastic IP address**.
4.  Select your `TaxiCity-Server` instance and click **Associate**.
5.  **Note this IP address** (e.g., `54.123.45.67`).

---

## 🌍 Step 2: Configure Custom Domains

Go to your domain registrar (GoDaddy, Namecheap, Route53, Cloudflare, etc.) and manage DNS records.

### ⚠️ Cloudflare Users: Read This First!

1.  **Record Type:** You MUST use an **A Record** (not CNAME) when pointing to an IP address (e.g., `54.123.45.67`).
2.  **SSL/TLS Mode:** You **MUST** set SSL/TLS to **Full (Strict)** in the Cloudflare Dashboard.
    - _Why?_ If set to "Flexible", Cloudflare talks to your server via HTTP. Your server (configured with Certbot) forces a redirect to HTTPS. This causes an infinite `ERR_TOO_MANY_REDIRECTS` loop.
    - **Fix:** Cloudflare Dashboard > SSL/TLS > Overview > Select **Full (Strict)**.

### DNS Records Setup

Assuming your domain is `taxyciti.com` and your EC2 Elastic IP is `54.123.45.67`.

| Type  | Name / Host       | Value / Target      | Proxy Status (Cloudflare) |
| :---- | :---------------- | :------------------ | :------------------------ |
| **A** | `app` (or `user`) | `<YOUR_ELASTIC_IP>` | Proxied (Orange Cloud)    |
| **A** | `driver`          | `<YOUR_ELASTIC_IP>` | Proxied (Orange Cloud)    |

_Example outcome:_

- User App: `app.taxyciti.com` -> `54.123.45.67`
- Driver App: `driver.taxyciti.com` -> `54.123.45.67`

---

## 💻 Step 3: Connect & Setup Server

Open your terminal (Mac/Linux) or PowerShell (Windows).
Move your key file to a safe folder (e.g., `~/.ssh/`).

```bash
chmod 400 ~/.ssh/taxyciti-key.pem
ssh -i "~/.ssh/taxyciti-key.pem" ubuntu@<YOUR_ELASTIC_IP>
```

### Install Docker, Nginx & Certbot

Run these commands inside the EC2 server:

```bash
# Update packages
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg nginx python3-certbot-nginx

# Install Docker
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Permissions
sudo usermod -aG docker $USER
```

### Enable Swap Memory (Crucial for 1GB RAM)

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

**Log out and log back in** for Docker permissions to take effect.

```bash
exit
ssh -i "~/.ssh/taxyciti-key.pem" ubuntu@<YOUR_ELASTIC_IP>
```

---

## 🚀 Step 4: Deploy Applications

### 1. Create Environment File

```bash
nano .env.production
```

Paste your env vars. (Ctrl+X, Y, Enter to save).

### 2. Upload Docker Compose

```bash
nano docker-compose.yml
```

Paste the content of your `docker-compose.prod.yml`.
_Note: Ensure ports are mapped as `"127.0.0.1:3000:3000"` so they are not exposed publicly._

### 3. Start Apps

```bash
docker compose up -d
```

Check if they are running: `docker compose ps`.

---

## 🔒 Step 5: Configure Nginx & SSL

We will configure Nginx to receive traffic on domains and forward it to Docker ports (3000 & 3001).

### 1. Create Nginx Config

Delete default config and create a new one:

```bash
sudo rm /etc/nginx/sites-enabled/default
sudo nano /etc/nginx/sites-available/taxyciti
```

**Paste the following configuration** (Replace `app.yourdomain.com` and `driver.yourdomain.com` with your actual domains):

```nginx
# User App
server {
    server_name app.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Driver App
server {
    server_name driver.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 2. Activate Config & Test

```bash
sudo ln -s /etc/nginx/sites-available/taxyciti /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 3. Generate SSL Certificates (HTTPS)

Run Certbot to automatically configure SSL for both domains:

```bash
sudo certbot --nginx -d app.yourdomain.com -d driver.yourdomain.com
```

- Enter your email.
- Agree to terms.
- Select checks/options as needed.
- Certbot will automatically update the Nginx config to enable HTTPS.

---

## ✅ Deployment Complete!

Visit your domains:

- `https://app.yourdomain.com`
- `https://driver.yourdomain.com`

### 🔄 Monitoring & Maintenance

**View Logs:**

```bash
docker compose logs -f user-app
# or
docker compose logs -f driver-app
```

**Renew SSL:**
Certbot renews automatically, but you can test it:

```bash
sudo certbot renew --dry-run
```
