# CivicHub Backend API

Backend server for the CivicHub Civic Engagement Platform.

## 🚀 Quick Start

### Prerequisites
- Node.js v18+ installed
- MongoDB running on `mongodb://localhost:27017/crud`

### Installation

```bash
cd backend
npm install
```

### Environment Variables

Copy the `.env` file and update these required variables:
- `MONGODB_URI` - Your MongoDB connection string (default: mongodb://localhost:27017/crud)
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_REFRESH_SECRET` - Secret key for refresh tokens

### Running the Server

```bash
# Development mode with hot reload
npm run dev

# Production build
npm run build
npm start
```

## 📡 API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/signup` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| POST | `/api/auth/refresh` | Refresh access token | No |
| GET | `/api/auth/me` | Get current user profile | Yes |
| POST | `/api/auth/logout` | Logout user | Yes |

### Request/Response Examples

#### Sign Up
```json
POST /api/auth/signup
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login
```json
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "user": {
      "id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "avatar": "...",
      "role": "user"
    },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

## 🗄️ Database Models

### User
- name, email, password (hashed)
- avatar, phone, address
- role (user/admin)
- notifications preferences

### Issue
- title, description, category
- priority, status
- location (GeoJSON Point)
- images, reportedBy
- votes, comments

### Community
- name, description, avatar
- category, members, admins
- isPublic, createdBy

### Message
- community, sender, text
- type (text/image/file)
- readBy

### ChatHistory
- user, messages array
- role (user/assistant)

## 🔒 Authentication

The API uses JWT tokens for authentication:
1. Sign up or login to receive `accessToken` and `refreshToken`
2. Include token in requests: `Authorization: Bearer <accessToken>`
3. Access tokens expire in 7 days, refresh tokens in 30 days

## 📝 Status

### Completed ✅
- Backend project structure
- Database connection with MongoDB
- User authentication system (signup, login, JWT)
- Error handling middleware
- Auth middleware with JWT verification

### In Progress 🔄
- Issue Reporting API
- Communities API
- Chatbot integration
- File upload system
- Real-time messaging with Socket.io

## 🛠️ Tech Stack

- **Runtime**: Node.js with Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT + bcrypt
- **Validation**: express-validator
- **File Upload**: Multer + Cloudinary (optional)
- **Real-time**: Socket.io (planned)

## 📦 Project Structure

```
backend/
├── src/
│   ├── config/          # Database & service configs
│   ├── models/          # Mongoose schemas
│   ├── controllers/     # Request handlers
│   ├── routes/          # API routes
│   ├── middleware/      # Auth, error handling
│   ├── utils/           # Helper functions
│   └── server.ts        # Entry point
├── .env                 # Environment variables
├── package.json
└── tsconfig.json
```

## 🐛 Troubleshooting

### TypeScript Errors
If you encounter TypeScript compilation errors with ts-node, try:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Or use the build command instead
npm run build
node dist/server.js
```

### MongoDB Connection Issues
- Ensure MongoDB is running: `mongod`
- Check connection string in `.env`
- Verify firewall/network settings

## 📄 License

ISC
