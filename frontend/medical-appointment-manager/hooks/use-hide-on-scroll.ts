import { useEffect } from "react"

export function useHideOnScroll(ref: React.RefObject<HTMLElement>) {
  useEffect(() => {
    if (!ref.current) return;
    let lastScroll = window.scrollY;
    let ticking = false;
    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const current = window.scrollY;
          if (current > lastScroll + 10) {
            ref.current!.style.transform = "translateY(100%)";
          } else if (current < lastScroll - 10) {
            ref.current!.style.transform = "translateY(0)";
          }
          lastScroll = current;
          ticking = false;
        });
        ticking = true;
      }
    }
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [ref]);
}
