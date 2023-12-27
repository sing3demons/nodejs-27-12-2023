const { MongoClient } = require('mongodb')

const uri = 'mongodb://localhost:27017' // Replace with your MongoDB URI
const client = new MongoClient(uri, { useUnifiedTopology: true })

async function connectToDB() {
  try {
    await client.connect()
    console.log('Connected to MongoDB')
  } catch (error) {
    console.error('Error connecting to MongoDB:', error)
  }
}

connectToDB()
