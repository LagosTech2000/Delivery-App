# Delivery App - Frontend API Context Document

> **Version**: 1.0  
> **Backend Repository**: LagosTech2000/Delivery-App  
> **API Base URL**: `http://localhost:5000/api/v1`  
> **WebSocket URL**: `http://localhost:5000`

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Authentication](#authentication)
3. [API Endpoints](#api-endpoints)
4. [Real-time Events (Socket.io)](#real-time-events-socketio)
5. [Data Models](#data-models)
6. [User Workflows](#user-workflows)
7. [Error Handling](#error-handling)

---

## System Overview

### Core Concept
A real-time delivery request platform where:
- **Customers** create delivery requests for products from any source
- **Agents** claim available requests and provide quotes
- **Real-time updates** keep everyone informed via Socket.io

### User Roles
- **customer**: Create requests, accept/reject resolutions
- **agent**: Claim requests, provide quotes (resolutions)
- **admin**: Manage users, view all data, system statistics

### Tech Stack Required for Frontend
- React/Vue/Next.js (recommended: Next.js for SSR)
- Socket.io-client for real-time features
- Axios or Fetch for HTTP requests
- State management (Redux/Zustand recommended)
- Form validation library

---

## Authentication

### JWT Token System

**Token Types:**
- **Access Token**: Valid for 15 minutes, sent in Authorization header
- **Refresh Token**: Valid for 7 days, used to get new access tokens

**Storage Recommendation:**
- Access token: Memory/state (NOT localStorage for security)
- Refresh token: HttpOnly cookie (if backend supports) OR secure localStorage

### Auth Flow 1: Email/Password

#### Register
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe",
  "phone": "+1234567890",
  "role": "customer" // or "agent"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "customer",
      "email_verified": false
    },
    "tokens": {
      "accessToken": "eyJhbGci...",
      "refreshToken": "eyJhbGci..."
    }
  }
}
```

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200):** Same as register

#### Refresh Token
```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGci..."
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "new_access_token",
    "refreshToken": "new_refresh_token"
  }
}
```

### Auth Flow 2: Google OAuth

#### Step 1: Redirect to Google
```javascript
window.location.href = 'http://localhost:5000/api/v1/auth/google';
```

#### Step 2: Handle Callback
After Google authentication, backend redirects to:
```
http://localhost:3000/auth/callback?accessToken=xxx&refreshToken=yyy
```

**Frontend**: Extract tokens from URL and store them

### Get Current User
```http
GET /api/v1/auth/me
Authorization: Bearer {accessToken}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "customer",
      "phone": "+1234567890",
      "email_verified": true,
      "is_online": false
    }
  }
}
```

### Logout
```http
POST /api/v1/auth/logout
Authorization: Bearer {accessToken}
```

---

## API Endpoints

### Requests

#### List Requests
```http
GET /api/v1/requests?page=1&limit=20&status=available
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `page` (optional): Page number, default 1
- `limit` (optional): Items per page, default 20
- `status` (optional): Filter by status
- `type` (optional): Filter by type
- `shipping_type` (optional): Filter by shipping type

**Response (200):**
```json
{
  "success": true,
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

#### Create Request (Customer Only)
```http
POST /api/v1/requests
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "product_name": "iPhone 15 Pro",
  "product_description": "New iPhone from Amazon",
  "product_url": "https://amazon.com/iphone",
  "type": "product_delivery",
  "source": "amazon",
  "weight": 0.5,
  "quantity": 1,
  "shipping_type": "national",
  "pickup_location": {
    "address": "123 Store St, NY",
    "city": "New York",
    "country": "USA"
  },
  "delivery_location": {
    "address": "456 Home Ave, Boston",
    "city": "Boston",
    "country": "USA"
  },
  "preferred_contact_method": "email",
  "customer_phone": "+1234567890",
  "notes": "Handle with care"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Request created successfully",
  "data": {
    "request": {
      "id": "uuid",
      "customer_id": "uuid",
      "product_name": "iPhone 15 Pro",
      "status": "pending",
      "created_at": "2025-11-23T14:00:00Z"
    }
  }
}
```

#### Get Single Request
```http
GET /api/v1/requests/{id}
Authorization: Bearer {accessToken}
```

#### Update Request (Customer Only, before claimed)
```http
PUT /api/v1/requests/{id}
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "product_name": "Updated name",
  "weight": 0.6,
  "notes": "Updated notes"
}
```

#### Claim Request (Agent Only)
```http
POST /api/v1/requests/{id}/claim
Authorization: Bearer {accessToken}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Request claimed successfully",
  "data": {
    "request": {
      "id": "uuid",
      "status": "claimed",
      "claimed_by_agent_id": "agent_uuid",
      "claimed_at": "2025-11-23T14:05:00Z"
    }
  }
}
```

#### Unclaim Request (Agent Only)
```http
POST /api/v1/requests/{id}/unclaim
Authorization: Bearer {accessToken}
```

---

### Resolutions

#### Create Resolution (Agent Only)
```http
POST /api/v1/resolutions
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "request_id": "request_uuid",
  "quote_breakdown": {
    "base_rate": 50.00,
    "weight_charge": 10.00,
    "distance_charge": 15.00,
    "total": 75.00
  },
  "estimated_delivery_days": 3,
  "notes": "I can deliver this within 3 days"
}
```

#### Accept Resolution (Customer Only)
```http
POST /api/v1/resolutions/{id}/accept
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "customer_response_notes": "Looks good, please proceed"
}
```

#### Reject Resolution (Customer Only)
```http
POST /api/v1/resolutions/{id}/reject
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "customer_response_notes": "Price too high"
}
```

---

### Files

#### Upload File
```http
POST /api/v1/files/upload
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data

