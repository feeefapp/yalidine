/**
 * Core type definitions for the Yalidine SDK
 *
 * This file contains all the TypeScript interfaces and types used throughout the SDK.
 * The types are based on the official Yalidine and Guepex API documentation.
 */

// ========================================
// Base Types
// ========================================

/**
 * Supported delivery agents
 */
export type Agent = 'yalidine' | 'goupex'

/**
 * Standard API response wrapper
 */
export interface APIResponse<T> {
  has_more: boolean
  total_data: number
  data: T[]
  links: PaginationLinks
}

/**
 * Pagination links in API responses
 */
export interface PaginationLinks {
  self: string
  before?: string
  next?: string
  after?: string
}

/**
 * Base configuration for the SDK
 */
export interface YalidineConfig {
  /** Delivery agent to use */
  agent: Agent
  /** Authentication credentials */
  auth: {
    id: string
    token: string
  }
  /** Database instance for caching */
  database?: YalidineDatabase
  /** Custom base URL (optional, auto-detected based on agent) */
  baseURL?: string
  /** Request timeout in milliseconds */
  timeout?: number
  /** Number of retry attempts */
  retries?: number
  /** Enable debug logging */
  debug?: boolean
}

// ========================================
// Database Interface
// ========================================

/**
 * Abstract database interface for caching
 */
export interface YalidineDatabase {
  get<T>(key: string): Promise<T | null>
  set<T>(key: string, value: T, ttl?: number): Promise<void>
  delete(key: string): Promise<void>
  clear(): Promise<void>
  has(key: string): Promise<boolean>
}

// ========================================
// Parcel Types
// ========================================

/**
 * Parcel status enumeration
 */
export type ParcelStatus =
  | 'Pas encore expédié'
  | 'A vérifier'
  | 'En préparation'
  | 'Pas encore ramassé'
  | 'Prêt à expédier'
  | 'Ramassé'
  | 'Bloqué'
  | 'Débloqué'
  | 'Transfert'
  | 'Expédié'
  | 'Centre'
  | 'En localisation'
  | 'Vers Wilaya'
  | 'Reçu à Wilaya'
  | 'En attente du client'
  | 'Prêt pour livreur'
  | 'Sorti en livraison'
  | 'En attente'
  | 'En alerte'
  | 'Tentative échouée'
  | 'Livré'
  | 'Echèc livraison'
  | 'Retour vers centre'
  | 'Retourné au centre'
  | 'Retour transfert'
  | 'Retour groupé'
  | 'Retour à retirer'
  | 'Retour vers vendeur'
  | 'Retourné au vendeur'
  | 'Echange échoué'

/**
 * Payment status enumeration
 */
export type PaymentStatus = 'not-ready' | 'ready' | 'receivable' | 'payed'

/**
 * Parcel type enumeration
 */
export type ParcelType = 'classic' | 'ecommerce' | 'multiseller'

/**
 * Parcel sub-type enumeration
 */
export type ParcelSubType = 'accuse' | 'exchange' | 'rcc' | 'rccback' | 'sm'

/**
 * Main parcel interface
 */
export interface Parcel {
  tracking: string
  order_id: string
  firstname: string
  familyname: string
  contact_phone: string
  address: string
  is_stopdesk: boolean
  stopdesk_id: number | null
  stopdesk_name: string | null
  from_wilaya_id: number
  from_wilaya_name: string
  to_commune_id: number
  to_commune_name: string
  to_wilaya_id: number
  to_wilaya_name: string
  product_list: string
  price: number
  do_insurance: boolean
  declared_value: number
  delivery_fee: number
  freeshipping: boolean
  import_id: number
  date_creation: string
  date_expedition: string | null
  date_last_status: string
  last_status: ParcelStatus
  taxe_percentage: number
  taxe_from: number
  taxe_retour: number
  parcel_type: ParcelType
  parcel_sub_type: ParcelSubType | null
  has_receipt: boolean | null
  length: number | null
  width: number | null
  height: number | null
  weight: number | null
  has_recouvrement: boolean
  current_center_id: number
  current_center_name: string
  current_wilaya_id: number
  current_wilaya_name: string
  current_commune_id: number
  current_commune_name: string
  payment_status: PaymentStatus
  payment_id: string | null
  has_exchange: boolean
  economic: boolean
  product_to_collect: string | null
  label: string
  labels?: string
  pin: string
  qr_text: string
}

