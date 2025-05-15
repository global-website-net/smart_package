"use client";
import { useSession } from "next-auth/react";
import RightSideBanner from "./RightSideBanner";

export default function RightSideBannerWrapper() {
  const { data: session, status } = useSession();
  if (status === "loading") return null;
  if (!session?.user) return null;
  return <RightSideBanner />;
} 