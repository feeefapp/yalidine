/**
 * Basic Usage Examples for Yalidine SDK
 *
 * This file demonstrates common usage patterns and examples for the Yalidine SDK.
 * Make sure to replace API credentials with your actual values.
 */

import { YalidineMemoryDatabase } from '../src/index.js'
import { CreateParcelRequest, YalidineError } from '../src/types.js'
import { Yalidine } from '../src/yalidine.js'

// Configuration examples
async function initializationExamples() {
  console.log('=== Initialization Examples ===')

  // Basic initialization with Guepex agent
  const yalidine = new Yalidine({
    agent: 'goupex', // or 'yalidine'
    auth: {
      id: 'your-api-id',
      token: 'your-api-token',
    },
    database: new YalidineMemoryDatabase(), // In-memory caching
    debug: true, // Enable debug logging
  })

  // Initialize the SDK (loads cached data)
  try {
    await yalidine.init()
    console.log('✅ SDK initialized successfully')

    // Test connection
    const isConnected = await yalidine.testConnection()
    console.log(`🔗 Connection status: ${isConnected ? 'Connected' : 'Failed'}`)

    // Get SDK information
    const info = yalidine.getInfo()
    console.log('📊 SDK Info:', info)
  } catch (error) {
    console.error('❌ Initialization failed:', error)
  }

  return yalidine
}

// Parcel management examples
async function parcelExamples(yalidine: Yalidine) {
  console.log('\n=== Parcel Management Examples ===')

  try {
    // 1. Create a single parcel
    console.log('\n1. Creating a single parcel...')

    const parcelData: CreateParcelRequest = {
      order_id: 'ORDER-' + Date.now(),
      from_wilaya_name: 'Alger',
      firstname: 'Ahmed',
      familyname: 'Benali',
      contact_phone: '0555123456',
      address: 'Rue de la Liberté, Hydra',
      to_commune_name: 'Hydra',
      to_wilaya_name: 'Alger',
      product_list: 'Smartphone Samsung Galaxy',
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
    }

    const createResult = await yalidine.parcels.create(parcelData)
    console.log('✅ Parcel created:', createResult)

    // Get the tracking number from the first (and only) result
    const orderId = Object.keys(createResult)[0]
    const tracking = createResult[orderId].tracking

    if (tracking) {
      // 2. Find the parcel we just created
      console.log('\n2. Finding parcel by tracking number...')
      const parcel = await yalidine.parcels.find(tracking)
      console.log('📦 Found parcel:', {
        tracking: parcel.tracking,
        status: parcel.last_status,
        recipient: `${parcel.firstname} ${parcel.familyname}`,
        destination: `${parcel.to_commune_name}, ${parcel.to_wilaya_name}`,
      })

      // 3. Update parcel information (only works if status is "En préparation")
      console.log('\n3. Updating parcel information...')
      try {
        const updatedParcel = await yalidine.parcels.update(tracking, {
          contact_phone: '0666789012',
          address: 'Nouvelle adresse - Rue des Oliviers',
        })
        console.log('✅ Parcel updated:', {
          tracking: updatedParcel.tracking,
          phone: updatedParcel.contact_phone,
          address: updatedParcel.address,
        })
      } catch (error) {
        console.log('⚠️ Update failed (parcel may no longer be editable):', error)
      }

      // 4. Get parcel label
      console.log('\n4. Getting parcel label...')
      const labelUrl = await yalidine.parcels.getLabel(tracking)
      console.log('🏷️ Label URL:', labelUrl)
    }

    // 5. List parcels with filters
    console.log('\n5. Listing parcels with filters...')
    const parcels = await yalidine.parcels.list({
      page: 1,
      page_size: 10,
      last_status: ['En préparation', 'Expédié'],
      to_wilaya_id: 16, // Alger
    })

    console.log(`📋 Found ${parcels.total_data} total parcels, showing ${parcels.data.length}:`)
    parcels.data.forEach((parcel, index) => {
      console.log(
        `  ${index + 1}. ${parcel.tracking} - ${parcel.last_status} (${parcel.firstname} ${parcel.familyname})`
      )
    })

    // 6. Search parcels
    console.log('\n6. Searching parcels...')
    const searchResults = await yalidine.parcels.search('ORDER', {
      page_size: 5,
    })
    console.log(`🔍 Search results: ${searchResults.data.length} parcels found`)

    // 7. Get parcel statistics
    console.log('\n7. Getting parcel statistics...')
    const stats = await yalidine.parcels.getStats({
      date_creation: '2024-01-01,2024-12-31',
    })
    console.log('📊 Statistics:', {
      total: stats.total,
      topStatuses: Object.entries(stats.statusCounts).slice(0, 3),
      topWilayas: Object.entries(stats.wilayaCounts).slice(0, 3),
    })
  } catch (error) {
    if (error instanceof YalidineError) {
      console.error('❌ Yalidine SDK Error:', error.message)
    } else {
      console.error('❌ Unexpected error:', error)
    }
  }
}

