const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");

const prisma = new PrismaClient();

// Helper to hash passwords using built-in crypto
function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

async function main() {
  console.log("Cleaning database...");
  await prisma.vivaQuestion.deleteMany({});
  await prisma.submission.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.rubric.deleteMany({});

  console.log("Seeding users...");
  const studentPassword = hashPassword("password");
  const lecturerPassword = hashPassword("password");

  // Create Student
  const student = await prisma.user.create({
    data: {
      email: "uzoma@university.edu",
      password: studentPassword,
      name: "Uzoma Iyke Tobechukwu",
      role: "STUDENT",
      matricNo: "CSC/2022/045",
      department: "Computer Science",
      level: "400L",
    },
  });

  // Create Lecturer
  const lecturer = await prisma.user.create({
    data: {
      email: "eric@university.edu",
      password: lecturerPassword,
      name: "Dr. Eric Nwabueze",
      role: "LECTURER",
      department: "Computer Science",
    },
  });

  // Create Other Students for Roster
  await prisma.user.createMany({
    data: [
      {
        email: "david@university.edu",
        password: studentPassword,
        name: "David O. Adeyemi",
        role: "STUDENT",
        matricNo: "CSC/2022/089",
        department: "Computer Science",
        level: "400L",
      },
      {
        email: "sarah@university.edu",
        password: studentPassword,
        name: "Sarah Chukwu",
        role: "STUDENT",
        matricNo: "CSC/2023/012",
        department: "Computer Science",
        level: "300L",
      },
      {
        email: "michael@university.edu",
        password: studentPassword,
        name: "Michael Eze",
        role: "STUDENT",
        matricNo: "CSC/2022/105",
        department: "Computer Science",
        level: "400L",
      },
      {
        email: "chiamaka@university.edu",
        password: studentPassword,
        name: "Chiamaka Nwosu",
        role: "STUDENT",
        matricNo: "CSC/2022/033",
        department: "Computer Science",
        level: "400L",
      },
      {
        email: "emeka@university.edu",
        password: studentPassword,
        name: "Emeka Okafor",
        role: "STUDENT",
        matricNo: "CSC/2022/077",
        department: "Computer Science",
        level: "400L",
      },
    ]
  });

  console.log("Seeding rubrics...");
  // Create Rubrics
  const rubric1 = await prisma.rubric.create({
    data: {
      title: "Standard SIWES IT Report",
      criteriaCount: 5,
      criteriaList: JSON.stringify([
        "Clear executive summary of the SIWES experience.",
        "Technical details of the work performed are well documented.",
        "Relevance of the placement to the CS curriculum is justified.",
        "Weekly logbook entries are complete and signed.",
        "Formatting and grammar adhere to academic guidelines."
      ]),
    },
  });

  const rubric2 = await prisma.rubric.create({
    data: {
      title: "Final Year Project Proposal",
      criteriaCount: 4,
      criteriaList: JSON.stringify([
        "Executive Summary clearly defines the problem space.",
        "System Architecture diagram is present and logical.",
        "Technology Stack is justified with valid reasons.",
        "Project timeline (Gantt Chart) is realistic."
      ]),
    },
  });

  const rubric3 = await prisma.rubric.create({
    data: {
      title: "Database Architecture Assignment",
      criteriaCount: 4,
      criteriaList: JSON.stringify([
        "Database schema is in third normal form (3NF).",
        "Primary and foreign keys are correctly defined.",
        "Query performance optimizations are described.",
        "SQL DDL scripts are syntax-error-free."
      ]),
    },
  });

  console.log("Seeding submissions...");
  // Create Project Proposal Submission for Uzoma
  const sub1 = await prisma.submission.create({
    data: {
      id: "sub_101",
      docTitle: "IntelliGrade SaaS Architecture",
      filePath: "/uploads/intelligrade-saas-architecture.pdf",
      fileSize: "1.2 MB",
      type: "project_proposal",
      status: "needs_grading",
      aiScore: 12,
      studentId: student.id,
      lecturerId: lecturer.id,
      rubricId: rubric2.id,
      entities: "Next.js App Router, Role-Based Access Control, PostgreSQL, Tailwind CSS, Framer Motion",
      summary: "This proposal outlines the SaaS architecture for the IntelliGrade grading platform. It describes the integration of Next.js for server-side rendering, SQLite for secure data persistence, and Framer Motion for rich, animated user dashboards.",
      fullText: `Federal University Of Petroleum Resources
Excellence and Relevance
Name: BEECROFT ARNOLD OLUWATOBILOBA
Matric Number: COS/7437/2020
Supervisor/Mentor: Mr NIEMOGHA STAR
Department: COMPUTER SCIENCE

PROJECT TITLE: Neural Machine Translation for English-to-Itsekiri: A Digital Approach to Language Preservation

EXECUTIVE SUMMARY
Nigeria's rich linguistic heritage faces an urgent threat, as indigenous languages like Itsekiri edge toward extinction due to limited documentation and dwindling usage among younger generations. This project aims to intervene by leveraging deep learning techniques specifically the T5 Transformer model to translate English into Itsekiri, thereby preserving the language. To achieve this, a bilingual parallel corpus of English-Itsekiri sentences will be created and used to fine-tune the translation model.

SYSTEM ARCHITECTURE
The system is built on a modern SaaS architecture. Choosing Next.js over a standard React SPA allows server-side rendering, improving the load speeds of heavy lecturer dashboard charts. This performance boost is critical for managing real-time data visualizers.

FILE UPLOAD AND MANAGEMENT
Handling user files asynchronously was a major architectural consideration. State management for the asynchronous file upload uses a central React state machine to track progress states (idle, uploading, success, error). This guarantees that network failures are handled gracefully.

SECURITY POLICIES
Access control is implemented strictly on the router level. Security is enforced by checking session cookies inside middleware.ts, redirecting unauthorized student users trying to reach lecturer paths.`
    },
  });

  // Add Viva Questions to Submission 1
  await prisma.vivaQuestion.createMany({
    data: [
      {
        text: "Explain the reasoning behind choosing Next.js over a standard React SPA for the dashboard architecture.",
        added: false,
        marker: "Choosing Next.js over a standard React SPA allows server-side rendering, improving the load speeds of heavy lecturer dashboard charts.",
        submissionId: sub1.id,
      },
      {
        text: "How did you handle the state management for the asynchronous file upload process?",
        added: true,
        marker: "State management for the asynchronous file upload uses a central React state machine to track progress states (idle, uploading, success, error).",
        submissionId: sub1.id,
      },
      {
        text: "What specific security measures were implemented to prevent students from accessing the lecturer routes?",
        added: false,
        marker: "Security is enforced by checking session cookies inside middleware.ts, redirecting unauthorized student users trying to reach lecturer paths.",
        submissionId: sub1.id,
      },
    ],
  });

  // Create IT Report Submission for Uzoma (already graded)
  const sub2 = await prisma.submission.create({
    data: {
      id: "sub_102",
      docTitle: "SIWES 6-Month Logbook",
      filePath: "/uploads/siwes-6-month-logbook.pdf",
      fileSize: "4.8 MB",
      type: "it_report",
      status: "graded",
      aiScore: 9,
      humanScore: 85,
      studentId: student.id,
      lecturerId: lecturer.id,
      rubricId: rubric1.id,
      entities: "React hooks, API integration, file handling, local state management",
      summary: "A comprehensive 6-month SIWES internship logbook documenting frontend development tasks. Focuses on building responsive layout components, integrating CRUD APIs, and optimizing client-side performance.",
      fullText: `SIWES 6-Month Internship Report
Submitted by Uzoma Iyke Tobechukwu
Matric: CSC/2022/045
Department of Computer Science

1. INTRODUCTION
This report details the work completed during my 6-month Student Industrial Work Experience Scheme (SIWES) at the University IT Center. The placement focused on frontend development.

2. TECHNICAL CHALLENGES
During the integration phase of the project, we encountered several performance issues. The main challenges included synchronizing local component state with complex multi-stage forms and debugging latency in external API fetches. This required building custom debouncers.

3. PERSISTENCE LAYER AND CONSISTENCY
Data safety was a primary focus of our database team. Data consistency is maintained through optimistic updates and structured SQL transaction rollbacks on the SQLite backend, preventing dirty reads or orphaned references.`
    },
  });

  // Add Viva Questions to Submission 2
  await prisma.vivaQuestion.createMany({
    data: [
      {
        text: "Can you detail the main technical challenges faced during your SIWES placement?",
        added: true,
        marker: "The main challenges included synchronizing local component state with complex multi-stage forms and debugging latency in external API fetches.",
        submissionId: sub2.id,
      },
      {
        text: "How does the system design in your report handle data consistency?",
        added: true,
        marker: "Data consistency is maintained through optimistic updates and structured SQL transaction rollbacks on the SQLite backend.",
        submissionId: sub2.id,
      },
    ],
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
