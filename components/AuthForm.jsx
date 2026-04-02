"use client";

import { useState } from "react";

export default function AuthForm({ type = "login" }) {
  const isLogin = type === "login";

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    mobile: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const url = isLogin
      ? "https://govt-quiz-app.onrender.com/api/auth/login"
      : "https://govt-quiz-app.onrender.com/api/auth/register";

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      const data = await res.json();
      console.log(data);

      if (res.ok) {
        alert(isLogin ? "Login success" : "Signup success");
      } else {
        alert(data.msg);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">
          {isLogin ? "Login" : "Create Account"}
        </h2>

        {!isLogin && (
          <input
            type="text"
            name="name"
            placeholder="Name"
            onChange={handleChange}
            className="w-full mb-4 p-3 border rounded-lg"
            required
          />
        )}

        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          className="w-full mb-4 p-3 border rounded-lg"
          required
        />
        <input
          type="mobile"
          name="mobile"
          placeholder="Mobile Number"
          onChange={handleChange}
          className="w-full mb-4 p-3 border rounded-lg"
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          className="w-full mb-6 p-3 border rounded-lg"
          required
        />

        <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition">
          {isLogin ? "Login" : "Sign Up"}
        </button>

        <p className="text-center mt-4 text-sm">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <a
            href={isLogin ? "/signup" : "/login"}
            className="text-blue-600 ml-1"
          >
            {isLogin ? "Sign up" : "Login"}
          </a>
        </p>
      </form>
    </div>
  );
}