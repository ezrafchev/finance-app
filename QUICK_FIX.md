# Quick Fix for GitHub Pages 404

## Try This First - Remove basePath

The 404 error might be caused by the basePath configuration. Let's try a simpler approach:

### Step 1: Update next.config.ts

Change the configuration to remove the basePath:

```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Remove basePath for simpler deployment
}

export default nextConfig
```

### Step 2: Update GitHub Actions Workflow

Make sure the workflow is correct in `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci --legacy-peer-deps

      - name: Build
        run: npm run build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./out

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### Step 3: Ensure GitHub Pages is Configured

1. Go to your repository: https://github.com/ezrafchev/finance-app
2. Click **Settings**
3. Click **Pages** in the left sidebar
4. Under "Build and deployment":
   - **Source**: Select "GitHub Actions"
   - NOT "Deploy from a branch"

### Step 4: Trigger Deployment

After merging to main:
- Option A: The workflow will run automatically on push
- Option B: Go to Actions → Select "Deploy to GitHub Pages" → Click "Run workflow"

## If You Get Permission Errors

GitHub Actions needs permission to deploy. Check:
1. Settings → Actions → General → Workflow permissions
2. Select "Read and write permissions"
3. Save

## Expected URL

- With basePath: https://ezrafchev.github.io/finance-app/
- Without basePath (if repo is ezrafchev.github.io): https://ezrafchev.github.io/

## Debug Checklist

- [ ] PR merged to main branch?
- [ ] GitHub Pages source set to "GitHub Actions"?
- [ ] Workflow ran successfully? (Check Actions tab)
- [ ] Files in out/ directory include index.html?
- [ ] .nojekyll file exists in out/?

## Common Issues

1. **404 on root**: basePath mismatch
2. **404 on all pages**: Files not deployed correctly
3. **Workflow doesn't run**: Not merged to main or workflow file not on main
4. **Permission denied**: Workflow permissions not set correctly
