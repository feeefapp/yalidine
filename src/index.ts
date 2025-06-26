/**
 * Yalidine SDK
 *
 * A modern, type-safe JavaScript/TypeScript SDK for interacting with
 * Yalidine and Guepex delivery APIs.
 *
 * @packageDocumentation
 */

// Main SDK class
export { Yalidine } from './yalidine'

// Database implementations
export { YalidineMemoryDatabase } from './database/memory'

// API classes
export { ParcelsAPI } from './api/parcels'

// HTTP client
export { HTTPClient } from './http/client'

// Types and interfaces
export * from './types'

// Convenience exports for common use cases
export type {
  YalidineConfig,
  YalidineDatabase,
  Agent,
  Parcel,
  CreateParcelRequest,
  UpdateParcelRequest,
  ParcelFilters,
  APIResponse,
  QuotaStatus,
} from './types'

export {
  YalidineError,
  YalidineAPIError,
  YalidineNetworkError,
  YalidineRateLimitError,
} from './types'

// Default export
export { Yalidine as default } from './yalidine'
