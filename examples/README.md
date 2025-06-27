# Yalidine SDK Examples

This directory contains practical examples showing how to use the Yalidine SDK.

## Basic Usage

```typescript
import { Yalidine, YalidineMemoryDatabase } from 'yalidine'

// Initialize the SDK
const yalidine = new Yalidine({
  agent: 'goupex', // or 'yalidine'
  auth: {
    id: 'your-api-id',
    token: 'your-api-token',
  },
  database: new YalidineMemoryDatabase(),
})

// Initialize (loads cached data like centers, wilayas, communes)
await yalidine.init()

// Create a parcel
const parcel = await yalidine.parcels.create({
  order_id: 'ORDER-123',
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

console.log('Parcel created:', parcel)
```

## List Parcels

```typescript
// List parcels with filters
const parcels = await yalidine.parcels.list({
  page: 1,
  page_size: 50,
  last_status: ['Livré', 'Expédié'],
  to_wilaya_id: 16, // Alger
  date_creation: '2024-01-01,2024-12-31',
})

console.log(`Found ${parcels.total_data} parcels`)
```

## Find Specific Parcel

```typescript
// Find parcel by tracking number
const parcel = await yalidine.parcels.find('yal-123456')
console.log(`Status: ${parcel.last_status}`)

// Get parcel label
const labelUrl = await yalidine.parcels.getLabel('yal-123456')
console.log('Label URL:', labelUrl)
```

## Update Parcel

```typescript
// Update parcel (only works if status is "En préparation")
const updated = await yalidine.parcels.update('yal-123456', {
  firstname: 'Mohamed',
  contact_phone: '0666123456',
})
```

## Bulk Operations

```typescript
// Create multiple parcels
const parcels = [
  { order_id: 'ORDER-1' /* ... parcel data ... */ },
  { order_id: 'ORDER-2' /* ... parcel data ... */ },
]

const results = await yalidine.parcels.createBulk(parcels)

// Delete multiple parcels
const deleteResults = await yalidine.parcels.deleteBulk(['yal-123456', 'yal-789012'])
```

## Error Handling

```typescript
import { YalidineError, YalidineAPIError, YalidineRateLimitError } from 'yalidine'

try {
  const parcel = await yalidine.parcels.create(invalidData)
} catch (error) {
  if (error instanceof YalidineAPIError) {
    console.error('API Error:', error.message, 'Status:', error.status)
  } else if (error instanceof YalidineRateLimitError) {
    console.error('Rate limit exceeded. Retry after:', error.retryAfter, 'seconds')
  } else if (error instanceof YalidineError) {
    console.error('SDK Error:', error.message)
  }
}
```

## Quota Management

```typescript
// Check current quota
const quota = yalidine.getQuotaStatus()
console.log('Remaining requests:', {
  second: quota.secondQuotaLeft,
  minute: quota.minuteQuotaLeft,
  hour: quota.hourQuotaLeft,
  day: quota.dayQuotaLeft,
})

// Check if we can make requests
if (yalidine.canMakeRequest()) {
  // Safe to make API calls
  const parcels = await yalidine.parcels.list()
}
```

## Cache Management

```typescript
// Clear cache
await yalidine.clearCache()

// Access database directly
const database = yalidine.getDatabase()
await database.set('custom-key', { data: 'value' }, 3600) // TTL in seconds
const data = await database.get('custom-key')
```

## Testing Connection

```typescript
// Test API credentials
const isConnected = await yalidine.testConnection()
if (!isConnected) {
  console.error('Failed to connect to API. Check your credentials.')
}
```

## Cleanup

```typescript
// Clean up resources when done
await yalidine.destroy()
```

## Different Database Options

```typescript
import {
  YalidineMemoryDatabase,
  YalidineIndexedDBDatabase,
  YalidineLocalStorageDatabase,
} from 'yalidine'

// Memory database (default, data lost on restart)
const memoryDb = new YalidineMemoryDatabase()

// IndexedDB for browsers (persistent)
const indexedDb = new YalidineIndexedDBDatabase('yalidine-cache')

// LocalStorage for browsers (limited size)
const localStorageDb = new YalidineLocalStorageDatabase('yalidine-cache')

// Auto-detect best available database
const autoDb = YalidineDatabase.auto()
```

## Environment-specific Usage

### Node.js

```typescript
import { Yalidine } from 'yalidine'

const yalidine = new Yalidine({
  agent: 'goupex',
  auth: { id: process.env.API_ID!, token: process.env.API_TOKEN! },
})
```

### Browser

```typescript
import { Yalidine, YalidineIndexedDBDatabase } from 'yalidine'

const yalidine = new Yalidine({
  agent: 'goupex',
  auth: { id: 'your-api-id', token: 'your-api-token' },
  database: new YalidineIndexedDBDatabase(), // Persistent storage
})
```

### React

```typescript
import { useYalidine } from 'yalidine/react';

function MyComponent() {
  const { yalidine, loading, error } = useYalidine({
    agent: 'goupex',
    auth: { id: 'your-api-id', token: 'your-api-token' }
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  // Use yalidine instance
  return <div>SDK Ready!</div>;
}
```
