# OJTern: Smart Web-Based OJT Matching Platform & Recommendation System

> **Team DUTERTECH — BSIT Software Engineering (ITPD4)**  
> **Course Instructor:** Prof. Mohamed Mogib Elkordy  
> **Default Database / Tech Stack:** MongoDB Document-Based Schema, React 19, Vite, Tailwind CSS v4, Zustand.

---

## 🌟 Overview & System Purpose

**OJTern** is a smart, web-based On-the-Job Training (OJT) matching platform engineered to resolve delayed placements, mismatched assignments, and manual spreadsheet coordination. The platform incorporates a **rule-based recommendation engine** that matches student qualifications with industry requirements, enforces strict **gatekeeper document verification** by university coordinators, and provides executive governance and institutional placement analytics.

---

## 📂 Project Directory Structure

```
DUTERTECH/
├── uicode/                                     # Complete web application implementation
│   ├── src/
│   │   ├── types/
│   │   │   └── index.ts                        # TypeScript domain entities & MongoDB schemas
│   │   ├── utils/
│   │   │   └── matchingEngine.ts               # Non-ML matching engine (FR-04, C-03)
│   │   ├── data/
│   │   │   └── seedData.ts                     # Pre-seeded users, profiles, postings, applications
│   │   ├── store/
│   │   │   ├── useOJTStore.ts                  # Zustand state store with MongoDB document persistence & RBAC
│   │   │   └── useOJTStore.js                  # Compatibility re-export
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Navbar.tsx                  # Navigation bar with role switcher & notification center
│   │   │   │   ├── DocumentViewer.tsx          # Side-by-side embedded endorsement preview (BR-01)
│   │   │   │   └── MongoDbViewer.tsx           # Live MongoDB JSON/BSON collection explorer
│   │   │   ├── student/
│   │   │   │   └── StudentDashboard.tsx        # Profile builder, recommendations, application modal
│   │   │   ├── partner/
│   │   │   │   └── PartnerDashboard.tsx        # Slot posting & coordinator-approved screening (BR-03)
│   │   │   ├── coordinator/
│   │   │   │   └── CoordinatorDashboard.tsx    # Review queue, BR-02 controls, monthly reporting (FR-12)
│   │   │   ├── admin/
│   │   │   │   └── AdminDashboard.tsx          # Governance, typed DEACTIVATE safety, stats banner
│   │   │   └── traceability/
│   │   │       └── TraceabilityMatrix.tsx      # Interactive live requirement verification table
│   │   ├── App.tsx                             # Master layout wiring all 4 stakeholder views
│   │   ├── main.tsx                            # React 19 application entrypoint
│   │   └── index.css                           # Tailwind CSS v4 theme, fonts, & styles
│   ├── package.json
│   ├── vite.config.ts
│   └── README.md
├── detailed_student_workflow.png               # High-resolution student workflow diagram
├── detailed_partner_workflow.png               # High-resolution industry partner workflow diagram
├── detailed_coordinator_workflow.png           # High-resolution OJT coordinator workflow diagram
├── detailed_admin_workflow.png                 # High-resolution school admin workflow diagram
├── USER_PROMPT.docx                            # Detailed stakeholder specifications & acceptance criteria
├── ITPD4_Section_1_DUTERTECH_Week3_Elicitation_SRS.pdf
├── ITPD4_Section_1_DUTERTECH_Week4_Laboratory_Use_Case_Modeling.pdf
├── ITPD4_Weeks5-6_BSIT1_OJTern.pdf
└── README.md
```

---

## 🚀 Running the Project

```bash
cd uicode
npm install
npm run dev
```

The web application runs on `http://localhost:5173` (or the port assigned by Vite).

---

## 📋 System Traceability & Business Rule Verification

| ID | Requirement | Business Rule | Implementation Location | Verification Status |
|:---|:---|:---|:---|:---|
| **FR-01** | Student Profile Creation | N/A | `StudentDashboard.tsx` (`ProfileBuilder`) | Validation blocks submit if required fields are missing. |
| **FR-04** | Rule-Based Matching | `C-03` (Non-ML) | `StudentDashboard.tsx` & `matchingEngine.ts` | Calculates percentage score from Program (40%), Location (20%), and Skill intersection (40%). |
| **FR-05, FR-06** | Application Submission | `BR-01` (Mandatory Endorsement) | `useOJTStore.ts` & `StudentDashboard.tsx` | "Submit Application" button disabled until endorsement document is attached. |
| **FR-07, FR-08** | Coordinator Review | `BR-02` (Coordinator Only) | `CoordinatorDashboard.tsx` & `useOJTStore.ts` | Throws authorization error if `role !== 'Coordinator'`. Side-by-side embedded preview provided. |
| **FR-09** | Partner Screening | `BR-03` (Approved Only) | `PartnerDashboard.tsx` (`screenedApplicants`) | Hardcoded query filter `status === 'Approved'` prevents unapproved candidate visibility. |
| **FR-12** | Placement Reports | N/A | `CoordinatorDashboard.tsx` (`reports view`) | Aggregates placement counts grouped by company and academic program for a selected month. |
| **Account Governance** | RBAC Governance | `NFR-02` (RBAC) | `AdminDashboard.tsx` & `useOJTStore.ts` | Protected by Admin role guard. Requires typed `"DEACTIVATE"` text confirmation for destructive account modifications. |
