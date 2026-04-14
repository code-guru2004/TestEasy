import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const cookie = req.headers.get("cookie");

    // Extract token from cookie string
    const token = cookie
      ?.split("; ")
      .find((c) => c.startsWith("token="))
      ?.split("=")[1];

    //console.log("Extracted token:", token);

    const res = await fetch("https://govt-quiz-app.onrender.com/api/auth/me", {
      headers: {
        // Option 1: Send as cookie (if backend expects cookie)
        cookie: `token=${token}`,

        // Option 2 (better): Send as Authorization header
        // Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching user data:", error);
    return NextResponse.json(
      { error: "Failed to fetch user data" },
      { status: 500 }
    );
  }
}