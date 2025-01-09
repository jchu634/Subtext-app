import Navbar from "@/components/navbar";
import Menu from "@/components/menu";
import "@/styles/globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Providers from "./providers";
import { Toaster } from "@/components/ui/toaster";

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
            <div className="flex w-full flex-col">
              {/* <Menu /> */}
              {children}
            </div>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
