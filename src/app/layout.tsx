import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Finance App - Manage Your Finances",
  description: "A modern finance application to help you track and manage your personal finances. Track expenses, manage budgets, and achieve your financial goals.",
  keywords: ["finance", "budget", "expense tracker", "money management", "financial planning"],
  authors: [{ name: "Finance App Team" }],
  manifest: "/manifest.json",
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
    <html lang="pt-BR">
      <body className="font-sans antialiased">
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
