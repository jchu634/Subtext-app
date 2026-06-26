"use client";
import * as React from "react";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import { cn } from "@/lib/utils";
import { useWatchScrollAreaOverflow } from "@/lib/use-watch-scrollarea-overflow";
import { ScrollArea, ScrollBar } from "./scroll-area";

export function ScrollAreaShadow({
  children,
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root> & {
  children: React.ReactNode;
}) {
  const scrollViewportRef = React.useRef<HTMLDivElement | null>(null);
  const [shadowTop, setShadowTop] = React.useState(false);
  const [shadowBottom, setShadowBottom] = React.useState(false);

  const handleScroll = React.useCallback(() => {
    const viewport = scrollViewportRef.current;
    if (!viewport) return;

    const scrollTop = viewport.scrollTop;
    const scrollHeight = viewport.scrollHeight;
    const clientHeight = viewport.clientHeight;

    // Add a small buffer (1px) to handle floating point rounding
    const isAtBottom = Math.abs(scrollTop + clientHeight - scrollHeight) <= 1;

    setShadowTop(scrollTop > 0);
    setShadowBottom(!isAtBottom);
  }, []);

  const overflown = useWatchScrollAreaOverflow(scrollViewportRef);

  React.useEffect(() => {
    const viewport = scrollViewportRef.current;
    if (!viewport) return;

    // Initial check
    handleScroll();

    viewport.addEventListener("scroll", handleScroll);
    return () => viewport.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <ScrollArea
      viewportRef={scrollViewportRef}
      onScrollCapture={handleScroll}
      className={cn(
        "h-full",
        overflown &&
          shadowTop &&
          !shadowBottom &&
          "shadow-[inset_0_20px_10px_-6px_rgba(0,0,0,0.3)] dark:shadow-[inset_0_20px_10px_-6px_rgba(255,255,255,0.3)]",
        overflown &&
          !shadowTop &&
          shadowBottom &&
          "shadow-[inset_0_-20px_10px_-6px_rgba(0,0,0,0.3)] dark:shadow-[inset_0_-20px_10px_-6px_rgba(255,255,255,0.3)]",
        overflown &&
          shadowTop &&
          shadowBottom &&
          "shadow-[inset_0_-20px_10px_-6px_rgba(0,0,0,0.3),inset_0_20px_10px_-6px_rgba(0,0,0,0.3)] dark:shadow-[inset_0_-20px_10px_-6px_rgba(255,255,255,0.3),inset_0_20px_10px_-6px_rgba(255,255,255,0.3)]",
        className,
      )}
      {...props}
    >
      {children}
      <ScrollBar orientation="vertical" />
    </ScrollArea>
  );
}
