import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Blox Fruits Stock Checker",
  description: "Check the real-time stock of the Blox Fruits dealer.",
  icons: "/logo2.png",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Google+Sans:wght@400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="google-sans antialiased">{children}</body>
    </html>
  );
}
