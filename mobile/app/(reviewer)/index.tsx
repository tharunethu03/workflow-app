import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
} from "react-native";
import React, { useCallback, useState } from "react";
import { MessageCircleCode } from "lucide-react-native";
import { useUser } from "@/lib/context";
import { api } from "@/lib/api";
import { useFocusEffect, useRouter } from "expo-router";
import DocumentCard from "@/components/DocumentCard";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
const SafeAreaView = styled(RNSafeAreaView);

type Document = {
  id: string;
  title: string;
  status: string;
  createdByName: string;
  createdAt: string;
};

const ReviewerHome = () => {
  const { userName, role } = useUser();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedDocumentId, setExpandedDocumentId] = useState<string | null>(
    null,
  );
  const [expandedDocument, setExpandedDocument] = useState<any>(null);
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      fetchDocuments();
    }, []),
  );

  const handleCardPress = async (id: string) => {
    if (expandedDocumentId === id) {
      setExpandedDocumentId(null);
      setExpandedDocument(null);
      return;
    }
    setExpandedDocumentId(id);
    const data = await api.getDocument(id);
    setExpandedDocument(data);
  };

  const fetchDocuments = async () => {
    try {
      const data = await api.getDocuments();
      setDocuments(data.documents);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
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
    <SafeAreaView className="flex-1 justify-between bg-background p-5">
      <View className="bg-accent py-3 rounded-xl mb-5">
        <View className="flex-row items-center justify-between px-3">
          <View className="flex flex-row items-center">
            <MessageCircleCode color={"white"} />
            <View className="ml-3">
              <Text className="text-xl font-bold text-white">Reviewer</Text>
              <Text className="text-sm font-semibold text-muted">
                {userName}
              </Text>
            </View>
          </View>

          <Pressable>
            <Text className="bg-card text-accent p-3 w-fit rounded-xl font-bold">
              Log out
            </Text>
          </Pressable>
        </View>
      </View>
      <FlatList
        data={documents}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text className="text-center text-muted-foreground mt-10">
            No documents yet. Create your first one!
          </Text>
        }
        renderItem={({ item }) => (
          <DocumentCard
            {...item}
            role={role}
            expanded={expandedDocumentId === item.id}
            onPress={() => handleCardPress(item.id)}
            cardButtonPress={() =>
              router.push(`/(reviewer)/review?id=${item.id}`)
            }
            timeline={expandedDocument?.timeline ?? []}
            finalizedVersion={expandedDocument?.versions?.find(
              (v: any) => v.id === expandedDocument?.finalizedVersionId,
            )}
          />
        )}
        extraData={expandedDocumentId}
        ItemSeparatorComponent={() => <View className="h-4" />}
        contentContainerClassName="pb-30"
      />
    </SafeAreaView>
  );
};

export default ReviewerHome;
