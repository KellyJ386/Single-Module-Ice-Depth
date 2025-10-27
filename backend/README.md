# IceDepth Pro Backend API

RESTful API for IceDepth Pro SAAS application built with Express.js and SQLite.

## Features

- User authentication with JWT tokens
- Secure password hashing with bcryptjs
- Measurement CRUD operations
- Measurement history tracking
- Analytics and statistics
- SQLite database for easy deployment
- Input validation with express-validator

## Installation

```bash
npm install
```

## Configuration

Create a `.env` file in the backend root directory:

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
PORT=5000
JWT_SECRET=your_secure_jwt_secret_key
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

## Running the Server

### Development mode (with auto-reload):
```bash
npm run dev
```

### Production mode:
```bash
npm start
```

The server will start at `http://localhost:5000`

## API Endpoints

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Measurements

All measurement endpoints require authentication.

#### Get Measurements for a Rink
```http
GET /api/measurements/:rinkId
Authorization: Bearer <token>
```

#### Save/Update Measurement
```http
POST /api/measurements
Authorization: Bearer <token>
Content-Type: application/json

{
  "rinkId": "olympic",
  "pointId": "circle-1",
  "depth": 1.5,
  "notes": "Good ice condition"
}
```

#### Delete Measurement
```http
DELETE /api/measurements/:rinkId/:pointId
Authorization: Bearer <token>
```

#### Get Measurement History
```http
GET /api/measurements/history/:rinkId?limit=100
Authorization: Bearer <token>
```

#### Get Analytics
```http
GET /api/measurements/analytics/:rinkId
Authorization: Bearer <token>
```

Returns:
```json
{
  "success": true,
  "analytics": {
    "totalMeasurements": 14,
    "averageDepth": 1.52,
    "minDepth": 0.8,
    "maxDepth": 2.1,
    "tooThin": 2,
    "good": 8,
    "acceptable": 3,
    "tooThick": 1,
    "historyCount": 45
  }
}
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Measurements Table
```sql
CREATE TABLE measurements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  rink_id TEXT NOT NULL,
  point_id TEXT NOT NULL,
  depth REAL NOT NULL,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, rink_id, point_id)
);
```

### Measurement History Table
```sql
CREATE TABLE measurement_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  rink_id TEXT NOT NULL,
  point_id TEXT NOT NULL,
  depth REAL NOT NULL,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## Error Handling

All endpoints return responses in the format:

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": []
}
```

## Security

- Passwords are hashed using bcryptjs with 10 salt rounds
- JWT tokens expire after 7 days
- All measurement endpoints require valid JWT authentication
- Input validation on all POST/PUT requests
- CORS configured for specific origin

## Production Deployment

1. Set `NODE_ENV=production` in your environment
2. Use a strong, random `JWT_SECRET`
3. Consider using PostgreSQL or MySQL instead of SQLite for production
4. Set up proper CORS origins
5. Enable HTTPS
6. Set up proper logging and monitoring

## Future Enhancements

- Rate limiting
- Refresh tokens
- Email verification
- Password reset functionality
- Role-based access control
- WebSocket support for real-time updates
- Data export endpoints (CSV, Excel)
- Batch operations
- PostgreSQL/MySQL support
