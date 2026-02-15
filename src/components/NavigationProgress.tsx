import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * NavigationProgress — shows a thin animated progress bar at top of page during route transitions.
 * Pure CSS implementation, no external dependencies.
 */
export function NavigationProgress() {
  const location = useLocation();

  useEffect(() => {
    const bar = document.getElementById("nav-progress-bar");
    if (!bar) return;

    // Start animation
    bar.style.transition = "none";
    bar.style.width = "0%";
    bar.style.opacity = "1";

    // Force reflow
    void bar.offsetWidth;

    // Animate to 80%
    bar.style.transition = "width 400ms ease-out";
    bar.style.width = "80%";

    // Complete after a short delay
    const timer = setTimeout(() => {
      bar.style.transition = "width 200ms ease-in, opacity 300ms ease";
      bar.style.width = "100%";
      setTimeout(() => {
        bar.style.opacity = "0";
      }, 200);
    }, 500);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-[3px] pointer-events-none">
      <div
        id="nav-progress-bar"
        className="h-full bg-primary"
        style={{
          width: "0%",
          opacity: 0,
          boxShadow: "0 0 10px hsl(var(--primary) / 0.5)",
        }}
      />
    </div>
  );
}
