import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ResearchMate AI - Academic Citation Auditor & Literature Review Generator",
  description: "AI-Powered Academic Research Assistant, Citation Auditor & Literature Review Generator grounded in OpenAlex and Crossref.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
