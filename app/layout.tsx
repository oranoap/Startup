import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "Insurance by Dentists — Risk Analysis Platform",
  description:
    "Internal platform for policy review and dental-practice insurance gap analysis.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600;8..60,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans text-sm">
        <Providers>
          <Sidebar />
          <div className="pl-60 print:pl-0">
            <Header />
            <main className="mx-auto min-h-[calc(100vh-3.5rem)] max-w-[1440px]">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
