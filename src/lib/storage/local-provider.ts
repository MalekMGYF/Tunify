import { promises as fs, createReadStream } from "node:fs";
import { Readable } from "node:stream";
import path from "node:path";
import type { StorageProvider } from "./types";

/**
 * Stores files on the local filesystem, outside the application's
 * source directory (see STORAGE_LOCAL_PATH). Intended for local
 * development — use the S3 provider in production.
 */
export class LocalStorageProvider implements StorageProvider {
  private readonly rootDir: string;

  constructor() {
    const configuredPath = process.env.STORAGE_LOCAL_PATH || "../tunify-storage";
    // Resolved relative to the project root (process.cwd()), and deliberately
    // defaults to a sibling directory so uploaded files never live inside
    // the source tree (src/, public/, etc).
    this.rootDir = path.resolve(process.cwd(), configuredPath);
  }

  private resolveKey(key: string): string {
    // Keys are always generated internally (see lib/storage/keys.ts) and
    // never taken verbatim from user input, but we still defend against
    // path traversal here rather than trusting callers.
    const safeKey = key.replace(/\\/g, "/");
    if (safeKey.includes("..") || path.isAbsolute(safeKey)) {
      throw new Error("Invalid storage key");
    }
    return path.join(this.rootDir, safeKey);
  }

  async upload(key: string, data: Buffer | ReadableStream, _contentType: string): Promise<string> {
    const fullPath = this.resolveKey(key);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });

    if (Buffer.isBuffer(data)) {
      await fs.writeFile(fullPath, data);
    } else {
      const nodeStream = Readable.fromWeb(data as import("stream/web").ReadableStream);
      const chunks: Buffer[] = [];
      for await (const chunk of nodeStream) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      }
      await fs.writeFile(fullPath, Buffer.concat(chunks));
    }

    return key;
  }

  async download(key: string): Promise<ReadableStream> {
    const fullPath = this.resolveKey(key);
    await fs.access(fullPath); // throws if missing
    const nodeStream = createReadStream(fullPath);
    return Readable.toWeb(nodeStream) as ReadableStream;
  }

  async delete(key: string): Promise<void> {
    const fullPath = this.resolveKey(key);
    try {
      await fs.unlink(fullPath);
    } catch (err) {
      const code = (err as NodeJS.ErrnoException).code;
      if (code !== "ENOENT") throw err;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      await fs.access(this.resolveKey(key));
      return true;
    } catch {
      return false;
    }
  }

  async size(key: string): Promise<number> {
    const stat = await fs.stat(this.resolveKey(key));
    return stat.size;
  }
}
