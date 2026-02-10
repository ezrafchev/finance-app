# Workflow Files Status

## Disabled Workflows

The following GitHub Pages deployment workflows have been disabled:
- `deploy.yml.disabled`
- `nextjs.yml.disabled`  
- `check-pages-enabled.yml.disabled`

## Why Were They Disabled?

This application is a **full-stack Next.js application** with:
- Server-side API routes (`/api/auth/*`, `/api/profile`, `/api/transactions`)
- Database integration (Prisma)
- Email verification functionality
- Authentication system

**GitHub Pages only supports static sites** and cannot run:
- API routes
- Server-side rendering
- Database connections
- Server-side authentication

Attempting to deploy this app to GitHub Pages results in the error:
```
tar: out: Cannot open: No such file or directory
Error: Process completed with exit code 2
```

This happens because the app cannot be exported as static files (`output: 'export'`) due to its server-side dependencies.

## How to Deploy This Application

This application should be deployed to a **server-side hosting platform** that supports Next.js server features:

### Recommended Platforms:
1. **Vercel** (Recommended) - https://vercel.com
   - Built for Next.js
   - Automatic deployment from Git
   - Built-in PostgreSQL support
   - Free tier available

2. **Railway** - https://railway.app
   - Easy PostgreSQL integration
   - Auto-deploys from GitHub
   - Good developer experience

3. **Render** - https://render.com
   - Free tier with PostgreSQL
   - Simple deployment process

4. **DigitalOcean App Platform** - https://digitalocean.com
   - Professional-grade hosting
   - Database clusters included

### Deployment Instructions

See the detailed deployment guide: [`DEPLOYMENT_GUIDE.md`](../../DEPLOYMENT_GUIDE.md)

The guide includes:
- Step-by-step instructions for each platform
- Database setup (PostgreSQL)
- Environment variable configuration
- Post-deployment checklist
- Troubleshooting tips

## Re-enabling GitHub Pages Workflows

**Do NOT re-enable these workflows unless**:
1. You remove all API routes from the application
2. You remove database dependencies
3. You convert the app to a fully static site
4. You add `output: 'export'` to `next.config.ts`

If you need to re-enable them:
```bash
mv deploy.yml.disabled deploy.yml
mv nextjs.yml.disabled nextjs.yml
mv check-pages-enabled.yml.disabled check-pages-enabled.yml
```

But be aware that the application will need significant refactoring to work as a static site.
