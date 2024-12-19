import { useTheme } from "next-themes";

export default function SideNav() {
  const { setTheme } = useTheme();

  return (
    <main className={`pywebview-drag-region`}>
      <div className="h-screen w-16 bg-[#5B8E7D] md:px-2"></div>
    </main>
  );
}
