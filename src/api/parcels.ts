/**
 * Parcels API Implementation
 *
 * Handles all parcel-related operations including create, read, update, delete
 */

import { HTTPClient } from '../http/client.js'
import {
  Parcel,
  CreateParcelRequest,
  UpdateParcelRequest,
  ParcelFilters,
  CreateParcelResponse,
  DeleteParcelResponse,
  APIResponse,
} from '../types.js'

/**
 * Parcels API class for managing parcel operations
 */
export class ParcelsAPI {
  constructor(private http: HTTPClient) {}

  /**
   * List parcels with optional filters
   *
   * @param filters - Filtering and pagination options
   * @returns Promise resolving to paginated parcel list
   *
   * @example
   * ```typescript
   * const parcels = await yalidine.parcels.list({
   *   page: 1,
   *   page_size: 50,
   *   last_status: ['Livré', 'Expédié'],
   *   to_wilaya_id: 16
   * });
   * ```
   */
  async list(filters: ParcelFilters = {}): Promise<APIResponse<Parcel>> {
    const queryParams = this.buildQueryParams(filters)
    const endpoint = `/parcels${queryParams ? `?${queryParams}` : ''}`

    const response = await this.http.get<APIResponse<Parcel>>(endpoint)
    return response.data
  }

  /**
   * Find a specific parcel by tracking number
   *
   * @param tracking - Parcel tracking number
   * @returns Promise resolving to parcel details
   *
   * @example
   * ```typescript
   * const parcel = await yalidine.parcels.find('yal-123456');
   * console.log(`Status: ${parcel.last_status}`);
   * ```
   */
  async find(tracking: string): Promise<Parcel> {
    const response = await this.http.get<Parcel>(`/parcels/${tracking}`)
    return response.data
  }

  /**
   * Create a single parcel
   *
   * @param parcelData - Parcel creation data
   * @returns Promise resolving to creation response
   *
   * @example
   * ```typescript
   * const result = await yalidine.parcels.create({
   *   order_id: 'ORDER-123',
   *   from_wilaya_name: 'Alger',
   *   firstname: 'Ahmed',
   *   familyname: 'Benali',
   *   // ... other required fields
   * });
   * ```
   */
  async create(parcelData: CreateParcelRequest): Promise<CreateParcelResponse> {
    const response = await this.http.post<CreateParcelResponse>('/parcels', [parcelData])
    return response.data
  }

  /**
   * Create multiple parcels in a single request
   *
   * @param parcelsData - Array of parcel creation data
   * @returns Promise resolving to bulk creation response
   *
   * @example
   * ```typescript
   * const results = await yalidine.parcels.createBulk([
   *   { order_id: 'ORDER-1', ... },
   *   { order_id: 'ORDER-2', ... }
   * ]);
   * ```
   */
  async createBulk(parcelsData: CreateParcelRequest[]): Promise<CreateParcelResponse> {
    const response = await this.http.post<CreateParcelResponse>('/parcels', parcelsData)
    return response.data
  }

  /**
   * Update a parcel (only possible if status is "En préparation")
   *
   * @param tracking - Parcel tracking number
   * @param updateData - Data to update
   * @returns Promise resolving to updated parcel
   *
   * @example
   * ```typescript
   * const updated = await yalidine.parcels.update('yal-123456', {
   *   firstname: 'Mohamed',
   *   contact_phone: '0551234567'
   * });
   * ```
   */
  async update(tracking: string, updateData: UpdateParcelRequest): Promise<Parcel> {
    const response = await this.http.patch<Parcel>(`/parcels/${tracking}`, updateData)
    return response.data
  }

  /**
   * Delete a parcel (only possible if status is "En préparation")
   *
   * @param tracking - Parcel tracking number
   * @returns Promise resolving to deletion result
   *
   * @example
   * ```typescript
   * const result = await yalidine.parcels.delete('yal-123456');
   * console.log(`Deleted: ${result.deleted}`);
   * ```
   */
  async delete(tracking: string): Promise<DeleteParcelResponse> {
    const response = await this.http.delete<DeleteParcelResponse[]>(`/parcels/${tracking}`)
    return response.data[0]! // API returns array with single result
  }

