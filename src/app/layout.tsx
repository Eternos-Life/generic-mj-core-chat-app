import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

/*
 * CUSTOMIZE: Update metadata for each persona
 * - title: "PersonaName - Title - UARE.AI"
 * - description: "Tagline | Digital Twin Demo"
 */
export const metadata: Metadata = {
  title: "{{AVATAR_NAME}} - {{AVATAR_TITLE}} - UARE.AI",
  description: "{{AVATAR_SUBTITLE}} | Digital Twin Demo",
  icons: {
    icon: [
      { url: "/favicon-u.png", sizes: "any" },
      { url: "/favicon-u.png", type: "image/png" }
    ],
    shortcut: "/favicon-u.png",
    apple: "/favicon-u.png",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="icon" href="/favicon-u.png" type="image/png" />
        <link rel="shortcut icon" href="/favicon-u.png" />
      </head>
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
