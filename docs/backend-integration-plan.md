# Backend Integration Plan: AWS RDS, Prisma, and Clerk Auth

## Overview

This document outlines the recommended structure and best practices for integrating the TaxiCity Next.js app with a PostgreSQL database hosted on AWS RDS, using Prisma ORM for database access and Clerk for authentication and authorization.

---

## 1. Database (AWS RDS PostgreSQL)

- **Provision** a PostgreSQL instance on AWS RDS.
- **Restrict access** to the DB using VPC security groups and allow only trusted IPs (e.g., Vercel, CI/CD, bastion).
- **Enforce SSL** connections for all DB traffic.
- **Use strong credentials** and rotate passwords regularly.
- **Enable automated backups** and multi-AZ for high availability.

---

## 2. Prisma ORM

### Structure

- Place your Prisma schema at `/prisma/schema.prisma`.
- Generate the Prisma client into `/lib/prisma/generated`.
- Use a single instance of Prisma Client per serverless function (see [Prisma docs](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management#solution-use-prisma-with-nextjs)).
- Store the DB connection string in `.env` as `DATABASE_URL`.

### Performance

- **Connection pooling:** Use a pooler like PgBouncer or RDS Proxy for serverless environments to avoid exhausting DB connections.
- **Efficient queries:** Use Prisma's `select` and `include` to fetch only required fields.
- **Pagination:** Always paginate large queries (e.g., trips, drivers).
- **Indexes:** Ensure Prisma schema defines indexes for frequently queried fields.
- **Batching:** Use `findMany` with filters instead of multiple `findUnique` calls.

### Security

- **Never expose Prisma Client to the client/browser.**
- **Validate all input** (use Zod or similar).
- **Use parameterized queries** (Prisma does this by default).
- **Restrict sensitive data** (e.g., never return password hashes).
- **Role-based access:** Enforce permissions in API routes.

---

## 3. API Route Structure

- Place all API routes under `/app/api/`.
- Use RESTful conventions: `/api/trips`, `/api/taxis`, `/api/drivers`, etc.
- Each route should:
    - Validate and parse input.
    - Use Clerk to authenticate and authorize the user.
    - Use Prisma Client for DB operations.
    - Return only necessary data (never internal IDs or secrets).
- Example folder structure:
    ```
    /app/api/
      ├── trips/
      │   ├── route.ts
      │   └── [id].ts
      ├── taxis/
      │   ├── route.ts
      │   └── [id].ts
      └── ...
    ```

---

## 4. Clerk Authentication & Authorization

- **Protect all API routes** using Clerk middleware.
- **Use Clerk JWTs** to identify the user in API requests.
- **Enforce roles/permissions** (e.g., only drivers can update taxi status, only admins can manage routes).
- **Map Clerk user IDs** to your `User` model in the DB.
- **Sync user profile data** (name, email) from Clerk to your DB as needed.

---

## 5. Example API Route (with Clerk & Prisma)

```typescript
// /app/api/trips/route.ts
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma/generated/client";

export async function GET(req: NextRequest) {
	const { userId } = auth();
	if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	// Fetch trips for the authenticated user
	const trips = await prisma.trip.findMany({
		where: { userId },
		orderBy: { createdAt: "desc" },
		take: 20,
		select: {
			id: true,
			route: { select: { name: true } },
			pickupAddress: true,
			dropoffAddress: true,
			fare: true,
			status: true,
			createdAt: true,
		},
	});

	return NextResponse.json(trips);
}
```

---

## 6. Environment Variables

- Store secrets in `.env` or via Vercel/hosting provider secrets.
    - `DATABASE_URL`
    - `CLERK_SECRET_KEY`
    - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`

---

## 7. Deployment & CI/CD

- Use Vercel or similar for deployment.
- Set environment variables in the deployment dashboard.
- Run `prisma migrate deploy` on deploy.
- Run `prisma generate` after every schema change.

---

## 8. Monitoring & Logging

- Enable query logging in Prisma for debugging (disable in production).
- Use Sentry or similar for error monitoring.
- Monitor DB performance via AWS RDS dashboard.

---

## 9. Data Privacy & Compliance

- Never log or expose sensitive user data.
- Comply with POPIA/GDPR for user data handling.
- Allow users to delete their data via API.

---

## 10. References

- [Prisma Docs](https://www.prisma.io/docs/)
- [Clerk Docs](https://clerk.com/docs)
- [AWS RDS Best Practices](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_BestPractices.html)
