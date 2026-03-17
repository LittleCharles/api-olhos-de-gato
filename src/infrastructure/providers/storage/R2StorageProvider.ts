import { injectable } from "tsyringe";
import { randomUUID } from "crypto";
import * as path from "path";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import {
  IStorageProvider,
  UploadParams,
} from "../../../application/interfaces/IStorageProvider.js";

@injectable()
export class R2StorageProvider implements IStorageProvider {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly publicUrl: string;

  constructor() {
    const accountId = process.env.STORAGE_ACCOUNT_ID ?? "";
    this.bucket = process.env.STORAGE_BUCKET ?? "";
    this.publicUrl = (process.env.STORAGE_PUBLIC_URL ?? "").replace(/\/$/, "");

    this.client = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.STORAGE_ACCESS_KEY ?? "",
        secretAccessKey: process.env.STORAGE_SECRET_KEY ?? "",
      },
    });
  }

  async upload(params: UploadParams): Promise<string> {
    const { file, fileName, mimeType, folder = "products" } = params;

    const extension = path.extname(fileName);
    const uniqueFilename = `${Date.now()}-${randomUUID()}${extension}`;
    const key = `${folder}/${uniqueFilename}`;

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file,
        ContentType: mimeType,
      }),
    );

    return `${this.publicUrl}/${key}`;
  }

  async delete(fileUrl: string): Promise<void> {
    const publicUrlBase = this.publicUrl + "/";
    if (!fileUrl.startsWith(publicUrlBase)) return;

    const key = fileUrl.slice(publicUrlBase.length);

    try {
      await this.client.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );
    } catch {
      // arquivo não encontrado — ignorar
    }
  }
}
