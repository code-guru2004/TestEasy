import { NextResponse } from "next/server";

export async function GET(req) {
  const cookie = req.headers.get("cookie");

  const res = await fetch("https://govt-quiz-app.onrender.com/api/auth/me", {
    headers: {
      cookie, // ✅ forward cookie
    },
  });

  const data = await res.json();

  return NextResponse.json(data);
}