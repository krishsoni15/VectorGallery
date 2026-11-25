import fs from 'fs'
import path from 'path'
import { IStorageDriver, StorageUploadOptions, StorageUploadResult } from './types'

export class LocalStorageDriver implements IStorageDriver {
  private baseDir: string

  constructor(baseDir?: string) {
    this.baseDir = baseDir || path.join(process.cwd(), 'public', 'uploads')
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true })
    }
  }

  private resolvePath(key: string): string {
    const safeKey = key.replace(/\.\./g, '').replace(/^\/+/, '')
    return path.join(this.baseDir, safeKey)
  }

  async upload(key: string, data: Buffer | Uint8Array, options?: StorageUploadOptions): Promise<StorageUploadResult> {
    const fullPath = this.resolvePath(key)
    const dir = path.dirname(fullPath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    fs.writeFileSync(fullPath, Buffer.from(data))
    const sizeBytes = Buffer.byteLength(data)
    const safeKey = key.replace(/\.\./g, '').replace(/^\/+/, '')
    const url = `/uploads/${safeKey}`

    return {
      path: fullPath,
      key: safeKey,
      url,
      sizeBytes,
    }
  }

  async download(key: string): Promise<Buffer> {
    const fullPath = this.resolvePath(key)
    if (!fs.existsSync(fullPath)) {
      throw new Error(`File not found in local storage: ${key}`)
    }
    return fs.readFileSync(fullPath)
  }

  async delete(key: string | string[]): Promise<boolean> {
    const keys = Array.isArray(key) ? key : [key]
    let allDeleted = true
    for (const k of keys) {
      const fullPath = this.resolvePath(k)
      if (fs.existsSync(fullPath)) {
        try {
          fs.unlinkSync(fullPath)
        } catch {
          allDeleted = false
        }
      }
    }
    return allDeleted
  }

  async getSignedUrl(key: string, expiresInSeconds: number = 3600): Promise<string> {
    const safeKey = key.replace(/\.\./g, '').replace(/^\/+/, '')
    return `/uploads/${safeKey}`
  }

  getPublicUrl(key: string): string {
    const safeKey = key.replace(/\.\./g, '').replace(/^\/+/, '')
    return `/uploads/${safeKey}`
  }

  async exists(key: string): Promise<boolean> {
    const fullPath = this.resolvePath(key)
    return fs.existsSync(fullPath)
  }
}

