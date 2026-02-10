# GitHub Pages Deployment Guide

This document provides instructions for deploying the Finance App to GitHub Pages.

## Prerequisites

- Repository with admin access
- GitHub Actions enabled for the repository

## Setup Steps

### 1. Enable GitHub Pages

1. Navigate to your repository on GitHub: `https://github.com/ezrafchev/finance-app`
2. Click on **Settings** tab
3. Scroll down and click on **Pages** in the left sidebar
4. Under "Build and deployment":
   - **Source**: Select "GitHub Actions"
   - This will use the workflow defined in `.github/workflows/deploy.yml`

### 2. Ensure Changes Are on Main Branch

**IMPORTANT**: The application files and workflow must be on the `main` branch for deployment to work.

If you're seeing a 404 error, it likely means the PR hasn't been merged to main yet. Merge the PR containing:
- Application structure (`src/app/layout.tsx`, `src/app/page.tsx`)
- GitHub Actions workflow (`.github/workflows/deploy.yml`)
- Updated configuration (`next.config.ts`, `package.json`)

### 3. Monitor Deployment

1. Go to the **Actions** tab in your repository
2. You should see a "Deploy to GitHub Pages" workflow running
3. Wait for it to complete (usually takes 2-3 minutes)
4. Once completed, your site will be live!

### 4. Access Your Site

After successful deployment, your site will be available at:

```
https://ezrafchev.github.io/finance-app/
```

## Manual Deployment

You can manually trigger a deployment at any time:

1. Go to the **Actions** tab
2. Select "Deploy to GitHub Pages" from the workflows list
3. Click the "Run workflow" button
4. Select the branch (usually `main`)
5. Click "Run workflow" to start

## Troubleshooting

### Workflow Fails to Run

- Ensure GitHub Actions is enabled in repository settings
- Check that the workflow file exists at `.github/workflows/deploy.yml` on the main branch
- Verify you have the necessary permissions

### 404 Error After Deployment

#### Most Common Cause: Changes Not on Main Branch
- Verify the PR has been merged to `main`
- Check that `src/app/layout.tsx` and `src/app/page.tsx` exist on main
- Ensure `.github/workflows/deploy.yml` exists on main

#### Other Causes:
- Make sure GitHub Pages is set to use "GitHub Actions" as the source (not "Deploy from a branch")
- Wait a few minutes after deployment for DNS propagation
- Check that the workflow completed successfully in the Actions tab

### Build Fails

- Check the Actions tab for detailed error logs
- Ensure all dependencies are correctly listed in `package.json`
- Verify the build works locally with `npm run build`

### Permission Errors

GitHub Actions needs permission to deploy:
1. Go to Settings → Actions → General → Workflow permissions
2. Select "Read and write permissions"
3. Check "Allow GitHub Actions to create and approve pull requests"
4. Save

## Updating the Site

Any push to the `main` branch will automatically trigger a new deployment. To update your site:

1. Make changes to your code
2. Commit and push to a feature branch
3. Create a pull request
4. Once merged to `main`, deployment happens automatically

## Local Testing

Before deploying, you can test the production build locally:

```bash
# Install dependencies
npm install --legacy-peer-deps

# Build the static site
npm run build

# Serve the static files (requires a static server)
npx serve out
```

The site should open at `http://localhost:3000` (or another port shown in terminal).

## Notes

- The build process creates a static export in the `out/` directory
- Images are unoptimized for static site compatibility
- The `.nojekyll` file ensures GitHub Pages serves Next.js files correctly
- The workflow runs on every push to `main` or can be triggered manually
- Configuration has been simplified to work without basePath for easier deployment

