This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Finance App

A modern finance application to help you track and manage your personal finances. Built with Next.js 15, React 19, and Tailwind CSS.

## Features

- 📊 Dashboard with financial overview
- 💰 Track income and expenses
- 📈 Budget tracking
- 📉 Financial reports and charts
- 💡 Smart financial insights

## Getting Started

First, install the dependencies:

```bash
npm install --legacy-peer-deps
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:8000](http://localhost:8000) with your browser to see the result.

## Building for Production

Build the project:

```bash
npm run build
```

This will create a static export in the `out` directory.

## GitHub Pages Deployment

![Deployment Status](https://github.com/ezrafchev/finance-app/actions/workflows/deploy.yml/badge.svg)

This project is configured to automatically deploy to GitHub Pages when changes are pushed to the main branch.

### ⚠️ IMPORTANT: First-Time Setup Required

**Before the deployment can work, you MUST enable GitHub Pages:**

1. Go to https://github.com/ezrafchev/finance-app/settings/pages
2. Under "Build and deployment", select:
   - Source: **GitHub Actions** (not "Deploy from a branch")
3. Save the settings
4. Run the workflow: https://github.com/ezrafchev/finance-app/actions

📖 **For detailed Portuguese instructions, see:** [GITHUB_PAGES_SETUP.md](./GITHUB_PAGES_SETUP.md)

### Current Status

- ✅ Application code is ready
- ✅ Build workflow is configured
- ✅ Static export works correctly
- ⚠️ **GitHub Pages needs to be enabled in repository settings**

### After Setup

Once GitHub Pages is enabled:
- Every push to `main` triggers automatic deployment
- Site will be available at: `https://ezrafchev.github.io/finance-app/`
- Deployment takes 2-3 minutes

### Manual Deployment

You can also trigger a manual deployment:

1. Go to the "Actions" tab in your GitHub repository
2. Select "Deploy to GitHub Pages" workflow
3. Click "Run workflow"

## Technologies Used

- **Framework**: Next.js 15.5.12
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4
- **Components**: Radix UI
- **Icons**: Lucide React
- **Form Handling**: React Hook Form + Zod
- **Charts**: Recharts

## Project Structure

```
finance-app/
├── .github/
│   └── workflows/
│       └── deploy.yml       # GitHub Pages deployment workflow
├── public/
│   └── .nojekyll           # Ensures GitHub Pages works correctly
├── src/
│   ├── app/
│   │   ├── layout.tsx      # Root layout
│   │   ├── page.tsx        # Home page
│   │   └── globals.css     # Global styles
│   ├── components/
│   │   └── ui/             # Reusable UI components
│   ├── hooks/              # Custom React hooks
│   └── lib/
│       └── utils.ts        # Utility functions
├── next.config.ts          # Next.js configuration (static export enabled)
└── package.json
```

## Development Notes

- The project uses `--legacy-peer-deps` flag due to some peer dependency conflicts
- Static export is enabled for GitHub Pages compatibility
- Images are unoptimized for static export
- Base path is set to `/finance-app` in production

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!
