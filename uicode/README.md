# OJTern: Smart Web-Based OJT Matching Platform & Recommendation System

> **Team DUTERTECH — BSIT Software Engineering (ITPD4)**  
> **Course Instructor:** Prof. Mohamed Mogib Elkordy  
> **Default Database / Tech Stack:** MongoDB Document-Based Schema, React 19, Vite, Tailwind CSS v4, Zustand.

---

## 🌟 Overview & System Purpose

**OJTern** is a smart, web-based On-the-Job Training (OJT) matching platform engineered to resolve delayed placements, mismatched assignments, and manual spreadsheet coordination. The platform incorporates a **rule-based recommendation engine** that matches student qualifications with industry requirements, enforces strict **gatekeeper document verification** by university coordinators, and provides executive governance and institutional placement analytics.

---

## 🚀 Key Stakeholder Portals

### 1. 🎓 OJT Student Portal
- **Profile Creation (`FR-01`, `NFR-04`):** Academic Program (BSIT, BSCS, BSCpE, BSIS), technical skills checklist, career interests, and preferred work location. Form validation blocks saving if required fields are missing.
- **Rule-Based Recommendation Engine (`FR-04`, `C-03`):** Strictly non-ML deterministic matching algorithm based on predefined weights:
  $$\text{Match Score} = \text{Academic Program (40\%)} + \text{Location (20\%)} + \text{Skill Intersection (40\%)}$$
- **Application Submission (`FR-05`, `FR-06`, `BR-01`):** "Submit Application" button is **disabled and grayed out** until an official endorsement document is attached.
- **Status Tracking (`FR-10`):** Real-time status progression (`Pending` → `Approved` → `Accepted` or `Returned for Correction`). Includes resubmission flow if coordinator requests revisions.

### 2. 🏢 Industry Partner Portal
- **Company Profile (`FR-02`):** Enterprise profile management, verification badge, and office location.
- **Job Posting Form (`FR-03`):** Define internship opportunities with explicit numerical capacity (slots), target academic program, location, stipend, and a reusable tag-input component for required technical skills.
- **Strictly Filtered Applicant Screening (`FR-09`, `BR-03`):**
  > **BR-03 Enforced:** Partners **strictly cannot see raw unapproved applications**. The applicant screening view applies a hardcoded filter `status === 'Approved'` (and partner decisions), ensuring only coordinator-verified students appear.
- **Split-Pane Screening Layout:** Left pane displays the candidate list with match scores; right pane embeds a side-by-side profile and endorsement document preview.
- **Decision Panel:** Official "Accept" and "Decline" actions with confirmation modals. Acceptance decrements available slot capacity and triggers student notification.

### 3. 🛡️ OJT Coordinator Portal (The Gatekeeper)
- **Review Queue (`FR-07`):** Filterable, sortable queue of pending applications.
- **Side-by-Side Review & Document Viewer (`FR-07`, `BR-01`, `BR-02`):** Side-by-side embedded preview panel displaying student qualifications alongside the uploaded endorsement document. Monospaced typography for tabular data (dates, student IDs).
- **Approval Controls:** "Approve & Forward", "Return for Correction", and "Reject" buttons.
  > **BR-01 Enforced:** "Approve" button is disabled if the endorsement document is missing or corrupted.  
  > **BR-02 Enforced:** Approval actions strictly check the user's role to ensure `role === 'Coordinator'`.
- **Placement Reporting (`FR-12`):** Monthly placement reports grouped by company and academic program for any selected period, visualized with Recharts bar and pie distribution charts.

### 4. 🏛️ School Administrator Portal
- **Distinct Visual Theme:** Styled in deep slate (`bg-slate-900`) to visually separate executive governance from student/coordinator workspaces.
- **System Health & Metrics Banner:** Displays real-time metrics (Total Students, Active Verified Partners, Pending Coordinator Approvals System-Wide, Total Placements).
- **User Management Table (`NFR-02 RBAC`):** Full table with search, role filters, status toggles, and role reassignment.
- **Destructive Action Safety:** Deactivating an account requires typed `"DEACTIVATE"` text confirmation in a modal.
- **Strict Route Protection:** Protected by an Admin role guard.

---

## 📋 Implementation Verification & System Traceability Matrix

| ID | Requirement | Business Rule | Implementation Location | Verification Status |
|:---|:---|:---|:---|:---|
| **FR-01** | Student Profile Creation | N/A | `StudentDashboard.tsx` (`ProfileBuilder`) | Validation blocks submit if required fields are missing. |
| **FR-04** | Rule-Based Matching | `C-03` (Non-ML) | `StudentDashboard.tsx` & `matchingEngine.ts` | Calculates percentage score from Program (40%), Location (20%), and Skill intersection (40%). |
| **FR-05, FR-06** | Application Submission | `BR-01` (Mandatory Endorsement) | `useOJTStore.ts` & `StudentDashboard.tsx` | "Submit Application" button disabled until endorsement document is attached. |
| **FR-07, FR-08** | Coordinator Review | `BR-02` (Coordinator Only) | `CoordinatorDashboard.tsx` & `useOJTStore.ts` | Throws authorization error if `role !== 'Coordinator'`. Side-by-side embedded preview provided. |
| **FR-09** | Partner Screening | `BR-03` (Approved Only) | `PartnerDashboard.tsx` (`screenedApplicants`) | Hardcoded query filter `status === 'Approved'` prevents unapproved candidate visibility. |
| **FR-12** | Placement Reports | N/A | `CoordinatorDashboard.tsx` (`reports view`) | Aggregates placement counts grouped by company and academic program for a selected month. |
| **Account Governance** | RBAC Governance | `NFR-02` (RBAC) | `AdminDashboard.tsx` & `useOJTStore.ts` | Protected by Admin role guard. Requires typed `"DEACTIVATE"` text confirmation for destructive account modifications. |

---

## 🗄️ MongoDB Document Store Schema (Emulated & Persisted)

The application simulates the MongoDB document model using JSON/BSON structures stored via Zustand persistence in `localStorage`:

1. `db.users`: User accounts, emails, roles (`Student`, `IndustryPartner`, `Coordinator`, `Admin`), statuses.
2. `db.student_profiles`: Academic degree, year level, required hours, technical skills array, preferred location, bio.
3. `db.company_profiles`: Company identity, industry type, office address, contact details, verification status.
4. `db.internship_postings`: Open slots, department, capacity, target program, required skills array, stipend.
5. `db.applications`: Links student profile to posting with match score breakdown, attached endorsement document, coordinator status, and partner decision.
6. `db.notifications`: In-system notifications dispatched on status transitions.

An interactive **MongoDB Document Explorer** is embedded directly in the application navbar under **"MongoDB Docs"** to inspect live collections in real time.

---

## 🛠️ Getting Started & Running Locally

### Prerequisites
- Node.js (v18+ or v20+)
- npm

### Installation & Run
```bash
# Navigate to uicode directory
cd uicode

# Install dependencies
npm install

# Start Vite development server
npm run dev

# Or build for production
npm run build
```

Open `http://localhost:5173` (or the port specified by Vite) in your browser.

---

## 👥 Instant Persona Switching

The app features a **Floating Stakeholder Bar** at the bottom of the screen allowing instant switching between test accounts:
- **Student:** Rico Gervero (BSIT, 3rd Year)
- **Partner:** TechCorp Solutions Philippines
- **Coordinator:** Prof. Mohamed Mogib Elkordy
- **Admin:** Dr. Naethan Trinidad
