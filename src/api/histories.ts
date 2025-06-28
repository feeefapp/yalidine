/**
 * Histories API Implementation
 *
 * Handles all history-related operations including retrieving parcel status history
 */

import { HTTPClient } from '../http/client.js'
import { History, HistoryFilters, APIResponse, ParcelStatus } from '../types.js'

/**
 * Histories API class for managing parcel history operations
 */
export class HistoriesAPI {
  constructor(private http: HTTPClient) {}

  /**
   * List histories with optional filters
   *
   * @param filters - Filtering and pagination options
   * @returns Promise resolving to paginated history list
   *
   * @example
   * ```typescript
   * const histories = await yalidine.histories.list({
   *   page: 1,
   *   page_size: 50,
   *   status: ['Livré', 'Expédié'],
   *   tracking: 'yal-123456'
   * });
   * ```
   */
  async list(filters: HistoryFilters = {}): Promise<APIResponse<History>> {
    const queryParams = this.buildQueryParams(filters)
    const endpoint = `/histories${queryParams ? `?${queryParams}` : ''}`

    const response = await this.http.get<APIResponse<History>>(endpoint)
    return response.data
  }

  /**
   * Find history for a specific parcel by tracking number
   *
   * @param tracking - Parcel tracking number
   * @returns Promise resolving to history details for the parcel
   *
   * @example
   * ```typescript
   * const history = await yalidine.histories.find('yal-123456');
   * console.log(`History entries: ${history.length}`);
   * ```
   */
  async find(tracking: string): Promise<History[]> {
    const response = await this.http.get<APIResponse<History>>(`/histories/${tracking}`)

    // Handle both single tracking response and paginated response
    if (response.data.has_more !== undefined) {
      return response.data.data
    }

    // If it's a direct array response
    if (Array.isArray(response.data)) {
      return response.data
    }

    return []
  }

  /**
   * Find histories for multiple parcels by tracking numbers
   *
   * @param trackings - Array of parcel tracking numbers
   * @returns Promise resolving to history details for all parcels
   *
   * @example
   * ```typescript
   * const histories = await yalidine.histories.findMultiple(['yal-123456', 'yal-789012']);
   * ```
   */
  async findMultiple(trackings: string[]): Promise<APIResponse<History>> {
    const trackingParam = trackings.join(',')
    const filters: HistoryFilters = { tracking: trackingParam }
    return this.list(filters)
  }

  /**
   * Get histories filtered by status
   *
   * @param status - Parcel status to filter by
   * @param filters - Additional filtering options
   * @returns Promise resolving to filtered history list
   *
   * @example
   * ```typescript
   * const deliveredHistories = await yalidine.histories.byStatus('Livré');
   * ```
   */
  async byStatus(
    status: ParcelStatus | ParcelStatus[],
    filters: HistoryFilters = {}
  ): Promise<APIResponse<History>> {
    const statusFilters: HistoryFilters = { ...filters, status }
    return this.list(statusFilters)
  }

  /**
   * Get histories filtered by date range
   *
   * @param startDate - Start date in YYYY-MM-DD format
   * @param endDate - End date in YYYY-MM-DD format
   * @param filters - Additional filtering options
   * @returns Promise resolving to filtered history list
   *
   * @example
   * ```typescript
   * const histories = await yalidine.histories.byDateRange('2023-01-01', '2023-01-31');
   * ```
   */
  async byDateRange(
    startDate: string,
    endDate: string,
    filters: HistoryFilters = {}
  ): Promise<APIResponse<History>> {
    const dateFilters: HistoryFilters = { ...filters, date_status: `${startDate},${endDate}` }
    return this.list(dateFilters)
  }

  /**
   * Get histories for a specific date
   *
   * @param date - Date in YYYY-MM-DD format
   * @param filters - Additional filtering options
   * @returns Promise resolving to filtered history list
   *
   * @example
   * ```typescript
   * const histories = await yalidine.histories.byDate('2023-01-15');
   * ```
   */
  async byDate(date: string, filters: HistoryFilters = {}): Promise<APIResponse<History>> {
    const dateFilters: HistoryFilters = { ...filters, date_status: date }
    return this.list(dateFilters)
  }

  /**
   * Get histories filtered by delivery failure reason
   *
   * @param reason - Delivery failure reason to filter by
   * @param filters - Additional filtering options
   * @returns Promise resolving to filtered history list
   *
   * @example
   * ```typescript
   * const failedHistories = await yalidine.histories.byReason('Client absent (échoué)');
   * ```
   */
  async byReason(
    reason: string | string[],
    filters: HistoryFilters = {}
  ): Promise<APIResponse<History>> {
    const reasonFilters: HistoryFilters = { ...filters, reason }
    return this.list(reasonFilters)
  }

