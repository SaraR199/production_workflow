import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Author Workflow - Production Management",
  description: "AI-assisted author workflow and production management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
