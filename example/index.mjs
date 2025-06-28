import { Yalidine, YalidineMemoryDatabase } from 'yalidine'

const yalidine = new Yalidine({
  agent: 'yalidine', // or 'goupex'
  auth: {
    id: process.env.YALIDINE_ID,
    token: process.env.YALIDINE_TOKEN,
  },
  database: new YalidineMemoryDatabase(), // In-memory caching
  debug: true, // Enable debug logging
})

async function run() {
  await yalidine.init()
  console.log('✅ SDK initialized successfully')

  // Test connection
  const isConnected = await yalidine.testConnection()
  console.log('🔄 Connection test result:', isConnected)

  // Test parcel creation
  // const parcels = await yalidine.parcels.createBulk([
  //   {
  //     tracking: '1234567890',
  //     name: 'Test Parcel',
  //     description: 'This is a test parcel',
  //   },
  // ])

  const parcels = await yalidine.parcels.list()
  console.log('🎁 Parcel list:', parcels)

  // Test get parcel by tracking number
  const tracking = parcels.data[0].tracking
  const parcel = await yalidine.parcels.find(tracking)
  console.log('🎁 Parcel:', parcel)

  // Test histories
  const histories = await yalidine.histories.find(tracking)
  console.log('🎁 Histories:', histories)

  // Test histories by status
  const historiesByStatus = await yalidine.histories.byStatus('Livré')
  console.log('🎁 Histories by status:', historiesByStatus)
}

run()
