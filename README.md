# Yalidine SDK

[![npm version](https://badge.fury.io/js/@yalidine/sdk.svg)](https://badge.fury.io/js/@yalidine/sdk)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A modern, type-safe JavaScript/TypeScript SDK for interacting with Yalidine and Guepex delivery APIs. Works seamlessly in both browser and Node.js environments.

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
npm install @yalidine/sdk
# or
yarn add @yalidine/sdk
# or
pnpm add @yalidine/sdk
```

## 🏁 Quick Start

```typescript
import { Yalidine, YalidineMemoryDatabase } from '@yalidine/sdk'

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

```typescript
// Get parcel history
const history = await yalidine.histories.list({
  tracking: 'yal-123456',
})

// Get delivery status updates
const updates = await yalidine.histories.getUpdates(['yal-123456', 'yal-789012'])
```

### Geographic Data API

```typescript
// Get all wilayas (cached automatically)
const wilayas = await yalidine.wilayas.list()

// Get communes for a wilaya
const communes = await yalidine.communes.list({ wilaya_id: 16 })

// Get delivery centers
const centers = await yalidine.centers.list({ wilaya_id: 16 })

// Calculate delivery fees
const fees = await yalidine.fees.calculate({
  from_wilaya_id: 16,
  to_wilaya_id: 19,
})
```

## 🎯 Advanced Usage

### Error Handling

```typescript
import { YalidineError, YalidineAPIError } from '@yalidine/sdk'

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

- `x-second-quota-left`
- `x-minute-quota-left`
- `x-hour-quota-left`
- `x-day-quota-left`

```typescript
// Check current quota
const quota = yalidine.getQuotaStatus()
console.log('Remaining requests:', quota)
```

### Custom Database Implementation

```typescript
import { YalidineDatabase } from '@yalidine/sdk'

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

### React Integration

```typescript
import { useYalidine } from '@yalidine/sdk/react';

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

Visit our [documentation site](https://yalidine-sdk.dev) for comprehensive guides, API reference, and examples.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📜 License

MIT © [Yalidine Team](https://yalidine.com)

## 🔗 Links

- [Yalidine API Documentation](https://yalidine.app/docs)
- [Guepex API Documentation](https://guepex.app/docs)
- [GitHub Repository](https://github.com/yalidine/sdk)
- [npm Package](https://www.npmjs.com/package/@yalidine/sdk)

---

Made with ❤️ by the Yalidine team
