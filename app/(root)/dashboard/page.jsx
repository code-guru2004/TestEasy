"use client";

import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Home,
  FileText,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Bell,
  BarChart3,
  ClipboardList,
  Award,
  Calendar,
  MessageSquare,
  Moon,
  Sun
} from "lucide-react";
import { logout, fetchUser } from "@/lib/redux/slices/authSlice";

export default function Dashboard() {
  const { user, token, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState("home");

  useEffect(() => {
    dispatch(fetchUser()).then((res) => {
      if (res.meta.requestStatus === "rejected") {
        router.push("/");
      } else {
        setLoading(false);
      }
    });

    // Handle responsive sidebar
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [dispatch, router]);

  const handleLogout = () => {
    dispatch(logout());
    router.push("/");
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    // Add your theme switching logic here
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mb-4"></div>
          <p className="text-white text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Navigation items
  const navItems = [
    { id: "home", label: "Home", icon: Home, href: "/dashboard" },
    { id: "tests", label: "My Tests", icon: ClipboardList, href: "/dashboard/tests" },
    { id: "results", label: "Results", icon: BarChart3, href: "/dashboard/results" },
    { id: "leaderboard", label: "Leaderboard", icon: Award, href: "/dashboard/leaderboard" },
    { id: "calendar", label: "Schedule", icon: Calendar, href: "/dashboard/schedule" },
    { id: "messages", label: "Messages", icon: MessageSquare, href: "/dashboard/messages", badge: 3 },
    { id: "settings", label: "Settings", icon: Settings, href: "/dashboard/settings" },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo Area */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-800 dark:text-white">TestPortal</span>
        </div>
        {typeof window !== 'undefined' && window.innerWidth >= 768 && (
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            {isSidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            onClick={() => setActiveTab(item.id)}
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${
              activeTab === item.id
                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            <item.icon size={20} />
            {isSidebarOpen && (
              <>
                <span className="font-medium">{item.label}</span>
                {item.badge && (
                  <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {item.badge}
                  </span>
                )}
              </>
            )}
            {!isSidebarOpen && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap z-50">
                {item.label}
                {item.badge && <span className="ml-1 text-red-400">({item.badge})</span>}
              </div>
            )}
          </Link>
        ))}
      </nav>

      {/* User Section */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center space-x-3 px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
            {user?.name ? user.name.charAt(0).toUpperCase() : "U"} {user?.role === "admin" && <span className="text-xs bg-yellow-400 text-gray-900 px-1 rounded ml-1">Admin</span>}
          </div>
          {isSidebarOpen && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
                {user?.name || "User Name"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user?.email || "user@example.com"}
              </p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </div>
  );

  const BottomNav = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg z-50 md:hidden">
      <div className="flex justify-around items-center px-4 py-2">
        {navItems.slice(0, 5).map((item) => (
          <Link
            key={item.id}
            href={item.href}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-all relative ${
              activeTab === item.id
                ? "text-purple-600 dark:text-purple-400"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            <item.icon size={22} />
            <span className="text-xs font-medium">{item.label}</span>
            {item.badge && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {item.badge}
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );

  const MobileHeader = () => (
    <div className="md:hidden fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-40">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-gray-800 dark:text-white">TestPortal</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Menu size={24} />
          </button>
        </div>
      </div>
    </div>
  );

  const MobileMenuDrawer = () => (
    <>
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-white dark:bg-gray-800 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold text-gray-800 dark:text-white">Menu</span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-4">
              {navItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                >
                  <item.icon size={20} />
                  <span className="font-medium">{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                >
                  <LogOut size={20} />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );

  // Main Content Component
  const MainContent = () => {
    const renderContent = () => {
      switch(activeTab) {
        case "home":
          return <HomeContent user={user} />;
        case "tests":
          return <TestsContent />;
        case "results":
          return <ResultsContent />;
        case "leaderboard":
          return <LeaderboardContent />;
        default:
          return <HomeContent user={user} />;
      }
    };

    return (
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 md:p-8">
          {renderContent()}
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${isDarkMode ? "dark" : ""}`}>
      <MobileHeader />
      <MobileMenuDrawer />
      <BottomNav />
      
      <div className="flex h-screen pt-0 md:pt-0 pb-16 md:pb-0">
        {/* Desktop Sidebar */}
        <aside
          className={`hidden md:block fixed left-0 top-0 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 z-30 ${
            isSidebarOpen ? "w-72" : "w-20"
          }`}
        >
          <SidebarContent />
        </aside>

        {/* Main Content Area */}
        <main
          className={`flex-1 transition-all duration-300 ${
            isSidebarOpen ? "md:ml-72" : "md:ml-20"
          }`}
        >
          <MainContent />
        </main>
      </div>
    </div>
  );
}

// Content Components
const HomeContent = ({ user }) => (
  <div className="space-y-6">
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
        { label: "Average Score", value: "85%", icon: BarChart3, color: "from-green-500 to-green-600" },
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

const TestsContent = () => (
  <div className="space-y-6">
    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Available Tests</h1>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Test {i}</h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm mt-2">10 Questions • 30 Minutes</p>
          <button className="mt-4 w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:opacity-90 transition">
            Start Test
          </button>
        </div>
      ))}
    </div>
  </div>
);

const ResultsContent = () => (
  <div className="space-y-6">
    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Test Results</h1>
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="p-6 border-b border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Recent Results</h2>
      </div>
      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {[
          { test: "JavaScript Basics", score: "85%", date: "Mar 1, 2024", status: "Passed" },
          { test: "React Hooks", score: "92%", date: "Feb 25, 2024", status: "Passed" },
        ].map((result, idx) => (
          <div key={idx} className="p-6 flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-800 dark:text-white">{result.test}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{result.date}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-600">{result.score}</p>
              <p className="text-sm text-gray-500">{result.status}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const LeaderboardContent = () => (
  <div className="space-y-6">
    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Leaderboard</h1>
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="p-6">
        <div className="space-y-4">
          {[
            { rank: 1, name: "John Doe", score: 2450, avatar: "JD" },
            { rank: 2, name: "Jane Smith", score: 2380, avatar: "JS" },
            { rank: 3, name: "Mike Johnson", score: 2210, avatar: "MJ" },
          ].map((userItem) => (
            <div key={userItem.rank} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="text-2xl font-bold text-gray-400">#{userItem.rank}</div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                  {userItem.avatar}
                </div>
                <span className="font-medium text-gray-800 dark:text-white">{userItem.name}</span>
              </div>
              <div className="text-xl font-bold text-purple-600">{userItem.score}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);