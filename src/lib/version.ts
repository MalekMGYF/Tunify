/**
 * Parses a version string like "1.10.2" into comparable integer parts.
 * Used instead of sorting version strings alphabetically, which would
 * incorrectly order "1.9.0" after "1.10.0".
 */
export function parseVersion(version: string): { major: number; minor: number; patch: number } {
  const match = version.trim().match(/^(\d+)(?:\.(\d+))?(?:\.(\d+))?/);
  if (!match) {
    return { major: 0, minor: 0, patch: 0 };
  }
  return {
    major: Number(match[1] ?? 0),
    minor: Number(match[2] ?? 0),
    patch: Number(match[3] ?? 0),
  };
}

export function compareVersions(a: { major: number; minor: number; patch: number }, b: typeof a): number {
  if (a.major !== b.major) return a.major - b.major;
  if (a.minor !== b.minor) return a.minor - b.minor;
  return a.patch - b.patch;
}
