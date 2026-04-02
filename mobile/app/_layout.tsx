import { Stack } from "expo-router";
import "./global.css";
import { UserProvider } from "@/lib/context";

export default function RootLayout() {
  return (
    <UserProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </UserProvider>
  );
}
