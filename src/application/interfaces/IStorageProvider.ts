export interface UploadParams {
  file: Buffer;
  fileName: string;
  mimeType: string;
  folder?: string;
}

export interface IStorageProvider {
  upload(params: UploadParams): Promise<string>;
  delete(fileUrl: string): Promise<void>;
}
