import type { Metadata } from "next";
import "./globals.css";
import { AlertProvider } from "@/contexts/AlertContext";


export const metadata: Metadata = {
  title: "fitrack",
  description: "A fitness tracking application",
    icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-gray-100 text-gray-900 antialiased">
        <AlertProvider>
          {children}
        </AlertProvider>
      </body>
    </html>
  );
}