  /**
   * Get latest status for a parcel
   *
   * @param tracking - Parcel tracking number
   * @returns Promise resolving to the most recent history entry
   *
   * @example
   * ```typescript
   * const latestStatus = await yalidine.histories.getLatestStatus('yal-123456');
   * console.log(`Latest status: ${latestStatus?.status}`);
   * ```
   */
  async getLatestStatus(tracking: string): Promise<History | null> {
    const histories = await this.find(tracking)
    if (histories.length === 0) {
      return null
    }

    // Sort by date_status descending and return the first (most recent)
    return (
      histories.sort(
        (a, b) => new Date(b.date_status).getTime() - new Date(a.date_status).getTime()
      )[0] || null
    )
  }

  /**
   * Get status timeline for a parcel
   *
   * @param tracking - Parcel tracking number
   * @returns Promise resolving to sorted history timeline
   *
   * @example
   * ```typescript
   * const timeline = await yalidine.histories.getTimeline('yal-123456');
   * timeline.forEach(entry => {
   *   console.log(`${entry.date_status}: ${entry.status}`);
   * });
   * ```
   */
  async getTimeline(tracking: string): Promise<History[]> {
    const histories = await this.find(tracking)

    // Sort by date_status in chronological order (oldest first)
    return histories.sort(
      (a, b) => new Date(a.date_status).getTime() - new Date(b.date_status).getTime()
    )
  }

  /**
   * Search histories with custom filters
   *
   * @param filters - Comprehensive filtering options
   * @returns Promise resolving to filtered history list
   *
   * @example
   * ```typescript
   * const results = await yalidine.histories.search({
   *   status: 'Livré',
   *   date_status: '2023-01-01,2023-01-31',
   *   fields: 'tracking,status,date_status',
   *   order_by: 'date_status',
   *   desc: true
   * });
   * ```
   */
  async search(filters: HistoryFilters): Promise<APIResponse<History>> {
    return this.list(filters)
  }

  /**
   * Get statistics about histories
   *
   * @param filters - Filtering options for statistics
   * @returns Promise resolving to history statistics
   *
   * @example
   * ```typescript
   * const stats = await yalidine.histories.getStats();
   * console.log(`Total entries: ${stats.total}`);
   * console.log(`Status counts:`, stats.statusCounts);
   * ```
   */
  async getStats(filters: HistoryFilters = {}): Promise<{
    total: number
    statusCounts: Record<string, number>
    wilayaCounts: Record<string, number>
    centerCounts: Record<string, number>
  }> {
    // Get all histories with the given filters
    const response = await this.list({ ...filters, page_size: 1000 })
    const histories = response.data

    const statusCounts: Record<string, number> = {}
    const wilayaCounts: Record<string, number> = {}
    const centerCounts: Record<string, number> = {}

    histories.forEach((history) => {
      // Count statuses
      statusCounts[history.status] = (statusCounts[history.status] || 0) + 1

      // Count wilayas
      wilayaCounts[history.wilaya_name] = (wilayaCounts[history.wilaya_name] || 0) + 1

      // Count centers
      centerCounts[history.center_name] = (centerCounts[history.center_name] || 0) + 1
    })

    return {
      total: histories.length,
      statusCounts,
      wilayaCounts,
      centerCounts,
    }
  }

  /**
   * Build query parameters from filters
   */
  private buildQueryParams(filters: HistoryFilters): string {
    const params = new URLSearchParams()

    // Add tracking filter
    if (filters.tracking) {
      const tracking = Array.isArray(filters.tracking)
        ? filters.tracking.join(',')
        : filters.tracking
      params.append('tracking', tracking)
    }

    // Add status filter
    if (filters.status) {
      const status = Array.isArray(filters.status) ? filters.status.join(',') : filters.status
      params.append('status', status)
    }

    // Add date_status filter
    if (filters.date_status) {
      params.append('date_status', filters.date_status)
    }

    // Add reason filter
    if (filters.reason) {
      const reason = Array.isArray(filters.reason) ? filters.reason.join(',') : filters.reason
      params.append('reason', reason)
    }

    // Add fields filter
    if (filters.fields) {
      params.append('fields', filters.fields)
    }

    // Add pagination
    if (filters.page) {
      params.append('page', filters.page.toString())
    }

    if (filters.page_size) {
      params.append('page_size', filters.page_size.toString())
    }

    // Add ordering
    if (filters.order_by) {
      params.append('order_by', filters.order_by)
    }

    if (filters.desc) {
      params.append('desc', '')
    }

    if (filters.asc) {
      params.append('asc', '')
    }

    return params.toString()
  }
}
