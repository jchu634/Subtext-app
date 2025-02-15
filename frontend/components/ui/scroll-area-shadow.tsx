"use client";
import * as React from "react";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import { cn } from "@/lib/utils";
import { useWatchScrollAreaOverflow } from "@/lib/use-watch-scrollarea-overflow";

function ScrollArea({
  className,
  children,
  viewportRef,
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.Root> & {
  viewportRef?: React.Ref<HTMLDivElement>;
}) {
  return (
    <ScrollAreaPrimitive.Root
      data-slot="scroll-area"
      className={cn("relative overflow-hidden", className)}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        ref={viewportRef}
        data-slot="scroll-area-viewport"
        className="ring-ring/10 dark:ring-ring/20 dark:outline-ring/40 outline-ring/50 size-full rounded-[inherit] transition-[color,box-shadow] focus-visible:ring-4 focus-visible:outline-1"
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  );
}

function ScrollBar({
  className,
  thumbClassName,
  orientation = "vertical",
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.ScrollAreaScrollbar> & {
  thumbClassName?: string;
}) {
  return (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      data-slot="scroll-area-scrollbar"
      orientation={orientation}
      className={cn(
        "flex touch-none p-px transition-colors select-none",
        orientation === "vertical" &&
          "h-full w-2.5 border-l border-l-transparent p-[1px]",
        orientation === "horizontal" &&
          "h-2.5 flex-col border-t border-t-transparent p-[1px]",
        className,
      )}
      {...props}
    >
      <ScrollAreaPrimitive.ScrollAreaThumb
        data-slot="scroll-area-thumb"
        className={cn(
          "relative flex-1 rounded-full bg-gray-500",
          thumbClassName,
        )}
      />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  );
}

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
