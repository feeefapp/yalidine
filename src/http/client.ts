/**
 * HTTP Client for Yalidine SDK
 *
 * Handles HTTP requests with authentication, retries, and error handling
 */

import {
  YalidineAPIError,
  YalidineNetworkError,
  YalidineRateLimitError,
  QuotaStatus,
} from '../types'

export interface HTTPClientConfig {
  baseURL: string
  apiId: string
  apiToken: string
  timeout?: number
  retries?: number
  debug?: boolean
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  headers?: Record<string, string>
  body?: string | undefined
  timeout?: number
  retries?: number
}

export interface HTTPResponse<T = any> {
  data: T
  status: number
  headers: Record<string, string>
  quota: QuotaStatus
}

/**
 * HTTP Client for making authenticated requests to Yalidine/Guepex APIs
 */
export class HTTPClient {
  private config: HTTPClientConfig
  private quotaStatus: QuotaStatus

  constructor(config: HTTPClientConfig) {
    this.config = config
    this.quotaStatus = {
      secondQuotaLeft: 5,
      minuteQuotaLeft: 50,
      hourQuotaLeft: 1000,
      dayQuotaLeft: 10000,
      lastUpdate: new Date(),
    }
  }

  /**
   * Make an HTTP request
   */
  async request<T = any>(endpoint: string, options: RequestOptions = {}): Promise<HTTPResponse<T>> {
    const url = `${this.config.baseURL}${endpoint}`
    const method = options.method || 'GET'
    const timeout = options.timeout || this.config.timeout || 30000
    const maxRetries = options.retries ?? this.config.retries ?? 3

    const headers: Record<string, string> = {
      'X-API-ID': this.config.apiId,
      'X-API-TOKEN': this.config.apiToken,
      'Content-Type': 'application/json',
      'User-Agent': 'Yalidine-SDK/1.0.0',
      ...options.headers,
    }

    if (this.config.debug) {
      console.log(`[Yalidine SDK] ${method} ${url}`, {
        headers,
        body: options.body,
      })
    }

    let lastError: Error | null = null

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), timeout)

        const response = await fetch(url, {
          method,
          headers,
          signal: controller.signal,
          ...(options.body !== undefined && { body: options.body }),
        })

        clearTimeout(timeoutId)

        // Update quota status from response headers
        this.updateQuotaStatus(response.headers)

        const responseText = await response.text()
        let data: T

        try {
          data = responseText ? JSON.parse(responseText) : null
        } catch (parseError) {
          throw new YalidineAPIError('Invalid JSON response from API', response.status, {
            responseText,
            parseError,
          })
        }

        if (!response.ok) {
          // Handle rate limiting
          if (response.status === 429) {
            const retryAfter = this.getRetryAfter(response.headers)
            throw new YalidineRateLimitError('Rate limit exceeded', retryAfter)
          }

          throw new YalidineAPIError(
            `API request failed: ${response.status} ${response.statusText}`,
            response.status,
            data
          )
        }

        if (this.config.debug) {
          console.log(`[Yalidine SDK] Response:`, data)
        }

        return {
          data,
          status: response.status,
          headers: this.headersToObject(response.headers),
          quota: { ...this.quotaStatus },
        }
      } catch (error) {
        lastError = error as Error

        if (error instanceof YalidineAPIError || error instanceof YalidineRateLimitError) {
          throw error
        }

        if (error instanceof Error && error.name === 'AbortError') {
          lastError = new YalidineNetworkError('Request timeout', error)
        } else if (error instanceof TypeError && error.message.includes('fetch')) {
          lastError = new YalidineNetworkError('Network error', error)
        }

        // Don't retry on final attempt
        if (attempt === maxRetries) {
          break
        }

        // Wait before retrying (exponential backoff)
        const delay = Math.min(1000 * Math.pow(2, attempt), 10000)
        await this.sleep(delay)

        if (this.config.debug) {
          console.log(
            `[Yalidine SDK] Retrying request in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`
          )
        }
      }
    }

    throw lastError || new YalidineNetworkError('Request failed after all retries')
  }

  /**
   * GET request
   */
  async get<T = any>(
    endpoint: string,
    options: Omit<RequestOptions, 'method'> = {}
  ): Promise<HTTPResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' })
  }

  /**
   * POST request
   */
  async post<T = any>(
    endpoint: string,
    data?: any,
    options: Omit<RequestOptions, 'method' | 'body'> = {}
  ): Promise<HTTPResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  /**
   * PATCH request
   */
  async patch<T = any>(
    endpoint: string,
    data?: any,
    options: Omit<RequestOptions, 'method' | 'body'> = {}
  ): Promise<HTTPResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  /**
   * DELETE request
   */
  async delete<T = any>(
    endpoint: string,
    options: Omit<RequestOptions, 'method'> = {}
  ): Promise<HTTPResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' })
  }

  /**
   * Get current quota status
   */
  getQuotaStatus(): QuotaStatus {
    return { ...this.quotaStatus }
  }

  /**
   * Check if we can make a request based on quota
   */
  canMakeRequest(): boolean {
    return (
      this.quotaStatus.secondQuotaLeft > 0 &&
      this.quotaStatus.minuteQuotaLeft > 0 &&
      this.quotaStatus.hourQuotaLeft > 0 &&
      this.quotaStatus.dayQuotaLeft > 0
    )
  }

  /**
   * Update quota status from response headers
   */
  private updateQuotaStatus(headers: Headers): void {
    const getHeader = (name: string): number => {
      const value = headers.get(name)
      return value
        ? Number.parseInt(value, 10)
        : (this.quotaStatus[name as keyof QuotaStatus] as number)
    }

    this.quotaStatus = {
      secondQuotaLeft: getHeader('x-second-quota-left'),
      minuteQuotaLeft: getHeader('x-minute-quota-left'),
      hourQuotaLeft: getHeader('x-hour-quota-left'),
      dayQuotaLeft: getHeader('x-day-quota-left'),
      lastUpdate: new Date(),
    }
  }

  /**
   * Get retry-after value from response headers
   */
  private getRetryAfter(headers: Headers): number {
    const retryAfter = headers.get('retry-after')
    return retryAfter ? Number.parseInt(retryAfter, 10) : 60
  }

  /**
   * Convert Headers object to plain object
   */
  private headersToObject(headers: Headers): Record<string, string> {
    const result: Record<string, string> = {}
    headers.forEach((value, key) => {
      result[key] = value
    })
    return result
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}