file: <binary>
file_type: "product_image"
related_to_request_id: "uuid"
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "file": {
      "id": "uuid",
      "filename": "1637681234567-abc123.jpg",
      "original_name": "iphone.jpg",
      "file_path": "uploads/product-images/...",
      "size": 245678,
      "file_type": "product_image"
    }
  }
}
```

---

## Real-time Events (Socket.io)

### Connection

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:5000', {
  auth: {
    token: accessToken // JWT access token
  }
});

socket.on('connect', () => {
  console.log('Connected:', socket.id);
});

socket.on('connect_error', (error) => {
  console.error('Connection failed:', error.message);
});
```

### Events for Customers

**Listen for request claimed:**
```javascript
socket.on('request:claimed', (data) => {
  // data = { request: {...}, timestamp: "..." }
  console.log('Your request was claimed!', data);
  // Update UI to show claimed status
});
```

**Listen for resolution provided:**
```javascript
socket.on('resolution:provided', (data) => {
  // data = { resolution: {...}, timestamp: "..." }
  console.log('Agent provided a quote!', data);
  // Show quote modal to customer
});
```

### Events for Agents

**Listen for new requests:**
```javascript
socket.on('request:new', (data) => {
  // data = { request: {...}, timestamp: "..." }
  console.log('New request available!', data);
  // Add to available requests list
});
```

**Listen for resolution accepted:**
```javascript
socket.on('resolution:accepted', (data) => {
  // data = { resolution: {...}, timestamp: "..." }
  console.log('Customer accepted your quote!', data);
  // Update request status
});
```

**Listen for resolution rejected:**
```javascript
socket.on('resolution:rejected', (data) => {
  // data = { resolution: {...}, timestamp: "..." }
  console.log('Customer rejected quote:', data);
  // Allow providing new quote
});
```

**Going online/offline:**
```javascript
// When agent logs in or activates
socket.emit('agent:online');

// When agent logs out or goes inactive
socket.emit('agent:offline');

// Listen for confirmation
socket.on('agent:online:success', (data) => {
  console.log('You are now online');
});
```

### Events for Admins

**Listen for agent count updates:**
```javascript
socket.on('agent:count', (data) => {
  // data = { count: 5, timestamp: "..." }
  console.log('Online agents:', data.count);
});
```

---

## Data Models

### Request Statuses
- `pending`: Just created, not yet available
- `available`: Ready for agents to claim
- `claimed`: Agent claimed but no quote yet
- `in_progress`: Agent working on delivery
- `resolution_provided`: Agent provided quote
- `accepted`: Customer accepted quote
- `rejected`: Customer rejected quote
- `completed`: Delivery completed
- `cancelled`: Request cancelled

### Request Types
- `product_delivery`
- `document`
- `package`
- `custom`

### Shipping Types
- `national`
- `international`

### Contact Methods
- `email`
- `whatsapp`
- `both`

---

## User Workflows

### Customer Journey

1. **Register/Login** → Get JWT tokens
2. **Create Request** → Fill form with product details
3. **Wait for Agent** → Receive `request:claimed` event
4. **Review Quote** → Receive `resolution:provided` event
5. **Accept/Reject** → Send decision to backend
6. **Track Delivery** → Watch status updates

### Agent Journey

1. **Register/Login as Agent** → Get JWT tokens
2. **Connect WebSocket** → Emit `agent:online`
3. **Browse Requests** → GET `/api/v1/requests?status=available`
4. **Claim Request** → POST `/api/v1/requests/{id}/claim`
5. **Provide Quote** → POST `/api/v1/resolutions`
6. **Wait for Response** → Listen for `resolution:accepted/rejected`
7. **Complete Delivery** → Update status to completed

