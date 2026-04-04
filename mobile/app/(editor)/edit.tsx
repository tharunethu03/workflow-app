import {
  View,
  Text,
  ActivityIndicator,
  Pressable,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import { api } from "@/lib/api";
import dayjs from "dayjs";
import { renderLetterStyled } from "@/lib/utils";
import { useUser } from "@/lib/context";
const SafeAreaView = styled(RNSafeAreaView);

type TemplateField = {
  name: string;
  type: string;
};

type Document = {
  id: string;
  title: string;
  createdAt: string;
  templateBody: string;
  templateFields: TemplateField[];
  status: string;
};

const Edit = () => {
  const params = useLocalSearchParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(true);
  const [document, setDocument] = useState<Document | null>(null);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [confirmModal, setConfirmModal] = useState(false);

  const { userName, role } = useUser();
  const router = useRouter();

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const data = await api.getDocument(id as string);

        if (!data || !data.templateFields) {
          console.error("Invalid document data:", data);
          return;
        }

        setDocument(data);

        const initialValues: Record<string, string> = {};
        data.templateFields.forEach((field: TemplateField) => {
          initialValues[field.name] = "";
        });

        if (data.versions && data.versions.length > 0) {
          const latestVersion = data.versions[0];
          const latestFields = latestVersion.fields as Record<string, string>;

          const initialValues: Record<string, string> = {};
          data.templateFields.forEach((field: TemplateField) => {
            initialValues[field.name] = latestFields[field.name] ?? "";
          });

          setFieldValues(initialValues);
        } else {
          const initialValues: Record<string, string> = {};
          data.templateFields.forEach((field: TemplateField) => {
            initialValues[field.name] = "";
          });
          setFieldValues(initialValues);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchDocument();
  }, [id]);

  const updateField = (fieldName: string, value: string) => {
    setFieldValues((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleEdit = async () => {
    try {
      await api.addVersion(
        id as string,
        {
          fields: fieldValues,
          editedByName: userName,
          editedByRole: role,
        },
        role!,
        userName,
      );
      setConfirmModal(false);
      router.back();
    } catch (error) {
      console.log(error);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color={"#EA7A54"} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <View className="bg-accent py-3 rounded-xl mb-5">
        <View className="flex-row items-center justify-between px-3">
          <View className="flex flex-row items-center">
            <View className="ml-2">
              <Text className="text-xl font-bold text-white">
                {document?.title}
              </Text>
            </View>
          </View>
        </View>
      </View>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 items-center justify-center gap-10"
        >
          <ScrollView
            className="p-3 flex-col h-full"
            contentContainerStyle={{
              paddingBottom: 20,
            }}
          >
            <View className="flex-row items-start justify-between w-full mb-5">
              <Text className="sub-label">Created on:</Text>
              <View className="flex-col items-end">
                <Text className="text-muted-foreground text-sm">
                  {dayjs(document?.createdAt).format("hh:mm A")}
                </Text>
                <Text className="text-muted-foreground text-sm">
                  {dayjs(document?.createdAt).format("MM/DD/YYYY")}
                </Text>
              </View>
            </View>
            <View className="bg-card border border-border rounded-xl p-4 mb-5">
              <Text className="text-sm font-semibold text-foreground mb-2">
                Preview:
              </Text>
              <Text>
                {renderLetterStyled(document?.templateBody || "", fieldValues)}
              </Text>
            </View>
            {(document?.templateFields ?? []).map((field, i) => (
              <View key={i} className="mb-3">
                <Text className="text-muted-foreground mb-2">{field.name}</Text>
                <TextInput
                  value={fieldValues[field.name] ?? ""}
                  onChangeText={(value) => updateField(field.name, value)}
                  placeholder={`Enter ${field.name}`}
                  placeholderTextColor="#9CA3AF"
                  className="border border-border p-3 rounded-lg bg-card focus:border-accent"
                />
              </View>
            ))}
            <Pressable
              onPress={() => {
                setConfirmModal(true);
              }}
              className="bg-accent p-4 rounded-xl my-4 shadow-lg mb-10"
            >
              <Text className="text-white text-center font-semibold">
                {loading ? "Editing..." : "Edit Document"}
              </Text>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
      {confirmModal && (
        <View
          className="absolute inset-0 justify-center items-center"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <View className="bg-card w-[80%] border-1 border-accent p-6 rounded-2xl">
            <Text className="mb-5 text-center">
              This will create a new version of the document with your changes.
              Other editors can still contribute.
            </Text>

            <View className="flex-row items-center justify-center gap-5">
              <Pressable
                onPress={() => {
                  setConfirmModal(false);
                }}
                className="bg-card border border-border p-4 rounded-xl"
              >
                <Text className="text-muted-foreground text-center font-semibold">
                  Go back
                </Text>
              </Pressable>

              <Pressable
                onPress={handleEdit}
                className="bg-accent p-4 rounded-xl border border-accent"
              >
                <Text className="text-white text-center font-semibold">
                  {loading ? "Editing..." : "Confirm"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default Edit;
