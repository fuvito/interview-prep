import { db } from '@/database/db'
import type { UploadedSubjectPack } from '@/types'

export const uploadedContentRepository = {
  async getAll(): Promise<UploadedSubjectPack[]> {
    return db.uploadedContent.toArray()
  },

  async save(pack: UploadedSubjectPack): Promise<void> {
    await db.uploadedContent.put(pack)
  },

  async delete(id: string): Promise<void> {
    await db.uploadedContent.delete(id)
  },
}
