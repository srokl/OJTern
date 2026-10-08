import './bun-compat.js';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

app.use(cors());
app.use(express.json());

// --- MongoDB Mongoose Schemas ---
const UserSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['Student', 'IndustryPartner', 'Coordinator', 'Admin'], required: true },
  status: { type: String, enum: ['active', 'inactive', 'pending'], default: 'active' },
  department: String,
  avatarUrl: String,
  createdAt: { type: Date, default: Date.now },
});

const StudentProfileSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  userId: { type: String, required: true },
  studentIdNumber: { type: String, required: true },
  fullName: { type: String, required: true },
  academicProgram: { type: String, enum: ['BSIT', 'BSCS', 'BSCpE', 'BSIS'], required: true },
  yearLevel: { type: String, default: '3rd Year' },
  requiredHours: { type: Number, default: 486 },
  completedHours: { type: Number, default: 0 },
  technicalSkills: [String],
  interests: [String],
  preferredLocation: String,
  bio: String,
  phone: String,
  email: String,
  updatedAt: { type: Date, default: Date.now },
});

const CompanyProfileSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  userId: { type: String, required: true },
  companyName: { type: String, required: true },
  industryType: String,
  officeAddress: String,
  location: String,
  contactPerson: String,
  contactEmail: String,
  contactPhone: String,
  website: String,
  verificationStatus: { type: String, enum: ['Verified', 'Pending', 'Rejected'], default: 'Pending' },
  description: String,
  slotsOffered: { type: Number, default: 5 },
  logoUrl: String,
});

const InternshipPostingSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  companyId: { type: String, required: true },
  companyName: { type: String, required: true },
  companyLocation: String,
  title: { type: String, required: true },
  department: String,
  slots: { type: Number, required: true },
  filledSlots: { type: Number, default: 0 },
  requiredProgram: { type: String, default: 'Any IT' },
  requiredSkills: [String],
  location: String,
  isRemote: { type: Boolean, default: false },
  stipend: String,
  description: String,
  responsibilities: [String],
  status: { type: String, enum: ['Open', 'Closed'], default: 'Open' },
  createdAt: { type: Date, default: Date.now },
});

const ApplicationSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  postingId: { type: String, required: true },
  postingTitle: { type: String, required: true },
  companyId: { type: String, required: true },
  companyName: { type: String, required: true },
  studentId: { type: String, required: true },
  studentProfile: Object,
  endorsementDocument: {
    _id: String,
    fileName: String,
    fileSize: String,
    fileType: String,
    uploadDate: String,
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Returned for Correction', 'Accepted', 'Partner Rejected'],
    default: 'Pending',
  },
  matchScore: Number,
  matchBreakdown: Object,
  submissionDate: { type: Date, default: Date.now },
  reviewedDate: Date,
  reviewedByCoordinatorName: String,
  coordinatorRemarks: String,
  partnerDecisionDate: Date,
  partnerRemarks: String,
});

const NotificationSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  userId: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, default: 'info' },
  dateSent: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false },
  relatedEntityId: String,
});

export const UserModel = mongoose.model('User', UserSchema);
export const StudentProfileModel = mongoose.model('StudentProfile', StudentProfileSchema);
export const CompanyProfileModel = mongoose.model('CompanyProfile', CompanyProfileSchema);
export const InternshipPostingModel = mongoose.model('InternshipPosting', InternshipPostingSchema);
export const ApplicationModel = mongoose.model('Application', ApplicationSchema);
export const NotificationModel = mongoose.model('Notification', NotificationSchema);

// --- REST API Endpoints ---

// Health & Status
app.get('/api/health', (req, res) => {
  const isConnected = mongoose.connection.readyState === 1;
  res.json({
    status: isConnected ? 'Connected' : 'Connecting',
    database: 'MongoDB Atlas',
    host: mongoose.connection.host || 'MongoDB Atlas',
    readyState: mongoose.connection.readyState,
  });
});

