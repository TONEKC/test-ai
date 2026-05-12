# Project Specification: Event Registration System

## 1. Project Overview

Build an end-to-end event registration system in a **single repository** encompassing User UI, Admin UI, and API routes.

## 2. Technology Stack (Selected)

- **Framework:** Next.js (App Router) with TypeScript.
- **Styling:** Tailwind CSS (and Ant Design if complex components are needed).
- **Database:** PostgreSQL managed via Prisma ORM.
- **File Storage:** Cloud storage compatible with serverless environments (e.g., Uploadthing, Supabase Storage, or Vercel Blob).
- **Testing:** Playwright for critical End-to-End (E2E) testing.
- **Deployment:** Vercel.

## 3. Core Features & Requirements

### 3.1 User Role (Registrant)

- **Registration Form:** Submit details including name, email, phone, and standard event fields.
- **File Uploads:** Upload multiple supporting documents during registration.
- **Security:** Set a password at the time of submission.
- **Confirmation:** Receive a unique Reference Code upon successful submission.
- **Self-Service Portal:** Return later, log in using the Reference Code + Password to view the submission.
- **Editing:** Ability to edit text fields, add new documents, and replace existing documents (must handle deleting old files from storage).

### 3.2 Admin Role

- **Authentication:** Login mechanism strictly using hardcoded `username` and `password` from the `.env` file.
- **Dashboard:** View a comprehensive list of all registrations.
- **Detail View:** Click into any registration to see full submitted details and attached files.
- **PDF Generation:** Download a dynamically generated Name Tag PDF for any selected registration.

## 4. Testing Strategy

Focus on highly pragmatic, real-world testing. Write code-based tests (e.g., Playwright E2E) that simulate a real user flow: registering -> uploading files -> getting ref code -> returning to edit -> admin logging in to download the tag.

## 5. Implementation Action Plan (Roadmap)

This project will be executed in the following order:

1. **Setup Project:** Next.js + Prisma + Tailwind initialization.
2. **Database & Storage:** Design schema (User, EventRegistration, Document) and setup cloud storage.
3. **Build User Flow:** Registration form, file uploads, and ref code generation.
4. **Build User Edit Flow:** Custom login (Ref Code + Password) and update functionality.
5. **Build Admin Flow:** Environment variable-based login and data listing.
6. **PDF Feature:** Generate and download Name Tags.
7. **Write Tests:** Pragmatic E2E tests covering the critical paths.
8. **Deploy:** Final deployment to Vercel.

---

**Instruction for AI Assistant (Codex):**
Please read and acknowledge this project context. Await my specific instructions for **Step 1**, where we will begin the execution based strictly on these requirements.
