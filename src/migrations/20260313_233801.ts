import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`art_pieces_tags\` (
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`value\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`art_pieces\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`art_pieces_tags_order_idx\` ON \`art_pieces_tags\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`art_pieces_tags_parent_idx\` ON \`art_pieces_tags\` (\`parent_id\`);`)
  await db.run(sql`CREATE TABLE \`art_pieces\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_order\` text,
  	\`title\` text NOT NULL,
  	\`image_id\` integer NOT NULL,
  	\`medium\` text,
  	\`description\` text,
  	\`featured\` integer DEFAULT false,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`art_pieces__order_idx\` ON \`art_pieces\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`art_pieces_image_idx\` ON \`art_pieces\` (\`image_id\`);`)
  await db.run(sql`CREATE INDEX \`art_pieces_updated_at_idx\` ON \`art_pieces\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`art_pieces_created_at_idx\` ON \`art_pieces\` (\`created_at\`);`)
  await db.run(sql`ALTER TABLE \`media\` ADD \`blur_data_u_r_l\` text;`)
  await db.run(sql`ALTER TABLE \`media\` ADD \`sizes_gallery_url\` text;`)
  await db.run(sql`ALTER TABLE \`media\` ADD \`sizes_gallery_width\` numeric;`)
  await db.run(sql`ALTER TABLE \`media\` ADD \`sizes_gallery_height\` numeric;`)
  await db.run(sql`ALTER TABLE \`media\` ADD \`sizes_gallery_mime_type\` text;`)
  await db.run(sql`ALTER TABLE \`media\` ADD \`sizes_gallery_filesize\` numeric;`)
  await db.run(sql`ALTER TABLE \`media\` ADD \`sizes_gallery_filename\` text;`)
  await db.run(sql`ALTER TABLE \`media\` ADD \`sizes_lightbox_url\` text;`)
  await db.run(sql`ALTER TABLE \`media\` ADD \`sizes_lightbox_width\` numeric;`)
  await db.run(sql`ALTER TABLE \`media\` ADD \`sizes_lightbox_height\` numeric;`)
  await db.run(sql`ALTER TABLE \`media\` ADD \`sizes_lightbox_mime_type\` text;`)
  await db.run(sql`ALTER TABLE \`media\` ADD \`sizes_lightbox_filesize\` numeric;`)
  await db.run(sql`ALTER TABLE \`media\` ADD \`sizes_lightbox_filename\` text;`)
  await db.run(sql`ALTER TABLE \`media\` ADD \`sizes_thumb_url\` text;`)
  await db.run(sql`ALTER TABLE \`media\` ADD \`sizes_thumb_width\` numeric;`)
  await db.run(sql`ALTER TABLE \`media\` ADD \`sizes_thumb_height\` numeric;`)
  await db.run(sql`ALTER TABLE \`media\` ADD \`sizes_thumb_mime_type\` text;`)
  await db.run(sql`ALTER TABLE \`media\` ADD \`sizes_thumb_filesize\` numeric;`)
  await db.run(sql`ALTER TABLE \`media\` ADD \`sizes_thumb_filename\` text;`)
  await db.run(sql`CREATE INDEX \`media_sizes_gallery_sizes_gallery_filename_idx\` ON \`media\` (\`sizes_gallery_filename\`);`)
  await db.run(sql`CREATE INDEX \`media_sizes_lightbox_sizes_lightbox_filename_idx\` ON \`media\` (\`sizes_lightbox_filename\`);`)
  await db.run(sql`CREATE INDEX \`media_sizes_thumb_sizes_thumb_filename_idx\` ON \`media\` (\`sizes_thumb_filename\`);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`art_pieces_id\` integer REFERENCES art_pieces(id);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_art_pieces_id_idx\` ON \`payload_locked_documents_rels\` (\`art_pieces_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`art_pieces_tags\`;`)
  await db.run(sql`DROP TABLE \`art_pieces\`;`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_payload_locked_documents_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	\`media_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_payload_locked_documents_rels\`("id", "order", "parent_id", "path", "users_id", "media_id") SELECT "id", "order", "parent_id", "path", "users_id", "media_id" FROM \`payload_locked_documents_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new_payload_locked_documents_rels\` RENAME TO \`payload_locked_documents_rels\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`)
  await db.run(sql`DROP INDEX \`media_sizes_gallery_sizes_gallery_filename_idx\`;`)
  await db.run(sql`DROP INDEX \`media_sizes_lightbox_sizes_lightbox_filename_idx\`;`)
  await db.run(sql`DROP INDEX \`media_sizes_thumb_sizes_thumb_filename_idx\`;`)
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`blur_data_u_r_l\`;`)
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`sizes_gallery_url\`;`)
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`sizes_gallery_width\`;`)
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`sizes_gallery_height\`;`)
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`sizes_gallery_mime_type\`;`)
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`sizes_gallery_filesize\`;`)
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`sizes_gallery_filename\`;`)
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`sizes_lightbox_url\`;`)
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`sizes_lightbox_width\`;`)
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`sizes_lightbox_height\`;`)
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`sizes_lightbox_mime_type\`;`)
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`sizes_lightbox_filesize\`;`)
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`sizes_lightbox_filename\`;`)
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`sizes_thumb_url\`;`)
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`sizes_thumb_width\`;`)
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`sizes_thumb_height\`;`)
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`sizes_thumb_mime_type\`;`)
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`sizes_thumb_filesize\`;`)
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`sizes_thumb_filename\`;`)
}
