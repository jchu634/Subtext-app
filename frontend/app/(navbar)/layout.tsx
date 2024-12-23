import Navbar from "@/components/navbar";
import Menu from "@/components/menu";
import "@/styles/globals.css";
import { ThemeProvider } from "@/components/theme-provider";

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
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          <div className="flex flex-col">
            <Menu />
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
