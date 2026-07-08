# IntelliGrade — Comprehensive Handover & Redesign Instructions

This document provides a complete overview of the **IntelliGrade** project structure, current functionality, development workflow, and redesign guidelines. It is designed to be fed directly into an AI agent (such as Claude) to guide a comprehensive UI/UX redesign of the application.

---

## 🚀 1. Tech Stack & Architecture

IntelliGrade is a modern EdTech SaaS platform designed for automated academic document routing, preliminary AI evaluations, and manual grading workspaces.

*   **Framework:** Next.js 16.2.5 (App Router, with React 19.2.4 & React Compiler enabled)
*   **Database & ORM:** SQLite database (`prisma/dev.db`) managed via Prisma ORM 6.19.3
*   **Styling:** Tailwind CSS v4 (configured inside `src/app/globals.css`, no `tailwind.config.js`)
*   **Animation & Icons:** Framer Motion 12.38.0 and Lucide-React 1.14.0
*   **Toasts & Alerts:** Sonner 2.0.7
*   **AI Integration:** Google Gemini 3.5 Flash via direct API fetch in route handlers

---

## 📂 2. Directory Structure & Key Files

```bash
intelligrade/
├── prisma/
│   ├── schema.prisma   # Database schema (User, Submission, Rubric, VivaQuestion, Comment)
│   └── seed.js         # Database seeding script (with student & lecturer demo accounts)
├── src/
│   ├── app/
│   │   ├── (auth)/login/page.jsx                 # Login Page
│   │   ├── actions/
│   │   │   ├── auth.js                           # Server actions for sessions and demo switcher
│   │   │   ├── grading.js                        # Server actions for submitting grades and comments
│   │   │   └── rubrics.js                        # Server actions for creating/updating rubrics
│   │   ├── api/
│   │   │   ├── evaluate/route.js                 # AI processing route with Gemini 3.5 Flash
│   │   │   └── upload/route.js                   # Handles PDF uploads and initial routing
│   │   ├── lecturer/
│   │   │   ├── rubrics/RubricManagerClient.jsx   # Rubrics creator/editor
│   │   │   ├── review/[id]/                      # Workspace where lecturers highlight text and grade
│   │   │   ├── LecturerDashboardClient.jsx       # Lecturer overview dashboard
│   │   │   └── layout.jsx                        # Lecturer shell
│   │   ├── student/
│   │   │   ├── upload/page.jsx                   # Document upload page (SIWES/Proposal/Assignment)
│   │   │   ├── review/[id]/                      # Student's view of feedback, scores, and viva prep
│   │   │   ├── StudentDashboardClient.jsx        # Student overview dashboard
│   │   │   └── layout.jsx                        # Student shell
│   │   ├── globals.css                           # Tailwind CSS v4 configuration and variables
│   │   ├── layout.jsx                            # Root layout with theme initialization script
│   │   ├── middleware.js                         # Cookie-based RBAC router guard
│   │   └── page.jsx                              # Project landing page
│   ├── components/
│   │   ├── ThemeProvider.jsx                     # Context-based light/dark theme provider
│   │   └── ThemeToggle.jsx                       # Theme toggle button
│   └── lib/
│       └── prisma.js                             # Cached global Prisma client instance
```

---

## ⚙️ 3. Current Functionality & Workflows

### 🔑 Authentication & The Demo Toggle
*   Authentication is session-cookie based (`intelligrade_session`), verified inside `src/middleware.js`.
*   **Testing Workflow:** To make previewing easy, there is a **Demo Toggle action** (`toggleDemoUserAction` in `src/app/actions/auth.js`) that lets you swap between the main Student account and the main Lecturer account in a single click from the UI headers.
*   **Demo Accounts:**
    *   **Student:** `uzoma@university.edu` (Password: `password`)
    *   **Lecturer:** `eric@university.edu` (Password: `password`)

### 📤 Submission & AI Interrogation Pipeline
1.  **Student Upload (`src/app/student/upload/page.jsx`):** Student uploads a PDF. The backend (`src/app/api/upload/route.js`) saves the file, assigns it to a default lecturer, matches it with the relevant rubric type (`SIWES IT Report`, `Final Year Project Proposal`, or `Database Architecture Assignment`), and sets the status to `processing`.
2.  **Gemini AI Evaluation (`src/app/api/evaluate/route.js`):**
    *   Initiated automatically or manually.
    *   Reads the uploaded PDF, encodes it to Base64, and sends it to the Gemini 3.5 Flash API with a structured prompt.
    *   Extracts: Verbatim parsed document text (`fullText`), actual document title, 3-4 sentence academic summary, key technology tags (`entities`), plagiarism/AI-writing probability percentage (`aiScore`), and exactly 3 context-linked **viva questions** containing source text quotes (`marker`).
    *   If evaluation fails, a cleanup rollback deletes the DB record and uploaded file to prevent database corruption.

