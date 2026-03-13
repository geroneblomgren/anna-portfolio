import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`about\` ADD \`contact_email\` text;`)
  await db.run(sql`ALTER TABLE \`about\` ADD \`contact_phone\` text;`)
  await db.run(sql`ALTER TABLE \`site_settings\` ADD \`qr_url\` text;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`about\` DROP COLUMN \`contact_email\`;`)
  await db.run(sql`ALTER TABLE \`about\` DROP COLUMN \`contact_phone\`;`)
  await db.run(sql`ALTER TABLE \`site_settings\` DROP COLUMN \`qr_url\`;`)
}
