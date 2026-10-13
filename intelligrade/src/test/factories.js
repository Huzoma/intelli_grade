// Valid-object builders for the five entities every feature reads, with
// sensible defaults and per field overrides. Use them instead of inline
// literals so a schema change lands in one place.
//
//   const student = buildUser({ role: "STUDENT" });
//   const submission = buildSubmission({ studentId: student.id, status: "graded" });

let sequence = 0;

function nextId(prefix) {
  sequence += 1;
  return `${prefix}_${sequence}`;
}

export function buildUser(overrides = {}) {
  const id = nextId("user");

  return {
    id,
    email: `${id}@university.edu`,
    password: "hashed-password",
    name: "Test User",
    role: "STUDENT",
    matricNo: null,
    department: "Computer Science",
    level: "400L",
    ...overrides,
  };
}

export function buildSubmission(overrides = {}) {
  const id = nextId("submission");

  return {
    id,
    docTitle: "Test Document",
    filePath: "/uploads/test-document.pdf",
    fileSize: "1.2 MB",
    type: "it_report",
    status: "processing",
    aiScore: null,
    humanScore: null,
    entities: null,
    summary: null,
    fullText: null,
    studentId: "student_1",
    lecturerId: null,
    rubricId: null,
    ...overrides,
  };
}

export function buildRubric(overrides = {}) {
  const id = nextId("rubric");

  return {
    id,
    title: "Test Rubric",
    criteriaCount: 2,
    criteriaList: JSON.stringify(["Criterion one.", "Criterion two."]),
    lastUpdated: new Date("2026-01-01T00:00:00.000Z"),
    ...overrides,
  };
}

export function buildVivaQuestion(overrides = {}) {
  const id = nextId("viva");

  return {
    id,
    text: "Explain the main technical decision in your submission.",
    added: false,
    marker: null,
    submissionId: "submission_1",
    ...overrides,
  };
}

export function buildComment(overrides = {}) {
  const id = nextId("comment");

  return {
    id,
    text: "This section needs a clearer justification.",
    quote: "the main technical decision",
    submissionId: "submission_1",
    ...overrides,
  };
}
