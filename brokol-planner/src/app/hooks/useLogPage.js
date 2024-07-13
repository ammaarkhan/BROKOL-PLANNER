"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { logEvent } from "firebase/analytics";
import { analytics } from "../../config/firebase";

const useLogPage = () => {
  const pathname = usePathname();

  useEffect(() => {
    if (analytics) {
      logEvent(analytics, "page_view", { page_path: pathname });
    }
  }, [pathname]); // Only re-run the effect if pathname changes
};

export default useLogPage;
