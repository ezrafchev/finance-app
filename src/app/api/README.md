# Backend API Routes

This directory contains professional backend API routes for the Finance App. These routes provide:

- **Authentication** (`/api/auth`): Secure user registration and login with JWT tokens
- **Profile Management** (`/api/profile`): User profile and financial data management
- **Transactions** (`/api/transactions`): CRUD operations for financial transactions
- **Analytics** (`/api/analytics`): Financial insights and reports
- **AI Advisor** (`/api/ai`): Intelligent financial recommendations

## Usage

### For Static Deployment (GitHub Pages - Current)

The app currently uses `output: 'export'` in `next.config.ts` for static deployment, which doesn't support API routes. The frontend uses localStorage as the database.

### For Server Deployment (With Backend)

To enable the backend API:

1. Remove or comment out `output: 'export'` from `next.config.ts`
2. Copy `.env.example` to `.env` and configure your secrets
3. Deploy to a Node.js hosting platform (Vercel, Railway, etc.)
4. The frontend will automatically detect and use the API routes

## Features

- **Secure Authentication**: PBKDF2 password hashing with salt
- **JWT Sessions**: HTTP-only cookies for security
- **File-based Storage**: JSON storage in `/data` directory
- **RESTful API**: Standard HTTP methods and status codes
- **Error Handling**: Comprehensive error messages in Portuguese
- **Type Safety**: Full TypeScript support

## API Endpoints

- `POST /api/auth` - Login/Register
- `POST /api/auth/logout` - Logout
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update profile
- `GET /api/transactions` - List transactions
- `POST /api/transactions` - Create transaction
- `DELETE /api/transactions?id=<id>` - Delete transaction
- `GET /api/analytics` - Get financial analytics
- `POST /api/ai` - Get AI recommendations
