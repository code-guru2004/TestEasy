// app/dashboard/page.jsx
"use client";

import { Bell, ClipboardList, Award, Calendar } from "lucide-react";
import { LuChartBarStacked } from "react-icons/lu";


import { useSelector } from "react-redux";

export default function DashboardHome() {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Welcome back, {user?.name?.split(" ")[0] || "User"}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Ready to test your knowledge today?
          </p>
        </div>
        <button className="hidden md:flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition">
          <Bell size={18} />
          <span>Notifications</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Tests Completed", value: "12", icon: ClipboardList, color: "from-blue-500 to-blue-600" },
          { label: "Average Score", value: "85%", icon: LuChartBarStacked, color: "from-green-500 to-green-600" },
          { label: "Rank", value: "#42", icon: Award, color: "from-yellow-500 to-yellow-600" },
          { label: "Study Hours", value: "24", icon: Calendar, color: "from-purple-500 to-pink-500" },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{stat.value}</p>
              </div>
              <div className={`bg-gradient-to-r ${stat.color} p-3 rounded-xl`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Upcoming Tests */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Upcoming Tests</h2>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {[
            { test: "JavaScript Fundamentals", date: "Tomorrow, 10:00 AM", duration: "45 min", status: "upcoming" },
            { test: "React Advanced", date: "Mar 15, 2:00 PM", duration: "60 min", status: "upcoming" },
          ].map((test, idx) => (
            <div key={idx} className="p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
              <div>
                <h3 className="font-medium text-gray-800 dark:text-white">{test.test}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{test.date} • {test.duration}</p>
              </div>
              <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition">
                Prepare
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}