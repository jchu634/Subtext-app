import Navbar from "@/components/navbar";

import { ThemeProvider } from "@/components/theme-provider";
import Providers from "./providers";

import { Toaster } from "@/components/ui/toaster";
import { Funnel_Display } from "next/font/google";
import "@/styles/globals.css";

const funnel = Funnel_Display({
  subsets: ["latin"],
  variable: "--font-funnel",
});

export default function RootLayout({
  // Layouts must accept a children prop.
  // This will be populated with nested layouts or pages
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex bg-white dark:bg-black">
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Navbar />
            <Toaster />
            <div className={`flex w-full flex-col ${funnel.className}`}>
              {/* <Menu /> */}
              {children}
            </div>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
