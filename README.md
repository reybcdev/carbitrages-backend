# Carbitrages Backend

Revolutionary car buying platform API built with Node.js, Express, TypeScript, and MongoDB.

## 🚀 Features

- **Modern Stack**: Node.js with Express and TypeScript
- **Authentication**: JWT-based auth with refresh tokens
- **Database**: MongoDB with Mongoose ODM
- **Caching**: Redis for session management
- **Security**: Helmet, CORS, rate limiting
- **Validation**: Joi/Express-validator schemas
- **Logging**: Winston with structured logging

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB + Mongoose
- **Cache**: Redis
- **Authentication**: JWT + bcrypt
- **Validation**: Express-validator + Joi
- **Logging**: Winston + Morgan
- **Security**: Helmet, CORS, rate limiting

## 🏃‍♂️ Getting Started

1. **Install dependencies**:
```bash
npm install
```

2. **Set up environment variables**:
```bash
cp .env.example .env
```

3. **Start MongoDB and Redis** (or use cloud services):
```bash
# MongoDB
mongod

# Redis
redis-server
```

4. **Run the development server**:
```bash
npm run dev
```

5. **For testing without databases**:
```bash
npm run dev-simple
```

## 📁 Project Structure

```
src/
├── config/             # Database and service configurations
├── controllers/        # Route controllers
├── middleware/         # Custom middleware
├── models/            # Database models
├── routes/            # API route definitions
├── services/          # Business logic services
└── utils/             # Utility functions
```

## 🔐 Authentication System

- User registration with email verification
- Secure password hashing with bcrypt
- JWT access tokens (7 days) + refresh tokens (30 days)
- Token blacklisting for logout
- Password reset functionality
- Role-based access control (buyer/dealer/admin)

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh-token` - Token refresh
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset
- `GET /api/auth/verify-email/:token` - Email verification

### User Management
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/change-password` - Change password
- `PUT /api/users/preferences` - Update preferences
- `DELETE /api/users/account` - Delete account

## 🛡️ Security Features

- **Rate Limiting**: 100 requests per 15 minutes
- **CORS**: Configured for frontend domain
- **Helmet**: Security headers
- **Input Validation**: All endpoints validated
- **Password Security**: bcrypt with salt rounds
- **JWT Security**: Signed tokens with expiration

## 🗄️ Database Models

### User Model
- Personal information (name, email, phone)
- Authentication (password, verification)
- Preferences and profile data
- Role-based permissions

## 📊 Logging

- **Winston**: Structured JSON logging
- **Morgan**: HTTP request logging
- **Error Tracking**: Comprehensive error handling
- **Log Levels**: Debug, info, warn, error

## 🔧 Environment Variables

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/carbitrages
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
FRONTEND_URL=http://localhost:3000
```

## 🚀 Deployment

Ready for deployment on:
- **Heroku**: With MongoDB Atlas and Redis Cloud
- **AWS**: EC2 + RDS + ElastiCache
- **Docker**: Containerized deployment
- **Railway**: Simple deployment platform

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## 📄 License

This project is part of the Carbitrages MVP.
