"use client";

import HeaderDesktop from "./HeaderDesktop";
import HeaderMobile from "./HeaderMobile";
import { useHeader } from "@/src/hooks/useHeader";

export default function Header() {
  const { user, logout } = useHeader();

  return (
    <>
      <HeaderDesktop user={user} logout={logout} />
      <HeaderMobile />
    </>
  );
}