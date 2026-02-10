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

This project is configured to automatically deploy to GitHub Pages when changes are pushed to the main branch.

### Setup Instructions

1. Go to your repository settings on GitHub
2. Navigate to "Pages" in the left sidebar
3. Under "Build and deployment", select:
   - Source: **GitHub Actions**
4. The workflow will automatically build and deploy your site

The site will be available at: `https://ezrafchev.github.io/finance-app/`

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
