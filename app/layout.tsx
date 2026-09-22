import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: {
    default: "OBYON Signal",
    template: "%s | OBYON Signal",
  },
  description:
    "AI-powered opportunity discovery platform. Turn online demand into opportunities for your business.",
  keywords: [
    "AI opportunity discovery",
    "buying intent detection",
    "lead generation",
    "AI signals",
    "sales intelligence",
  ],
  openGraph: {
    title: "OBYON Signal",
    description: "Turn online demand into opportunities.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
