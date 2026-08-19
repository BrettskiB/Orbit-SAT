import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Orbit SAT Math",
  description: "A focused, personalized SAT Math learning experience."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