  /**
   * Delete multiple parcels
   *
   * @param trackings - Array of tracking numbers
   * @returns Promise resolving to deletion results
   *
   * @example
   * ```typescript
   * const results = await yalidine.parcels.deleteBulk(['yal-123456', 'yal-789012']);
   * ```
   */
  async deleteBulk(trackings: string[]): Promise<DeleteParcelResponse[]> {
    const trackingParam = trackings.join(',')
    const response = await this.http.delete<DeleteParcelResponse[]>(
      `/parcels?tracking=${trackingParam}`
    )
    return response.data
  }

  /**
   * Get parcel label URL
   *
   * @param tracking - Parcel tracking number
   * @returns Promise resolving to label URL
   *
   * @example
   * ```typescript
   * const labelUrl = await yalidine.parcels.getLabel('yal-123456');
   * window.open(labelUrl, '_blank');
   * ```
   */
  async getLabel(tracking: string): Promise<string> {
    const parcel = await this.find(tracking)
    return parcel.label
  }

  /**
   * Get multiple parcel labels URL
   *
   * @param trackings - Array of tracking numbers
   * @returns Promise resolving to combined labels URL
   *
   * @example
   * ```typescript
   * const labelsUrl = await yalidine.parcels.getLabels(['yal-123456', 'yal-789012']);
   * ```
   */
  async getLabels(trackings: string[]): Promise<string> {
    // For bulk labels, we need to create a request and get the labels URL
    const filters: ParcelFilters = {
      tracking: trackings,
      fields: 'tracking,labels',
    }

    const result = await this.list(filters)

    if (!result.data.length) {
      throw new Error('Unable to generate labels URL')
    }

    if (result.data.length > 0 && result.data[0]!.labels) {
      return result.data[0]!.labels
    }

    throw new Error('Unable to generate labels URL')
  }

  /**
   * Search parcels by multiple criteria
   *
   * @param searchTerm - Search term to match against tracking, order_id, etc.
   * @param filters - Additional filters
   * @returns Promise resolving to search results
   *
   * @example
   * ```typescript
   * const results = await yalidine.parcels.search('ORDER-123', {
   *   last_status: ['Livré']
   * });
   * ```
   */
  async search(searchTerm: string, filters: ParcelFilters = {}): Promise<APIResponse<Parcel>> {
    // Search in tracking and order_id
    const searchFilters: ParcelFilters = {
      ...filters,
      tracking: searchTerm,
    }

    // First try searching by tracking
    let results = await this.list(searchFilters)

    // If no results, try searching by order_id
    if (results.data.length === 0) {
      delete searchFilters.tracking
      searchFilters.order_id = searchTerm
      results = await this.list(searchFilters)
    }

    return results
  }

  /**
   * Get parcel statistics
   *
   * @param filters - Filters to apply for statistics
   * @returns Promise resolving to statistics summary
   */
  async getStats(filters: ParcelFilters = {}): Promise<{
    total: number
    statusCounts: Record<string, number>
    wilayaCounts: Record<string, number>
  }> {
    // Get all parcels with minimal fields for statistics
    const allParcels = await this.list({
      ...filters,
      fields: 'last_status,to_wilaya_name',
      page_size: 1000, // Get more results for better statistics
    })

    const statusCounts: Record<string, number> = {}
    const wilayaCounts: Record<string, number> = {}

    allParcels.data.forEach((parcel) => {
      // Count by status
      statusCounts[parcel.last_status] = (statusCounts[parcel.last_status] || 0) + 1

      // Count by wilaya
      wilayaCounts[parcel.to_wilaya_name] = (wilayaCounts[parcel.to_wilaya_name] || 0) + 1
    })

    return {
      total: allParcels.total_data,
      statusCounts,
      wilayaCounts,
    }
  }

  /**
   * Build query parameters string from filters
   */
  private buildQueryParams(filters: ParcelFilters): string {
    const params = new URLSearchParams()

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          params.append(key, value.join(','))
        } else {
          params.append(key, String(value))
        }
      }
    })

    return params.toString()
  }
}
