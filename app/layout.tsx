import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TripBinder",
  description: "Organize and manage your trips",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
