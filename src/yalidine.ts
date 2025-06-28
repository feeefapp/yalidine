/**
 * Main Yalidine SDK Class
 *
 * The primary entry point for the Yalidine SDK. Provides access to all API endpoints
 * and manages authentication, caching, and configuration.
 */

import { ParcelsAPI } from './api/parcels.js'
import { HistoriesAPI } from './api/histories.js'
import { YalidineMemoryDatabase } from './database/memory.js'
import { HTTPClient } from './http/client.js'
import { YalidineConfig, YalidineDatabase, YalidineError, QuotaStatus, Agent } from './types.js'

/**
 * Main Yalidine SDK class
 *
 * @example
 * ```typescript
 * const yalidine = new Yalidine({
 *   agent: 'goupex',
 *   auth: {
 *     id: 'your-api-id',
 *     token: 'your-api-token'
 *   },
 *   database: new YalidineMemoryDatabase()
 * });
 *
 * await yalidine.init();
 *
 * const parcels = await yalidine.parcels.list();
 * ```
 */
export class Yalidine {
  private config: Required<YalidineConfig>
  private http: HTTPClient
  private database: YalidineDatabase
  private initialized = false

  // API endpoints
  readonly parcels: ParcelsAPI
  readonly histories: HistoriesAPI

  constructor(config: YalidineConfig) {
    // Validate configuration
    this.validateConfig(config)

    // Set default values
    this.config = {
      ...config,
      database: config.database || new YalidineMemoryDatabase(),
      baseURL: config.baseURL || this.getDefaultBaseURL(config.agent),
      timeout: config.timeout || 30000,
      retries: config.retries || 3,
      debug: config.debug || false,
    }

    this.database = this.config.database

    // Initialize HTTP client
    this.http = new HTTPClient({
      baseURL: this.config.baseURL,
      apiId: this.config.auth.id,
      apiToken: this.config.auth.token,
      timeout: this.config.timeout,
      retries: this.config.retries,
      debug: this.config.debug,
    })

    // Initialize API endpoints
    this.parcels = new ParcelsAPI(this.http)
    this.histories = new HistoriesAPI(this.http)
  }

  /**
   * Initialize the SDK and load cached data
   *
   * This method should be called before using the SDK. It loads cached data
   * like wilayas, communes, and centers to improve performance.
   *
   * @example
   * ```typescript
   * await yalidine.init();
   * console.log('SDK initialized and ready to use');
   * ```
   */
  async init(): Promise<void> {
    if (this.initialized) {
      return
    }

    try {
      // Load and cache static data
      await this.loadCachedData()

      this.initialized = true

      if (this.config.debug) {
        console.log('[Yalidine SDK] Initialized successfully')
      }
    } catch (error) {
      if (this.config.debug) {
        console.error('[Yalidine SDK] Initialization failed:', error)
      }
      throw new YalidineError('Failed to initialize SDK', 'INIT_ERROR')
    }
  }

  /**
   * Get the current configuration
   */
  getConfig(): Readonly<Required<YalidineConfig>> {
    return { ...this.config }
  }

  /**
   * Get the current agent
   */
  getAgent(): Agent {
    return this.config.agent
  }

  /**
   * Get current API quota status
   */
  getQuotaStatus(): QuotaStatus {
    return this.http.getQuotaStatus()
  }

  /**
   * Check if the SDK can make requests based on current quota
   */
  canMakeRequest(): boolean {
    return this.http.canMakeRequest()
  }

  /**
   * Get database instance
   */
  getDatabase(): YalidineDatabase {
    return this.database
  }

  /**
   * Test the API connection and credentials
   *
   * @returns Promise resolving to true if connection is successful
   *
   * @example
   * ```typescript
   * const isConnected = await yalidine.testConnection();
   * if (isConnected) {
   *   console.log('API connection successful');
   * }
   * ```
   */
  async testConnection(): Promise<boolean> {
    try {
      // Test connection by fetching wilayas (lightweight request)
      await this.http.get('/wilayas?page_size=1')
      return true
    } catch (error) {
      if (this.config.debug) {
        console.error('[Yalidine SDK] Connection test failed:', error)
      }
      return false
    }
  }

  /**
   * Clear all cached data
   *
   * @example
   * ```typescript
   * await yalidine.clearCache();
   * console.log('Cache cleared');
   * ```
   */
  async clearCache(): Promise<void> {
    await this.database.clear()

    if (this.config.debug) {
      console.log('[Yalidine SDK] Cache cleared')
    }
  }

  /**
   * Get SDK version
   */
  getVersion(): string {
    return '1.0.0'
  }

  /**
   * Get SDK information
   */
  getInfo(): {
    version: string
    agent: Agent
    baseURL: string
    initialized: boolean
    quotaStatus: QuotaStatus
  } {
    return {
      version: this.getVersion(),
      agent: this.config.agent,
      baseURL: this.config.baseURL,
      initialized: this.initialized,
      quotaStatus: this.getQuotaStatus(),
    }
  }

  /**
   * Destroy the SDK and clean up resources
   *
   * @example
   * ```typescript
   * await yalidine.destroy();
   * ```
   */
  async destroy(): Promise<void> {
    // Clean up database if it has a destroy method
    if (this.database && typeof (this.database as any).destroy === 'function') {
      ;(this.database as any).destroy()
    }

    this.initialized = false

    if (this.config.debug) {
      console.log('[Yalidine SDK] Destroyed')
    }
  }

  /**
   * Validate the configuration
   */
  private validateConfig(config: YalidineConfig): void {
    if (!config.agent) {
      throw new YalidineError('Agent is required', 'INVALID_CONFIG')
    }

    if (!['yalidine', 'goupex'].includes(config.agent)) {
      throw new YalidineError('Agent must be either "yalidine" or "goupex"', 'INVALID_CONFIG')
    }

    if (!config.auth?.id) {
      throw new YalidineError('API ID is required', 'INVALID_CONFIG')
    }

    if (!config.auth?.token) {
      throw new YalidineError('API token is required', 'INVALID_CONFIG')
    }

    if (config.timeout && config.timeout <= 0) {
      throw new YalidineError('Timeout must be positive', 'INVALID_CONFIG')
    }

    if (config.retries && config.retries < 0) {
      throw new YalidineError('Retries must be non-negative', 'INVALID_CONFIG')
    }
  }

  /**
   * Get default base URL for the agent
   */
  private getDefaultBaseURL(agent: Agent): string {
    const baseURLs: Record<Agent, string> = {
      yalidine: 'https://api.yalidine.app/v1',
      goupex: 'https://api.guepex.app/v1',
    }

    return baseURLs[agent]
  }

  /**
   * Load and cache static data
   */
  private async loadCachedData(): Promise<void> {
    try {
      // Check if data is already cached
      const wilayasCacheKey = `${this.config.agent}:wilayas`
      const cachedWilayas = await this.database.get(wilayasCacheKey)

      if (!cachedWilayas) {
        if (this.config.debug) {
          console.log('[Yalidine SDK] Loading wilayas data...')
        }

        // Load wilayas and cache for 24 hours
        const wilayasResponse = await this.http.get('/wilayas')
        await this.database.set(wilayasCacheKey, wilayasResponse.data, 24 * 60 * 60)

        if (this.config.debug) {
          console.log(`[Yalidine SDK] Cached ${wilayasResponse.data.data?.length || 0} wilayas`)
        }
      }

      // Load other static data similarly...
      // We can add communes and centers caching here
    } catch (error) {
      // Don't fail initialization if caching fails
      if (this.config.debug) {
        console.warn('[Yalidine SDK] Failed to load cached data:', error)
      }
    }
  }
}
