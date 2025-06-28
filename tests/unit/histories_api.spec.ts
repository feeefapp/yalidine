/**
 * Histories API Tests
 *
 * Comprehensive test suite for the HistoriesAPI class
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { HistoriesAPI } from '../../src/api/histories.js'
import { HTTPClient } from '../../src/http/client.js'
import { History, APIResponse } from '../../src/types.js'

// Mock HTTP client
const mockHttpClient = {
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
} as unknown as HTTPClient

describe('HistoriesAPI', () => {
  let historiesAPI: HistoriesAPI

  beforeEach(() => {
    vi.clearAllMocks()
    historiesAPI = new HistoriesAPI(mockHttpClient)
  })

  describe('list', () => {
    it('should list histories with default filters', async () => {
      const mockResponse: APIResponse<History> = {
        has_more: false,
        total_data: 2,
        data: [
          {
            date_status: '2023-01-01 10:00:00',
            tracking: 'yal-123456',
            status: 'Livré',
            reason: '',
            center_id: 1,
            center_name: 'Test Center',
            wilaya_id: 16,
            wilaya_name: 'Alger',
            commune_id: 1601,
            commune_name: 'Test Commune',
          },
          {
            date_status: '2023-01-02 11:00:00',
            tracking: 'yal-789012',
            status: 'Expédié',
            reason: '',
            center_id: 2,
            center_name: 'Test Center 2',
            wilaya_id: 16,
            wilaya_name: 'Alger',
            commune_id: 1601,
            commune_name: 'Test Commune',
          },
        ],
        links: {
          self: 'https://api.yalidine.app/v1/histories/',
        },
      }

      vi.mocked(mockHttpClient.get).mockResolvedValue({
        data: mockResponse,
        status: 200,
        headers: {},
        quota: {
          secondQuotaLeft: 100,
          minuteQuotaLeft: 1000,
          hourQuotaLeft: 10000,
          dayQuotaLeft: 100000,
          lastUpdate: new Date(),
        },
      })

      const result = await historiesAPI.list()

      expect(mockHttpClient.get).toHaveBeenCalledWith('/histories')
      expect(result).toEqual(mockResponse)
    })

    it('should list histories with filters', async () => {
      const mockResponse: APIResponse<History> = {
        has_more: false,
        total_data: 1,
        data: [
          {
            date_status: '2023-01-01 10:00:00',
            tracking: 'yal-123456',
            status: 'Livré',
            reason: '',
            center_id: 1,
            center_name: 'Test Center',
            wilaya_id: 16,
            wilaya_name: 'Alger',
            commune_id: 1601,
            commune_name: 'Test Commune',
          },
        ],
        links: {
          self: 'https://api.yalidine.app/v1/histories/?status=Livré',
        },
      }

      vi.mocked(mockHttpClient.get).mockResolvedValue({
        data: mockResponse,
        status: 200,
        headers: {},
        quota: {
          secondQuotaLeft: 100,
          minuteQuotaLeft: 1000,
          hourQuotaLeft: 10000,
          dayQuotaLeft: 100000,
          lastUpdate: new Date(),
        },
      })

      const result = await historiesAPI.list({
        status: 'Livré',
        page: 1,
        page_size: 10,
      })

      expect(mockHttpClient.get).toHaveBeenCalledWith('/histories?status=Livré&page=1&page_size=10')
      expect(result).toEqual(mockResponse)
    })
  })

  describe('find', () => {
    it('should find history for a specific tracking number', async () => {
      const mockResponse: APIResponse<History> = {
        has_more: false,
        total_data: 2,
        data: [
          {
            date_status: '2023-01-01 10:00:00',
            tracking: 'yal-123456',
            status: 'Expédié',
            reason: '',
            center_id: 1,
            center_name: 'Test Center',
            wilaya_id: 16,
            wilaya_name: 'Alger',
            commune_id: 1601,
            commune_name: 'Test Commune',
          },
          {
            date_status: '2023-01-02 11:00:00',
            tracking: 'yal-123456',
            status: 'Livré',
            reason: '',
            center_id: 1,
            center_name: 'Test Center',
            wilaya_id: 16,
            wilaya_name: 'Alger',
            commune_id: 1601,
            commune_name: 'Test Commune',
          },
        ],
        links: {
          self: 'https://api.yalidine.app/v1/histories/yal-123456',
        },
      }

      vi.mocked(mockHttpClient.get).mockResolvedValue({
        data: mockResponse,
        status: 200,
        headers: {},
        quota: {
          secondQuotaLeft: 100,
          minuteQuotaLeft: 1000,
          hourQuotaLeft: 10000,
          dayQuotaLeft: 100000,
          lastUpdate: new Date(),
        },
      })

      const result = await historiesAPI.find('yal-123456')

      expect(mockHttpClient.get).toHaveBeenCalledWith('/histories/yal-123456')
      expect(result).toEqual(mockResponse.data)
    })

    it('should return empty array when no history found', async () => {
      const mockResponse: APIResponse<History> = {
        has_more: false,
        total_data: 0,
        data: [],
        links: {
          self: 'https://api.yalidine.app/v1/histories/yal-nonexistent',
        },
      }

      vi.mocked(mockHttpClient.get).mockResolvedValue({
        data: mockResponse,
        status: 200,
        headers: {},
        quota: {
          secondQuotaLeft: 100,
          minuteQuotaLeft: 1000,
          hourQuotaLeft: 10000,
          dayQuotaLeft: 100000,
          lastUpdate: new Date(),
        },
      })

      const result = await historiesAPI.find('yal-nonexistent')

      expect(result).toEqual([])
    })
  })

  describe('findMultiple', () => {
    it('should find histories for multiple tracking numbers', async () => {
      const mockResponse: APIResponse<History> = {
        has_more: false,
        total_data: 2,
        data: [
          {
            date_status: '2023-01-01 10:00:00',
            tracking: 'yal-123456',
            status: 'Livré',
            reason: '',
            center_id: 1,
            center_name: 'Test Center',
            wilaya_id: 16,
            wilaya_name: 'Alger',
            commune_id: 1601,
            commune_name: 'Test Commune',
          },
          {
            date_status: '2023-01-02 11:00:00',
            tracking: 'yal-789012',
            status: 'Expédié',
            reason: '',
            center_id: 2,
            center_name: 'Test Center 2',
            wilaya_id: 16,
            wilaya_name: 'Alger',
            commune_id: 1601,
            commune_name: 'Test Commune',
          },
        ],
        links: {
          self: 'https://api.yalidine.app/v1/histories/?tracking=yal-123456,yal-789012',
        },
      }

      vi.mocked(mockHttpClient.get).mockResolvedValue({
        data: mockResponse,
        status: 200,
        headers: {},
        quota: {
          secondQuotaLeft: 100,
          minuteQuotaLeft: 1000,
          hourQuotaLeft: 10000,
          dayQuotaLeft: 100000,
          lastUpdate: new Date(),
        },
      })

      const result = await historiesAPI.findMultiple(['yal-123456', 'yal-789012'])

      expect(mockHttpClient.get).toHaveBeenCalledWith('/histories?tracking=yal-123456,yal-789012')
      expect(result).toEqual(mockResponse)
    })
  })

  describe('byStatus', () => {
    it('should filter histories by status', async () => {
      const mockResponse: APIResponse<History> = {
        has_more: false,
        total_data: 1,
        data: [
          {
            date_status: '2023-01-01 10:00:00',
            tracking: 'yal-123456',
            status: 'Livré',
            reason: '',
            center_id: 1,
            center_name: 'Test Center',
            wilaya_id: 16,
            wilaya_name: 'Alger',
            commune_id: 1601,
            commune_name: 'Test Commune',
          },
        ],
        links: {
          self: 'https://api.yalidine.app/v1/histories/?status=Livré',
        },
      }

      vi.mocked(mockHttpClient.get).mockResolvedValue({
        data: mockResponse,
        status: 200,
        headers: {},
        quota: {
          secondQuotaLeft: 100,
          minuteQuotaLeft: 1000,
          hourQuotaLeft: 10000,
          dayQuotaLeft: 100000,
          lastUpdate: new Date(),
        },
      })

      const result = await historiesAPI.byStatus('Livré')

      expect(mockHttpClient.get).toHaveBeenCalledWith('/histories?status=Livré')
      expect(result).toEqual(mockResponse)
    })
  })

  describe('byDateRange', () => {
    it('should filter histories by date range', async () => {
      const mockResponse: APIResponse<History> = {
        has_more: false,
        total_data: 1,
        data: [
          {
            date_status: '2023-01-15 10:00:00',
            tracking: 'yal-123456',
            status: 'Livré',
            reason: '',
            center_id: 1,
            center_name: 'Test Center',
            wilaya_id: 16,
            wilaya_name: 'Alger',
            commune_id: 1601,
            commune_name: 'Test Commune',
          },
        ],
        links: {
          self: 'https://api.yalidine.app/v1/histories/?date_status=2023-01-01,2023-01-31',
        },
      }

      vi.mocked(mockHttpClient.get).mockResolvedValue({
        data: mockResponse,
        status: 200,
        headers: {},
        quota: {
          secondQuotaLeft: 100,
          minuteQuotaLeft: 1000,
          hourQuotaLeft: 10000,
          dayQuotaLeft: 100000,
          lastUpdate: new Date(),
        },
      })

      const result = await historiesAPI.byDateRange('2023-01-01', '2023-01-31')

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/histories?date_status=2023-01-01,2023-01-31'
      )
      expect(result).toEqual(mockResponse)
    })
  })

  describe('byDate', () => {
    it('should filter histories by specific date', async () => {
      const mockResponse: APIResponse<History> = {
        has_more: false,
        total_data: 1,
        data: [
          {
            date_status: '2023-01-15 10:00:00',
            tracking: 'yal-123456',
            status: 'Livré',
            reason: '',
            center_id: 1,
            center_name: 'Test Center',
            wilaya_id: 16,
            wilaya_name: 'Alger',
            commune_id: 1601,
            commune_name: 'Test Commune',
          },
        ],
        links: {
          self: 'https://api.yalidine.app/v1/histories/?date_status=2023-01-15',
        },
      }

      vi.mocked(mockHttpClient.get).mockResolvedValue({
        data: mockResponse,
        status: 200,
        headers: {},
        quota: {
          secondQuotaLeft: 100,
          minuteQuotaLeft: 1000,
          hourQuotaLeft: 10000,
          dayQuotaLeft: 100000,
          lastUpdate: new Date(),
        },
      })

      const result = await historiesAPI.byDate('2023-01-15')

      expect(mockHttpClient.get).toHaveBeenCalledWith('/histories?date_status=2023-01-15')
      expect(result).toEqual(mockResponse)
    })
  })

  describe('byReason', () => {
    it('should filter histories by reason', async () => {
      const mockResponse: APIResponse<History> = {
        has_more: false,
        total_data: 1,
        data: [
          {
            date_status: '2023-01-15 10:00:00',
            tracking: 'yal-123456',
            status: 'Tentative échouée',
            reason: 'Client absent (échoué)',
            center_id: 1,
            center_name: 'Test Center',
            wilaya_id: 16,
            wilaya_name: 'Alger',
            commune_id: 1601,
            commune_name: 'Test Commune',
          },
        ],
        links: {
          self: 'https://api.yalidine.app/v1/histories/?reason=Client%20absent%20(échoué)',
        },
      }

      vi.mocked(mockHttpClient.get).mockResolvedValue({
        data: mockResponse,
        status: 200,
        headers: {},
        quota: {
          secondQuotaLeft: 100,
          minuteQuotaLeft: 1000,
          hourQuotaLeft: 10000,
          dayQuotaLeft: 100000,
          lastUpdate: new Date(),
        },
      })

      const result = await historiesAPI.byReason('Client absent (échoué)')

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/histories?reason=Client%20absent%20(échoué)'
      )
      expect(result).toEqual(mockResponse)
    })
  })

  describe('getLatestStatus', () => {
    it('should return the most recent status for a parcel', async () => {
      const mockHistories: History[] = [
        {
          date_status: '2023-01-01 10:00:00',
          tracking: 'yal-123456',
          status: 'Expédié',
          reason: '',
          center_id: 1,
          center_name: 'Test Center',
          wilaya_id: 16,
          wilaya_name: 'Alger',
          commune_id: 1601,
          commune_name: 'Test Commune',
        },
        {
          date_status: '2023-01-02 11:00:00',
          tracking: 'yal-123456',
          status: 'Livré',
          reason: '',
          center_id: 1,
          center_name: 'Test Center',
          wilaya_id: 16,
          wilaya_name: 'Alger',
          commune_id: 1601,
          commune_name: 'Test Commune',
        },
      ]

      vi.mocked(mockHttpClient.get).mockResolvedValue({
        data: {
          has_more: false,
          total_data: 2,
          data: mockHistories,
          links: { self: 'https://api.yalidine.app/v1/histories/yal-123456' },
        },
        status: 200,
        headers: {},
        quota: {
          secondQuotaLeft: 100,
          minuteQuotaLeft: 1000,
          hourQuotaLeft: 10000,
          dayQuotaLeft: 100000,
          lastUpdate: new Date(),
        },
      })

      const result = await historiesAPI.getLatestStatus('yal-123456')

      expect(result).toEqual(mockHistories[1]) // Should return the most recent (Livré)
    })

    it('should return null when no history found', async () => {
      vi.mocked(mockHttpClient.get).mockResolvedValue({
        data: {
          has_more: false,
          total_data: 0,
          data: [],
          links: { self: 'https://api.yalidine.app/v1/histories/yal-nonexistent' },
        },
        status: 200,
        headers: {},
        quota: {
          secondQuotaLeft: 100,
          minuteQuotaLeft: 1000,
          hourQuotaLeft: 10000,
          dayQuotaLeft: 100000,
          lastUpdate: new Date(),
        },
      })

      const result = await historiesAPI.getLatestStatus('yal-nonexistent')

      expect(result).toBeNull()
    })
  })

  describe('getTimeline', () => {
    it('should return sorted timeline in chronological order', async () => {
      const mockHistories: History[] = [
        {
          date_status: '2023-01-02 11:00:00',
          tracking: 'yal-123456',
          status: 'Livré',
          reason: '',
          center_id: 1,
          center_name: 'Test Center',
          wilaya_id: 16,
          wilaya_name: 'Alger',
          commune_id: 1601,
          commune_name: 'Test Commune',
        },
        {
          date_status: '2023-01-01 10:00:00',
          tracking: 'yal-123456',
          status: 'Expédié',
          reason: '',
          center_id: 1,
          center_name: 'Test Center',
          wilaya_id: 16,
          wilaya_name: 'Alger',
          commune_id: 1601,
          commune_name: 'Test Commune',
        },
      ]

      vi.mocked(mockHttpClient.get).mockResolvedValue({
        data: {
          has_more: false,
          total_data: 2,
          data: mockHistories,
          links: { self: 'https://api.yalidine.app/v1/histories/yal-123456' },
        },
        status: 200,
        headers: {},
        quota: {
          secondQuotaLeft: 100,
          minuteQuotaLeft: 1000,
          hourQuotaLeft: 10000,
          dayQuotaLeft: 100000,
          lastUpdate: new Date(),
        },
      })

      const result = await historiesAPI.getTimeline('yal-123456')

      // Should be sorted chronologically (oldest first)
      expect(result[0]?.status).toBe('Expédié')
      expect(result[1]?.status).toBe('Livré')
    })
  })

  describe('getStats', () => {
    it('should return statistics about histories', async () => {
      const mockHistories: History[] = [
        {
          date_status: '2023-01-01 10:00:00',
          tracking: 'yal-123456',
          status: 'Livré',
          reason: '',
          center_id: 1,
          center_name: 'Center A',
          wilaya_id: 16,
          wilaya_name: 'Alger',
          commune_id: 1601,
          commune_name: 'Commune A',
        },
        {
          date_status: '2023-01-02 11:00:00',
          tracking: 'yal-789012',
          status: 'Livré',
          reason: '',
          center_id: 2,
          center_name: 'Center B',
          wilaya_id: 16,
          wilaya_name: 'Alger',
          commune_id: 1601,
          commune_name: 'Commune A',
        },
        {
          date_status: '2023-01-03 12:00:00',
          tracking: 'yal-345678',
          status: 'Expédié',
          reason: '',
          center_id: 1,
          center_name: 'Center A',
          wilaya_id: 16,
          wilaya_name: 'Alger',
          commune_id: 1601,
          commune_name: 'Commune A',
        },
      ]

      vi.mocked(mockHttpClient.get).mockResolvedValue({
        data: {
          has_more: false,
          total_data: 3,
          data: mockHistories,
          links: { self: 'https://api.yalidine.app/v1/histories/' },
        },
        status: 200,
        headers: {},
        quota: {
          secondQuotaLeft: 100,
          minuteQuotaLeft: 1000,
          hourQuotaLeft: 10000,
          dayQuotaLeft: 100000,
          lastUpdate: new Date(),
        },
      })

      const result = await historiesAPI.getStats()

      expect(result.total).toBe(3)
      expect(result.statusCounts).toEqual({
        Livré: 2,
        Expédié: 1,
      })
      expect(result.wilayaCounts).toEqual({
        Alger: 3,
      })
      expect(result.centerCounts).toEqual({
        'Center A': 2,
        'Center B': 1,
      })
    })
  })

  describe('buildQueryParams', () => {
    it('should build query parameters correctly', async () => {
      const mockResponse: APIResponse<History> = {
        has_more: false,
        total_data: 0,
        data: [],
        links: { self: 'https://api.yalidine.app/v1/histories/' },
      }

      vi.mocked(mockHttpClient.get).mockResolvedValue({
        data: mockResponse,
        status: 200,
        headers: {},
        quota: {
          secondQuotaLeft: 100,
          minuteQuotaLeft: 1000,
          hourQuotaLeft: 10000,
          dayQuotaLeft: 100000,
          lastUpdate: new Date(),
        },
      })

      await historiesAPI.list({
        tracking: ['yal-123456', 'yal-789012'],
        status: ['Livré', 'Expédié'],
        date_status: '2023-01-01,2023-01-31',
        reason: 'Client absent (échoué)',
        fields: 'tracking,status,date_status',
        page: 1,
        page_size: 50,
        order_by: 'date_status',
        desc: true,
      })

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/histories?tracking=yal-123456,yal-789012&status=Livré,Expédié&date_status=2023-01-01,2023-01-31&reason=Client%20absent%20(échoué)&fields=tracking,status,date_status&page=1&page_size=50&order_by=date_status&desc='
      )
    })
  })
})
