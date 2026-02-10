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

### 2. Merge the PR

1. Review and merge the pull request that contains the GitHub Pages setup
2. Once merged to the `main` branch, the GitHub Actions workflow will automatically trigger

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
- Check that the workflow file exists at `.github/workflows/deploy.yml`
- Verify you have the necessary permissions

### 404 Error After Deployment

- Make sure GitHub Pages is set to use "GitHub Actions" as the source
- Check that the `basePath` in `next.config.ts` matches your repository name
- Wait a few minutes after deployment for DNS propagation

### Build Fails

- Check the Actions tab for detailed error logs
- Ensure all dependencies are correctly listed in `package.json`
- Verify the build works locally with `npm run build`

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
