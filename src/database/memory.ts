import { YalidineDatabase } from '../types'

interface CacheEntry<T> {
  value: T
  expiry?: number
}

export class YalidineMemoryDatabase implements YalidineDatabase {
  private cache = new Map<string, CacheEntry<any>>()
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor() {
    this.cleanupInterval = setInterval(
      () => {
        this.cleanup()
      },
      5 * 60 * 1000
    )
  }

  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key)

    if (!entry) {
      return null
    }

    if (entry.expiry && Date.now() > entry.expiry) {
      this.cache.delete(key)
      return null
    }

    return entry.value
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const entry: CacheEntry<T> = { value }

    if (ttl && ttl > 0) {
      entry.expiry = Date.now() + ttl * 1000
    }

    this.cache.set(key, entry)
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key)
  }

  async clear(): Promise<void> {
    this.cache.clear()
  }

  async has(key: string): Promise<boolean> {
    const entry = this.cache.get(key)

    if (!entry) {
      return false
    }

    if (entry.expiry && Date.now() > entry.expiry) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  private cleanup(): void {
    const now = Date.now()

    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiry && now > entry.expiry) {
        this.cache.delete(key)
      }
    }
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
    this.cache.clear()
  }
}
