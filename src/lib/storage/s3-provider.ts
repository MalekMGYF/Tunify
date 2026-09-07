import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { Readable } from "node:stream";
import type { StorageProvider } from "./types";

/**
 * S3-compatible storage provider for production. Works with AWS S3
 * as well as S3-compatible services (Cloudflare R2, Backblaze B2,
 * MinIO, etc) by pointing STORAGE_ENDPOINT at the provider's endpoint.
 */
export class S3StorageProvider implements StorageProvider {
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor() {
    const region = process.env.STORAGE_REGION || "auto";
    const bucket = process.env.STORAGE_BUCKET;
    const accessKeyId = process.env.STORAGE_ACCESS_KEY;
    const secretAccessKey = process.env.STORAGE_SECRET_KEY;
    const endpoint = process.env.STORAGE_ENDPOINT || undefined;

    if (!bucket || !accessKeyId || !secretAccessKey) {
      throw new Error(
        "S3 storage is selected (STORAGE_PROVIDER=s3) but STORAGE_BUCKET, STORAGE_ACCESS_KEY, or STORAGE_SECRET_KEY is missing."
      );
    }

    this.bucket = bucket;
    this.client = new S3Client({
      region,
      endpoint,
      // Required by most non-AWS S3-compatible services (R2, MinIO, B2).
      forcePathStyle: Boolean(endpoint),
      credentials: { accessKeyId, secretAccessKey },
    });
  }

  async upload(key: string, data: Buffer | ReadableStream, contentType: string): Promise<string> {
    const body = Buffer.isBuffer(data)
      ? data
      : Readable.fromWeb(data as import("stream/web").ReadableStream);

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      })
    );
    return key;
  }

  async download(key: string): Promise<ReadableStream> {
    const result = await this.client.send(new GetObjectCommand({ Bucket: this.bucket, Key: key }));
    if (!result.Body) throw new Error("File not found in storage");
    // The AWS SDK v3 Body is a web ReadableStream in edge/runtime environments
    // and a Node Readable in Node — normalize to a web stream either way.
    const body = result.Body as unknown as { transformToWebStream?: () => ReadableStream };
    if (typeof body.transformToWebStream === "function") {
      return body.transformToWebStream();
    }
    return Readable.toWeb(result.Body as unknown as Readable) as ReadableStream;
  }

  async delete(key: string): Promise<void> {
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  }

  async exists(key: string): Promise<boolean> {
    try {
      await this.client.send(new HeadObjectCommand({ Bucket: this.bucket, Key: key }));
      return true;
    } catch {
      return false;
    }
  }

  async size(key: string): Promise<number> {
    const result = await this.client.send(new HeadObjectCommand({ Bucket: this.bucket, Key: key }));
    return result.ContentLength ?? 0;
  }
}
