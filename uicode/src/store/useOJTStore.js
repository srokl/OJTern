import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  INITIAL_USERS,
  INITIAL_STUDENT_PROFILES,
  INITIAL_COMPANY_PROFILES,
  INITIAL_POSTINGS,
  INITIAL_APPLICATIONS,
  INITIAL_NOTIFICATIONS,
} from '../data/seedData.js';
import { calculateMatchScore } from '../utils/matchingEngine.js';

export const useOJTStore = create(
  persist(
    (set, get) => ({
      currentUser: INITIAL_USERS[0],
      users: INITIAL_USERS,
      currentRole: 'Student',

      studentProfiles: INITIAL_STUDENT_PROFILES,
      companyProfiles: INITIAL_COMPANY_PROFILES,
      postings: INITIAL_POSTINGS,
      applications: INITIAL_APPLICATIONS,
      notifications: INITIAL_NOTIFICATIONS,
      mongoDbStatus: {
        connected: true,
        host: 'MongoDB Atlas',
        database: 'ojtern_db',
      },

      setCurrentUser: (user) => {
        set({ currentUser: user, currentRole: user ? user.role : 'Student' });
      },

      login: (email, password) => {
        const user = get().users.find((u) => u.email.toLowerCase() === email.toLowerCase());
        if (!user) {
          throw new Error('No account found with this email address.');
        }
        if (user.status === 'inactive') {
          throw new Error('This account has been deactivated by the administrator.');
        }
        set({ currentUser: user, currentRole: user.role });
        return user;
      },

      signup: ({ name, email, password, role, academicProgram, companyName, industryType }) => {
        const existing = get().users.find((u) => u.email.toLowerCase() === email.toLowerCase());
        if (existing) {
          throw new Error('An account with this email address already exists.');
        }

        const newUser = {
          _id: `usr-${Date.now()}`,
          name,
          email,
          role,
          status: 'active',
          createdAt: new Date().toISOString(),
          avatarUrl: role === 'Student' 
            ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
            : 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
        };

        const updatedUsers = [...get().users, newUser];

        const welcomeNotif = {
          _id: `notif-${Date.now()}`,
          userId: newUser._id,
          title: 'Welcome to OJTern!',
          message: `Your ${role === 'Student' ? 'OJT candidate profile' : 'industry partner profile'} has been created. Start exploring your dashboard!`,
          type: 'success',
          dateSent: new Date().toISOString(),
          isRead: false,
        };

        if (role === 'Student') {
          const newProfile = {
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
            phone: '',
            email: email,
            updatedAt: new Date().toISOString(),
          };
          set({
            users: updatedUsers,
            studentProfiles: [...get().studentProfiles, newProfile],
            notifications: [welcomeNotif, ...get().notifications],
            currentUser: newUser,
            currentRole: newUser.role,
          });
        } else if (role === 'IndustryPartner') {
          const newCompany = {
            _id: `comp-${Date.now()}`,
            userId: newUser._id,
            companyName: companyName || `${name}'s Company`,
            industryType: industryType || 'Technology',
            officeAddress: 'Davao City, Philippines',
            location: 'Davao City',
            contactPerson: name,
            contactEmail: email,
            contactPhone: '',
            website: '',
            verificationStatus: 'Pending',
            description: 'Partner enterprise offering student internships.',
            slotsOffered: 5,
          };
          set({
            users: updatedUsers,
            companyProfiles: [...get().companyProfiles, newCompany],
            notifications: [welcomeNotif, ...get().notifications],
            currentUser: newUser,
            currentRole: newUser.role,
          });
        } else {
          set({
            users: updatedUsers,
            notifications: [welcomeNotif, ...get().notifications],
            currentUser: newUser,
            currentRole: newUser.role,
          });
        }

        return newUser;
      },

      logout: () => {
        set({ currentUser: null });
      },

      switchRole: (role) => {
        const matchingUser = get().users.find((u) => u.role === role) || {
          _id: `mock-${role.toLowerCase()}`,
          name: `${role} Demo User`,
          email: `${role.toLowerCase()}@university.edu.ph`,
          role,
          status: 'active',
          createdAt: new Date().toISOString(),
        };
        set({ currentUser: matchingUser, currentRole: role });
      },

      // --- Student Domain (FR-01, FR-05, FR-06, BR-01) ---
      getStudentProfile: (userId) => {
        return get().studentProfiles.find((p) => p.userId === userId);
      },

      updateStudentProfile: (profileData) => {
        const profiles = get().studentProfiles;
        const existingIndex = profiles.findIndex((p) => p.userId === profileData.userId);
        const now = new Date().toISOString();

        let updated;
        if (existingIndex >= 0) {
          updated = {
            ...profiles[existingIndex],
            ...profileData,
            updatedAt: now,
          };
          const newProfiles = [...profiles];
          newProfiles[existingIndex] = updated;
          set({ studentProfiles: newProfiles });
        } else {
          updated = {
            _id: `prof-${Date.now()}`,
            userId: profileData.userId,
            studentIdNumber: profileData.studentIdNumber || '2026-0000',
            fullName: profileData.fullName || 'Student Name',
            academicProgram: profileData.academicProgram || 'BSIT',
            yearLevel: profileData.yearLevel || '3rd Year',
            requiredHours: profileData.requiredHours || 486,
            completedHours: 0,
            technicalSkills: profileData.technicalSkills || [],
            interests: profileData.interests || [],
            preferredLocation: profileData.preferredLocation || 'Davao City',
            bio: profileData.bio || '',
            phone: profileData.phone || '',
            email: profileData.email || '',
            updatedAt: now,
          };
          set({ studentProfiles: [...profiles, updated] });
        }
        return updated;
      },

      submitApplication: ({ postingId, studentId, endorsementDocument }) => {
        // BR-01 Enforcement: Mandatory endorsement document
        if (!endorsementDocument || !endorsementDocument.fileName) {
          throw new Error('BR-01 Violation: Mandatory endorsement document is missing. An application cannot be submitted.');
        }

        const posting = get().postings.find((p) => p._id === postingId);
        if (!posting) throw new Error('Internship posting not found.');

        const studentProfile = get().studentProfiles.find((p) => p.userId === studentId);
        if (!studentProfile) throw new Error('Student profile must be created before applying.');

        // Calculate rule-based matching score (FR-04, C-03)
        const matchBreakdown = calculateMatchScore(studentProfile, posting);

        const newApp = {
          _id: `app-${Date.now()}`,
          postingId: posting._id,
          postingTitle: posting.title,
          companyId: posting.companyId,
          companyName: posting.companyName,
          studentId: studentProfile.userId,
          studentProfile,
          endorsementDocument,
          status: 'Pending',
          matchScore: matchBreakdown.totalScore,
          matchBreakdown,
          submissionDate: new Date().toISOString(),
        };

        const newNotif = {
          _id: `notif-${Date.now()}`,
          userId: studentId,
          title: 'Application Submitted',
          message: `Your application for "${posting.title}" at ${posting.companyName} has been submitted for Coordinator verification.`,
          type: 'info',
          dateSent: new Date().toISOString(),
          isRead: false,
          relatedEntityId: newApp._id,
        };

        set({
          applications: [newApp, ...get().applications],
          notifications: [newNotif, ...get().notifications],
        });

        return newApp;
      },

      resubmitApplicationWithDocument: (applicationId, endorsementDocument) => {
        if (!endorsementDocument || !endorsementDocument.fileName) {
          throw new Error('BR-01 Violation: Mandatory endorsement document is missing.');
        }
        const apps = get().applications;
        const appIndex = apps.findIndex((a) => a._id === applicationId);
        if (appIndex === -1) throw new Error('Application not found');

        const updatedApp = {
          ...apps[appIndex],
          endorsementDocument,
          status: 'Pending',
          submissionDate: new Date().toISOString(),
          coordinatorRemarks: 'Re-submitted by student with updated endorsement document.',
        };

        const updatedApps = [...apps];
        updatedApps[appIndex] = updatedApp;

        set({ applications: updatedApps });
        return updatedApp;
      },

      acceptOfferByStudent: (applicationId) => {
        const apps = get().applications;
        const appIndex = apps.findIndex((a) => a._id === applicationId);
        if (appIndex === -1) throw new Error('Application not found');
        const app = apps[appIndex];
        
        const profiles = get().studentProfiles;
        const profIndex = profiles.findIndex(p => p.userId === app.studentId);
        if (profIndex > -1 && profiles[profIndex].companyId) {
          throw new Error('You already have an active placement. You cannot accept multiple offers.');
        }
        
        const updatedApp = {
          ...app,
          status: 'Placement Active',
          studentAcceptanceDate: new Date().toISOString(),
        };
        const updatedApps = [...apps];
        updatedApps[appIndex] = updatedApp;

        let updatedProfiles = profiles;
        if (profIndex > -1) {
          updatedProfiles = [...profiles];
          updatedProfiles[profIndex] = {
            ...profiles[profIndex],
            companyId: app.companyId,
            companyName: app.companyName,
            activePostingId: app.postingId,
          };
        }

        const notif = {
          _id: `notif-${Date.now()}`,
          userId: app.studentId,
          title: 'OJT Placement Finalized!',
          message: `You have successfully accepted the offer from ${app.companyName}. Your OJT is now active!`,
          type: 'success',
          dateSent: new Date().toISOString(),
          isRead: false,
          relatedEntityId: app._id,
        };

        set({
          applications: updatedApps,
          studentProfiles: updatedProfiles,
          notifications: [notif, ...get().notifications],
        });
      },

      declineOfferByStudent: (applicationId) => {
        const apps = get().applications;
        const appIndex = apps.findIndex((a) => a._id === applicationId);
        if (appIndex === -1) throw new Error('Application not found');
        const app = apps[appIndex];
        
        const updatedApp = {
          ...app,
          status: 'Offer Declined',
          studentAcceptanceDate: new Date().toISOString(),
        };
        const updatedApps = [...apps];
        updatedApps[appIndex] = updatedApp;
        set({ applications: updatedApps });
      },

      // --- Partner Domain (FR-02, FR-03, FR-09, BR-03) ---
      getCompanyProfile: (userId) => {
        return get().companyProfiles.find((c) => c.userId === userId);
      },

      updateCompanyProfile: (profileData) => {
        const companies = get().companyProfiles;
        const existingIndex = companies.findIndex((c) => c.userId === profileData.userId);

        let updated;
        if (existingIndex >= 0) {
          updated = { ...companies[existingIndex], ...profileData };
          const newCompanies = [...companies];
          newCompanies[existingIndex] = updated;
          set({ companyProfiles: newCompanies });
        } else {
          updated = {
            _id: `comp-${Date.now()}`,
            userId: profileData.userId,
            companyName: profileData.companyName || 'New Partner Company',
            industryType: profileData.industryType || 'Technology',
            officeAddress: profileData.officeAddress || '',
            location: profileData.location || 'Davao City',
            contactPerson: profileData.contactPerson || '',
            contactEmail: profileData.contactEmail || '',
            contactPhone: profileData.contactPhone || '',
            website: profileData.website || '',
            verificationStatus: 'Pending',
            description: profileData.description || '',
            slotsOffered: profileData.slotsOffered || 5,
          };
          set({ companyProfiles: [...companies, updated] });
        }
        return updated;
      },

      createPosting: (postingData) => {
        const newPosting = {
          ...postingData,
          _id: `post-${Date.now()}`,
          filledSlots: 0,
          status: 'Open',
          createdAt: new Date().toISOString(),
        };

        set({ postings: [newPosting, ...get().postings] });
        return newPosting;
      },

      updatePosting: (postingId, updates) => {
        const updated = get().postings.map((p) =>
          p._id === postingId ? { ...p, ...updates } : p
        );
        set({ postings: updated });
      },

      /**
       * BR-03 CRITICAL BUSINESS RULE:
       * An industry partner may ONLY view applicants who have already been coordinator-approved!
       * Strictly filters out 'Pending' and 'Returned for Correction' applications.
       */
      getScreenedApplicantsForPartner: (companyId) => {
        const allApplications = get().applications;
        return allApplications.filter(
          (app) =>
            app.companyId === companyId &&
            ['Approved', 'Accepted', 'Partner Rejected', 'Placement Active', 'Offer Declined'].includes(app.status)
        );
      },

      decideOnApplicantByPartner: ({ applicationId, decision, remarks }) => {
        const apps = get().applications;
        const appIndex = apps.findIndex((a) => a._id === applicationId);
        if (appIndex === -1) throw new Error('Application not found');

        const app = apps[appIndex];
        const updatedApp = {
          ...app,
          status: decision,
          partnerDecisionDate: new Date().toISOString(),
          partnerRemarks: remarks || (decision === 'Accepted' ? 'Candidate accepted into internship slot.' : 'Candidate rejected.'),
        };

        const updatedApps = [...apps];
        updatedApps[appIndex] = updatedApp;

        // If accepted, increment filled slots
        if (decision === 'Accepted') {
          const updatedPostings = get().postings.map((p) => {
            if (p._id === app.postingId) {
              const newFilled = Math.min(p.slots, p.filledSlots + 1);
              return {
                ...p,
                filledSlots: newFilled,
                status: newFilled >= p.slots ? 'Closed' : p.status,
              };
            }
            return p;
          });
          set({ postings: updatedPostings });
        }

        // Notify Student (FR-10)
        const notif = {
          _id: `notif-${Date.now()}`,
          userId: app.studentId,
          title: decision === 'Accepted' ? 'Offer Received! 🎉' : 'Application Decision',
          message: decision === 'Accepted'
            ? `Congratulations! ${app.companyName} has accepted you for "${app.postingTitle}".`
            : `${app.companyName} has decided not to proceed with your application for "${app.postingTitle}".`,
          type: decision === 'Accepted' ? 'success' : 'error',
          dateSent: new Date().toISOString(),
          isRead: false,
          relatedEntityId: app._id,
        };

        set({
          applications: updatedApps,
          notifications: [notif, ...get().notifications],
        });
      },

      // --- Coordinator Domain (FR-07, FR-08, BR-01, BR-02, FR-12) ---
      getPendingApplicationsForCoordinator: () => {
        return get().applications.filter((a) => a.status === 'Pending');
      },

      updateApplicationStatusByCoordinator: ({
        applicationId,
        newStatus,
        coordinatorRemarks,
      }) => {
        const { currentRole, currentUser } = get();

        // BR-02 Role Check: Must be Coordinator
        if (currentRole !== 'Coordinator') {
          throw new Error('BR-02 Authorization Error: Only a user with the OJT coordinator role may change an application\'s official status.');
        }

        const apps = get().applications;
        const appIndex = apps.findIndex((a) => a._id === applicationId);
        if (appIndex === -1) throw new Error('Application not found');

        const app = apps[appIndex];

        // BR-01 Check: Cannot be marked 'Approved' if endorsement document is missing or corrupted
        if (newStatus === 'Approved') {
          if (!app.endorsementDocument || !app.endorsementDocument.fileName || app.endorsementDocument.isCorrupted) {
            throw new Error('BR-01 Business Rule Violation: An application cannot be marked Approved if the required endorsement document is missing or corrupted.');
          }
        }

        const updatedApp = {
          ...app,
          status: newStatus,
          reviewedDate: new Date().toISOString(),
          reviewedByCoordinatorName: currentUser.name,
          coordinatorRemarks: coordinatorRemarks || '',
        };

        const updatedApps = [...apps];
        updatedApps[appIndex] = updatedApp;

        // Notify Student (FR-10)
        const studentNotif = {
          _id: `notif-stud-${Date.now()}`,
          userId: app.studentId,
          title: `Application ${newStatus}`,
          message:
            newStatus === 'Approved'
              ? `Your application for "${app.postingTitle}" at ${app.companyName} has been approved by the Coordinator and forwarded to the partner.`
              : newStatus === 'Returned for Correction'
              ? `Your application was returned for correction: "${coordinatorRemarks || 'Please update documents'}"`
              : `Your application for "${app.postingTitle}" was rejected: "${coordinatorRemarks || 'Requirements unmet'}"`,
          type: newStatus === 'Approved' ? 'success' : newStatus === 'Returned for Correction' ? 'warning' : 'error',
          dateSent: new Date().toISOString(),
          isRead: false,
          relatedEntityId: app._id,
        };

        // Notify Partner if Approved (FR-11)
        const notificationsToAdd = [studentNotif];
        if (newStatus === 'Approved') {
          const company = get().companyProfiles.find((c) => c._id === app.companyId);
          if (company) {
            const partnerNotif = {
              _id: `notif-part-${Date.now()}`,
              userId: company.userId,
              title: 'New Screened Applicant Ready',
              message: `OJT Coordinator approved applicant ${app.studentProfile.fullName} (${app.studentProfile.academicProgram}, ${app.matchScore}% Match) for your listing "${app.postingTitle}".`,
              type: 'info',
              dateSent: new Date().toISOString(),
              isRead: false,
              relatedEntityId: app._id,
            };
            notificationsToAdd.push(partnerNotif);
          }
        }

        set({
          applications: updatedApps,
          notifications: [...notificationsToAdd, ...get().notifications],
        });

        return updatedApp;
      },

      generatePlacementReportData: (selectedMonth) => {
        const acceptedApps = get().applications.filter((a) => a.status === 'Accepted');

        const companyMap = new Map();
        const programMap = new Map();

        acceptedApps.forEach((app) => {
          companyMap.set(app.companyName, (companyMap.get(app.companyName) || 0) + 1);
          const prog = app.studentProfile.academicProgram;
          programMap.set(prog, (programMap.get(prog) || 0) + 1);
        });

        const byCompany = Array.from(companyMap.entries()).map(([companyName, count]) => ({
          companyName,
          count,
        }));

        const byProgram = Array.from(programMap.entries()).map(([program, count]) => ({
          program,
          count,
        }));

        return {
          byCompany,
          byProgram,
          totalPlacements: acceptedApps.length,
          detailedList: acceptedApps,
        };
      },

      // --- Admin Domain (NFR-02 RBAC & Governance) ---
      getAllUsers: () => {
        return get().users;
      },

      updateUserStatus: (userId, newStatus) => {
        const { currentRole } = get();
        if (currentRole !== 'Admin') {
          throw new Error('NFR-02 Access Violation: Only administrators can modify user status.');
        }

        const updatedUsers = get().users.map((u) =>
          u._id === userId ? { ...u, status: newStatus } : u
        );
        set({ users: updatedUsers });
      },

      assignUserRole: (userId, newRole) => {
        const { currentRole } = get();
        if (currentRole !== 'Admin') {
          throw new Error('NFR-02 Access Violation: Only administrators can assign or revoke roles.');
        }

        const updatedUsers = get().users.map((u) =>
          u._id === userId ? { ...u, role: newRole } : u
        );

        const currentUser = get().currentUser;
        if (currentUser._id === userId) {
          set({ currentUser: { ...currentUser, role: newRole }, currentRole: newRole });
        }

        set({ users: updatedUsers });
      },

      createNewUser: (userData) => {
        const { currentRole } = get();
        if (currentRole !== 'Admin') {
          throw new Error('NFR-02 Access Violation: Only administrators can create users directly.');
        }

        const newUser = {
          ...userData,
          _id: `usr-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };

        set({ users: [...get().users, newUser] });
        return newUser;
      },

      // --- Notifications ---
      getUserNotifications: (userId) => {
        return get().notifications.filter((n) => n.userId === userId);
      },

      markNotificationAsRead: (notificationId) => {
        const updated = get().notifications.map((n) =>
          n._id === notificationId ? { ...n, isRead: true } : n
        );
        set({ notifications: updated });
      },

      markAllNotificationsAsRead: (userId) => {
        const updated = get().notifications.map((n) =>
          n.userId === userId ? { ...n, isRead: true } : n
        );
        set({ notifications: updated });
      },

      resetToDefaultData: () => {
        set({
          users: INITIAL_USERS,
          currentUser: INITIAL_USERS[0],
          currentRole: 'Student',
          studentProfiles: INITIAL_STUDENT_PROFILES,
          companyProfiles: INITIAL_COMPANY_PROFILES,
          postings: INITIAL_POSTINGS,
          applications: INITIAL_APPLICATIONS,
          notifications: INITIAL_NOTIFICATIONS,
        });
      },
    }),
    {
      name: 'ojtern-mongodb-store-v2',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
