import {
  View,
  Text,
  ActivityIndicator,
  Pressable,
  ScrollView,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import { useUser } from "@/lib/context";
import { api } from "@/lib/api";
import { renderLetterStyled } from "@/lib/utils";
import dayjs from "dayjs";
import { ChevronLeft } from "lucide-react-native";

const SafeAreaView = styled(RNSafeAreaView);

type TemplateField = {
  name: string;
  type: string;
};

type Version = {
  id: string;
  versionNumber: number;
  fields: Record<string, string>;
  editedByName: string;
  editedByRole: string;
  createdAt: string;
};

type Document = {
  id: string;
  title: string;
  status: string;
  templateBody: string;
  templateFields: TemplateField[];
  finalizedVersionId: string | null;
  createdAt: string;
  versions: Version[];
};

const Review = () => {
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
  const [document, setDocument] = useState<Document | null>(null);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [confirmModal, setConfirmModal] = useState(false);
  const { userName, role } = useUser();
  const router = useRouter();

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const data = await api.getDocument(id as string);
        setDocument(data);

        const initialValues: Record<string, string> = {};
        data.templateFields.forEach((field: TemplateField) => {
          initialValues[field.name] = "";
        });

        if (data.versions && data.versions.length > 0) {
          setSelectedVersion(data.versions[0]);
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

  const handleFinalize = async () => {
    try {
      await api.finalizeDocument(
        id as string,
        {
          finalizedByName: userName,
          versionId: selectedVersion!.id,
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
    <SafeAreaView className="flex-1 h-full bg-background p-5">
      <View className="bg-accent py-3 rounded-xl mb-5">
        <View className="flex-row items-center justify-between px-3">
          <View className="flex flex-row items-center">
            <View className="flex-row">
              <Pressable className="px-2" onPress={() => router.back()}>
                <ChevronLeft color={"white"} />
              </Pressable>
              <Text className="text-xl font-bold text-white">
                {document?.title}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View className="px-3">
        {document?.status === "DRAFTED" ? (
          <View className="mb-5">
            <Text className="text-center bg-destructive/50 p-3 rounded-lg text-white">
              This document haven&apos;t been edited yet!
            </Text>
          </View>
        ) : document?.status === "FINALIZED" ? (
          <View className="mb-5">
            <Text className="text-center bg-destructive/50 p-3 rounded-lg text-white">
              This document has been finalized!
            </Text>
          </View>
        ) : (
          <>
            <View className="flex flex-row flex-wrap justify-center gap-3 mb-3">
              {document?.versions.map((version, index) => (
                <Pressable
                  onPress={() => {
                    setSelectedVersion(version);
                    setFieldValues(version.fields as Record<string, string>);
                  }}
                  key={index}
                  className={`border ${selectedVersion?.id === version.id ? "bg-accent border-accent" : "bg-card border-border"} p-3 rounded-lg`}
                >
                  <Text
                    className={`${selectedVersion?.id === version.id ? "text-white" : "text-muted-foreground"} text-center font-semibold`}
                  >
                    Version {version.versionNumber}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View className="flex-col my-3">
              <View className="flex-row items-center justify-between">
                <Text className="sub-label">Edited by:</Text>
                <View className="flex-row items-end gap-5">
                  <Text
                    className={`text-sm font-semibold ${selectedVersion?.editedByRole === "editor" ? "text-success" : "text-destructive"}`}
                  >
                    {selectedVersion?.editedByRole === "editor"
                      ? "EDITOR"
                      : selectedVersion?.editedByRole === "admin" && "ADMIN"}
                  </Text>
                  <Text className="text-foreground">
                    {selectedVersion?.editedByName}
                  </Text>
                </View>
              </View>
              <View className="flex-row items-start justify-between">
                <Text className="sub-label">Edited at:</Text>
                <View className="flex-col items-end">
                  <Text className="text-muted-foreground text-sm">
                    {dayjs(selectedVersion?.createdAt).format("hh:mm A")}
                  </Text>
                  <Text className="text-muted-foreground text-sm">
                    {dayjs(selectedVersion?.createdAt).format("MM/DD/YYYY")}
                  </Text>
                </View>
              </View>
            </View>
          </>
        )}

        {role === "admin" && document?.status === "FINALIZED" && (
          <>
            <View className="flex flex-row flex-wrap justify-center gap-3 mb-3">
              {document?.versions.map((version, index) => (
                <Pressable
                  onPress={() => {
                    setSelectedVersion(version);
                    setFieldValues(version.fields as Record<string, string>);
                  }}
                  key={index}
                  className={`border ${selectedVersion?.id === version.id ? "bg-accent border-accent" : "bg-card border-border"} p-3 rounded-lg`}
                >
                  <Text
                    className={`${selectedVersion?.id === version.id ? "text-white" : "text-muted-foreground"} text-center font-semibold`}
                  >
                    Version {version.versionNumber}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View className="flex-col my-3">
              <View className="flex-row items-center justify-between">
                <Text className="sub-label">Edited by:</Text>
                <View className="flex-row items-end gap-5">
                  <Text
                    className={`text-sm font-semibold ${selectedVersion?.editedByRole === "editor" ? "text-success" : "text-destructive"}`}
                  >
                    {selectedVersion?.editedByRole === "editor"
                      ? "EDITOR"
                      : selectedVersion?.editedByRole === "admin" && "ADMIN"}
                  </Text>
                  <Text className="text-foreground">
                    {selectedVersion?.editedByName}
                  </Text>
                </View>
              </View>
              <View className="flex-row items-start justify-between">
                <Text className="sub-label">Edited at:</Text>
                <View className="flex-col items-end">
                  <Text className="text-muted-foreground text-sm">
                    {dayjs(selectedVersion?.createdAt).format("hh:mm A")}
                  </Text>
                  <Text className="text-muted-foreground text-sm">
                    {dayjs(selectedVersion?.createdAt).format("MM/DD/YYYY")}
                  </Text>
                </View>
              </View>
            </View>
          </>
        )}

        <View
          className="bg-card border border-border rounded-xl p-4 mb-5"
          style={{ maxHeight: 300 }}
        >
          <ScrollView>
            <Text className="font-semibold text-foreground mb-2">Preview:</Text>
            <Text>
              {renderLetterStyled(document?.templateBody || "", fieldValues)}
            </Text>
          </ScrollView>
        </View>
      </View>

      {role === "admin" && document?.status === "FINALIZED" && (
        <Pressable
          onPress={() => setConfirmModal(true)}
          className="bg-accent p-4 rounded-xl my-4 shadow-lg mb-10"
        >
          <Text className="text-white text-center font-semibold">
            Finalize Version
          </Text>
        </Pressable>
      )}

      {document?.status !== "FINALIZED" && document?.status !== "DRAFTED" && (
        <Pressable
          onPress={() => setConfirmModal(true)}
          className="bg-accent p-4 rounded-xl my-4 shadow-lg mb-10"
        >
          <Text className="text-white text-center font-semibold">
            Finalize Version
          </Text>
        </Pressable>
      )}
      {confirmModal && (
        <View
          className="absolute inset-0 justify-center items-center"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <View className="bg-card w-[80%] border-1 border-accent p-6 rounded-2xl">
            <Text className="mb-5 text-center">
              Finalizing will lock this version and prevent any further
              modifications.
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
                onPress={handleFinalize}
                className="bg-accent p-4 rounded-xl border border-accent"
              >
                <Text className="text-white text-center font-semibold">
                  {loading ? "Finalizing..." : "Confirm"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default Review;
