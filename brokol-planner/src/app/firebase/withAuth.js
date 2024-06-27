"use client";

import { auth } from "../../config/firebase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";

export default function withAuth(Component) {
  return function AuthComponent(props) {
    const router = useRouter();

    useEffect(() => {
      const unsub = onAuthStateChanged(auth, (user) => {
        if (!user) {
          router.push("/");
        }
      });

      return () => unsub();
    }, [router]);

    return <Component {...props} />;
  };
}
