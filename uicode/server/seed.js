import './bun-compat.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import {
  UserModel,
  StudentProfileModel,
  CompanyProfileModel,
  InternshipPostingModel,
  ApplicationModel,
  NotificationModel,
} from './index.js';
import {
  INITIAL_USERS,
  INITIAL_STUDENT_PROFILES,
  INITIAL_COMPANY_PROFILES,
  INITIAL_POSTINGS,
  INITIAL_APPLICATIONS,
  INITIAL_NOTIFICATIONS,
} from '../src/data/seedData.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://REDACTED_USER:REDACTED_PASSWORD@REDACTED_CLUSTER/ojtern_db?retryWrites=true&w=majority';

async function seed() {
  console.log('[Seed] Connecting to MongoDB Atlas...');
  await mongoose.connect(MONGODB_URI);
  console.log('[Seed] Connected.');

  console.log('[Seed] Seeding Users...');
  for (const u of INITIAL_USERS) {
    await UserModel.findByIdAndUpdate(u._id, u, { upsert: true });
  }

  console.log('[Seed] Seeding Student Profiles...');
  for (const p of INITIAL_STUDENT_PROFILES) {
    await StudentProfileModel.findByIdAndUpdate(p._id, p, { upsert: true });
  }

  console.log('[Seed] Seeding Company Profiles...');
  for (const c of INITIAL_COMPANY_PROFILES) {
    await CompanyProfileModel.findByIdAndUpdate(c._id, c, { upsert: true });
  }

  console.log('[Seed] Seeding Internship Postings...');
  for (const post of INITIAL_POSTINGS) {
    await InternshipPostingModel.findByIdAndUpdate(post._id, post, { upsert: true });
  }

  console.log('[Seed] Seeding Applications...');
  for (const a of INITIAL_APPLICATIONS) {
    await ApplicationModel.findByIdAndUpdate(a._id, a, { upsert: true });
  }

  console.log('[Seed] Seeding Notifications...');
  for (const n of INITIAL_NOTIFICATIONS) {
    await NotificationModel.findByIdAndUpdate(n._id, n, { upsert: true });
  }

  console.log('[Seed] ALL COLLECTIONS SUCCESSFULLY SEEDED TO MONGODB ATLAS!');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('[Seed Error]', err);
  process.exit(1);
});
