import axios from "axios";
import { NextResponse } from "next/server";

export async function POST(req) {
  const body = await req.json();

  const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, body, {
    withCredentials: true,
  });

    const data = res.data;  

  const response = NextResponse.json(data);

  // ✅ THIS is the key fix
  response.cookies.set("token", data.token, {
    httpOnly: true,
    secure: true, // true in production (HTTPS)
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 3, // ✅ 3 days in seconds
  });

  return response;
}