---

## Error Handling

### Standard Error Response
```json
{
  "success": false,
  "error": "Error message",
  "errors": [ // Optional, for validation errors
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### HTTP Status Codes
- `200` OK - Successful GET/PUT/PATCH
- `201` Created - Successful POST
- `400` Bad Request - Validation error
- `401` Unauthorized - Missing/invalid token
- `403` Forbidden - Insufficient permissions
- `404` Not Found - Resource doesn't exist
- `409` Conflict - Duplicate entry
- `500` Internal Server Error

### Frontend Error Handling Example
```javascript
try {
  const response = await fetch('/api/v1/requests', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestData)
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    // Handle error
    if (response.status === 401) {
      // Refresh token or redirect to login
    } else if (response.status === 400) {
      // Show validation errors
      data.errors.forEach(err => {
        showFieldError(err.field, err.message);
      });
    }
  } else {
    // Success
    console.log('Request created:', data.data.request);
  }
} catch (error) {
  console.error('Network error:', error);
}
```

---

## Recommended Frontend Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   └── GoogleAuthButton.tsx
│   │   ├── requests/
│   │   │   ├── RequestForm.tsx
│   │   │   ├── RequestList.tsx
│   │   │   └── RequestCard.tsx
│   │   ├── resolutions/
│   │   │   ├── ResolutionForm.tsx
│   │   │   └── ResolutionModal.tsx
│   │   └── layout/
│   │       ├── Navbar.tsx
│   │       └── Sidebar.tsx
│   ├── services/
│   │   ├── api.ts // Axios instance with interceptors
│   │   ├── auth.service.ts
│   │   ├── request.service.ts
│   │   ├── resolution.service.ts
│   │   └── socket.service.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useSocket.ts
│   │   └── useRealTimeRequests.ts
│   ├── store/ // Redux/Zustand
│   │   ├── authSlice.ts
│   │   ├── requestsSlice.ts
│   │   └── notificationsSlice.ts
│   └── pages/
│       ├── Dashboard.tsx
│       ├── Requests.tsx
│       ├── AgentDashboard.tsx
│       └── Profile.tsx
```

---

## Implementation Tips

### 1. Token Refresh Interceptor
```javascript
// api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api/v1'
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Try to refresh token
      const refreshToken = getRefreshToken();
      const { data } = await axios.post('/auth/refresh', { refreshToken });
      
      setAccessToken(data.data.accessToken);
      
      // Retry original request
      error.config.headers.Authorization = `Bearer ${data.data.accessToken}`;
      return axios.request(error.config);
    }
    return Promise.reject(error);
  }
);
```

### 2. Socket.io Hook
```javascript
// useSocket.ts
import { useEffect } from 'react';
import io from 'socket.io-client';

export const useSocket = (accessToken) => {
  useEffect(() => {
    const socket = io('http://localhost:5000', {
      auth: { token: accessToken }
    });
    
    socket.on('connect', () => {
      console.log('WebSocket connected');
    });
    
    return () => {
      socket.disconnect();
    };
  }, [accessToken]);
};
```

### 3. Real-time Request Updates
```javascript
// useRealTimeRequests.ts
export const useRealTimeRequests = () => {
  const [requests, setRequests] = useState([]);
  const { socket } = useSocket();
  
  useEffect(() => {
    socket?.on('request:new', (data) => {
      setRequests(prev => [data.request, ...prev]);
    });
    
    socket?.on('request:updated', (data) => {
      setRequests(prev => 
        prev.map(r => r.id === data.request.id ? data.request : r)
      );
    });
  }, [socket]);
  
  return { requests };
};
```

---

## Next Steps for Frontend Development

1. **Set up project**: Initialize Next.js/React project
2. **Configure API client**: Set up Axios with interceptors
3. **Implement auth**: Login, register, Google OAuth flows
4. **Build request forms**: Create/edit request UI
5. **Integrate Socket.io**: Real-time notifications
6. **Agent dashboard**: Available requests, claim functionality
7. **Customer dashboard**: My requests, quote reviews
8. **Polish UI/UX**: Responsive design, loading states, error handling

---

## Support & Contact

- **Backend Running**: `http://localhost:5000`
- **Health Check**: `http://localhost:5000/health`
- **API Documentation**: Coming soon (Swagger)
- **Backend Repository**: LagosTech2000/Delivery-App

**Ready to build! The API is stable and fully functional for frontend development to proceed in parallel.** 🚀
