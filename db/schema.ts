import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
export const roadmaps=sqliteTable("roadmaps",{
  id:text("id").primaryKey(),
  ownerId:text("owner_id").notNull(),
  payload:text("payload").notNull(),
  title:text("title").notNull(),
  updatedAt:integer("updated_at").notNull(),
});
export const aiConnections=sqliteTable("ai_connections",{
  ownerId:text("owner_id").primaryKey(),
  encryptedKey:text("encrypted_key").notNull(),
  updatedAt:integer("updated_at").notNull(),
});
