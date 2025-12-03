// frontend/hooks/useOnlineStatus.ts
import { useEffect, useState } from "react";

export default function useOnlineStatus() {
  const isBrowser = typeof window !== "undefined";
  const [online, setOnline] = useState<boolean>(() => (isBrowser ? navigator.onLine : true));

  useEffect(() => {
    if (!isBrowser) return;
    function onOnline() { setOnline(true); }
    function onOffline() { setOnline(false); }
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    setOnline(navigator.onLine);
    return () => { window.removeEventListener("online", onOnline); window.removeEventListener("offline", onOffline); };
  }, [isBrowser]);

  return online;
}
