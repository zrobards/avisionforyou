import crypto from 'crypto'
import type { Prisma } from '@prisma/client'
import { logger } from '@/lib/logger'

type EncryptedPayload = {
  encrypted: true
  v: 1
  iv: string
  tag: string
  data: string
}

type PlainPayload = Record<string, unknown>

type JsonCompatible = Prisma.InputJsonValue

const keyB64 = process.env.ENCRYPTION_KEY
const key = keyB64 ? Buffer.from(keyB64, 'base64') : null

const isKeyValid = key ? key.length === 32 : false

export function encryptJSON(payload: PlainPayload): JsonCompatible {
  if (!isKeyValid) {
    logger.warn('ENCRYPTION_KEY missing or invalid length; storing plaintext')
    return payload as JsonCompatible
  }

  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', key as Buffer, iv)
  const json = JSON.stringify(payload)
  const encrypted = Buffer.concat([cipher.update(json, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()

  return {
    encrypted: true,
    v: 1,
    iv: iv.toString('base64'),
    tag: tag.toString('base64'),
    data: encrypted.toString('base64'),
  } as JsonCompatible
}

export function decryptJSON(value: unknown): PlainPayload {
  if (!value || typeof value !== 'object' || !('encrypted' in value)) return value as PlainPayload
  if (!isKeyValid) {
    logger.warn('ENCRYPTION_KEY missing or invalid; returning ciphertext object as-is')
    return value as PlainPayload
  }

  try {
    const { iv, tag, data } = value as EncryptedPayload
    const decipher = crypto.createDecipheriv('aes-256-gcm', key as Buffer, Buffer.from(iv, 'base64'))
    decipher.setAuthTag(Buffer.from(tag, 'base64'))
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(data, 'base64')),
      decipher.final(),
    ])
    return JSON.parse(decrypted.toString('utf8'))
  } catch (e) {
    logger.error({ err: e }, 'decryptJSON failed; returning original payload')
    return value as PlainPayload
  }
}
