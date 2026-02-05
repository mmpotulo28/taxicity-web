# WebSocket Server Deployment Guide

**Domain:** `ws.taxyciti.net`
**Infrastructure:** AWS ECS (Fargate) with ALB
**Container:** Docker
**Reverse Proxy:** AWS Application Load Balancer

---

## 🏗 Step 1: Build & Push Image

Run these commands from the **root** of your monorepo to build the WebSocket server image and push it to Docker Hub.

```bash
# 1. Login to Docker Hub (if not already logged in)
docker login

# 2. Build the image (targeting Linux AMD64 for ECS)
docker build --platform linux/amd64 -f apps/websocket/Dockerfile -t mmpotulo28/taxiciti-websocket:latest .

# 3. Push to Docker Hub
docker push mmpotulo28/taxiciti-websocket:latest
```

---

## ☁️ Step 2: Create ECS Cluster

1.  Log in to **AWS Console** > **ECS**.
2.  Click **Clusters** > **Create Cluster**.
3.  **Cluster name:** `taxicity-production`.
4.  **Infrastructure:** Select **AWS Fargate (serverless)**.
5.  Click **Create**.

---

## 📦 Step 3: Create Task Definition

1.  Go to **Task Definitions** > **Create new Task Definition**.
2.  **Task Definition Family:** `websocket-server`.
3.  **Launch Type:** AWS Fargate.
4.  **OS/Architecture:** Linux / X86_64.
5.  **Task Size:**
    - CPU: `.5 vCPU`
    - Memory: `1 GB`
6.  **Container Details:**
    - **Name:** `websocket`
    - **Image URI:** `mmpotulo28/taxiciti-websocket:latest`
    - **Container Port:** `3001`
    - **Protocol:** `TCP`
7.  **Environment Variables:**
    - Add the following key/value pairs:
        - `NODE_ENV`: `production`
        - `NEW_RELIC_LICENSE_KEY`: `<YOUR_LICENSE_KEY>`
        - `NEW_RELIC_APP_NAME`: `ws-taxicity`
        - `CLERK_SECRET_KEY`: `<YOUR_CLERK_SECRET_KEY>`
        - `CLERK_PUBLISHABLE_KEY`: `<YOUR_CLERK_PUBLISHABLE_KEY>`
        - `WS_INTERNAL_API_KEY`: `<YOUR_SECURE_KEY>` (for internal API calls)
8.  Click **Create**.

---

## 🚀 Step 4: Create Service & Load Balancer

1.  Go to your **Cluster** (`taxicity-production`).
2.  Under **Services**, click **Create**.
3.  **Compute configuration:** Launch type > Fargate.
4.  **Task definition:** `websocket-server` (Latest revision).
5.  **Service name:** `websocket-service`.
6.  **Desired tasks:** `1` (or more for scaling).
7.  **Networking:**
    - **VPC:** Select default VPC.
    - **Subnets:** Select all public subnets.
    - **Security Group:** Create new SG `websocket-sg`.
        - Allow TCP `3001` from `0.0.0.0/0` (for direct test) AND `80/443` (for LB).
8.  **Load Balancing:**
    - **Load balancer type:** Application Load Balancer.
    - **Load balancer name:** `taxicity-alb`.
    - **Container to load balance:** `websocket:3001`.
    - **Listener:** Create new listener on Port `443` (HTTPS).
        - **Certificate:** Choose your ACM certificate for `*.taxyciti.net` (or `ws.taxyciti.net`).
    - **Target Group:** Create new target group.
        - **Health check path:** `/` (or creates a `/health` endpoint in Express if needed).
9.  Click **Create**.

---

## 🌍 Step 5: Configure DNS (Route53)

1.  Go to **Route53**.
2.  Select your hosted zone (`taxyciti.net`).
3.  Create an **A Record** for `ws.taxyciti.net`.
4.  **Route traffic to:** Alias to Application and Classic Load Balancer.
5.  **Region:** Choose your region.
6.  **Balancer:** Select `taxicity-alb`.
7.  Click **Create records**.

---

## ✅ Step 6: Verify Deployment

Your WebSocket server is now running on Fargate behind an ALB.

1.  **Check Service Status:** In ECS, ensure `websocket-service` status is **Active** and running tasks is `1/1`.
2.  **Test Connection:**

```javascript
const ws = new WebSocket("wss://ws.taxyciti.net");

ws.onopen = () => console.log("✅ Connected to Secure WebSocket!");
ws.onmessage = (e) => console.log("📩 Message:", e.data);
```

---

## 🔧 Troubleshooting

- **Task Stopped (Exit Code 1):** Check logs in CloudWatch. Often missing env vars.
- **502 Bad Gateway:** ALB can't reach container. Check Security Group allows traffic from ALB to Container on Port 3001.
- **WebSocket Disconnects:** Enable "Stickiness" in Target Group settings if using multiple tasks (though standard websockets usually persist). Check ALB idle timeout (increase to 300s+).

- **502 Bad Gateway:** The Docker container isn't running or isn't on port 3001. Check `docker ps` and `docker logs websocket-server`.
- **403 Forbidden:** Nginx permissions or firewall issues.
- **Connection Failed:** Check AWS Security Groups (Port 443/80 open) and Nginx service status (`sudo systemctl status nginx`).
