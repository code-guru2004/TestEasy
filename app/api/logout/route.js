import axios from "axios";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    // 🔥 1. Get token from cookie (NOT localStorage)
    const token = req.cookies.get("token")?.value;

    // 🔥 2. Call backend to blacklist token (if exists)
    if (token) {
      await axios.post(
        "https://govt-quiz-app.onrender.com/api/auth/logout",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    }

    // 🔥 3. Clear cookie (VERY IMPORTANT: match login config)
    const response = NextResponse.json({
      success: true,
      message: "Logout successful",
    });

    response.cookies.set("token", "", {
      httpOnly: true,
      secure: true,        // same as login
      sameSite: "lax",     // same as login
      path: "/",           // same as login
      expires: new Date(0) // 🔥 delete
    });

    return response;
  } catch (error) {
    console.error("Logout error:", error.message);

    // Even if backend fails, still clear cookie
    const response = NextResponse.json({
      success: false,
      message: "Logout failed, but cookie cleared",
    });

    response.cookies.set("token", "", {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      expires: new Date(0),
    });

    return response;
  }
}