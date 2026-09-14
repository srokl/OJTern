// Frontend API client for interacting with MongoDB backend endpoints

export interface Application {
  _id?: string
  id: number | string
  student: string
  studentId: string
  program: string
  year: string
  company: string
  role: string
  date?: string
  submitted?: string
  status: 'Pending' | 'Approved' | 'Returned for Correction' | 'Accepted' | 'Rejected'
  urgency?: 'High' | 'Normal' | 'Low'
  matchScore?: number
  skills?: string[]
}

export interface Posting {
  _id?: string
  id: number | string
  title: string
  slots: number | string
  filled: number
  programs: string[]
  skills: string[]
  status: 'Active' | 'Filled' | 'Draft' | string
  applicants: number
  posted: string
}

export interface UserItem {
  _id?: string
  id: number | string
  name: string
  email: string
  role: 'Student' | 'OJT Coordinator' | 'Industry Partner' | 'Administrator'
  status: 'Active' | 'Inactive'
  joined: string
  lastLogin: string
}

export interface Internship {
  _id?: string
  id: number | string
  match: number
  company: string
  logo: string
  title: string
  skills: string[]
  location: string
  type: string
  slots: number
  program: string
}

export const api = {
  async getHealth() {
    const res = await fetch('/api/health')
    if (!res.ok) throw new Error('Health check failed')
    return res.json()
  },

  // Applications
  async getApplications(): Promise<Application[]> {
    const res = await fetch('/api/applications')
    if (!res.ok) throw new Error('Failed to fetch applications')
    return res.json()
  },

  async createApplication(data: Partial<Application>): Promise<Application> {
    const res = await fetch('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Failed to create application')
    return res.json()
  },

  async updateApplication(id: number | string, updates: Partial<Application>): Promise<Application> {
    const res = await fetch(`/api/applications/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    if (!res.ok) throw new Error('Failed to update application')
    return res.json()
  },

  async deleteApplication(id: number | string) {
    const res = await fetch(`/api/applications/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Failed to delete application')
    return res.json()
  },

  // Postings
  async getPostings(): Promise<Posting[]> {
    const res = await fetch('/api/postings')
    if (!res.ok) throw new Error('Failed to fetch postings')
    return res.json()
  },

  async createPosting(data: Partial<Posting>): Promise<Posting> {
    const res = await fetch('/api/postings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Failed to create posting')
    return res.json()
  },

  async updatePosting(id: number | string, updates: Partial<Posting>): Promise<Posting> {
    const res = await fetch(`/api/postings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    if (!res.ok) throw new Error('Failed to update posting')
    return res.json()
  },

  async deletePosting(id: number | string) {
    const res = await fetch(`/api/postings/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Failed to delete posting')
    return res.json()
  },

  // Users
  async getUsers(): Promise<UserItem[]> {
    const res = await fetch('/api/users')
    if (!res.ok) throw new Error('Failed to fetch users')
    return res.json()
  },

  async createUser(data: Partial<UserItem>): Promise<UserItem> {
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Failed to create user')
    return res.json()
  },

  async updateUser(id: number | string, updates: Partial<UserItem>): Promise<UserItem> {
    const res = await fetch(`/api/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    if (!res.ok) throw new Error('Failed to update user')
    return res.json()
  },

  async deleteUser(id: number | string) {
    const res = await fetch(`/api/users/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Failed to delete user')
    return res.json()
  },

  // Internships
  async getInternships(): Promise<Internship[]> {
    const res = await fetch('/api/internships')
    if (!res.ok) throw new Error('Failed to fetch internships')
    return res.json()
  },

  async createInternship(data: Partial<Internship>): Promise<Internship> {
    const res = await fetch('/api/internships', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Failed to create internship')
    return res.json()
  },

  // Seed
  async seedDatabase() {
    const res = await fetch('/api/seed', { method: 'POST' })
    if (!res.ok) throw new Error('Failed to seed database')
    return res.json()
  },
}
