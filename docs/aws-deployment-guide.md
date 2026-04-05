# AWS App Runner Deployment Guide

This guide details how to deploy the **TaxiCity** User and Driver web applications to AWS App Runner using the Docker images we have built and pushed to Docker Hub.

## 🏗 Why App Runner?

We chose AWS App Runner because:

1.  **Zero Server Management**: No EC2 instances to patch or scale manually.
2.  **Cost Efficient**: You pay only for the compute resources (vCPU/RAM) you provision.
3.  **Automatic Deployment**: It can automatically re-deploy when you push a new image to Docker Hub.
4.  **Simplicity**: It handles Load Balancing and SSL (HTTPS) automatically.

---

## 📋 Prerequisites

1.  **AWS Account**: You must have access to the AWS Console.
2.  **Docker Hub Images**: Ensure the following images are pushed and accessible (public or authenticated):
    - `mmpotulo28/taxiciti-user:latest`
    - `mmpotulo28/taxiciti-driver:latest`
    - `mmpotulo28/taxiciti-api:latest`

## 🚀 Deployment Steps

### Step 0: Deploy the API App (`apps/api`)

1.  **Log in to AWS Console** and search for **"App Runner"**.
2.  Click **Create Service**.
3.  **Source:**
    - Repository type: **Container Registry**.
    - Container Image URI: `mmpotulo28/taxiciti-api:latest`
4.  **Configuration:**
    - **Service name:** `taxiciti-api-app`
    - **Virtual CPU & Memory:** `1 vCPU / 2 GB`
    - **Port:** `3006`
5.  **Environment Variables:**
    - `DATABASE_URL`
    - One token verification strategy:
        - `CLERK_JWT_PUBLIC_KEY`, or
        - `JWT_PUBLIC_KEY`, or
        - `JWT_SECRET`
    - `INTERNAL_PROXY_SECRET` (optional, only if using trusted proxy header forwarding)
    - `BLOB_READ_WRITE_TOKEN`
    - `UPLOAD_MAX_FILE_BYTES` (optional)
    - `REDIS_URL` (or equivalent Upstash URL variables used in your environment)
6.  **Review & Create:** Click deploy.

### Step 1: Deploy the User App (`apps/user`)

1.  **Log in to AWS Console** and search for **"App Runner"**.
2.  Click **Create Service**.
3.  **Source:**
    - Repository type: **Container Registry**.
    - Provider: **Amazon ECR / Public** (or your private Docker Hub provider settings).
    - Container Image URI: `mmpotulo28/taxiciti-user:latest`
4.  **Deployment triggers:**
    - Select **Automatic**. (This ensures that whenever you run `docker push` locally or via GitHub Actions, AWS updates the site automatically).
5.  **Configuration:**
    - **Service name:** `taxiciti-user-app`
    - **Virtual CPU & Memory:** `1 vCPU / 2 GB` (Start small, scale up if needed).
    - **Port:** `3000` (Our Docker container exposes port 3000).
6.  **Environment Variables:**
    Copy these keys and their values from your `.env.local`:
    - `DATABASE_URL`
    - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
    - `CLERK_SECRET_KEY`
    - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
    - `NEXT_PUBLIC_PUSHER_KEY`
    - `NEXT_PUBLIC_PUSHER_CLUSTER`
    - `PUSHER_APP_ID`
    - `PUSHER_KEY`
    - `PUSHER_SECRET`
    - `PUSHER_CLUSTER`
    - `UPSTASH_REDIS_REST_URL`
    - `UPSTASH_REDIS_REST_TOKEN`
    - `KV_REST_API_URL`
    - `KV_REST_API_TOKEN`
    - `KV_URL`
    - `REDIS_URL`
    - `SENTRY_AUTH_TOKEN` (Optional for runtime, mostly for build)
7.  **Review & Create:** Click deploy. It may take 5-10 minutes to start.

### Step 2: Deploy the Driver App (`apps/driver`)

1.  Go back to the App Runner dashboard and click **Create Service**.
2.  **Source:**
    - Container Image URI: `mmpotulo28/taxiciti-driver:latest`
3.  **Deployment triggers:**
    - Select **Automatic**.
4.  **Configuration:**
    - **Service name:** `taxiciti-driver-app`
    - **Virtual CPU & Memory:** `1 vCPU / 2 GB`
    - **Port:** `3000` (Caution: Ensure you set Port 3000, even though we develop on 3001 locally, the Docker container standardizes on 3000).
5.  **Environment Variables:**
    - Use the variables required by the User app.
    - Add API routing variables:
        - `NEXT_PUBLIC_API_URL` (public API base URL, e.g. `https://api.your-domain.com`)
        - `API_URL` (server-side API base URL)
6.  **Review & Create:** Click deploy.

---

## 🌐 Post-Deployment Configuration

### 1. Custom Domains (Optional)

App Runner gives you a default URL (e.g., `https://xyz123.awsapprunner.com`). To use your own domain:

1.  Go to the **Custom Domains** tab in your App Runner service.
2.  Add your domain (e.g., `app.taxiciti.co.za`).
3.  Add the provided CNAME records to your DNS provider (GoDaddy, Cloudflare, etc.).
4.  App Runner handles the SSL certificate validation automatically.

### 2. Clerk Configuration

Once deployed, you will have live URLs. You update your Clerk Dashboard with these:

1.  Go to **Clerk Dashboard > Paths**.
2.  Add your new App Runner URLs to the **Allowed Origins** list to prevent CORS errors.

### 3. Google Maps

1.  Go to the **Google Cloud Console**.
2.  Update your API Key restrictions to allow HTTP Referrers from your new App Runner domains.

---

## 💰 Estimated Costs (App Runner)

- **Provisioned Container Instance:** ~$0.009 / GB-hour.
    - For 1 vCPU / 2GB always on: ~$15 - $20 per month per service.
    - **Total for both apps:** ~$30 - $40 / month.
- **Auto-Scaling:**
    - You can configure "Auto-Pause" for development instances, but for production, keep them active.
    - You pay extra only when traffic spikes and App Runner spins up additional instances.

## 🛠 Troubleshooting

**Health Check Fails?**

- Check the logs in the App Runner console.
- Ensure the **Port** is set to `3000`, NOT `3001` or `80`.
- Ensure `DATABASE_URL` is correct and accessible from the public internet (since Neon/Upstash are serverless and public).

**White Screen / 500 Error?**

- This usually means a missing Environment Variable. Double-check the spelling of keys like `NEXT_PUBLIC_...` in the App Runner configuration.
