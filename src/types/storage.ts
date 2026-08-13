export interface StorageMetadata {
  key: string;
  size: number;
  mimeType: string;
  checksum?: string;
}

export interface UploadProgress {
  bytesUploaded: number;
  totalBytes: number;
  percentage: number;
}
