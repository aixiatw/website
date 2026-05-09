import { defineConfig } from "tinacms";

export default defineConfig({
  branch: "main",
  clientId: "請到 https://app.tina.io/ 申請",
  token: "請到 https://app.tina.io/ 申請",
  build: {
    outputFolder: "admin",
    publicFolder: "public",
  },
  media: {
    tina: {
      mediaRoot: "images",
      publicFolder: "public",
    },
  },
  schema: {
    collections: [
      {
        name: "post",
        label: "衛教文章",
        path: "content/blog",
        format: "md",
        fields: [
          {
            type: "string",
            name: "title",
            label: "標題",
            required: true,
          },
          {
            type: "string",
            name: "excerpt",
            label: "摘要",
          },
          {
            type: "datetime",
            name: "date",
            label: "日期",
          },
          {
            type: "string",
            name: "category",
            label: "分類",
          },
          {
            type: "rich-text",
            name: "body",
            label: "內容",
            isBody: true,
          },
        ],
      },
    ],
  },
});
