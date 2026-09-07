export type ReleaseStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface ReleaseRow {
  id: string;
  version: string;
  versionMajor: number;
  versionMinor: number;
  versionPatch: number;
  title: string;
  description: string;
  changelog: string;
  platform: string;
  fileName: string;
  storagePath: string;
  fileSize: number;
  mimeType: string;
  status: ReleaseStatus;
  isCurrent: boolean;
  downloadCount: number;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
}

export interface AdminRow {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SettingsRow {
  id: string;
  appName: string;
  description: string;
  websiteTitle: string;
  supportedPlatforms: string[];
  socialTwitter: string;
  socialGithub: string;
  socialDiscord: string;
  contactEmail: string;
  updatedAt: Date;
}