/**
 * Request body for creating a parcel
 */
export interface CreateParcelRequest {
  order_id: string
  from_wilaya_name: string
  firstname: string
  familyname: string
  contact_phone: string
  address: string
  to_commune_name: string
  to_wilaya_name: string
  product_list: string
  price: number
  do_insurance: boolean
  declared_value: number
  length: number
  width: number
  height: number
  weight: number
  freeshipping: boolean
  is_stopdesk: boolean
  stopdesk_id?: number
  has_exchange: boolean
  economic?: boolean
  product_to_collect?: string
}

/**
 * Request body for updating a parcel
 */
export interface UpdateParcelRequest {
  order_id?: string
  firstname?: string
  familyname?: string
  contact_phone?: string
  address?: string
  from_wilaya_name?: string
  to_commune_name?: string
  to_wilaya_name?: string
  product_list?: string
  price?: number
  do_insurance?: boolean
  declared_value?: number
  length?: number
  width?: number
  height?: number
  weight?: number
  freeshipping?: boolean
  is_stopdesk?: boolean
  stopdesk_id?: number
  has_exchange?: boolean
  product_to_collect?: string
}

/**
 * Filters for listing parcels
 */
export interface ParcelFilters {
  tracking?: string | string[]
  order_id?: string | string[]
  import_id?: number | number[]
  to_wilaya_id?: number | number[]
  to_commune_name?: string | string[]
  is_stopdesk?: boolean
  is_exchange?: boolean
  has_exchange?: boolean
  economic?: boolean
  freeshipping?: boolean
  date_creation?: string // YYYY-MM-DD or YYYY-MM-DD,YYYY-MM-DD
  date_last_status?: string // YYYY-MM-DD or YYYY-MM-DD,YYYY-MM-DD
  payment_status?: PaymentStatus | PaymentStatus[]
  last_status?: ParcelStatus | ParcelStatus[]
  fields?: string // comma-separated field names
  page?: number
  page_size?: number
  order_by?:
    | 'date_creation'
    | 'date_last_status'
    | 'tracking'
    | 'order_id'
    | 'import_id'
    | 'to_wilaya_id'
    | 'to_commune_id'
    | 'last_status'
  desc?: boolean
  asc?: boolean
}

/**
 * Response from creating parcels
 */
export interface CreateParcelResponse {
  [order_id: string]: {
    success: boolean
    order_id: string
    tracking: string | null
    import_id: number | null
    label: string | null
    labels: string | null
    message: string
  }
}

/**
 * Response from deleting parcels
 */
export interface DeleteParcelResponse {
  tracking: string
  deleted: boolean
}

// ========================================
// History Types
// ========================================

/**
 * Delivery failure reasons
 */
export type DeliveryFailureReason =
  | 'Téléphone injoignable'
  | 'Client ne répond pas'
  | 'Faux numéro'
  | 'Client absent (reporté)'
  | 'Client absent (échoué)'
  | 'Annulé par le client'
  | 'Commande double'
  | "Le client n'a pas commandé"
  | 'Produit erroné'
  | 'Produit manquant'
  | 'Produit cassé ou défectueux'
  | 'Client incapable de payer'
  | 'Wilaya erronée'
  | 'Commune erronée'
  | 'Client no-show'

/**
 * Parcel hold reasons
 */
export type ParcelHoldReason =
  | 'Document manquant'
  | 'Produit interdit'
  | 'Produit dangereux'
  | 'Fausse déclaration'

/**
 * History entry interface
 */
export interface History {
  date_status: string
  tracking: string
  status: ParcelStatus
  reason: DeliveryFailureReason | ParcelHoldReason | string
  center_id: number
  center_name: string
  wilaya_id: number
  wilaya_name: string
  commune_id: number
  commune_name: string
}

