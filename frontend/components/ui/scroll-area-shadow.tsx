"use client";
import * as React from "react";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import { cn } from "@/lib/utils";
import { useWatchScrollAreaOverflow } from "@/lib/use-watch-scrollarea-overflow";

const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root> & {
    viewportRef?: React.Ref<HTMLDivElement>;
  }
>(({ className, children, viewportRef, ...props }, ref) => (
  <ScrollAreaPrimitive.Root
    ref={ref}
    className={cn("relative overflow-hidden", className)}
    {...props}
  >
    <ScrollAreaPrimitive.Viewport
      ref={viewportRef}
      className="h-full w-full rounded-[inherit]"
    >
      {children}
    </ScrollAreaPrimitive.Viewport>
    <ScrollBar />
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
));
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;

const ScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  React.ComponentPropsWithoutRef<
    typeof ScrollAreaPrimitive.ScrollAreaScrollbar
  > & {
    thumbClassName?: string;
  }
>(({ className, thumbClassName, orientation = "vertical", ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    className={cn(
      "flex touch-none select-none transition-colors",
      orientation === "vertical" &&
        "h-full w-2.5 border-l border-l-transparent p-[1px]",
      orientation === "horizontal" &&
        "h-2.5 flex-col border-t border-t-transparent p-[1px]",
      className,
    )}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb
      className={cn("relative flex-1 rounded-full bg-gray-500", thumbClassName)}
    />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
));
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName;

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
        "h-full rounded-b-lg", // Added rounded-b-lg for bottom corners
        overflown &&
          shadowTop &&
          !shadowBottom &&
          "shadow-[inset_0_20px_10px_-6px_rgba(0,0,0,0.3)]",
        overflown &&
          !shadowTop &&
          shadowBottom &&
          "shadow-[inset_0_-20px_10px_-6px_rgba(0,0,0,0.3)]",
        overflown &&
          shadowTop &&
          shadowBottom &&
          "shadow-[inset_0_-20px_10px_-6px_rgba(0,0,0,0.3),inset_0_20px_10px_-6px_rgba(0,0,0,0.3)]",
        className,
      )}
      {...props}
    >
      {children}
      <ScrollBar orientation="vertical" />
    </ScrollArea>
  );
}
