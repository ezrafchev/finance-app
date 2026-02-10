import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Finance App - Manage Your Finances",
  description: "A modern finance application to help you track and manage your personal finances",
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
