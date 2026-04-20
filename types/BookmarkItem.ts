import type { Subtitle } from "@/types/subtitle";
export type BookmarkItem = Subtitle & {
  note?: string;
  starred?: boolean;
  category?: string;
};
