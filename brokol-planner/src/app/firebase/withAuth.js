"use client";

import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../config/firebase";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const withAuth = (Component) => {
  return (props) => {
    const [user, loading, error] = useAuthState(auth);
    const router = useRouter();

    useEffect(() => {
      if (!loading && !user) {
        router.push("/");
      }
    }, [user, loading, router]);

    if (loading) {
      return <p>Loading...</p>;
    }

    if (error) {
      console.error("Authentication error:", error);
      return <p>Error loading user data.</p>;
    }

    return user ? <Component {...props} /> : null;
  };
};

export default withAuth;
