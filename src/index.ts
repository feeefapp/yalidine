/**
 * Yalidine SDK
 *
 * A modern, type-safe JavaScript/TypeScript SDK for interacting with
 * Yalidine and Guepex delivery APIs.
 *
 * @packageDocumentation
 */

// Main SDK class
export { Yalidine } from './yalidine.js'

// Database implementations
export { YalidineMemoryDatabase } from './database/memory.js'

// API classes
export { ParcelsAPI } from './api/parcels.js'

// HTTP client
export { HTTPClient } from './http/client.js'

// Types and interfaces
export * from './types.js'

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
  CreateParcelResponse,
  DeleteParcelResponse,
} from './types.js'

export {
  YalidineError,
  YalidineAPIError,
  YalidineNetworkError,
  YalidineRateLimitError,
} from './types.js'

// Default export
export { Yalidine as default } from './yalidine.js'
