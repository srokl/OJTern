import type { IncomingMessage, ServerResponse } from 'node:http'
import { connectToDatabase, getCollection } from './db'

// Helper to parse JSON body
function parseBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', chunk => {
      body += chunk.toString()
    })
    req.on('end', () => {
      if (!body) return resolve({})
      try {
        resolve(JSON.parse(body))
      } catch (err) {
        reject(err)
      }
    })
    req.on('error', reject)
  })
}

function sendJson(res: ServerResponse, status: number, data: any) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(data))
}

export async function handleApiRequest(req: IncomingMessage, res: ServerResponse): Promise<boolean> {
  const url = req.url || ''
  if (!url.startsWith('/api/')) return false

  const [pathWithQuery] = url.split('?')
  const path = pathWithQuery.replace(/^\/api/, '')
  const method = req.method?.toUpperCase() || 'GET'

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (method === 'OPTIONS') {
    res.statusCode = 204
    res.end()
    return true
  }

  try {
    // 1. Health check
    if (path === '/health') {
      try {
        const db = await connectToDatabase()
        const collections = await db.listCollections().toArray()
        sendJson(res, 200, {
          status: 'connected',
          database: db.databaseName,
          collections: collections.map(c => c.name),
        })
      } catch (err: any) {
        sendJson(res, 500, { status: 'error', message: err.message })
      }
      return true
    }

    // 2. Applications collection
    if (path === '/applications' || path.startsWith('/applications/')) {
      const col = await getCollection('applications')
      const idMatch = path.match(/^\/applications\/([^\/]+)$/)

      if (method === 'GET') {
        const items = await col.find({}).sort({ createdAt: -1 }).toArray()
        // Map _id to id if not present
        const mapped = items.map(item => ({
          ...item,
          id: item.id || item._id.toString(),
        }))
        sendJson(res, 200, mapped)
        return true
      }

      if (method === 'POST') {
        const body = await parseBody(req)
        const doc = {
          ...body,
          id: body.id || Date.now(),
          createdAt: new Date().toISOString(),
          status: body.status || 'Pending',
        }
        const result = await col.insertOne(doc)
        sendJson(res, 201, { ...doc, _id: result.insertedId })
        return true
      }

      if (method === 'PATCH' && idMatch) {
        const targetId = isNaN(Number(idMatch[1])) ? idMatch[1] : Number(idMatch[1])
        const body = await parseBody(req)
        await col.updateOne(
          { $or: [{ id: targetId }, { _id: idMatch[1] as any }] },
          { $set: { ...body, updatedAt: new Date().toISOString() } }
        )
        const updated = await col.findOne({ $or: [{ id: targetId }, { _id: idMatch[1] as any }] })
        sendJson(res, 200, updated || { success: true })
        return true
      }

      if (method === 'DELETE' && idMatch) {
        const targetId = isNaN(Number(idMatch[1])) ? idMatch[1] : Number(idMatch[1])
        await col.deleteOne({ $or: [{ id: targetId }, { _id: idMatch[1] as any }] })
        sendJson(res, 200, { success: true })
        return true
      }
    }

    // 3. Postings collection (Partner Portal)
    if (path === '/postings' || path.startsWith('/postings/')) {
      const col = await getCollection('postings')
      const idMatch = path.match(/^\/postings\/([^\/]+)$/)

      if (method === 'GET') {
        const items = await col.find({}).sort({ createdAt: -1 }).toArray()
        const mapped = items.map(item => ({
          ...item,
          id: item.id || item._id.toString(),
        }))
        sendJson(res, 200, mapped)
        return true
      }

      if (method === 'POST') {
        const body = await parseBody(req)
        const doc = {
          ...body,
          id: body.id || Date.now(),
          createdAt: new Date().toISOString(),
          applicants: body.applicants ?? 0,
          filled: body.filled ?? 0,
          status: body.status || 'Active',
          posted: body.posted || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        }
        const result = await col.insertOne(doc)
        sendJson(res, 201, { ...doc, _id: result.insertedId })
        return true
      }

      if (method === 'PATCH' && idMatch) {
        const targetId = isNaN(Number(idMatch[1])) ? idMatch[1] : Number(idMatch[1])
        const body = await parseBody(req)
        await col.updateOne(
          { $or: [{ id: targetId }, { _id: idMatch[1] as any }] },
          { $set: { ...body, updatedAt: new Date().toISOString() } }
        )
        const updated = await col.findOne({ $or: [{ id: targetId }, { _id: idMatch[1] as any }] })
        sendJson(res, 200, updated || { success: true })
        return true
      }

      if (method === 'DELETE' && idMatch) {
        const targetId = isNaN(Number(idMatch[1])) ? idMatch[1] : Number(idMatch[1])
        await col.deleteOne({ $or: [{ id: targetId }, { _id: idMatch[1] as any }] })
        sendJson(res, 200, { success: true })
        return true
      }
    }

    // 4. Users collection (Admin Portal)
    if (path === '/users' || path.startsWith('/users/')) {
      const col = await getCollection('users')
      const idMatch = path.match(/^\/users\/([^\/]+)$/)

      if (method === 'GET') {
        const items = await col.find({}).sort({ createdAt: -1 }).toArray()
        const mapped = items.map(item => ({
          ...item,
          id: item.id || item._id.toString(),
        }))
        sendJson(res, 200, mapped)
        return true
      }

      if (method === 'POST') {
        const body = await parseBody(req)
        const doc = {
          ...body,
          id: body.id || Date.now(),
          status: body.status || 'Active',
          joined: body.joined || new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          lastLogin: body.lastLogin || 'Just now',
          createdAt: new Date().toISOString(),
        }
        const result = await col.insertOne(doc)
        sendJson(res, 201, { ...doc, _id: result.insertedId })
        return true
      }

      if (method === 'PATCH' && idMatch) {
        const targetId = isNaN(Number(idMatch[1])) ? idMatch[1] : Number(idMatch[1])
        const body = await parseBody(req)
        await col.updateOne(
          { $or: [{ id: targetId }, { _id: idMatch[1] as any }] },
          { $set: { ...body, updatedAt: new Date().toISOString() } }
        )
        const updated = await col.findOne({ $or: [{ id: targetId }, { _id: idMatch[1] as any }] })
        sendJson(res, 200, updated || { success: true })
        return true
      }

      if (method === 'DELETE' && idMatch) {
        const targetId = isNaN(Number(idMatch[1])) ? idMatch[1] : Number(idMatch[1])
        await col.deleteOne({ $or: [{ id: targetId }, { _id: idMatch[1] as any }] })
        sendJson(res, 200, { success: true })
        return true
      }
    }

    // 5. Internships collection (Student Portal recommendations/browse)
    if (path === '/internships' || path.startsWith('/internships/')) {
      const col = await getCollection('internships')
      const idMatch = path.match(/^\/internships\/([^\/]+)$/)

      if (method === 'GET') {
        const items = await col.find({}).toArray()
        const mapped = items.map(item => ({
          ...item,
          id: item.id || item._id.toString(),
        }))
        sendJson(res, 200, mapped)
        return true
      }

      if (method === 'POST') {
        const body = await parseBody(req)
        const doc = {
          ...body,
          id: body.id || Date.now(),
          createdAt: new Date().toISOString(),
        }
        const result = await col.insertOne(doc)
        sendJson(res, 201, { ...doc, _id: result.insertedId })
        return true
      }

      if (method === 'DELETE' && idMatch) {
        const targetId = isNaN(Number(idMatch[1])) ? idMatch[1] : Number(idMatch[1])
        await col.deleteOne({ $or: [{ id: targetId }, { _id: idMatch[1] as any }] })
        sendJson(res, 200, { success: true })
        return true
      }
    }

    // 6. Seed sample real data into MongoDB
    if (path === '/seed' && method === 'POST') {
      const db = await connectToDatabase()
      
      const appCol = db.collection('applications')
      const postCol = db.collection('postings')
      const userCol = db.collection('users')
      const internCol = db.collection('internships')

      // Clear existing
      await appCol.deleteMany({})
      await postCol.deleteMany({})
      await userCol.deleteMany({})
      await internCol.deleteMany({})

      const sampleInternships = [
        { id: 1, match: 98, company: 'Accenture Philippines', logo: '🔷', title: 'Software Engineering Intern', skills: ['React', 'Node.js', 'TypeScript'], location: 'BGC, Taguig', type: 'Full-time', slots: 3, program: 'BS Computer Science' },
        { id: 2, match: 94, company: 'Globe Telecom', logo: '🌐', title: 'IT Infrastructure Intern', skills: ['Linux', 'Networking', 'AWS'], location: 'Mandaluyong', type: 'Full-time', slots: 2, program: 'BS Information Technology' },
        { id: 3, match: 91, company: 'Jollibee Foods Corp.', logo: '🍔', title: 'Systems Analyst Intern', skills: ['SQL', 'Excel', 'Power BI'], location: 'Ortigas, Pasig', type: 'Hybrid', slots: 4, program: 'BS Computer Science' },
        { id: 4, match: 88, company: 'BDO Unibank', logo: '🏦', title: 'Data Analytics Intern', skills: ['Python', 'Tableau', 'SQL'], location: 'Makati CBD', type: 'On-site', slots: 2, program: 'BS Information Systems' },
        { id: 5, match: 85, company: 'PLDT Enterprise', logo: '📡', title: 'Network Operations Intern', skills: ['Cisco', 'TCP/IP', 'CCNA'], location: 'Makati', type: 'On-site', slots: 1, program: 'BS Computer Engineering' },
      ]

      const sampleApplications = [
        { id: 1, student: 'Maria Reyes', studentId: '2021-00132', program: 'BS Computer Science', year: '3rd Year', company: 'Accenture Philippines', role: 'Software Engineering Intern', date: 'Jan 15, 2025', submitted: 'Feb 10, 2025', status: 'Accepted', urgency: 'High', matchScore: 98, skills: ['React', 'Node.js', 'TypeScript'] },
        { id: 2, student: 'Juan de la Cruz', studentId: '2020-00456', program: 'BS Information Technology', year: '4th Year', company: 'Globe Telecom', role: 'IT Infrastructure Intern', date: 'Jan 20, 2025', submitted: 'Feb 9, 2025', status: 'Approved', urgency: 'High', matchScore: 91, skills: ['Linux', 'Networking', 'AWS'] },
        { id: 3, student: 'Ana Santos', studentId: '2021-00789', program: 'BS Computer Engineering', year: '3rd Year', company: 'PLDT Enterprise', role: 'Network Operations Intern', date: 'Feb 5, 2025', submitted: 'Feb 8, 2025', status: 'Pending', urgency: 'Normal', matchScore: 85, skills: ['Cisco', 'TCP/IP'] },
        { id: 4, student: 'Carlo Bautista', studentId: '2021-00234', program: 'BS Information Systems', year: '3rd Year', company: 'BDO Unibank', role: 'Data Analytics Intern', date: 'Feb 2, 2025', submitted: 'Feb 7, 2025', status: 'Pending', urgency: 'Low', matchScore: 88, skills: ['Python', 'SQL', 'Tableau'] },
      ]

      const samplePostings = [
        { id: 1, title: 'Software Engineering Intern', slots: 3, filled: 1, programs: ['BS Computer Science'], skills: ['React', 'Node.js', 'TypeScript'], status: 'Active', applicants: 12, posted: 'Jan 20, 2025' },
        { id: 2, title: 'Data Analytics Intern', slots: 2, filled: 0, programs: ['BS Information Systems', 'BS Computer Science'], skills: ['Python', 'SQL', 'Tableau'], status: 'Active', applicants: 8, posted: 'Feb 1, 2025' },
        { id: 3, title: 'Cloud Infrastructure Intern', slots: 2, filled: 2, programs: ['BS Computer Engineering', 'BS IT'], skills: ['AWS', 'Linux', 'Networking'], status: 'Filled', applicants: 15, posted: 'Jan 10, 2025' },
      ]

      const sampleUsers = [
        { id: 1, name: 'Maria Reyes', email: 'maria.reyes@pup.edu.ph', role: 'Student', status: 'Active', joined: 'Aug 2024', lastLogin: '1 hr ago' },
        { id: 2, name: 'Prof. Elena Gomez', email: 'e.gomez@pup.edu.ph', role: 'OJT Coordinator', status: 'Active', joined: 'Jun 2023', lastLogin: '3 hrs ago' },
        { id: 3, name: 'Andrea Cruz', email: 'acruz@accenture.com.ph', role: 'Industry Partner', status: 'Active', joined: 'Jan 2024', lastLogin: '2 days ago' },
        { id: 4, name: 'Dr. Santos', email: 'r.santos@pup.edu.ph', role: 'Administrator', status: 'Active', joined: 'Jan 2022', lastLogin: '5 min ago' },
      ]

      await internCol.insertMany(sampleInternships)
      await appCol.insertMany(sampleApplications)
      await postCol.insertMany(samplePostings)
      await userCol.insertMany(sampleUsers)

      sendJson(res, 200, {
        message: 'Database successfully seeded with MongoDB records',
        counts: {
          internships: sampleInternships.length,
          applications: sampleApplications.length,
          postings: samplePostings.length,
          users: sampleUsers.length,
        }
      })
      return true
    }

    sendJson(res, 404, { error: 'API endpoint not found' })
    return true
  } catch (err: any) {
    console.error(`[API Error] ${method} ${path}:`, err)
    sendJson(res, 500, { error: err.message || 'Internal Server Error' })
    return true
  }
}