// Authentication
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email address is required.' });
    }
    const user = await UserModel.findOne({ email: new RegExp(`^${email}$`, 'i') });
    if (!user) {
      return res.status(404).json({ error: 'No account found with this email address.' });
    }
    if (user.status === 'inactive') {
      return res.status(403).json({ error: 'This account has been deactivated by the administrator.' });
    }
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, role, academicProgram, companyName, industryType } = req.body;
    if (!name || !email || !role) {
      return res.status(400).json({ error: 'Name, email, and role are required.' });
    }
    const existing = await UserModel.findOne({ email: new RegExp(`^${email}$`, 'i') });
    if (existing) {
      return res.status(400).json({ error: 'An account with this email address already exists.' });
    }

    const newUser = new UserModel({
      _id: `usr-${Date.now()}`,
      name,
      email,
      role,
      status: 'active',
      createdAt: new Date(),
      avatarUrl: role === 'Student' 
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    });
    await newUser.save();

    if (role === 'Student') {
      const studentProfile = new StudentProfileModel({
        _id: `prof-${Date.now()}`,
        userId: newUser._id,
        studentIdNumber: `2026-${Math.floor(10000 + Math.random() * 90000)}`,
        fullName: name,
        academicProgram: academicProgram || 'BSIT',
        yearLevel: '3rd Year',
        requiredHours: 486,
        completedHours: 0,
        technicalSkills: ['React', 'JavaScript', 'SQL', 'Git'],
        interests: ['Web Development', 'Software Engineering'],
        preferredLocation: 'Davao City',
        bio: 'OJT Intern candidate',
        email: email,
        updatedAt: new Date(),
      });
      await studentProfile.save();
    } else if (role === 'IndustryPartner') {
      const companyProfile = new CompanyProfileModel({
        _id: `comp-${Date.now()}`,
        userId: newUser._id,
        companyName: companyName || `${name}'s Company`,
        industryType: industryType || 'Technology',
        officeAddress: 'Davao City, Philippines',
        location: 'Davao City',
        contactPerson: name,
        contactEmail: email,
        verificationStatus: 'Pending',
        description: 'Partner enterprise offering student internships.',
        slotsOffered: 5,
      });
      await companyProfile.save();
    }

    // Welcome Notification
    const notif = new NotificationModel({
      _id: `notif-${Date.now()}`,
      userId: newUser._id,
      title: 'Welcome to OJTern Portal!',
      message: `Your ${role === 'Student' ? 'OJT candidate profile' : 'industry partner account'} has been successfully registered.`,
      type: 'success',
      dateSent: new Date(),
      isRead: false,
    });
    await notif.save();

    res.status(201).json({ success: true, user: newUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Users
app.get('/api/users', async (req, res) => {
  try {
    const users = await UserModel.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const user = new UserModel(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/users/:id/status', async (req, res) => {
  try {
    const user = await UserModel.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/users/:id/role', async (req, res) => {
  try {
    const user = await UserModel.findByIdAndUpdate(
      req.params.id,
      { role: req.body.role },
      { new: true }
    );
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Student Profiles
app.get('/api/student-profiles', async (req, res) => {
  try {
    const profiles = await StudentProfileModel.find();
    res.json(profiles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/student-profiles', async (req, res) => {
  try {
    const profile = await StudentProfileModel.findByIdAndUpdate(
      req.body._id,
      req.body,
      { upsert: true, new: true }
    );
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Company Profiles
app.get('/api/company-profiles', async (req, res) => {
  try {
    const profiles = await CompanyProfileModel.find();
    res.json(profiles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Internship Postings
app.get('/api/postings', async (req, res) => {
  try {
    const postings = await InternshipPostingModel.find().sort({ createdAt: -1 });
    res.json(postings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/postings', async (req, res) => {
  try {
    const posting = new InternshipPostingModel(req.body);
    await posting.save();
    res.status(201).json(posting);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Applications
app.get('/api/applications', async (req, res) => {
  try {
    const apps = await ApplicationModel.find().sort({ submissionDate: -1 });
    res.json(apps);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/applications', async (req, res) => {
  try {
    // BR-01 Verification on Server
    if (!req.body.endorsementDocument || !req.body.endorsementDocument.fileName) {
      return res.status(400).json({
        error: 'BR-01 Business Rule Violation: Mandatory endorsement document is required.',
      });
    }
    const appDoc = new ApplicationModel(req.body);
    await appDoc.save();
    res.status(201).json(appDoc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/applications/:id/status', async (req, res) => {
  try {
    const updated = await ApplicationModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Notifications
app.get('/api/notifications', async (req, res) => {
  try {
    const notifs = await NotificationModel.find().sort({ dateSent: -1 });
    res.json(notifs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Connect to MongoDB Atlas and start server
if (MONGODB_URI) {
  mongoose
    .connect(MONGODB_URI)
    .then(() => {
      console.log('[MongoDB] Connected successfully to Atlas cluster');
      app.listen(PORT, () => {
        console.log(`[Express API] Server listening on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error('[MongoDB] Connection error:', err.message);
      app.listen(PORT, () => {
        console.log(`[Express API] Running in fallback mode on port ${PORT}`);
      });
    });
} else {
  console.warn('[MongoDB] MONGODB_URI is not set. Running in fallback mode.');
  app.listen(PORT, () => {
    console.log(`[Express API] Running in fallback mode on port ${PORT}`);
  });
}

export default app;
