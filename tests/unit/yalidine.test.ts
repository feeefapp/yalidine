/**
 * Unit tests for the main Yalidine SDK class
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Yalidine, YalidineMemoryDatabase, YalidineError } from '../../src'

describe('Yalidine SDK', () => {
  describe('Configuration Validation', () => {
    it('should throw error when agent is missing', () => {
      expect(() => {
        new Yalidine({
          // @ts-expect-error Testing invalid config
          agent: undefined,
          auth: { id: 'test', token: 'test' },
        })
      }).toThrow(YalidineError)
    })

    it('should throw error when agent is invalid', () => {
      expect(() => {
        new Yalidine({
          // @ts-expect-error Testing invalid config
          agent: 'invalid',
          auth: { id: 'test', token: 'test' },
        })
      }).toThrow('Agent must be either "yalidine" or "goupex"')
    })

    it('should throw error when API ID is missing', () => {
      expect(() => {
        new Yalidine({
          agent: 'goupex',
          // @ts-expect-error Testing invalid config
          auth: { token: 'test' },
        })
      }).toThrow('API ID is required')
    })

    it('should throw error when API token is missing', () => {
      expect(() => {
        new Yalidine({
          agent: 'goupex',
          // @ts-expect-error Testing invalid config
          auth: { id: 'test' },
        })
      }).toThrow('API token is required')
    })
  })

  describe('Initialization', () => {
    let yalidine: Yalidine

    beforeEach(() => {
      yalidine = new Yalidine({
        agent: 'goupex',
        auth: {
          id: 'test-id',
          token: 'test-token',
        },
        database: new YalidineMemoryDatabase(),
      })
    })

    it('should create SDK instance with valid config', () => {
      expect(yalidine).toBeInstanceOf(Yalidine)
      expect(yalidine.getAgent()).toBe('goupex')
    })

    it('should set default values for optional config', () => {
      const config = yalidine.getConfig()

      expect(config.baseURL).toBe('https://api.guepex.app/v1')
      expect(config.timeout).toBe(30000)
      expect(config.retries).toBe(3)
      expect(config.debug).toBe(false)
    })

    it('should use custom config values when provided', () => {
      const customYalidine = new Yalidine({
        agent: 'yalidine',
        auth: { id: 'test', token: 'test' },
        baseURL: 'https://custom.api.com',
        timeout: 5000,
        retries: 1,
        debug: true,
      })

      const config = customYalidine.getConfig()

      expect(config.baseURL).toBe('https://custom.api.com')
      expect(config.timeout).toBe(5000)
      expect(config.retries).toBe(1)
      expect(config.debug).toBe(true)
    })

    it('should expose API endpoints', () => {
      expect(yalidine.parcels).toBeDefined()
      expect(typeof yalidine.parcels.list).toBe('function')
      expect(typeof yalidine.parcels.find).toBe('function')
      expect(typeof yalidine.parcels.create).toBe('function')
      expect(typeof yalidine.parcels.update).toBe('function')
      expect(typeof yalidine.parcels.delete).toBe('function')
    })

    it('should provide utility methods', () => {
      expect(typeof yalidine.getVersion).toBe('function')
      expect(typeof yalidine.getQuotaStatus).toBe('function')
      expect(typeof yalidine.canMakeRequest).toBe('function')
      expect(typeof yalidine.testConnection).toBe('function')
      expect(typeof yalidine.clearCache).toBe('function')
    })

    it('should return correct version', () => {
      expect(yalidine.getVersion()).toBe('1.0.0')
    })

    it('should return SDK info', () => {
      const info = yalidine.getInfo()

      expect(info).toHaveProperty('version', '1.0.0')
      expect(info).toHaveProperty('agent', 'goupex')
      expect(info).toHaveProperty('baseURL', 'https://api.guepex.app/v1')
      expect(info).toHaveProperty('initialized', false)
      expect(info).toHaveProperty('quotaStatus')
    })

    it('should provide database access', () => {
      const database = yalidine.getDatabase()
      expect(database).toBeInstanceOf(YalidineMemoryDatabase)
      expect(typeof database.get).toBe('function')
      expect(typeof database.set).toBe('function')
    })
  })

  describe('Agent-specific Configuration', () => {
    it('should set correct base URL for Guepex agent', () => {
      const yalidine = new Yalidine({
        agent: 'goupex',
        auth: { id: 'test', token: 'test' },
      })

      expect(yalidine.getConfig().baseURL).toBe('https://api.guepex.app/v1')
    })

    it('should set correct base URL for Yalidine agent', () => {
      const yalidine = new Yalidine({
        agent: 'yalidine',
        auth: { id: 'test', token: 'test' },
      })

      expect(yalidine.getConfig().baseURL).toBe('https://api.yalidine.app/v1')
    })
  })

  describe('Cache Management', () => {
    let yalidine: Yalidine
    let mockDatabase: YalidineMemoryDatabase

    beforeEach(() => {
      mockDatabase = new YalidineMemoryDatabase()
      yalidine = new Yalidine({
        agent: 'goupex',
        auth: { id: 'test', token: 'test' },
        database: mockDatabase,
      })
    })

    it('should clear cache', async () => {
      // Set some test data
      await mockDatabase.set('test-key', 'test-value')
      expect(await mockDatabase.get('test-key')).toBe('test-value')

      // Clear cache through SDK
      await yalidine.clearCache()

      // Verify cache is cleared
      expect(await mockDatabase.get('test-key')).toBeNull()
    })
  })

  describe('Cleanup', () => {
    it('should destroy SDK instance properly', async () => {
      const mockDatabase = new YalidineMemoryDatabase()
      const destroySpy = vi.spyOn(mockDatabase, 'destroy')

      const yalidine = new Yalidine({
        agent: 'goupex',
        auth: { id: 'test', token: 'test' },
        database: mockDatabase,
      })

      await yalidine.destroy()

      expect(destroySpy).toHaveBeenCalled()
    })
  })
})

describe('Types', () => {
  it('should export types without runtime errors', () => {
    // This test ensures our type exports don't cause runtime issues
    expect(true).toBe(true)
  })
})
