import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Navigation } from "@/components/navigation";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";

const fractul = localFont({
  src: "./fonts/Fractul-Regular.woff",
  variable: "--font-fractul",
  weight: "400",
});

export const metadata: Metadata = {
  title: "PassAR | Decentralized Event Ticketing",
  description: "Decentralized event ticketing platform powered by AO",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fractul.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
            <Navigation />
            <main>{children}</main>
            <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
