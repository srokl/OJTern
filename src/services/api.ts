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
  correctionNote?: string
  endorsementFileName?: string
  endorsementDocumentId?: string
  endorsementDocumentUrl?: string
  hasEndorsementDocument?: boolean
  dateReviewed?: string
  reviewedBy?: string
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
  location?: string
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
  filled?: number
  program: string
  deadline?: string
  requirements?: string[]
}

export interface StudentSkill {
  id: string
  name: string
  category?: string
}

export interface StudentProfile {
  _id?: string
  id: string
  studentId: string
  name: string
  email: string
  program: string
  year: string
  university?: string
  interests: string
  preferredLocation: string
  skills: string[]
  updatedAt?: string
}

export interface EndorsementDocument {
  _id?: string
  id: string
  studentId: string
  fileName: string
  fileSize: number
  fileType: string
  documentUrl: string
  signedUrl: string
  uploadedAt: string
  status: 'Verified' | 'PendingReview'
}

export interface SystemNotification {
  id: string
  applicationId?: number | string
  recipientUserId: string
  recipientEmail?: string
  type: 'ApplicationApproved' | 'ApplicationRejected' | 'CorrectionRequired' | 'General'
  title: string
  message: string
  emailSent: boolean
  smtpLog?: {
    host: string
    port: number
    from: string
    to: string
    subject: string
    sentAt: string
    messageId: string
  }
  createdAt: string
  read: boolean
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

  // Student Workflow: Email Check
  async checkEmail(email: string): Promise<{ exists: boolean }> {
    const res = await fetch('/api/users/check-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    if (!res.ok) throw new Error('Failed to verify email')
    return res.json()
  },

  // Student Workflow: Student Profile & Skills
  async getStudentProfile(studentId: string): Promise<StudentProfile | null> {
    const res = await fetch(`/api/student-profile/${encodeURIComponent(studentId)}`)
    if (!res.ok) {
      if (res.status === 404) return null
      throw new Error('Failed to fetch student profile')
    }
    return res.json()
  },

  async saveStudentProfile(profile: Partial<StudentProfile>): Promise<StudentProfile> {
    const res = await fetch('/api/student-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    })
    if (!res.ok) throw new Error('Failed to save student profile')
    return res.json()
  },

  // Student Workflow: Endorsement Document Upload with Cloud Storage Signed URL
  async uploadEndorsementDocument(data: {
    studentId: string
    fileName: string
    fileSize: number
    fileType: string
  }): Promise<EndorsementDocument> {
    const res = await fetch('/api/documents/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.message || 'Document upload failed')
    }
    return res.json()
  },

  // Coordinator Workflow: Login & Role Verification (NFR-01, NFR-02)
  async coordinatorLogin(credentials: { email: string; password?: string }): Promise<{
    token: string
    user: UserItem
  }> {
    const res = await fetch('/api/auth/coordinator-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      const error: any = new Error(err.message || 'Coordinator authentication failed')
      error.status = res.status
      throw error
    }
    return res.json()
  },

  // Coordinator Workflow: Review Application with BR-01 & BR-02 Audit
  async reviewApplication(
    id: number | string,
    reviewData: {
      status: 'Approved' | 'Rejected' | 'Returned for Correction'
      note?: string
      reviewedBy: string
      token?: string
    }
  ): Promise<Application> {
    const res = await fetch(`/api/applications/${id}/review`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(reviewData.token ? { Authorization: `Bearer ${reviewData.token}` } : {}),
      },
      body: JSON.stringify(reviewData),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.message || 'Failed to review application')
    }
    return res.json()
  },

  // Coordinator & Student Notification Management (FR-10, FR-11)
  async getNotifications(userId?: string): Promise<SystemNotification[]> {
    const url = userId ? `/api/notifications?userId=${encodeURIComponent(userId)}` : '/api/notifications'
    const res = await fetch(url)
    if (!res.ok) throw new Error('Failed to fetch notifications')
    return res.json()
  },

  async createNotification(notif: Partial<SystemNotification>): Promise<SystemNotification> {
    const res = await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notif),
    })
    if (!res.ok) throw new Error('Failed to create notification')
    return res.json()
  },
}
