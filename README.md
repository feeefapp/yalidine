# Yalidine SDK (not official)

[![npm version](https://badge.fury.io/js/yalidine.svg)](https://badge.fury.io/js/yalidine)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> this is not the official Yalidine SDK, this is a community-driven SDK build by feeef.org team, we will try to keep it up-to-date with the latest Yalidine and Guepex APIs. contributions and feedback are welcome!

A type-safe JavaScript/TypeScript SDK for interacting with Yalidine and Guepex delivery APIs. Works seamlessly in both browser and Node.js environments.

## 🚀 Features

- **🎯 Type-Safe**: Full TypeScript support with comprehensive type definitions
- **🌐 Universal**: Works in browser, Node.js, Edge Runtime, and React Native
- **🔄 Multi-Agent**: Support for both Yalidine and Guepex delivery services
- **💾 Smart Caching**: Built-in database support for caching centers, wilayas, and communes
- **📦 Lightweight**: Tree-shakable with minimal bundle size
- **🔐 Secure**: Built-in authentication and rate limiting handling
- **📊 Analytics**: Request/response logging and error tracking
- **🎨 Developer Experience**: Intuitive API design with excellent IntelliSense

## 📦 Installation

```bash
npm install yalidine
# or
yarn add yalidine
# or
pnpm add yalidine
```

## 🏁 Quick Start

```typescript
import { Yalidine, YalidineMemoryDatabase } from 'yalidine'

// Initialize the SDK
const config = {
  agent: 'goupex', // or 'yalidine'
  auth: {
    id: 'your-api-id',
    token: 'your-api-token',
  },
  database: new YalidineMemoryDatabase(), // or YalidineIndexedDBDatabase() for browser
}

const yalidine = new Yalidine(config)

// Initialize (loads cached data like centers, wilayas, communes)
await yalidine.init()

// Create a parcel
const parcel = await yalidine.parcels.create({
  order_id: 'order-123',
  from_wilaya_name: 'Alger',
  firstname: 'Ahmed',
  familyname: 'Benali',
  contact_phone: '0555123456',
  address: 'Rue de la Liberté, Hydra',
  to_commune_name: 'Hydra',
  to_wilaya_name: 'Alger',
  product_list: 'Smartphone',
  price: 50000,
  do_insurance: true,
  declared_value: 55000,
  length: 15,
  width: 10,
  height: 5,
  weight: 1,
  freeshipping: false,
  is_stopdesk: false,
  has_exchange: false,
})

console.log('Parcel created:', parcel.tracking)
```

## 🗂️ API Reference

### Configuration

```typescript
interface YalidineConfig {
  agent: 'yalidine' | 'goupex'
  auth: {
    id: string
    token: string
  }
  database?: YalidineDatabase
  baseURL?: string // Optional custom base URL
  timeout?: number // Request timeout in ms (default: 30000)
  retries?: number // Number of retries (default: 3)
  cacheTTL?: number // Cache TTL in seconds (default: 3600*24) WIP
}
```

### Database Options

```typescript
// In-memory database (default)
const memoryDb = new YalidineMemoryDatabase()

// IndexedDB for browsers
const indexedDb = new YalidineIndexedDBDatabase('yalidine-cache')

// Local storage for browsers (fallback)
const localStorageDb = new YalidineLocalStorageDatabase('yalidine-cache')

// Auto-detect best database for environment
const autoDb = YalidineDatabase.auto()

// file-based database for Node.js (soon in separate package)
const fileDb = new YalidineFileDatabase('path/to/cache.json')
```

### Parcels API

```typescript
// List parcels with filters
const parcels = await yalidine.parcels.list({
  page: 1,
  page_size: 50,
  to_wilaya_id: 16,
  last_status: ['Livré', 'En cours'],
  date_creation: '2024-01-01,2024-01-31',
})

// Find specific parcel
const parcel = await yalidine.parcels.find('yal-123456')

// Create single parcel
const newParcel = await yalidine.parcels.create(parcelData)

// Create multiple parcels
const bulkResult = await yalidine.parcels.createBulk([parcel1, parcel2])

// Update parcel
const updated = await yalidine.parcels.update('yal-123456', {
  firstname: 'New Name',
  contact_phone: '0666123456',
})

// Delete parcel
await yalidine.parcels.delete('yal-123456')

// Get parcel label
const labelUrl = await yalidine.parcels.getLabel('yal-123456')
```

### Histories API

The Histories API provides comprehensive access to parcel status history and delivery tracking information.

```typescript
// List all histories with optional filters
const histories = await yalidine.histories.list({
  page: 1,
  page_size: 50,
  status: ['Livré', 'Expédié'],
  tracking: 'yal-123456',
  date_status: '2024-01-01,2024-01-31',
})

// Find history for a specific parcel
const parcelHistory = await yalidine.histories.find('yal-123456')

// Find histories for multiple parcels
const multipleHistories = await yalidine.histories.findMultiple([
  'yal-123456',
  'yal-789012',
])

// Filter by status
const deliveredHistories = await yalidine.histories.byStatus('Livré')

// Filter by date range
const dateRangeHistories = await yalidine.histories.byDateRange(
  '2024-01-01',
  '2024-01-31'
)

// Filter by specific date
const dateHistories = await yalidine.histories.byDate('2024-01-15')

// Filter by delivery failure reason
const failedHistories = await yalidine.histories.byReason('Client absent (échoué)')

// Get latest status for a parcel
const latestStatus = await yalidine.histories.getLatestStatus('yal-123456')
console.log(`Latest status: ${latestStatus?.status}`)

// Get complete timeline for a parcel (chronological order)
const timeline = await yalidine.histories.getTimeline('yal-123456')
timeline.forEach((entry) => {
  console.log(`${entry.date_status}: ${entry.status}`)
})

// Get statistics about histories
const stats = await yalidine.histories.getStats()
console.log(`Total entries: ${stats.total}`)
console.log(`Status counts:`, stats.statusCounts)
console.log(`Wilaya counts:`, stats.wilayaCounts)
console.log(`Center counts:`, stats.centerCounts)

// Advanced search with custom filters
const searchResults = await yalidine.histories.search({
  status: 'Livré',
  date_status: '2024-01-01,2024-01-31',
  fields: 'tracking,status,date_status',
  order_by: 'date_status',
  desc: true,
})
```

#### History Filters

```typescript
interface HistoryFilters {
  tracking?: string | string[]           // Filter by tracking number(s)
  status?: ParcelStatus | ParcelStatus[] // Filter by status
  date_status?: string                   // Filter by date (YYYY-MM-DD or YYYY-MM-DD,YYYY-MM-DD)
  reason?: string | string[]             // Filter by delivery failure reason
  fields?: string                        // Specify which fields to return
  page?: number                          // Page number
  page_size?: number                     // Results per page
  order_by?: 'date_status' | 'tracking' | 'status' | 'reason'
  desc?: boolean                         // Descending order
  asc?: boolean                          // Ascending order
}
```

#### History Object

```typescript
interface History {
  date_status: string    // Status creation date (YYYY-MM-DD HH:MM:SS)
  tracking: string       // Parcel tracking number
  status: ParcelStatus   // Current status
  reason: string         // Failure reason (if applicable)
  center_id: number      // Center ID where status occurred
  center_name: string    // Center name
  wilaya_id: number      // Wilaya ID
  wilaya_name: string    // Wilaya name
  commune_id: number     // Commune ID
  commune_name: string   // Commune name
}
```

### Data API

```typescript
// Get all wilayas (cached automatically)
const wilayas = await yalidine.wilayas.list()

// Get communes for a wilaya (will be cached automatically in next updates)
const communes = await yalidine.communes.list({ wilaya_id: 16 })

// Get delivery centers (will be cached automatically in next updates)
const centers = await yalidine.centers.list({ wilaya_id: 16 })

// Calculate delivery fees (will be cached automatically)
const fees = await yalidine.fees.calculate({
  from_wilaya_id: 16,
  to_wilaya_id: 19,
})
```

## 🎯 Advanced Usage

### Error Handling

```typescript
import { YalidineError, YalidineAPIError } from 'yalidine'

try {
  const parcel = await yalidine.parcels.create(invalidData)
} catch (error) {
  if (error instanceof YalidineAPIError) {
    console.error('API Error:', error.message, error.status)
    console.error('Details:', error.details)
  } else if (error instanceof YalidineError) {
    console.error('SDK Error:', error.message)
  }
}
```

### Rate Limiting

The SDK automatically handles rate limiting based on the API response headers:

- `second-quota-left`
- `minute-quota-left`
- `hour-quota-left`
- `day-quota-left`

```typescript
// Check current quota
const quota = yalidine.getQuotaStatus()
console.log('Remaining requests:', quota)
```

### Custom Database Implementation

```typescript
import { YalidineDatabase } from 'yalidine'

class CustomDatabase implements YalidineDatabase {
  async get<T>(key: string): Promise<T | null> {
    // Your implementation
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    // Your implementation
  }

  async delete(key: string): Promise<void> {
    // Your implementation
  }

  async clear(): Promise<void> {
    // Your implementation
  }
}
```

### React Integration (WIP)

this is just a basic example, more hooks and features will be added in the future

```typescript
import { useYalidine } from 'yalidine/react';

function MyComponent() {
  const { yalidine, loading, error } = useYalidine({
    agent: 'goupex',
    auth: { id: 'xxx', token: 'yyy' }
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {/* Use yalidine instance */}
    </div>
  );
}
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests
npm run test:integration

# Run with coverage
npm run test:coverage
```

## 📖 Documentation

Visit the yalidine [documentation site](https://feeef.org) for comprehensive guides, API reference, and examples.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📜 License

MIT © [feeef](https://feeef.org)

## 🔗 Links

- [Yalidine/Guepex API Documentation](https://guepex.app/app/dev/docs/api/index.php) (you must log in to access the API documentation)
- [GitHub Repository](https://github.com/feeefapp/yalidine)
- [npm Package](https://www.npmjs.com/package/yalidine)

---

Made with ❤️ by @mohamadlounnas at feeef.org
