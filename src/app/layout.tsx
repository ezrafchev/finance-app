import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Finance App - Manage Your Finances",
  description: "A modern finance application to help you track and manage your personal finances. Track expenses, manage budgets, and achieve your financial goals.",
  keywords: ["finance", "budget", "expense tracker", "money management", "financial planning"],
  authors: [{ name: "Finance App Team" }],
  openGraph: {
    title: "Finance App - Manage Your Finances",
    description: "Track expenses, manage budgets, and achieve your financial goals",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
