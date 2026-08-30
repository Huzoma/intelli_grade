"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export async function loginAction(email, password, roleOverride) {
  let user = await prisma.user.findUnique({
    where: { email },
  });

  // Auto-seed demo users on the fly if they don't exist in the remote database yet
  if (!user && (email === "uzoma@university.edu" || email === "eric@university.edu")) {
    try {
      user = await prisma.user.create({
        data: {
          email,
          name: email === "uzoma@university.edu" ? "Uzoma Iyke" : "Eric Lecturer",
          password: hashPassword("password"),
          role: email === "uzoma@university.edu" ? "STUDENT" : "LECTURER",
          department: "Computer Science",
          level: "400",
          matricNo: email === "uzoma@university.edu" ? "FUPRE/CS/21/1234" : null,
        },
      });
    } catch (e) {
      // If creation fails due to race conditions, try fetching again
      user = await prisma.user.findUnique({ where: { email } });
    }
  }

  if (!user || user.password !== hashPassword(password)) {
    return { error: "Invalid email or password" };
  }

  // Double check role alignment
  if (roleOverride && user.role !== roleOverride) {
    return { error: `User is not registered as a ${roleOverride}` };
  }

  const cookieStore = await cookies();
  cookieStore.cookieStore.set("intelligrade_session", JSON.stringify({ userId: user.id, role: user.role }), {
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });

  return { success: true, role: user.role };
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("intelligrade_session");
  redirect("/");
}

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("intelligrade_session");
    if (!session) return null;

    const { userId } = JSON.parse(session.value);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        id: true, 
        name: true, 
        email: true, 
        role: true, 
        matricNo: true, 
        department: true, 
        level: true 
      },
    });
    return user;
  } catch (e) {
    return null;
  }
}

export async function toggleDemoUserAction() {
  const cookieStore = await cookies();
  const session = cookieStore.get("intelligrade_session");
  let targetRole = "LECTURER";

  if (session) {
    try {
      const { role } = JSON.parse(session.value);
      targetRole = role === "STUDENT" ? "LECTURER" : "STUDENT";
    } catch (e) {}
  }

  const targetEmail = targetRole === "STUDENT" ? "uzoma@university.edu" : "eric@university.edu";
  let user = await prisma.user.findFirst({
    where: { email: targetEmail },
  });

  if (!user) {
    // Auto-create if missing during toggle
    user = await prisma.user.create({
      data: {
        email: targetEmail,
        name: targetRole === "STUDENT" ? "Uzoma Iyke" : "Eric Lecturer",
        password: hashPassword("password"),
        role: targetRole,
        department: "Computer Science",
      },
    });
  }

  if (user) {
    cookieStore.set("intelligrade_session", JSON.stringify({ userId: user.id, role: user.role }), {
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
    });
    return { success: true, role: user.role };
  }
  return { error: "Demo user not found" };
}