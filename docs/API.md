# TaxiCity API Documentation

Welcome to the comprehensive API documentation for the TaxiCity platform. This documentation provides detailed information about all available REST API endpoints, request/response schemas, authentication, and usage examples.

## 📖 Interactive Documentation

Visit the interactive API documentation at:

- **Development**: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)
- **Production**: [https://taxiciti.vercel.app/api-docs](https://taxiciti.vercel.app/api-docs)

## 🔗 OpenAPI Specification

The OpenAPI 3.0 specification is available at:

- **JSON Format**: `/api/openapi`
- **Local File**: `/docs/openapi.json`

## 🔐 Authentication

All API endpoints require authentication using a Clerk session token. Include the token in the Authorization header:

```
Authorization: Bearer <your-clerk-session-token>
```

## 📊 API Overview

### Available Endpoints

| Category    | Endpoints        | Description                                          |
| ----------- | ---------------- | ---------------------------------------------------- |
| **Users**   | `/api/users/*`   | User profile management, locations, saved places     |
| **Drivers** | `/api/drivers/*` | Driver registration, verification, ratings           |
| **Taxis**   | `/api/taxis/*`   | Fleet management, status tracking, location updates  |
| **Routes**  | `/api/routes/*`  | Route management between taxi ranks                  |
| **Ranks**   | `/api/ranks/*`   | Taxi rank (station) management and operations        |
| **Ride**    | `/api/driver/*`  | Shared vehicle flow: runs, requests, passenger trips |
| **Reports** | `/api/reports/*` | User reports and complaints system                   |
| **Support** | `/api/support/*` | Support ticket management and messaging              |
| **Search**  | `/api/search`    | Search across all entities with filters              |

### Core Features

- **RESTful Design**: Standard HTTP methods (GET, POST, PUT, DELETE)
- **JSON Responses**: All responses are in JSON format
- **Pagination**: Large datasets are paginated for performance
- **Filtering**: Query parameters for filtering and sorting
- **Error Handling**: Consistent error response format
- **Role-Based Access**: Different permissions for users, drivers, admin, and support

## 🚀 Quick Start

### 1. Authentication Setup

First, authenticate with Clerk and obtain a session token (template: `taxiciti_api`):

```javascript
import { useAuth } from "@clerk/nextjs";

const { getToken } = useAuth();
const token = await getToken({ template: "taxiciti_api" });
```

### 2. Making API Requests

```javascript
const response = await fetch("/api/users", {
	method: "GET",
	headers: {
		Authorization: `Bearer ${token}`,
		"Content-Type": "application/json",
	},
});

const data = await response.json();
```

### 3. Common Response Format

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

## 📝 API Categories

### Users API (`/api/users`)

Manage user profiles, locations, and saved places.

- `GET /api/users` - List all users (admin only)
- `POST /api/users` - Create/update user profile
- `PUT /api/users` - Update user profile
- `DELETE /api/users` - Delete user account
- `GET /api/users/location` - Get user's current location
- `PUT /api/users/location` - Update user's location
- `GET /api/users/saved-locations` - Get saved locations
- `POST /api/users/saved-locations` - Create saved location

### Taxis API (`/api/taxis`)

Manage taxi fleet, status, and location tracking.

- `GET /api/taxis` - List taxis with filtering
- `POST /api/taxis` - Create new taxi (admin only)
- `GET /api/taxis/[id]` - Get specific taxi details
- `PUT /api/taxis/[id]` - Update taxi information
- `DELETE /api/taxis/[id]` - Remove taxi from fleet
- `GET /api/taxis/[id]/location` - Get taxi location
- `PUT /api/taxis/[id]/location` - Update taxi location

### Drivers API (`/api/drivers`)

Driver registration, verification, and management.

- `GET /api/drivers` - List drivers
- `POST /api/drivers` - Register new driver
- `GET /api/drivers/[id]` - Get driver details
- `PUT /api/drivers/[id]` - Update driver information
- `DELETE /api/drivers/[id]` - Remove driver

### Routes API (`/api/routes`)

Manage routes between taxi ranks.

- `GET /api/routes` - List available routes
- `POST /api/routes` - Create new route (admin only)
- `GET /api/routes/[id]` - Get route details
- `PUT /api/routes/[id]` - Update route information
- `DELETE /api/routes/[id]` - Remove route

### Ranks API (`/api/ranks`)

Taxi rank (station) management.

- `GET /api/ranks` - List taxi ranks
- `POST /api/ranks` - Create new rank (admin only)
- `GET /api/ranks/[id]` - Get rank details
- `PUT /api/ranks/[id]` - Update rank information
- `DELETE /api/ranks/[id]` - Remove rank

### Reports API (`/api/reports`)

User reporting and complaint system.

- `GET /api/reports` - List reports (filtered by role)
- `POST /api/reports` - Create new report
- `GET /api/reports/[id]` - Get report details
- `PUT /api/reports/[id]` - Update report (staff only)
- `DELETE /api/reports/[id]` - Delete report (admin only)

### Support API (`/api/support`)

Support ticket management system.

- `GET /api/support` - List support tickets
- `POST /api/support` - Create support ticket
- `GET /api/support/[id]` - Get ticket with messages
- `PUT /api/support/[id]` - Update ticket (staff only)
- `POST /api/support/[id]` - Add message to ticket

### Search API (`/api/search`)

Search across multiple entities.

- `GET /api/search` - Search with query parameters
- `POST /api/search` - Advanced search with filters

## 🔧 Development

### Local Development

1. Start the development server:

```bash
npm run dev
```

2. Visit the API docs:

```
http://localhost:3000/api-docs
```

### Testing APIs

Use tools like:

- **Postman**: Import the OpenAPI spec from `/api/openapi`
- **Insomnia**: Load the specification file
- **curl**: Command-line testing
- **Browser**: GET endpoints can be tested directly

### Example curl Request

```bash
curl -X GET "http://localhost:3000/api/taxis" \
	-H "Authorization: Bearer YOUR_CLERK_SESSION_TOKEN" \
  -H "Content-Type: application/json"
```

## 🚨 Error Handling

All APIs return consistent error responses:

```json
{
	"error": "Error message",
	"details": [
		{
			"field": "fieldName",
			"message": "Validation error details"
		}
	]
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

## 📊 Rate Limiting

API endpoints may have rate limiting in place:

- Regular users: 100 requests per minute
- Authenticated users: 300 requests per minute
- Admin users: 1000 requests per minute

## 🛡️ Security

- All endpoints require authentication
- Role-based access control (RBAC)
- Input validation and sanitization
- SQL injection protection via Prisma ORM
- CORS headers configured appropriately

## 🔄 Versioning

The current API version is v1. Future versions will be accessible via:

- `/api/v2/...` (when available)

## 📞 Support

For API support and questions:

- Email: support@taxiciti.com
- Documentation Issues: Create an issue in the repository
- Feature Requests: Contact the development team

---

**Last Updated**: October 2025
**API Version**: 1.0.0
**OpenAPI Version**: 3.0.3
