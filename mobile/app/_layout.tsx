import "./global.css";
import { Stack, useRouter, useSegments } from "expo-router";
import { UserProvider, useUser } from "../lib/context";
import { useEffect } from "react";

function RootLayoutNav() {
  const { role } = useUser();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const inAuthScreen = segments[0] === undefined;
    if (!role && !inAuthScreen) {
      router.dismissAll();
    }
  }, [role]);

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return (
    <UserProvider>
      <RootLayoutNav />
    </UserProvider>
  );
}
