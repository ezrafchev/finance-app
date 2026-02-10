# Deployment Guide for Finance App

This guide covers deploying the Finance App with database backend and email verification to various platforms.

## Prerequisites

Before deploying, ensure you have:
- ✅ A Resend account and API key (for sending emails)
- ✅ Your code pushed to a Git repository (GitHub, GitLab, etc.)
- ✅ Environment variables documented

## Quick Start: Deploy to Vercel (Recommended)

Vercel is the easiest and recommended deployment platform for Next.js applications.

### Step 1: Prepare Your Database

For production, use PostgreSQL instead of SQLite:

1. Update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

2. Commit the changes:
```bash
git add prisma/schema.prisma
git commit -m "Switch to PostgreSQL for production"
git push
```

### Step 2: Set Up Vercel Postgres

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Storage" → "Create Database"
3. Select "Postgres"
4. Choose a region close to your users
5. Create the database

Vercel will automatically add the `DATABASE_URL` environment variable to your project.

### Step 3: Deploy to Vercel

1. Go to [Vercel](https://vercel.com/new)
2. Import your Git repository
3. Vercel will auto-detect Next.js - keep the defaults
4. Add environment variables:
   - `JWT_SECRET`: Generate a random string (e.g., use `openssl rand -base64 32`)
   - `RESEND_API_KEY`: Your Resend API key
   - `APP_URL`: Will be your Vercel URL (e.g., `https://your-app.vercel.app`)
   - `NODE_ENV`: `production`

5. Click "Deploy"

### Step 4: Run Database Migrations

After first deployment:

1. Go to your project settings in Vercel
2. Navigate to the "Deployments" tab
3. Find your latest deployment and click the three dots → "Redeploy"
4. In the "Build Command" override, add: `npx prisma generate && npx prisma migrate deploy && npm run build`

Or use Vercel CLI:
```bash
vercel env pull .env.local
npx prisma migrate deploy
```

### Step 5: Configure Domain (Optional)

1. In Vercel Dashboard, go to your project → Settings → Domains
2. Add your custom domain
3. Update `APP_URL` environment variable to your custom domain

## Alternative Deployment Platforms

### Deploy to Railway

Railway provides a simple deployment with built-in PostgreSQL.

1. **Create Account**: Sign up at [Railway](https://railway.app)

2. **Create New Project**: 
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your repository

3. **Add PostgreSQL**:
   - Click "+ New"
   - Select "Database" → "PostgreSQL"
   - Railway auto-generates `DATABASE_URL`

4. **Configure Environment Variables**:
   ```
   JWT_SECRET=<your-secret>
   RESEND_API_KEY=<your-resend-key>
   APP_URL=<your-railway-url>
   NODE_ENV=production
   ```

5. **Deploy**: Railway automatically builds and deploys

6. **Run Migrations**: In Railway dashboard, open the shell and run:
   ```bash
   npx prisma migrate deploy
   ```

### Deploy to Render

Render offers free tier with PostgreSQL.

1. **Create Account**: Sign up at [Render](https://render.com)

2. **Create PostgreSQL Database**:
   - Dashboard → "New" → "PostgreSQL"
   - Note the connection string

3. **Create Web Service**:
   - Dashboard → "New" → "Web Service"
   - Connect your repository
   - Settings:
     - **Build Command**: `npm install --legacy-peer-deps && npx prisma generate && npx prisma migrate deploy && npm run build`
     - **Start Command**: `npm start`

4. **Environment Variables**:
   ```
   DATABASE_URL=<your-postgres-url>
   JWT_SECRET=<your-secret>
   RESEND_API_KEY=<your-resend-key>
   APP_URL=<your-render-url>
   NODE_ENV=production
   ```

5. **Deploy**: Render automatically deploys on push

### Deploy to DigitalOcean App Platform

1. **Create Account**: Sign up at [DigitalOcean](https://digitalocean.com)

2. **Create Database Cluster**:
   - Database → "Create Database Cluster"
   - Choose PostgreSQL
   - Select region and plan

3. **Create App**:
   - Apps → "Create App"
   - Connect repository
   - Configure:
     - **Build Command**: `npm install --legacy-peer-deps && npx prisma generate && npx prisma migrate deploy && npm run build`
     - **Run Command**: `npm start`

4. **Add Environment Variables**: Same as above

5. **Deploy**: DigitalOcean handles deployment

## Environment Variables Reference

Required environment variables for production:

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | Secret key for JWT tokens | Generate with `openssl rand -base64 32` |
| `RESEND_API_KEY` | Resend API key for emails | `re_xxxxxxxxxxxxx` |
| `APP_URL` | Your production domain | `https://yourapp.com` |
| `NODE_ENV` | Node environment | `production` |

## Post-Deployment Checklist

After deploying:

- [ ] Test user registration and email verification
- [ ] Test login with verified account
- [ ] Test creating transactions and profile updates
- [ ] Verify emails are being sent correctly
- [ ] Test on mobile devices
- [ ] Set up monitoring (e.g., Sentry for error tracking)
- [ ] Configure custom domain (if applicable)
- [ ] Set up SSL certificate (usually automatic on modern platforms)
- [ ] Test backup and restore procedures

## Database Backups

### Vercel Postgres

Vercel automatically backs up your database. Access backups:
1. Vercel Dashboard → Storage → Your Database
2. Backups tab

### Railway

Railway provides automatic backups:
1. Railway Dashboard → Your Database
2. Backups section

### Manual Backup

Create a manual backup:

```bash
# Export database
npx prisma db pull

# Or use pg_dump for PostgreSQL
pg_dump $DATABASE_URL > backup.sql
```

## Troubleshooting

### Migration Errors

If migrations fail:

```bash
# Reset migrations in development
npx prisma migrate reset

# In production, you may need to manually fix
npx prisma migrate resolve --applied <migration-name>
```

### Email Issues

If emails aren't sending:
1. Verify `RESEND_API_KEY` is correct
2. Check Resend dashboard for logs
3. Verify sender domain is configured in Resend
4. Check spam folder

### Database Connection Issues

If database won't connect:
1. Verify `DATABASE_URL` format
2. Check database server is running
3. Verify IP whitelist (if applicable)
4. Test connection: `npx prisma db push`

### Build Fails

Common issues:
- Missing dependencies: Run `npm install --legacy-peer-deps`
- TypeScript errors: Fix or add `// @ts-ignore` temporarily
- Missing env vars: Add them to your platform's dashboard

## Scaling Considerations

As your app grows:

1. **Database**: 
   - Consider connection pooling (Prisma Accelerate)
   - Monitor query performance
   - Add indexes for frequently queried fields

2. **Caching**:
   - Add Redis for session storage
   - Cache frequently accessed data

3. **Rate Limiting**:
   - Implement rate limiting on API routes
   - Use services like Upstash Rate Limit

4. **Monitoring**:
   - Set up error tracking (Sentry)
   - Monitor performance (Vercel Analytics)
   - Set up uptime monitoring

## Security Checklist

- [x] Environment variables properly set
- [x] JWT secret is strong and unique
- [ ] Rate limiting implemented
- [ ] Database backups configured
- [x] HTTPS enabled
- [ ] Security headers configured
- [ ] Regular dependency updates
- [ ] SQL injection protection (via Prisma)
- [x] Password hashing (bcrypt)

## Support

If you encounter issues:
1. Check the troubleshooting section
2. Review platform documentation
3. Check application logs
4. Open an issue on GitHub

## Additional Resources

- [Vercel Deployment Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [Render Documentation](https://render.com/docs)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment)
- [Resend Documentation](https://resend.com/docs)
