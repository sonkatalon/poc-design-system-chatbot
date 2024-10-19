import type { Metadata } from "next";
import localFont from "next/font/local";
import { getJob } from "./ingestion/actions";
import { IngestionForm } from "./ingestion/IngestionForm";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Hoàng Duy",
  description: "Katalon Design System Chatbot",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { job } = await getJob();

  return (
    <html className="h-full" lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full`}
      >
        <IngestionForm job={job} />
        {children}
      </body>
    </html>
  );
}
