import { View, Text, Pressable, ScrollView, TextInput } from "react-native";
import React, { useState } from "react";
import { FilePlus, ChevronLeft } from "lucide-react-native";

import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import { api } from "@/lib/api";
import { useUser } from "@/lib/context";
import { useRouter } from "expo-router";
const SafeAreaView = styled(RNSafeAreaView);

const Create = () => {
  const [title, setTitle] = useState("");
  const [templateBody, setTemplateBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { userName, role } = useUser();
  const router = useRouter();

  const extractFields = (body: string) => {
    const matches = body.match(/\{\{(\w+)\}\}/g) ?? [];
    return [...new Set(matches.map((m) => m.replace(/\{\{|\}\}/g, "")))];
  };

  const detectedFields = extractFields(templateBody);

  const handleCreate = async () => {
    if (!title.trim() || !templateBody.trim()) {
      setError("Please fill in all fields *");
      return;
    }
    setError("");

    setLoading(true);

    try {
      const templateFields = detectedFields.map((field) => ({
        name: field,
        type: "text",
      }));

      await api.createDocument(
        { title, templateBody, templateFields, createdByName: userName },
        role!,
        userName,
      );

      router.back();
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background p-5 justify-between">
      <View className="bg-accent py-3 rounded-xl">
        <View className="flex-row items-center justify-between px-3">
          <View className="flex flex-row items-center">
            <Pressable className="px-2" onPress={() => router.back()}>
              <ChevronLeft color={"white"} />
            </Pressable>
            <Text className=" ml-2 text-xl font-bold text-white">
              Create Document
            </Text>
          </View>
        </View>
      </View>
      <ScrollView
        className="p-5 flex-col h-full"
        contentContainerStyle={{
          paddingBottom: 20,
        }}
      >
        <View>
          <Text className="text-muted-foreground mb-1">Document title:</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Serrvice Agreement"
            className="border border-border p-3 rounded-lg bg-card focus:border-accent mb-3"
          />
          <Text className="text-muted-foreground mb-1">Letter body:</Text>
          <Text className="text-xs text-muted-foreground mb-2">
            Use {`{{field_name}}`} for dynamic fields
          </Text>
          <TextInput
            value={templateBody}
            onChangeText={setTemplateBody}
            placeholder={"Dear {{recipient_name}},\n\nRegarding {{subject}}..."}
            multiline
            numberOfLines={10}
            style={{ textAlignVertical: "top", minHeight: 300 }}
            className="border border-border p-3 rounded-lg bg-card focus:border-accent mb-3"
          />

          {detectedFields.length > 0 && (
            <View className="bg-muted rounded-lg p-4 mb-5">
              <Text className="text-muted-foreground text-sm mb-2">
                Detected Fields:
              </Text>
              {detectedFields.map((field, i) => (
                <Text key={i} className="text-sm text-muted-foreground">
                  • {field}
                </Text>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
      {error ? (
        <Text className="text-destructive text-sm mb-3">{error}</Text>
      ) : null}
      <Pressable
        onPress={handleCreate}
        className="bg-accent p-4 rounded-xl mb-2"
      >
        <Text className="text-white text-center font-semibold">
          {loading ? "Creating..." : "Create Document"}
        </Text>
      </Pressable>
    </SafeAreaView>
  );
};

export default Create;
