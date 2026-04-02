import { View, Text, Pressable } from "react-native";
import dayjs from "dayjs";
import clsx from "clsx";

type TimelineEntry = {
  id: string;
  action: string;
  userName: string;
  userRole: string;
  versionNumber: number | null;
  createdAt: string;
};

type DocumentCardProps = {
  role: string | null;
  title: string;
  status: string;
  createdAt: string;
  createdByName: string;
  onPress: () => void;
  cardButtonPress?: () => void;
  expanded: boolean;
  timeline: TimelineEntry[];
  finalizedVersion: any;
};

const DocumentCard = ({
  title,
  status,
  createdAt,
  createdByName,
  onPress,
  cardButtonPress,
  expanded,
  role,
  timeline,
  finalizedVersion,
}: DocumentCardProps) => {
  const formatDateTime = (value?: string): string => {
    if (!value) return "Not provided";
    const parsedDate = dayjs(value);
    return parsedDate.isValid()
      ? parsedDate.format("MM/DD/YYYY")
      : "Not provided";
  };

  const buttonText =
    role === "editor"
      ? "Edit"
      : role === "reviewer"
        ? "Review"
        : role === "downloader"
          ? "Download"
          : "View";
  return (
    <Pressable
      onPress={onPress}
      className={clsx("sub-card", expanded ? "sub-card-expanded" : "bg-card")}
    >
      <View className="sub-main">
        <View className="sub-head">
          <Text className="sub-title">{title}</Text>
          <Text className="sub-meta">{status}</Text>
        </View>
      </View>

      <View className="sub-row">
        <View className="sub-row-copy">
          <Text className="sub-label">Created at:</Text>
          <Text className="sub-value">
            {dayjs(createdAt).format("hh:mm A")}
          </Text>
          <Text className="sub-value">
            {createdAt ? formatDateTime(createdAt) : ""}
          </Text>
        </View>
        <View className="sub-row-copy">
          <Text className="sub-label">Created by:</Text>
          <Text className="sub-value">{createdByName}</Text>
        </View>
      </View>
      {expanded && (
        <View className="sub-body">
          <View className="sub-details">
            <View className="sub-row">
              <Text className="sub-label mb-3">Timeline: </Text>
              <View className="mb-10">
                {timeline.map((entry, i) => (
                  <View
                    key={entry.id}
                    className="flex-row items-start justify-between w-full"
                  >
                    <View className="flex-row items-start gap-5">
                      <View className="items-center">
                        <View className="w-2 h-2 rounded-full bg-accent" />
                        {i < timeline.length - 1 && (
                          <View className="w-[2px] h-10 bg-accent" />
                        )}
                      </View>
                      <View className="flex-col items-start">
                        <Text className="text-accent font-bold">
                          {entry.action}
                        </Text>
                        <View className="flex-row items-center gap-1">
                          <Text className="text-sm text-muted-foreground">
                            by:
                          </Text>
                          <Text className="font-semibold text-muted-foreground">
                            {entry.userName}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View className="flex-col items-end">
                      <Text className="text-muted-foreground text-sm">
                        {dayjs(entry.createdAt).format("hh:mm A")}
                      </Text>
                      <Text className="text-muted-foreground text-sm">
                        {dayjs(entry.createdAt).format("MM/DD/YYYY")}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
              {finalizedVersion && (
                <View className="flex-row items-start justify-between w-full">
                  <Text className="sub-label mb-3">Finalized Version:</Text>
                  <View className="flex-col items-end">
                    <Text className="text-accent font-bold">
                      Version {finalizedVersion.versionNumber}
                    </Text>
                    <View className="flex-row gap-1">
                      <Text className="text-sm text-muted-foreground">
                        edited by
                      </Text>
                      <Text className="text-muted-foreground font-semibold">
                        {finalizedVersion.editedByName}
                      </Text>
                    </View>
                  </View>
                </View>
              )}
              {role !== "creator" ? (
                <Pressable
                  onPress={cardButtonPress}
                  className="bg-accent py-3 px-8 rounded-xl my-5 shadow-lg w-fit self-end"
                >
                  <Text className="text-white text-center font-semibold">
                    {buttonText}
                  </Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        </View>
      )}
    </Pressable>
  );
};

export default DocumentCard;