/**
 * Filters for listing histories
 */
export interface HistoryFilters {
  tracking?: string | string[]
  status?: ParcelStatus | ParcelStatus[]
  date_status?: string // YYYY-MM-DD or YYYY-MM-DD,YYYY-MM-DD
  reason?: string | string[]
  fields?: string // comma-separated field names
  page?: number
  page_size?: number
  order_by?: 'date_status' | 'tracking' | 'status' | 'reason'
  desc?: boolean
  asc?: boolean
}

// ========================================
// Geographic Types
// ========================================

/**
 * Wilaya (province) interface
 */
export interface Wilaya {
  id: number
  name: string
  zone: number
  is_deliverable: boolean
}

/**
 * Commune interface
 */
export interface Commune {
  id: number
  name: string
  wilaya_id: number
  wilaya_name: string
  has_stop_desk: boolean
  is_deliverable: boolean
  delivery_time_parcel: number
  delivery_time_payment: number
}

/**
 * Delivery center interface
 */
export interface Center {
  center_id: number
  name: string
  address: string
  gps: string // "latitude,longitude"
  commune_id: number
  commune_name: string
  wilaya_id: number
  wilaya_name: string
}

/**
 * Delivery fees interface
 */
export interface DeliveryFees {
  from_wilaya_name: string
  to_wilaya_name: string
  zone: number
  retour_fee: number
  cod_percentage: number
  insurance_percentage: number
  oversize_fee: number
  per_commune: {
    [commune_id: string]: {
      commune_id: number
      commune_name: string
      express_home: number | null
      express_desk: number | null
      economic_home: number | null
      economic_desk: number | null
    }
  }
}

/**
 * Filters for geographic data
 */
export interface GeographicFilters {
  id?: number | number[]
  name?: string | string[]
  wilaya_id?: number | number[]
  has_stop_desk?: boolean
  is_deliverable?: boolean
  fields?: string
  page?: number
  page_size?: number
  order_by?: string
  desc?: boolean
  asc?: boolean
}

// ========================================
// Quota Management Types
// ========================================

/**
 * API quota status
 */
export interface QuotaStatus {
  secondQuotaLeft: number
  minuteQuotaLeft: number
  hourQuotaLeft: number
  dayQuotaLeft: number
  lastUpdate: Date
}

// ========================================
// Error Types
// ========================================

/**
 * Base error class for all SDK errors
 */
export class YalidineError extends Error {
  constructor(
    message: string,
    public code?: string
  ) {
    super(message)
    this.name = 'YalidineError'
  }
}

/**
 * API-specific error class
 */
export class YalidineAPIError extends YalidineError {
  constructor(
    message: string,
    public status: number,
    public details?: any
  ) {
    super(message)
    this.name = 'YalidineAPIError'
  }
}

/**
 * Validation error class
 */
export class YalidineValidationError extends YalidineError {
  constructor(
    message: string,
    public errors: Array<{ field: string; message: string }>
  ) {
    super(message)
    this.name = 'YalidineValidationError'
  }
}

/**
 * Rate limit error class
 */
export class YalidineRateLimitError extends YalidineError {
  constructor(
    message: string,
    public retryAfter: number
  ) {
    super(message)
    this.name = 'YalidineRateLimitError'
  }
}

/**
 * Network error class
 */
export class YalidineNetworkError extends YalidineError {
  constructor(
    message: string,
    public originalError?: Error
  ) {
    super(message)
    this.name = 'YalidineNetworkError'
  }
}

// ========================================
// Request/Response Types
// ========================================

/**
 * HTTP request options
 */
export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  headers?: Record<string, string>
  body?: string
  timeout?: number
  retries?: number
}

/**
 * HTTP response interface
 */
export interface Response<T = any> {
  data: T
  status: number
  headers: Record<string, string>
  quota: QuotaStatus
}

// ========================================
// Utility Types
// ========================================

/**
 * Make all properties optional except the specified ones
 */
export type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>

/**
 * Extract array element type
 */
export type ArrayElement<T> = T extends (infer U)[] ? U : never

/**
 * Deep partial type
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}
