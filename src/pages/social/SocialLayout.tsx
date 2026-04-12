import { Outlet } from "react-router-dom";
import { SocialProvider } from "@/contexts/SocialContext";

export default function SocialLayout() {
  return (
    <SocialProvider>
      <Outlet />
    </SocialProvider>
  );
}
