import { useHeaderScroll } from "./useHeaderScroll";
import { useHeaderUser } from "@/src/hooks/useHeaderUser";

export function useHeader() {
  const scroll = useHeaderScroll();
  const user = useHeaderUser();

  return {
    ...scroll,
    ...user,
  };
}