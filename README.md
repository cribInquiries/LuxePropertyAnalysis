# Luxe Property Analysis Backend

A comprehensive backend API for luxury property analysis platform built with Node.js, TypeScript, Express, and Prisma.

## Features

- 🔐 **Authentication & Authorization** - JWT-based auth with role-based access control
- 🏠 **Property Management** - CRUD operations for luxury properties
- 📊 **Analysis Engine** - Advanced property analysis and market insights
- 👥 **User Management** - User profiles, favorites, and inquiries
- 📧 **Email Notifications** - Automated email notifications
- 📁 **File Upload** - Cloudinary integration for image and document uploads
- 🔍 **Search & Filtering** - Advanced property search with multiple filters
- 📈 **Analytics** - Property views and engagement tracking
- 🐳 **Docker Support** - Containerized deployment
- 🧪 **Testing** - Comprehensive test suite with Jest

## Tech Stack

- **Runtime**: Node.js 18+
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT (JSON Web Tokens)
- **File Storage**: Cloudinary
- **Email**: Nodemailer with SMTP
- **Caching**: Redis
- **Testing**: Jest with Supertest
- **Containerization**: Docker & Docker Compose

## Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL 15+
- Redis 7+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd luxe-property-analysis-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Database Setup**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Run database migrations
   npm run db:migrate
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3000`

## API Documentation

### Base URL
```
http://localhost:3000/api/v1
```

### Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Endpoints

#### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user profile
- `PUT /auth/profile` - Update user profile
- `PUT /auth/change-password` - Change password
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password
- `POST /auth/refresh-token` - Refresh access token
- `POST /auth/logout` - User logout

#### Properties
- `GET /properties` - Get all properties (with search/filter)
- `GET /properties/:id` - Get property by ID
- `POST /properties` - Create new property (protected)
- `PUT /properties/:id` - Update property (protected)
- `DELETE /properties/:id` - Delete property (protected)
- `POST /properties/:id/favorite` - Toggle favorite (protected)
- `POST /properties/:id/inquiry` - Create inquiry (protected)
- `GET /properties/:id/analyses` - Get property analyses
- `GET /properties/my/properties` - Get user's properties (protected)
- `GET /properties/my/favorites` - Get user's favorites (protected)

#### Users
- `GET /users/profile` - Get user profile (protected)
- `PUT /users/profile` - Update user profile (protected)
- `GET /users/favorites` - Get user favorites (protected)
- `GET /users/inquiries` - Get user inquiries (protected)
- `GET /users/messages` - Get user messages (protected)
- `GET /users` - Get all users (admin only)
- `GET /users/:id` - Get user by ID (admin only)
- `PUT /users/:id` - Update user (admin only)
- `DELETE /users/:id` - Delete user (admin only)

#### Analysis
- `POST /analysis` - Create analysis (protected)
- `GET /analysis/my` - Get user's analyses (protected)
- `GET /analysis/public` - Get public analyses
- `GET /analysis/:id` - Get analysis by ID
- `PUT /analysis/:id` - Update analysis (protected)
- `DELETE /analysis/:id` - Delete analysis (protected)
- `POST /analysis/:id/share` - Share analysis (protected)
- `GET /analysis` - Get all analyses (admin only)

#### File Upload
- `POST /upload/image` - Upload single image (protected)
- `POST /upload/images` - Upload multiple images (protected)
- `POST /upload/document` - Upload document (protected)
- `DELETE /upload/:publicId` - Delete file (protected)

### Response Format

All API responses follow this format:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

Error responses:
```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "stack": "Error stack trace (development only)"
  }
}
```

## Database Schema

### Core Models

- **User** - User accounts with roles (USER, ADMIN, AGENT)
- **Property** - Luxury properties with detailed information
- **Analysis** - Property analysis and market insights
- **Favorite** - User property favorites
- **Inquiry** - Property inquiries and messages
- **Message** - User-to-user messaging
- **PropertyView** - Property view tracking
- **MarketData** - Market data and trends
- **Notification** - User notifications

## Environment Variables

```env
# Server Configuration
NODE_ENV=development
PORT=3000
API_VERSION=v1

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/luxe_property_analysis"

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_REFRESH_EXPIRES_IN=30d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@luxeproperty.com
FROM_NAME=Luxe Property Analysis

# Redis
REDIS_URL=redis://localhost:6379

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp,application/pdf

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
```

## Development

### Scripts

```bash
# Development
npm run dev          # Start development server with hot reload
npm run build        # Build for production
npm start            # Start production server

# Database
npm run db:migrate   # Run database migrations
npm run db:generate  # Generate Prisma client
npm run db:studio    # Open Prisma Studio

# Testing
npm test             # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors
npm run format       # Format code with Prettier
```

### Project Structure

```
src/
├── config/          # Configuration files
├── controllers/     # Route controllers
├── middleware/      # Custom middleware
├── models/          # Database models (Prisma)
├── routes/          # API routes
├── services/        # Business logic services
├── tests/           # Test files
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
└── index.ts         # Application entry point
```

## Docker Deployment

### Using Docker Compose

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Using Docker

```bash
# Build image
docker build -t luxe-property-backend .

# Run container
docker run -p 3000:3000 luxe-property-backend
```

## Testing

The project includes comprehensive tests for all major functionality:

- **Unit Tests** - Individual function testing
- **Integration Tests** - API endpoint testing
- **Database Tests** - Database operation testing

Run tests:
```bash
npm test
```

## API Documentation

Interactive API documentation is available at:
- Development: `http://localhost:3000/api-docs`
- Swagger UI with full endpoint documentation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

Built with ❤️ for luxury property analysis