// Bulk operations examples
async function bulkOperationsExamples(yalidine: Yalidine) {
  console.log('\n=== Bulk Operations Examples ===')

  try {
    // Create multiple parcels at once
    console.log('\n1. Creating multiple parcels...')

    const bulkParcels: CreateParcelRequest[] = [
      {
        order_id: 'BULK-ORDER-1-' + Date.now(),
        from_wilaya_name: 'Alger',
        firstname: 'Fatima',
        familyname: 'Zohra',
        contact_phone: '0777111222',
        address: 'Cité des Palmiers',
        to_commune_name: 'Bab Ezzouar',
        to_wilaya_name: 'Alger',
        product_list: 'Livre de cuisine',
        price: 2500,
        do_insurance: false,
        declared_value: 2500,
        length: 20,
        width: 15,
        height: 3,
        weight: 1,
        freeshipping: true,
        is_stopdesk: true,
        stopdesk_id: 163001, // Example center ID
        has_exchange: false,
      },
      {
        order_id: 'BULK-ORDER-2-' + Date.now(),
        from_wilaya_name: 'Alger',
        firstname: 'Karim',
        familyname: 'Bencheikh',
        contact_phone: '0555333444',
        address: 'Résidence El Wiam',
        to_commune_name: 'Rouiba',
        to_wilaya_name: 'Alger',
        product_list: 'Chaussures de sport',
        price: 8500,
        do_insurance: true,
        declared_value: 9000,
        length: 30,
        width: 20,
        height: 15,
        weight: 2,
        freeshipping: false,
        is_stopdesk: false,
        has_exchange: false,
      },
    ]

    const bulkResult = await yalidine.parcels.createBulk(bulkParcels)
    console.log('✅ Bulk creation result:')

    Object.entries(bulkResult).forEach(([orderId, result]) => {
      if (result.success) {
        console.log(`  ✅ ${orderId}: ${result.tracking}`)
      } else {
        console.log(`  ❌ ${orderId}: ${result.message}`)
      }
    })

    // Get successful tracking numbers for further operations
    const trackingNumbers = Object.values(bulkResult)
      .filter((result) => result.success && result.tracking)
      .map((result) => result.tracking!)

    if (trackingNumbers.length > 0) {
      // Get bulk labels
      console.log('\n2. Getting bulk labels...')
      try {
        const labelsUrl = await yalidine.parcels.getLabels(trackingNumbers)
        console.log('🏷️ Bulk labels URL:', labelsUrl)
      } catch (error) {
        console.log('⚠️ Bulk labels not available:', error)
      }
    }
  } catch (error) {
    console.error('❌ Bulk operations error:', error)
  }
}

// Error handling examples
async function errorHandlingExamples(yalidine: Yalidine) {
  console.log('\n=== Error Handling Examples ===')

  // Example 1: Handling API errors
  try {
    await yalidine.parcels.find('non-existent-tracking')
  } catch (error) {
    if (error instanceof YalidineError) {
      console.log('🔍 Expected error for non-existent parcel:', error.message)
    }
  }

  // Example 2: Handling validation errors
  try {
    // @ts-expect-error Intentionally invalid data for demo
    await yalidine.parcels.create({
      order_id: '', // Invalid: empty order ID
      from_wilaya_name: 'InvalidWilaya',
    })
  } catch (error) {
    console.log('📋 Expected validation error:', error instanceof Error ? error.message : error)
  }

  // Example 3: Check quota before making requests
  const quotaStatus = yalidine.getQuotaStatus()
  console.log('📊 Current API quota:', {
    secondLeft: quotaStatus.secondQuotaLeft,
    minuteLeft: quotaStatus.minuteQuotaLeft,
    hourLeft: quotaStatus.hourQuotaLeft,
    dayLeft: quotaStatus.dayQuotaLeft,
  })

  if (!yalidine.canMakeRequest()) {
    console.log('⚠️ Rate limit reached, waiting before next request...')
  }
}

// Cache management examples
async function cacheExamples(yalidine: Yalidine) {
  console.log('\n=== Cache Management Examples ===')

  const database = yalidine.getDatabase()

  // Set custom cache data
  await database.set('custom-key', { data: 'example' }, 3600) // 1 hour TTL

  // Get cached data
  const cachedData = await database.get('custom-key')
  console.log('💾 Cached data:', cachedData)

  // Check if key exists
  const exists = await database.has('custom-key')
  console.log('🔍 Key exists:', exists)

  // Clear all cache
  await yalidine.clearCache()
  console.log('🧹 Cache cleared')
}

// Main example runner
async function runExamples() {
  console.log('🚀 Yalidine SDK Examples\n')

  try {
    // Initialize SDK
    const yalidine = await initializationExamples()

    // Run examples
    await parcelExamples(yalidine)
    await bulkOperationsExamples(yalidine)
    await errorHandlingExamples(yalidine)
    await cacheExamples(yalidine)

    // Cleanup
    await yalidine.destroy()
    console.log('\n✅ Examples completed successfully!')
  } catch (error) {
    console.error('\n❌ Example execution failed:', error)
  }
}

// Export for use in other files
export {
  initializationExamples,
  parcelExamples,
  bulkOperationsExamples,
  errorHandlingExamples,
  cacheExamples,
}

// Run examples if this file is executed directly
// eslint-disable-next-line unicorn/prefer-module
if (require.main === module) {
  runExamples()
}
