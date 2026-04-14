"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import axios from "axios";
import {
  PlusCircle,
  FileQuestion,
  TestTube,
  BookOpen,
  FolderTree,
  ListChecks,
  BarChart3,
  Users,
  Settings,
  TrendingUp,
  Award,
  Clock,
  CheckCircle,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Database,
  LayoutGrid,
  Calendar,
  Star,
  Activity,
  Shield
} from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const { user, token } = useSelector((state) => state.auth);
  
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalQuestions: 0,
    totalTests: 0,
    totalSubjects: 0,
    totalTopics: 0,
    totalPublishedTests: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    fetchDashboardStats();
    fetchRecentActivity();
  }, []);

  const fetchDashboardStats = async () => {
    try{
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/dashboard-stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data && response.data.stats) {
        setStats({
          totalUsers: response.data.stats.totalUsers || 0,
          totalQuestions: response.data.stats.totalQuestions || 0,
          totalTests: response.data.stats.totalPublishedTests || 0,
          totalSubjects: response.data.stats.totalSubjects || 0,
          totalTopics: response.data.stats.totalTopics || 0,
          publishedTests: response.data.stats.totalPublishedTests || 0
        });
      }


    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentActivity = async () => {
    // Simulate recent activity - you can replace with actual API calls
    setRecentActivity([
      { id: 1, action: "Question created", details: "JavaScript Basics", time: "2 minutes ago", type: "create" },
      { id: 2, action: "Test published", details: "React Assessment", time: "1 hour ago", type: "publish" },
      { id: 3, action: "Subject added", details: "Database Management", time: "3 hours ago", type: "create" },
      { id: 4, action: "Topic updated", details: "Advanced Algorithms", time: "5 hours ago", type: "update" },
    ]);
  };

  const adminCards = [
    {
      title: "Create Question",
      description: "Add new questions to your question bank with multiple options, images, and detailed explanations",
      icon: FileQuestion,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      iconColor: "text-blue-600",
      path: "/admin/create-question",
      stats: `${stats.totalQuestions} Total Questions`,
      gradient: "from-blue-600 to-indigo-600"
    },
    {
      title: "Create Test",
      description: "Design comprehensive tests with custom duration, questions, and evaluation criteria",
      icon: TestTube,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      iconColor: "text-purple-600",
      path: "/admin/create-test",
      stats: `${stats.totalTests} Total Tests`,
      gradient: "from-purple-600 to-pink-600"
    },
    {
      title: "Create Subject",
      description: "Organize your content by creating subject categories for better structure",
      icon: BookOpen,
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
      iconColor: "text-emerald-600",
      path: "/admin/subjects/create",
      stats: `${stats.totalSubjects} Subjects Created`,
      gradient: "from-emerald-600 to-teal-600"
    },
    {
      title: "Create Topic",
      description: "Add specific topics under subjects to categorize questions effectively",
      icon: FolderTree,
      color: "from-amber-500 to-amber-600",
      bgColor: "bg-amber-50 dark:bg-amber-900/20",
      iconColor: "text-amber-600",
      path: "/admin/topics/create",
      stats: `${stats.totalTopics} Topics Created`,
      gradient: "from-amber-600 to-orange-600"
    },
    {
      title: "All Tests",
      description: "View, manage, and monitor all your published and draft tests",
      icon: ListChecks,
      color: "from-rose-500 to-rose-600",
      bgColor: "bg-rose-50 dark:bg-rose-900/20",
      iconColor: "text-rose-600",
      path: "/admin/tests",
      stats: `${stats.publishedTests} Published | ${stats.totalTests - stats.publishedTests} Drafts`,
      gradient: "from-rose-600 to-red-600"
    },
    {
      title: "Question Bank",
      description: "Manage all questions, edit existing ones, and organize your question database",
      icon: Database,
      color: "from-cyan-500 to-cyan-600",
      bgColor: "bg-cyan-50 dark:bg-cyan-900/20",
      iconColor: "text-cyan-600",
      path: "/dashboard/admin/questions",
      stats: `${stats.totalQuestions} Questions Available`,
      gradient: "from-cyan-600 to-blue-600"
    }
  ];

  const quickActions = [
    { label: "Manage Subjects", icon: BookOpen, path: "/admin/subjects", color: "emerald" },
    { label: "Manage Topics", icon: FolderTree, path: "/admin/topics", color: "amber" },
    { label: "View Analytics", icon: BarChart3, path: "/admin/analytics", color: "purple" },
    { label: "User Management", icon: Users, path: "/admin/users", color: "blue" },
    { label: "Settings", icon: Settings, path: "/admin/settings", color: "gray" },
  ];

  const StatCard = ({ title, value, icon: Icon, color, change }) => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-all">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{title}</p>
          {loading ? (
            <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          ) : (
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          )}
          {change && (
            <p className="text-xs text-green-600 dark:text-green-400 mt-2">{change}</p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${color} flex items-center justify-center shadow-lg`}>
          <Icon className="text-white" size={24} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-2 rounded-xl">
                  <Shield className="text-white" size={28} />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
              </div>
              <p className="text-gray-600 dark:text-gray-400 ml-12">
                Welcome back, {user?.name?.split(" ")[0] || "Admin"}! Here's what's happening with your platform today.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-2 rounded-lg shadow-sm">
                <p className="text-white text-sm font-medium flex items-center space-x-2">
                  <Sparkles size={16} />
                  <span>Admin Access</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* total User */}
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={Users}
            color="from-blue-500 to-blue-600"
          />
          <StatCard
            title="Total Questions"
            value={stats.totalQuestions}
            icon={FileQuestion}
            color="from-blue-500 to-blue-600"
          />
          <StatCard
            title="Total Tests"
            value={stats.totalTests}
            icon={TestTube}
            color="from-purple-500 to-purple-600"
          />
          <StatCard
            title="Active Tests"
            value={stats.publishedTests}
            icon={Activity}
            color="from-green-500 to-green-600"
          />
          {/* Total Topics */}
          <StatCard
            title="Total Subjects"
            value={stats.totalSubjects}
            icon={BookOpen}
            color="from-emerald-500 to-emerald-600"
          />
          <StatCard
            title="Total Topics"
            value={stats.totalTopics}
            icon={FolderTree}
            color="from-amber-500 to-amber-600"
          />
        </div>

        {/* Main Admin Cards Grid */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Actions</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Quickly access common administrative tasks</p>
            </div>
            <div className="hidden md:block text-sm text-gray-500 dark:text-gray-400">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {adminCards.map((card, index) => (
              <div
                key={index}
                onClick={() => router.push(card.path)}
                className="group cursor-pointer transform transition-all duration-300 hover:-translate-y-2"
              >
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-2xl transition-all">
                  <div className={`bg-gradient-to-r ${card.gradient} p-4`}>
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                        <card.icon className="text-white" size={24} />
                      </div>
                      <ArrowRight className="text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all" size={20} />
                    </div>
                  </div>
                  
                  <div className="p-5">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {card.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                      {card.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${card.color}`}></div>
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{card.stats}</span>
                      </div>
                      <button className="text-xs font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 transition">
                        Get Started →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <LayoutGrid size={20} className="text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Actions</h3>
              </div>
              <div className="space-y-3">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => router.push(action.path)}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-lg bg-${action.color}-100 dark:bg-${action.color}-900/30 flex items-center justify-center`}>
                        <action.icon size={16} className={`text-${action.color}-600 dark:text-${action.color}-400`} />
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{action.label}</span>
                    </div>
                    <ArrowRight size={14} className="text-gray-400 group-hover:text-purple-600 transition" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Activity size={20} className="text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
                </div>
                <button className="text-xs text-purple-600 hover:text-purple-700 font-medium">
                  View All
                </button>
              </div>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      activity.type === "create" ? "bg-green-100 dark:bg-green-900/30" :
                      activity.type === "publish" ? "bg-blue-100 dark:bg-blue-900/30" :
                      "bg-yellow-100 dark:bg-yellow-900/30"
                    }`}>
                      {activity.type === "create" ? (
                        <CheckCircle size={16} className="text-green-600" />
                      ) : activity.type === "publish" ? (
                        <Sparkles size={16} className="text-blue-600" />
                      ) : (
                        <AlertCircle size={16} className="text-yellow-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.action}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{activity.details}</p>
                    </div>
                    <p className="text-xs text-gray-400">{activity.time}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Tips */}
        <div className="mt-8 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl border border-purple-200 dark:border-purple-800">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <Star size={18} className="text-white" />
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                Pro Tip for Admins
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Organize your content hierarchically: Create Subjects first, then Topics under subjects, 
                then Questions under topics, and finally combine them into Tests for a structured learning experience.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}