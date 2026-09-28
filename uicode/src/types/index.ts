export type UserRole = 'Student' | 'IndustryPartner' | 'Coordinator' | 'Admin';

export type UserStatus = 'active' | 'inactive' | 'pending';

export type AcademicProgram = 'BSIT' | 'BSCS' | 'BSCpE' | 'BSIS';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  avatarUrl?: string;
  department?: string;
}

export interface StudentProfile {
  _id: string;
  userId: string;
  studentIdNumber: string;
  fullName: string;
  academicProgram: AcademicProgram;
  yearLevel: '3rd Year' | '4th Year';
  requiredHours: number;
  completedHours: number;
  technicalSkills: string[];
  interests: string[];
  preferredLocation: string;
  bio: string;
  phone: string;
  email: string;
  updatedAt: string;
}

export interface CompanyProfile {
  _id: string;
  userId: string;
  companyName: string;
  industryType: string;
  officeAddress: string;
  location: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  website: string;
  verificationStatus: 'Verified' | 'Pending' | 'Rejected';
  description: string;
  slotsOffered: number;
  logoUrl?: string;
}

export interface InternshipPosting {
  _id: string;
  companyId: string;
  companyName: string;
  companyLocation: string;
  title: string;
  department: string;
  slots: number;
  filledSlots: number;
  requiredProgram: AcademicProgram | 'Any IT';
  requiredSkills: string[];
  location: string;
  isRemote: boolean;
  stipend: string;
  description: string;
  responsibilities: string[];
  status: 'Open' | 'Closed';
  createdAt: string;
}

export interface EndorsementDocument {
  _id: string;
  fileName: string;
  fileSize: string;
  fileType: string;
  fileDataUrl?: string; // Data URL or base64 or mockup preview
  uploadDate: string;
  isCorrupted?: boolean;
}

export type ApplicationStatus = 
  | 'Pending' 
  | 'Approved' 
  | 'Rejected' 
  | 'Returned for Correction' 
  | 'Accepted' 
  | 'Partner Rejected';

export interface MatchBreakdown {
  programScore: number;
  locationScore: number;
  skillsScore: number;
  totalScore: number;
  matchedSkills: string[];
  missingSkills: string[];
}

export interface Application {
  _id: string;
  postingId: string;
  postingTitle: string;
  companyId: string;
  companyName: string;
  studentId: string;
  studentProfile: StudentProfile;
  endorsementDocument: EndorsementDocument;
  status: ApplicationStatus;
  matchScore: number;
  matchBreakdown: MatchBreakdown;
  submissionDate: string;
  reviewedDate?: string;
  reviewedByCoordinatorName?: string;
  coordinatorRemarks?: string;
  partnerDecisionDate?: string;
  partnerRemarks?: string;
}

export interface Notification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  dateSent: string;
  isRead: boolean;
  relatedEntityId?: string;
}

export interface PlacementRecord {
  companyName: string;
  program: AcademicProgram;
  studentName: string;
  placementDate: string;
}

export interface TraceabilityItem {
  id: string;
  requirement: string;
  businessRule: string;
  implementationLocation: string;
  status: 'Passed' | 'Active';
  description: string;
}
