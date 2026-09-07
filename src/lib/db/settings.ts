import { pool } from "./pool";
import type { SettingsRow } from "@/types/db";

const SETTINGS_ID = "settings";

const DEFAULTS = {
  appName: "Tunify",
  description: "A modern music player, built for speed and focus.",
  websiteTitle: "Tunify — Your Music. Your Way.",
  supportedPlatforms: ["Windows"],
  socialTwitter: "",
  socialGithub: "",
  socialDiscord: "",
  contactEmail: "",
};

export async function getSettings(): Promise<SettingsRow> {
  const { rows } = await pool.query<SettingsRow>(`SELECT * FROM "Settings" WHERE id = $1`, [SETTINGS_ID]);
  if (rows[0]) return rows[0];

  const { rows: created } = await pool.query<SettingsRow>(
    `INSERT INTO "Settings"
      (id, "appName", description, "websiteTitle", "supportedPlatforms", "socialTwitter", "socialGithub", "socialDiscord", "contactEmail", "updatedAt")
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9, now())
     RETURNING *`,
    [
      SETTINGS_ID,
      DEFAULTS.appName,
      DEFAULTS.description,
      DEFAULTS.websiteTitle,
      DEFAULTS.supportedPlatforms,
      DEFAULTS.socialTwitter,
      DEFAULTS.socialGithub,
      DEFAULTS.socialDiscord,
      DEFAULTS.contactEmail,
    ]
  );
  return created[0];
}

export async function updateSettings(data: {
  appName: string;
  description: string;
  websiteTitle: string;
  supportedPlatforms: string[];
  socialTwitter: string;
  socialGithub: string;
  socialDiscord: string;
  contactEmail: string;
}): Promise<SettingsRow> {
  const { rows } = await pool.query<SettingsRow>(
    `INSERT INTO "Settings" (id, "appName", description, "websiteTitle", "supportedPlatforms", "socialTwitter", "socialGithub", "socialDiscord", "contactEmail", "updatedAt")
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9, now())
     ON CONFLICT (id) DO UPDATE SET
       "appName" = EXCLUDED."appName",
       description = EXCLUDED.description,
       "websiteTitle" = EXCLUDED."websiteTitle",
       "supportedPlatforms" = EXCLUDED."supportedPlatforms",
       "socialTwitter" = EXCLUDED."socialTwitter",
       "socialGithub" = EXCLUDED."socialGithub",
       "socialDiscord" = EXCLUDED."socialDiscord",
       "contactEmail" = EXCLUDED."contactEmail",
       "updatedAt" = now()
     RETURNING *`,
    [
      SETTINGS_ID,
      data.appName,
      data.description,
      data.websiteTitle,
      data.supportedPlatforms,
      data.socialTwitter,
      data.socialGithub,
      data.socialDiscord,
      data.contactEmail,
    ]
  );
  return rows[0];
}

/** Fields safe to expose on the public site. */
export function toPublicSettings(settings: SettingsRow) {
  return {
    appName: settings.appName,
    description: settings.description,
    websiteTitle: settings.websiteTitle,
    supportedPlatforms: settings.supportedPlatforms,
    socialTwitter: settings.socialTwitter,
    socialGithub: settings.socialGithub,
    socialDiscord: settings.socialDiscord,
    contactEmail: settings.contactEmail,
  };
}
