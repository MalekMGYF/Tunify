/**
 * Storage abstraction so the rest of the app never talks to the
 * filesystem or S3 directly. Swap providers with the STORAGE_PROVIDER
 * environment variable — nothing else in the codebase needs to change.
 */
export interface StorageProvider {
  /** Uploads a file's bytes under the given internal storage key and returns that key. */
  upload(key: string, data: Buffer | ReadableStream, contentType: string): Promise<string>;
  /** Returns a readable stream of the file's contents. Throws if the file doesn't exist. */
  download(key: string): Promise<ReadableStream>;
  /** Deletes the file. Safe to call even if the file no longer exists. */
  delete(key: string): Promise<void>;
  /** Checks whether a file exists at the given key. */
  exists(key: string): Promise<boolean>;
  /** Returns the byte size of a stored file. */
  size(key: string): Promise<number>;
}
