import { Pressable, Text } from "react-native";
import { useUser } from "@/lib/context";

const LogoutButton = () => {
  const { logout } = useUser();

  return (
    <Pressable onPress={logout} className="bg-card p-3 rounded-xl">
      <Text className="text-accent font-bold">Log out</Text>
    </Pressable>
  );
};

export default LogoutButton;
