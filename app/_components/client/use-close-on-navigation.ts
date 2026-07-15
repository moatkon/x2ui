"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export function useCloseOnNavigation() {
  const pathname = usePathname();
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const close = () => detailsRef.current?.removeAttribute("open");

  useEffect(() => {
    const details = detailsRef.current;
    details?.removeAttribute("open");
  }, [pathname]);

  return { detailsRef, close };
}
