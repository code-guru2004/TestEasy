import axios from "axios";
import { NextResponse } from "next/server";

export async function POST(req) {
  const body = await req.json();
console.log("Received login request with body:", body);
  const res = await axios.post("https://govt-quiz-app.onrender.com/api/auth/login", body, {
    withCredentials: true,
  });

    const data = res.data;  

  const response = NextResponse.json(data);

  // ✅ THIS is the key fix
  response.cookies.set("token", data.token, {
    httpOnly: true,
    secure: false, // true in production
    sameSite: "lax",
    path: "/",
  });

  return response;
}