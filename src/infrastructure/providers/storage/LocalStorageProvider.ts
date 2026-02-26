import { injectable } from "tsyringe";
import { randomUUID } from "crypto";
import * as fs from "fs/promises";
import * as path from "path";
import {
  IStorageProvider,
  UploadParams,
} from "../../../application/interfaces/IStorageProvider.js";

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

@injectable()
export class LocalStorageProvider implements IStorageProvider {
  private readonly uploadsDir: string;

  constructor() {
    this.uploadsDir = path.resolve(process.cwd(), "uploads");
  }

  async upload(params: UploadParams): Promise<string> {
    const { file, fileName, mimeType, folder = "products" } = params;

    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      throw new Error(
        `Mime type "${mimeType}" is not allowed. Allowed types: ${ALLOWED_MIME_TYPES.join(", ")}`,
      );
    }

    const extension = path.extname(fileName);
    const uniqueFilename = `${Date.now()}-${randomUUID()}${extension}`;

    const folderPath = path.join(this.uploadsDir, folder);

    await fs.mkdir(folderPath, { recursive: true });

    const filePath = path.join(folderPath, uniqueFilename);

    await fs.writeFile(filePath, file);

    return `/uploads/${folder}/${uniqueFilename}`;
  }

  async delete(fileUrl: string): Promise<void> {
    const relativePath = fileUrl.startsWith("/") ? fileUrl.slice(1) : fileUrl;
    const filePath = path.resolve(process.cwd(), relativePath);

    try {
      await fs.unlink(filePath);
    } catch (error: unknown) {
      if (error instanceof Error && "code" in error && (error as NodeJS.ErrnoException).code === "ENOENT") {
        return;
      }
      throw error;
    }
  }
}
