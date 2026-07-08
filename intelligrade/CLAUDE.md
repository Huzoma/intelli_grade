# IntelliGrade Project Guidelines & Commands

For comprehensive project history, workflows, database schemas, and redesign instructions, please read [HANDOVER.md](file:///c:/Users/PC/Documents/intelli_grade/intelligrade/HANDOVER.md).

## 🛠️ CLI Commands

*   **Start Dev Server:** `npm run dev` (Runs Next.js dev server on http://localhost:3000)
*   **Production Build:** `npm run build`
*   **Start Build:** `npm run start`
*   **Run Linter:** `npm run lint`
*   **Prisma Client Generate:** `npx prisma generate`
*   **Database Sync (No Migrations):** `npx prisma db push`
*   **Database Seeding:** `node prisma/seed.js` (Resets and seeds default accounts)

## 📌 Development Rules

1.  **Next.js 16 Async APIs:** Request-based APIs (`cookies()`, `params`, `searchParams`) are asynchronous. Always `await` them.
    *   *Example:* `const cookieStore = await cookies();`
    *   *Example:* `const { id } = await params;`
2.  **Tailwind CSS v4:** Configuration is located in `src/app/globals.css` using the `@theme` directive. Do not create a `tailwind.config.js`.
3.  **State Management & Actions:** Use Server Actions inside `src/app/actions/` for mutation handlers. Use `"use client"` at the top of client-interactive wrappers.
4.  **Database Access:** Always import and use the singleton client from `@/lib/prisma`.
5.  **Demo Toggle Flow:** Use the custom cookie toggle (`toggleDemoUserAction` in `/actions/auth.js`) inside UI headers to swap between student and lecturer roles instantly during development.