### 👩‍🏫 Lecturer Workspace & Grading
*   **Dashboard:** Shows student rosters and pending submissions categorized by evaluation states (`needs_grading`, `graded`, `processing`).
*   **Review Workspace (`src/app/lecturer/review/[id]/ReviewWorkspaceClient.jsx`):**
    *   Left Column: Scrollable extracted document text.
    *   **Text Highlighting:** Lecturers can select text inside the document view and instantly open a popup to attach comments (stored in the `Comment` model with `quote` and `text`).
    *   Right Column: Evaluator panel displaying the matched Rubric criteria, the AI-generated viva questions (lecturers can toggle which ones are added to the student's sheet), and a grading form to input a final `humanScore` and submit.

### 👨‍🎓 Student Workspace
*   **Dashboard:** Displays overall status cards, submissions lists, and grades.
*   **Review Workspace:** Displays their uploaded document side-by-side with the lecturer's annotations (comments display inline relative to their highlighted quotes), the final score, and the approved viva defense questions for practice.

---

## 🎨 4. Redesign Instructions: Modernizing & Standardizing the UI

The goal is to redesign the entire application to feel premium, visually cohesive, and modern (wowed at first glance), adhering to high-end design standards.

### 💎 A. Visual Style & Theme Consistency
*   **Theme & Palette:** Avoid default primary colors. Implement an HSL-tailored slate, indigo, and deep violet palette. 
    *   Light Mode: Clean slate backgrounds with subtle borders and premium white card elevations.
    *   Dark Mode: A deep obsidian theme (e.g. `#090d16` canvas) with navy/indigo glass cards.
*   **Glassmorphism:** Use unified CSS classes (like `.glass-panel` in `src/app/globals.css`) with backdrop-filters (`blur(12px)`) and subtle semi-transparent borders for card components.
*   **Ambient Glows:** Use dynamic radial-gradients or blurred floating auroras in page layouts to create depth.
*   **Typography:** Maintain the variables `--font-poppins` for body copy and `--font-jakarta` for headers. Use clear font weights for crisp hierarchy.

### 🧭 B. Component-Level Guidelines
1.  **Sidebar Shell Layout:**
    *   Both `/student` and `/lecturer` routes should use a consistent sidebar component layout.
    *   Sidebar: Fixed width, glassy panel, featuring clean interactive navigation links with subtle SVG/Lucide icons, a user profile card, and the Demo User Toggle action positioned prominently at the bottom.
2.  **Forms, Uploaders & Buttons:**
    *   **Upload Area:** Design a drag-and-drop zone with smooth animations, file size validators, and dynamic upload progress animations (no default HTML input styling).
    *   **Buttons:** Apply gradients and subtle scaling hover transitions (`whileHover={{ scale: 1.02 }}`) using Framer Motion.
    *   **Inputs & Selects:** Replace basic inputs with styled container boxes that animate borders on focus.
3.  **Review Workspace & Annotator Tool:**
    *   The split screen (Extracted Document Text vs. Grading Sheet) needs a highly functional layout.
    *   Extracted Text: Custom-styled scrollbars (`scrollbar-thin`), readable line heights (`leading-relaxed`), and intuitive hover styles on highlighted annotations.
    *   Inline Highlight Popup: A floating micro-menu that appears when text is selected, enabling lecturers to quickly input comments.
4.  **Tables, Badges & Empty States:**
    *   **Rosters:** Clean modern tables with responsive layouts, hover states, and clear status badges (`Needs Grading` in amber/yellow, `Graded` in emerald/green, `Processing` in indigo/blue).
    *   **Empty States:** Avoid blank screens. Design premium empty-state wrappers with illustrative Lucide icons, descriptive headers, and actionable buttons.
    *   **Skeleton Loaders:** Build modern animated skeleton loading grids for dashboard tables and statistics card widgets while the database or API is loading.

---

## ⚠️ 5. Next.js 16 & React 19 Developer Rules
Keep these rules in mind when editing the codebase:
1.  **Async Request APIs:** In Next.js 16, request-based APIs like `cookies()`, `params`, and `searchParams` are asynchronous. You must **await** them:
    ```javascript
    // Correct
    const cookieStore = await cookies();
    const session = cookieStore.get("intelligrade_session");
    
    // Correct for Route / Page / Layout params
    export async function Page({ params }) {
      const { id } = await params;
    }
    ```
2.  **Tailwind CSS v4 Configuration:** All configurations must be added inline in `src/app/globals.css` under the `@theme` directive. There is no `tailwind.config.js` or `tailwind.config.mjs` file:
    ```css
    @import "tailwindcss";
    @theme {
      --color-primary: #4f46e5;
    }
    ```
3.  **Server Actions vs Client Components:** Keep actions clean inside `src/app/actions/`. Use `"use client"` directives explicitly at the top of client pages, dashboards, and review workspaces.
