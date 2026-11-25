import { describe, it, expect } from 'vitest'
import { encrypt, decrypt } from '../../lib/encryption'

describe('AES-256-GCM Encryption Architecture', () => {
  it('encrypts and decrypts sensitive API keys accurately', () => {
    const rawApiKey = 'sk-ant-api03-test-secret-key-1234567890'
    const encrypted = encrypt(rawApiKey)

    expect(encrypted).not.toBe(rawApiKey)
    expect(encrypted.split(':')).toHaveLength(3) // iv:authTag:ciphertext

    const decrypted = decrypt(encrypted)
    expect(decrypted).toBe(rawApiKey)
  })

  it('generates distinct IVs and ciphertexts for identical plaintexts', () => {
    const rawApiKey = 'AIzaSyTestGeminiKey'
    const enc1 = encrypt(rawApiKey)
    const enc2 = encrypt(rawApiKey)

    expect(enc1).not.toBe(enc2) // Random IV ensures ciphertext uniqueness
    expect(decrypt(enc1)).toBe(rawApiKey)
    expect(decrypt(enc2)).toBe(rawApiKey)
  })

  it('fails decryption when ciphertext or auth tag is tampered with', () => {
    const rawApiKey = 'co-test-cohere-key'
    const encrypted = encrypt(rawApiKey)
    const parts = encrypted.split(':')

    // Tamper with ciphertext
    const tamperedCipher = parts[0] + ':' + parts[1] + ':ff' + parts[2].slice(2)
    expect(() => decrypt(tamperedCipher)).toThrow()

    // Tamper with auth tag
    const tamperedTag = parts[0] + ':deadbeef000000000000000000000000:' + parts[2]
    expect(() => decrypt(tamperedTag)).toThrow()
  })

  it('handles empty input gracefully', () => {
    expect(encrypt('')).toBe('')
    expect(decrypt('')).toBe('')
  })
})

