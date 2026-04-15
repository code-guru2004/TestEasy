"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, LogIn } from "lucide-react";
import { FaPhone } from "react-icons/fa6";
import { loginUser, registerUser, clearError } from "../../../lib/redux/slices/authSlice";
import Cookies from "js-cookie";

export default function AuthPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { loading, error, token } = useSelector((state) => state.auth);

  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    mobile: ""
  });
  const [errors, setErrors] = useState({});
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Check for token in cookies and redirect if found
  useEffect(() => {
    const checkAuth = async () => {
      const cookieToken = Cookies.get("token");
      
      if (cookieToken) {
        console.log("Token found in cookies:", cookieToken);
        // Optionally dispatch an action to set the token in Redux state
        // dispatch(setAuthToken(cookieToken));
        router.push("/dashboard");
      } else {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [router]); // Only run once on mount

  // Redirect if token exists in Redux state
  useEffect(() => {
    if (token && !isCheckingAuth) {
      router.push("/dashboard");
    }
  }, [token]);

  // Clear errors when switching modes
  useEffect(() => {
    dispatch(clearError());
    setErrors({});
  }, [isLogin, dispatch]);

  // Show loading or null while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p>Checking authentication...</p>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!isLogin && !formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    if (!isLogin && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!isLogin && !formData.mobile.trim()) {
      newErrors.mobile = "Mobile number is required";
    } else if (!isLogin && !/^\d{10}$/.test(formData.mobile)) {
      newErrors.mobile = "Mobile number must be 10 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (isLogin) {
      // Login
      const loginData = {
        email: formData.email,
        password: formData.password
      };
      const result = await dispatch(loginUser(loginData));
      console.log("Login result:", result);
      console.log("Login fulfilled:", loginUser.fulfilled.match(result));
      if (loginUser.fulfilled.match(result)) {
        console.log("Login successful, redirecting to dashboard...");
        router.replace("/dashboard");
      }
    } else {
      // Register
      const { confirmPassword, ...registerData } = formData;
      const result = await dispatch(registerUser(registerData));
      if (registerUser.fulfilled.match(result)) {
        // Switch to login mode after successful registration
        setIsLogin(true);
        setFormData({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
          mobile: ""
        });
        // You can also show a success message here
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        {/* Animated background elements */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-3xl blur-3xl -z-10"></div>
        
        {/* Main Card */}
        <div className="backdrop-blur-xl bg-white/10 rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Header */}
          <div className="p-6 pb-0">
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-2xl">
                <LogIn className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-center text-white mb-2">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="text-center text-gray-300 text-sm">
              {isLogin
                ? "Sign in to continue to your account"
                : "Join us and start your journey"}
            </p>
          </div>

          {/* API Error Message */}
          {error && (
            <div className="mx-6 mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl">
              <p className="text-red-300 text-sm text-center">{error}</p>
            </div>
          )}

          {/* Success Message for Registration */}
          {/* {!isLogin && !error && (
            <div className="mx-6 mt-4 p-3 bg-green-500/20 border border-green-500/50 rounded-xl">
              <p className="text-green-300 text-sm text-center">
                Registration successful! Please login.
              </p>
            </div>
          )} */}

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {!isLogin && (
              <div className="relative">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Full Name"
                    disabled={loading}
                    className={`w-full pl-10 pr-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      errors.name
                        ? "border-red-500 focus:ring-red-500"
                        : "border-white/20 focus:ring-purple-500 focus:border-transparent"
                    }`}
                  />
                </div>
                {errors.name && (
                  <p className="text-red-400 text-xs mt-1">{errors.name}</p>
                )}
              </div>
            )}

            {!isLogin && (
              <div className="relative">
                <div className="relative">
                  <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    placeholder="Mobile Number"
                    disabled={loading}
                    className={`w-full pl-10 pr-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      errors.mobile
                        ? "border-red-500 focus:ring-red-500"
                        : "border-white/20 focus:ring-purple-500 focus:border-transparent"
                    }`}
                  />
                </div>
                {errors.mobile && (
                  <p className="text-red-400 text-xs mt-1">{errors.mobile}</p>
                )}
              </div>
            )}

            <div className="relative">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email Address"
                  disabled={loading}
                  className={`w-full pl-10 pr-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    errors.email
                      ? "border-red-500 focus:ring-red-500"
                      : "border-white/20 focus:ring-purple-500 focus:border-transparent"
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-red-400 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            <div className="relative">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  disabled={loading}
                  className={`w-full pl-10 pr-12 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    errors.password
                      ? "border-red-500 focus:ring-red-500"
                      : "border-white/20 focus:ring-purple-500 focus:border-transparent"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition disabled:opacity-50"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            {!isLogin && (
              <div className="relative">
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm Password"
                    disabled={loading}
                    className={`w-full pl-10 pr-12 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      errors.confirmPassword
                        ? "border-red-500 focus:ring-red-500"
                        : "border-white/20 focus:ring-purple-500 focus:border-transparent"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={loading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition disabled:opacity-50"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>
                )}
              </div>
            )}

            {isLogin && (
              <div className="text-right">
                <button
                  type="button"
                  disabled={loading}
                  className="text-sm text-purple-300 hover:text-purple-200 transition disabled:opacity-50"
                >
                  Forgot Password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>{isLogin ? "Signing In..." : "Creating Account..."}</span>
                </>
              ) : (
                <>
                  <span>{isLogin ? "Sign In" : "Create Account"}</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="p-6 pt-0 text-center border-t border-white/10 mt-2">
            <p className="text-gray-300 text-sm">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setErrors({});
                  setFormData({
                    name: "",
                    email: "",
                    password: "",
                    confirmPassword: "",
                    mobile: "",
                  });
                }}
                disabled={loading}
                className="text-purple-400 hover:text-purple-300 font-semibold transition disabled:opacity-50"
              >
                {isLogin ? "Sign Up" : "Sign In"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}