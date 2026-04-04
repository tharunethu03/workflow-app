import React from "react";
import { Text } from "react-native";

export const renderLetterStyled = (
  templateBody: string,
  fields: Record<string, string>,
) => {
  const parts = templateBody.split(/(\{\{\w+\}\})/g);

  return parts.map((part, index) => {
    const match = part.match(/\{\{(\w+)\}\}/);

    if (match) {
      const key = match[1];
      const value = fields[key];

      return React.createElement(
        Text,
        {
          key: index,
          className: value
            ? "text-foreground"
            : "text-accent font-semibold underline",
        },
        value || part,
      );
    }

    return React.createElement(
      Text,
      { key: index, className: "text-foreground" },
      part,
    );
  });
};

export const renderLetterPlain = (
  templateBody: string,
  fields: Record<string, string>,
) => {
  let rendered = templateBody;
  Object.entries(fields).forEach(([key, value]) => {
    rendered = rendered.replaceAll(`{{${key}}}`, value || `{{${key}}}`);
  });
  return rendered;
};
