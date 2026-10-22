import { useEffect, useState } from "react";
import { getNewestEntries } from "@mingu/interaction-ui/catalog";

/** No build-time clock: expiration also updates in an already-open catalog. */
export function useNewestEntries() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const refresh = () => setNow(Date.now());
    const visible = () => {
      if (!document.hidden) refresh();
    };
    const timer = window.setInterval(refresh, 60_000);
    document.addEventListener("visibilitychange", visible);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", visible);
    };
  }, []);
  return getNewestEntries(undefined, now);
}
