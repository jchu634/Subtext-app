import Navbar from "./navbar";
import { ThemeProvider } from "@/components/theme-provider";

export default function Layout({ children }) {
  return (
    <>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <main className="flex bg-white dark:bg-black">
          <Navbar />
          {children}
        </main>
      </ThemeProvider>
    </>
  );
}
