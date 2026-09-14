import { MongoClient, Db } from 'mongodb'
import fs from 'node:fs'
import path from 'node:path'

// Helper to load .env in dev mode if not already loaded into process.env
function loadEnvFile() {
  if (!process.env.MONGODB_URI) {
    try {
      const envPath = path.resolve(process.cwd(), '.env')
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf-8')
        content.split('\n').forEach(line => {
          const trimmed = line.trim()
          if (!trimmed || trimmed.startsWith('#')) return
          const [key, ...values] = trimmed.split('=')
          if (key && values.length > 0) {
            let val = values.join('=').trim()
            if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
              val = val.slice(1, -1)
            }
            if (!process.env[key.trim()]) {
              process.env[key.trim()] = val
            }
          }
        })
      }
    } catch (e) {
      console.error('Failed to load .env file:', e)
    }
  }
}

loadEnvFile()

const uri = process.env.MONGODB_URI || ''
const dbName = process.env.MONGODB_DB_NAME || 'ojtern'

let client: MongoClient | null = null
let db: Db | null = null
let connectionPromise: Promise<Db> | null = null

export async function connectToDatabase(): Promise<Db> {
  if (db) return db
  if (connectionPromise) return connectionPromise

  loadEnvFile()
  const activeUri = process.env.MONGODB_URI || uri

  if (!activeUri) {
    throw new Error('MONGODB_URI is not set in .env or environment')
  }

  connectionPromise = (async () => {
    try {
      client = new MongoClient(activeUri)
      await client.connect()
      db = client.db(process.env.MONGODB_DB_NAME || dbName)
      console.log(`[MongoDB] Connected successfully to database: ${db.databaseName}`)
      return db
    } catch (err) {
      connectionPromise = null
      console.error('[MongoDB] Connection error:', err)
      throw err
    }
  })()

  return connectionPromise
}

export async function getCollection(name: string) {
  const database = await connectToDatabase()
  return database.collection(name)
}
