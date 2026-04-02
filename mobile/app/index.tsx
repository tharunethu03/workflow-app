import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { styled } from "nativewind";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { useUser } from "@/lib/context";
import { useRouter } from "expo-router";
import { TreeDeciduous } from "lucide-react-native";

type Role = "creator" | "editor" | "reviewer" | "downloader" | "admin";

const SafeAreaView = styled(RNSafeAreaView);
export default function Index() {
  const { setRole, setUserName: saveUserName } = useUser();
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<
    "creator" | "editor" | "reviewer" | "downloader" | "admin" | null
  >(null);
  const [userName, setUserName] = useState("");

  const roles: { name: string; role: Role }[] = [
    { name: "Creator", role: "creator" },
    { name: "Editor", role: "editor" },
    { name: "Reviewer", role: "reviewer" },
    { name: "Downloader", role: "downloader" },
    { name: "Admin", role: "admin" },
  ];

  const roleRoutes: Record<Role, string> = {
    creator: "/(creator)",
    editor: "/(editor)",
    reviewer: "/(reviewer)",
    downloader: "/(downloader)",
    admin: "/(creator)", // admin sees creator view
  };

  const handleLogin = () => {
    if (!userName.trim() || !selectedRole) return;

    saveUserName(userName);
    setRole(selectedRole);

    router.push(roleRoutes[selectedRole] as any);
  };

  return (
    <SafeAreaView className="flex-1  bg-background p-5">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 items-center justify-center gap-10"
        >
          <View className="w-full items-center">
            <View className="bg-accent p-3 rounded-xl mb-5">
              <TreeDeciduous color={"white"} size={50} />
            </View>
            <Text className="text-xl font-bold text-accent">
              Welcome to Workflow!
            </Text>
            <Text className="text-sm text-center text-muted-foreground mt-1">
              Login and start managing your tasks.
            </Text>
          </View>

          <View className="w-full items-center">
            {/* Role selector */}
            <View className="mt-5 w-full items-center justify-center mx-auto px-5">
              <Text className="text-sm text-muted-foreground self-start">
                Choose your role:
              </Text>
              <View className="flex flex-row flex-wrap justify-center gap-3 mt-3">
                {roles.map((role, i) => (
                  <Pressable key={i} onPress={() => setSelectedRole(role.role)}>
                    <Text
                      className={`px-4 py-3 rounded-xl ${
                        selectedRole === role.role
                          ? "bg-accent text-white font-semibold"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      {role.name}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Name input */}
            <View className="mt-5 w-full items-center justify-center mx-auto px-5">
              <Text className="text-sm text-muted-foreground self-start ">
                Enter your name:
              </Text>
              <TextInput
                onChangeText={setUserName}
                value={userName}
                placeholder="ex: Dewana Rajasinghe"
                placeholderTextColor="#9CA3AF"
                className="border border-border w-full py-3 px-3 mt-3 text-primary bg-card rounded-xl focus:border-accent"
              />
            </View>
          </View>
          <Pressable onPress={handleLogin} className="w-full px-5">
            <Text className="bg-accent w-full py-3 rounded-lg text-center font-bold shadow-lg text-white mt-10">
              Log in
            </Text>
          </Pressable>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}
