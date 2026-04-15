"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Shield, AlertCircle, CheckCircle, Clock, X } from "lucide-react";

export default function OtpDrawer({ open, onClose }) {
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(30);
  const [success, setSuccess] = useState(false);
  const [resending, setResending] = useState(false);

  const inputsRef = useRef([]);

  useEffect(() => {
    if (open) {
      setOtp(Array(6).fill(""));
      setError("");
      setTimer(30);
      setSuccess(false);
      setTimeout(() => inputsRef.current[0]?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((p) => p - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");

    if (value && index < 5) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
    if (e.key === "Enter" && otp.every(digit => digit !== "")) {
      handleVerify();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(paste)) return;

    const newOtp = paste.split("");
    setOtp([...newOtp, ...Array(6 - newOtp.length).fill("")]);
    setError("");
    
    const lastIndex = Math.min(newOtp.length - 1, 5);
    inputsRef.current[lastIndex]?.focus();
  };

  const handleVerify = async () => {
    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify-otp`,
        { otp: otpValue },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setSuccess(true);
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      setError(err?.response?.data?.message || "Invalid OTP. Please try again.");
      setOtp(Array(6).fill(""));
      inputsRef.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setResending(true);
      setError("");
      setTimer(30);
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/resend-otp`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
    } catch (err) {
      setError("Failed to resend OTP. Please try again.");
    } finally {
      setResending(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom duration-300">
        {/* Drag Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-6 pt-2 pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Verify Account</h2>
                <p className="text-xs text-gray-500">Enter the 6-digit code</p>
              </div>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* OTP Input Fields */}
          <div className="flex justify-center gap-2 mb-6" onPaste={handlePaste}>
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => (inputsRef.current[i] = el)}
                type="text"
                value={digit}
                onChange={(e) => handleChange(e.target.value, i)}
                onKeyDown={(e) => handleKeyDown(e, i)}
                className={`w-12 h-14 text-center text-xl font-semibold rounded-xl border-2 
                  focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all
                  ${error ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-purple-300'}
                  ${success ? 'border-green-400 bg-green-50' : ''}`}
                maxLength={1}
                autoComplete="off"
                disabled={loading || success}
              />
            ))}
          </div>

          {/* Timer */}
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mb-4">
            <Clock className="w-3 h-3" />
            <span>Code expires in 5 minutes</span>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl animate-in slide-in-from-top-2">
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl animate-in fade-in">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <p className="text-sm">Verified! Redirecting...</p>
              </div>
            </div>
          )}

          {/* Verify Button */}
          <button
            onClick={handleVerify}
            disabled={loading || success || otp.some(digit => digit === "")}
            className={`w-full py-3 rounded-xl font-semibold transition-all active:scale-95
              ${loading || success || otp.some(digit => digit === "")
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
              }`}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Verifying...</span>
              </div>
            ) : success ? (
              "Verified!"
            ) : (
              "Verify Account"
            )}
          </button>

          {/* Resend Section */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Didn't receive the code?{" "}
              {timer > 0 ? (
                <span className="text-purple-600 font-medium">
                  Resend in {timer}s
                </span>
              ) : (
                <button
                  onClick={handleResend}
                  disabled={resending}
                  className="text-purple-600 font-medium hover:text-purple-700 transition-colors disabled:opacity-50"
                >
                  {resending ? "Sending..." : "Resend Code"}
                </button>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}