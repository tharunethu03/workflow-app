import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  Pressable,
} from "react-native";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import { api } from "@/lib/api";
import { useUser } from "@/lib/context";
import { renderLetterPlain, renderLetterStyled } from "@/lib/utils";
const SafeAreaView = styled(RNSafeAreaView);

type TemplateField = {
  name: string;
  type: string;
};

type FinalizedVersion = {
  id: string;
  versionNumber: number;
  fields: Record<string, string>;
  editedByName: string;
  createdAt: string;
};

type Document = {
  id: string;
  title: string;
  templateBody: string;
  templateFields: TemplateField[];
  finalizedVersion: FinalizedVersion;
};

const Download = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { role, userName } = useUser();
  const [loading, setLoading] = useState(true);
  const [document, setDocument] = useState<Document | null>(null);

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const data = await api.downloadDocument(id as string, role!, userName);
        setDocument(data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchDocument();
  }, [id]);

  const handleDownload = async () => {
    if (!document) return;

    const renderedLetter = renderLetterPlain(
      document.templateBody,
      document.finalizedVersion.fields,
    );

    const html = `
      <html>
        <body style="font-family: Arial; padding: 40px; line-height: 1.6;">
          <h2>${document.title}</h2>
          <hr/>
          <p style="white-space: pre-wrap;">${renderedLetter}</p>
          <hr/>
          <p style="font-size: 12px; color: gray;">
            Finalized version: ${document.finalizedVersion.versionNumber} · 
            Edited by: ${document.finalizedVersion.editedByName}
          </p>
        </body>
      </html>
    `;

    const { uri } = await Print.printToFileAsync({ html });
    await Sharing.shareAsync(uri);

    await api.recordDownload(id as string, role!, userName);
    router.back();
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color={"#EA7A54"} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 justify-between bg-background p-5">
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
      <View className="flex-row items-center justify-between mb-4 px-1">
        <Text className="sub-label">Finalized version:</Text>
        <Text className="text-accent font-bold">
          Version {document?.finalizedVersion.versionNumber}
        </Text>
      </View>
      <View className="flex-row items-center justify-between mb-5 px-1">
        <Text className="sub-label">Edited by:</Text>
        <Text className="text-foreground font-semibold">
          {document?.finalizedVersion.editedByName}
        </Text>
      </View>
      <View className="bg-card border border-border rounded-xl p-4 mb-5 flex-1">
        <ScrollView>
          <Text className="font-semibold text-foreground mb-2">Preview:</Text>
          <Text>
            {renderLetterStyled(
              document?.templateBody || "",
              document?.finalizedVersion.fields ?? {},
            )}
          </Text>
        </ScrollView>
      </View>
      <Pressable
        onPress={handleDownload}
        className="bg-accent p-4 rounded-xl mb-5 shadow-lg"
      >
        <Text className="text-white text-center font-semibold">
          Download PDF
        </Text>
      </Pressable>
    </SafeAreaView>
  );
};

export default Download;
