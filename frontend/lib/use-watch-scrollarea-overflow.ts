import React from "react";

export function useWatchScrollAreaOverflow(
  ref: React.MutableRefObject<HTMLDivElement | null>,
) {
  const [overflown, setOverflown] = React.useState(false);
  const observer = React.useRef<ResizeObserver | null>(null);

  const checkOverflow = React.useCallback(() => {
    if (ref.current) {
      setOverflown(ref.current.scrollHeight > ref.current.clientHeight);
    }
  }, []);

  React.useEffect(() => {
    if (typeof window === "undefined" || !ref.current) return;

    // Initial check
    checkOverflow();

    // Watch for resize of the container
    observer.current = new ResizeObserver(checkOverflow);
    observer.current.observe(ref.current);

    // Handle window resize
    window.addEventListener("resize", checkOverflow);

    return () => {
      observer.current?.disconnect();
      window.removeEventListener("resize", checkOverflow);
    };
  }, [ref.current]);

  return overflown;
}
