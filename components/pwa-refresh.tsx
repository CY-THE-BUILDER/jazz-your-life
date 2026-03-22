"use client";

import { useEffect } from "react";

export function PwaRefresh() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    let refreshing = false;

    const reloadForNewWorker = () => {
      if (refreshing) {
        return;
      }

      refreshing = true;
      window.location.reload();
    };

    const updateRegistrations = async () => {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(
        registrations.map((registration) => registration.update().catch(() => undefined))
      );
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void updateRegistrations();
      }
    };

    navigator.serviceWorker.addEventListener("controllerchange", reloadForNewWorker);
    window.addEventListener("focus", updateRegistrations);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    void updateRegistrations();

    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", reloadForNewWorker);
      window.removeEventListener("focus", updateRegistrations);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return null;
}
