This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Finance App

A modern finance application to help you track and manage your personal finances. Built with Next.js 15, React 19, Tailwind CSS, and Prisma with SQLite database.

## Features

- 🔐 **Secure Authentication**: Email verification and password encryption with bcrypt
- 💾 **Database Storage**: SQLite database with Prisma ORM for data persistence
- 📊 Dashboard with financial overview
- 💰 Track income and expenses
- 📈 Budget tracking
- 📉 Financial reports and charts
- 💡 Smart financial insights with AI recommendations

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/ezrafchev/finance-app.git
cd finance-app
```

### 2. Install Dependencies

```bash
npm install --legacy-peer-deps
```

### 3. Set Up Environment Variables

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` and configure the following variables:

```env
# Database URL (SQLite for development)
DATABASE_URL="file:./dev.db"

# JWT Secret (change this to a secure random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Email Service (Resend API Key - optional for development)
# Get your API key from https://resend.com
RESEND_API_KEY=re_your_api_key_here

# Application URL
APP_URL=http://localhost:8000

# Node environment
NODE_ENV=development
```

**Note**: For development, the app will simulate email sending and print verification links to the console. To actually send emails in production, you need to:
1. Sign up at [Resend](https://resend.com)
2. Get your API key
3. Update `RESEND_API_KEY` in your `.env` file

### 4. Initialize the Database

Generate Prisma client and run migrations:

```bash
npx prisma generate
npx prisma migrate dev --name init
```

This will create the SQLite database file and set up all necessary tables.

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:8000](http://localhost:8000) with your browser to see the application.

## How It Works

### Authentication Flow

1. **Registration**:
   - User fills out registration form with name, email, and password
   - Password is hashed using bcrypt before storage
   - Email verification token is generated and stored in database
   - Verification email is sent (or logged in development mode)
   - User account is created but marked as unverified

2. **Email Verification**:
   - User clicks verification link in email
   - Token is validated and user account is marked as verified
   - User can now log in

3. **Login**:
   - User enters email and password
   - System checks if email is verified
   - If verified and credentials are correct, JWT session token is created
   - Session cookie is set with 7-day expiration

### Database Schema

The application uses the following database models:

- **User**: Stores user credentials and email verification status
- **Profile**: Stores user's financial profile (income, expenses, goals)
- **Transaction**: Stores individual financial transactions
- **EmailVerification**: Stores email verification tokens

## Development Workflow

### Testing Email Verification

In development mode, verification emails are not actually sent. Instead, the verification URL is printed to the console. To test:

1. Register a new account
2. Check the terminal/console for the verification URL
3. Copy and paste it into your browser
4. You'll be redirected to the login page with a success message

### Database Management

View and manage your database using Prisma Studio:

```bash
npx prisma studio
```

This opens a web interface at `http://localhost:5555` where you can view and edit database records.

### Reset the Database

To start fresh with a clean database:

```bash
rm prisma/dev.db
npx prisma migrate dev
```

## Building for Production

### Build the Application

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

## Deployment

This application is now configured as a **server-side application** and requires a Node.js hosting platform. Here are some recommended options:

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your GitHub repository
4. Configure environment variables in Vercel dashboard:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `RESEND_API_KEY` (get from Resend)
   - `APP_URL` (your production URL)
   - `NODE_ENV=production`
5. Deploy

**Important**: For production on Vercel, you should use a PostgreSQL database instead of SQLite. Update your Prisma schema to use PostgreSQL:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Then connect to a Vercel Postgres database or other PostgreSQL provider.

### Other Deployment Options

- **Railway**: Supports PostgreSQL database out of the box
- **Render**: Free tier available with PostgreSQL
- **Heroku**: Classic platform with good PostgreSQL support
- **DigitalOcean App Platform**: Full control with managed databases

### Environment Variables for Production

Make sure to set these in your production environment:

- `DATABASE_URL`: Your production database URL
- `JWT_SECRET`: A strong, random secret key
- `RESEND_API_KEY`: Your Resend API key for sending emails
- `APP_URL`: Your production domain (e.g., `https://yourdomain.com`)
- `NODE_ENV=production`

## Project Structure

```
finance-app/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Database migrations
├── src/
│   ├── app/
│   │   ├── api/               # API routes
│   │   │   ├── auth/         # Authentication endpoints
│   │   │   ├── profile/      # Profile management
│   │   │   └── transactions/ # Transaction management
│   │   ├── dashboard/        # Dashboard page
│   │   ├── login/            # Login/register page
│   │   └── page.tsx          # Home page
│   ├── components/           # React components
│   ├── lib/
│   │   ├── prisma.ts        # Prisma client
│   │   ├── auth.ts          # Authentication utilities
│   │   ├── email.ts         # Email service
│   │   └── api-client.ts    # Frontend API client
│   └── hooks/               # Custom React hooks
└── public/                  # Static assets
```

## Security Features

- ✅ Password hashing with bcrypt
- ✅ Email verification required for login
- ✅ JWT-based session management
- ✅ HTTP-only cookies for session storage
- ✅ CSRF protection through SameSite cookies
- ✅ SQL injection protection via Prisma ORM
- ✅ Rate limiting (recommended to add in production)

## Troubleshooting

### Database Issues

If you encounter database errors:

```bash
# Reset Prisma client
npx prisma generate

# Reset database
rm prisma/dev.db
npx prisma migrate dev
```

### Email Not Sending

In development, emails are logged to console. Check your terminal for verification URLs.

For production, verify:
1. `RESEND_API_KEY` is set correctly
2. `APP_URL` is set to your production domain
3. Check Resend dashboard for delivery logs

### Build Errors

If you get TypeScript errors during build:

```bash
# Clean and rebuild
rm -rf .next
npm run build
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Resend Documentation](https://resend.com/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)
