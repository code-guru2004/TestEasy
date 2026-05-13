// components/admin/AdminHeader.jsx
"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, LayoutDashboard } from "lucide-react";

const AdminHeader = ({ showBackButton = true, showDashboardButton = true }) => {
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  const handleGoToDashboard = () => {
    router.push("/admin/dashboard");
  };

  return (
    <div className=" border-b border-gray-200 dark:border-gray-700  z-50">
      <div className="max-w-7xl mx-auto px-2">
        <div className="flex items-center space-x-3 h-14">
          {showBackButton && (
            <button
              onClick={handleGoBack}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
              title="Go Back"
            >
              <ArrowLeft size={18} />
              <span className="text-sm font-medium">Back</span>
            </button>
          )}

          {showDashboardButton && (
            <button
              onClick={handleGoToDashboard}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
              title="Go to Dashboard"
            >
              <LayoutDashboard size={18} />
              <span className="text-sm font-medium">Dashboard</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminHeader;