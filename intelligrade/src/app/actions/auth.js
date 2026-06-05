"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export async function loginAction(email, password, roleOverride) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || user.password !== hashPassword(password)) {
    return { error: "Invalid email or password" };
  }

  // Double check role alignment
  if (roleOverride && user.role !== roleOverride) {
    return { error: `User is not registered as a ${roleOverride}` };
  }

  const cookieStore = await cookies();
  cookieStore.set("intelligrade_session", JSON.stringify({ userId: user.id, role: user.role }), {
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

  // Get the default seeded user of the target role
  const user = await prisma.user.findFirst({
    where: { 
      role: targetRole,
      email: targetRole === "STUDENT" ? "uzoma@university.edu" : "eric@university.edu"
    },
  });

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
