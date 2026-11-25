/// <reference types="node" />
import type { Readable } from 'stream'

export interface StorageUploadOptions {
  contentType?: string
  upsert?: boolean
  metadata?: Record<string, any>
}

export interface StorageUploadResult {
  path: string
  key: string
  url: string
  sizeBytes: number
}

export interface IStorageDriver {
  upload(key: string, data: Buffer | Uint8Array, options?: StorageUploadOptions): Promise<StorageUploadResult>
  download(key: string): Promise<Buffer>
  delete(key: string | string[]): Promise<boolean>
  getSignedUrl(key: string, expiresInSeconds?: number): Promise<string>
  getPublicUrl(key: string): string
  exists(key: string): Promise<boolean>
}

