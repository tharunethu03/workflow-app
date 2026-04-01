import { Text, View } from "react-native";

export default function Index() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-xl font-bold text-accent">
        Welcome to Workflow!
      </Text>
      <Text className="text-sm text-center text-muted-foreground mt-2">
        Choose your role and enter your name to enter the app and start managing your tasks.
      </Text>
    </View>
  );
}
