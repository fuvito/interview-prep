import { db } from '@/database/db'
import type { OfficialSubjectPack } from '@/types'

export const officialPackRepository = {
  async getAll(): Promise<OfficialSubjectPack[]> {
    return db.officialPacks.toArray()
  },

  async getById(id: string): Promise<OfficialSubjectPack | undefined> {
    return db.officialPacks.get(id)
  },

  async save(pack: OfficialSubjectPack): Promise<void> {
    await db.officialPacks.put(pack)
  },

  async delete(id: string): Promise<void> {
    await db.officialPacks.delete(id)
  },
}
