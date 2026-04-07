"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setAuth } from "./slices/authSlice";
import { fetchUser } from "./slices/authSlice";
export default function AuthLoader() {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = document.cookie.includes("token");

    if (token) {
      dispatch(setAuth({ token: true }));
      dispatch(fetchUser()); // ✅ THIS FIXES YOUR ISSUE
    }
  }, [dispatch]);

  return null;
}