"use client";

import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Home,
  FileText,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  BarChart3,
  Award,
  Calendar,
  Moon,
  Sun,
  User,
  SquareChevronRight
} from "lucide-react";
import { logout, fetchUser, logoutUser } from "@/lib/redux/slices/authSlice";
import { MdOutlineReceiptLong } from "react-icons/md";

import { MdAdminPanelSettings,MdMenuBook } from "react-icons/md";
import { FaBook } from "react-icons/fa6";
import { FaSwatchbook } from "react-icons/fa";



export default function DashboardLayout({ children }) {
  const { user, token, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState("home");

  useEffect(() => {
    // Get current path to set active tab
    const currentPath = window.location.pathname;
    
    if (currentPath === "/dashboard") setActiveTab("home");
    else if (currentPath === "/dashboard/subjects") setActiveTab("subjects");
    else if (currentPath === "/dashboard/tests") setActiveTab("tests");
    else if (currentPath === "/dashboard/topic-wise-test") setActiveTab("topic-wise-test");
    else if (currentPath === "/dashboard/subject-wise-test") setActiveTab("subjects-wise-test");
    else if (currentPath === "/dashboard/my-results") setActiveTab("results");
    else if (currentPath === "/dashboard/leaderboard") setActiveTab("leaderboard");
    else if (currentPath === "/dashboard/schedule") setActiveTab("schedule");
    
    dispatch(fetchUser()).then((res) => {
      if (res.meta.requestStatus === "rejected") {
        router.push("/");
      } else {
        setLoading(false);
      }
    });

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

  useEffect(() => {
    console.log("User data in dashboard layout:", user);
  }, [user]);


  const handleLogout = async() => {
    const resp = await dispatch(logoutUser());
    if(resp){
      //console.log("Logout successful");
      router.replace("/login");
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // Navigation items
  const navItems = [
    { id: "home", label: "Home", icon: Home, href: "/dashboard" },
    { id: "tests", label: "Full Length Tests", icon: MdOutlineReceiptLong, href: "/dashboard/tests" },
    { id: "topic-wise-test", label: "Topic-wise Tests", icon: FaSwatchbook, href: "/dashboard/topic-wise-test" },
    { id: "subjects-wise-test", label: "Subject-wise Tests", icon: FaBook, href: "/dashboard/subject-wise-test" },
    { id: "results", label: "Results", icon: BarChart3, href: "/dashboard/my-results" },
    { id: "leaderboard", label: "Leaderboard", icon: Award, href: "/dashboard/leaderboard" },
    { id: "schedule", label: "Schedule", icon: Calendar, href: "/dashboard/schedule" },
    { id: "Admin", label: "Admin Panel", icon: User, href: "/admin/dashboard", badge: user?.role === "admin" ? "Admin" : null },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full ">
      <div className="flex items-center  relative justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        {
          isSidebarOpen ? (
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="bg-blue-500 p-2 rounded-lg flex-shrink-0">
                <MdMenuBook className="w-6 h-6 text-white" />
              </div>
              <span className={`text-xl font-bold text-gray-800 dark:text-white whitespace-nowrap transition-all duration-300 ${
                isSidebarOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 w-0"
              }`}>
                Test Easy Mate
              </span>
            </div>

          ) : (
            <div className="bg-blue-500 p-2 rounded-lg flex-shrink-0 mx-auto">
              <MdMenuBook className="w-6 h-6 text-white" />
            </div>
          )
        }
        {typeof window !== 'undefined' && window.innerWidth >= 768 && (
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`p-1 absolute ${isSidebarOpen?"left-56":"left-15 top-1"} rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-110 flex-shrink-0 `}
          >
            {isSidebarOpen ? <ChevronLeft size={20} /> : <SquareChevronRight size={30} className="text-gray-400"/>}
          </button>
        )}
      </div>

      <nav className="flex-1  py-6 px-4 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            onClick={() => setActiveTab(item.id)}
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${
              activeTab === item.id
                ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            <item.icon size={20} className="flex-shrink-0" />
            <span className={`font-medium transition-all duration-300 ${
              isSidebarOpen ? "opacity-100 translate-x-0 delay-100" : "opacity-0 -translate-x-4 w-0 absolute"
            }`}>
              {item.label}
            </span>
            {isSidebarOpen && item.badge && (
              <span className={`ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full transition-all duration-300 ${
                isSidebarOpen ? "opacity-100 scale-100" : "opacity-0 scale-0"
              }`}>
                {item.badge}
              </span>
            )}
            {!isSidebarOpen && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 transform group-hover:translate-x-0 -translate-x-2 shadow-lg">
                {item.label}
                {item.badge && <span className="ml-1 text-yellow-400">({item.badge})</span>}
              </div>
            )}
          </Link>
        ))}
      </nav>
      {/* sidebar profile */}
      {
        isSidebarOpen? (
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
         
          <div className="flex items-center space-x-3 px-4 py-3 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-700/30 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center space-x-3 overflow-hidden cursor-pointer" onClick={() => router.push("/dashboard/profile")}>
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold shadow-md flex-shrink-0">
                {user?.name ? user.name.charAt(0).toUpperCase() : "U"} 
              </div>
              <div className={`flex-1 min-w-0 transition-all duration-300 ${
                isSidebarOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 w-0 absolute"
              }`}
              onClick={() => router.push("/dashboard/profile")}
              >
                <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
                  {user?.name || "User Name"} 
                  {user?.role === "admin" && <MdAdminPanelSettings className="inline text-yellow-400 ml-1" size={16} />} 
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.email || "user@example.com"}
                </p>
              </div>

            </div>
            {/* Logout */}
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-all duration-200 hover:scale-110 flex-shrink-0"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
        ):(
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold shadow-md flex-shrink-0 mx-auto mb-4">
           
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"} 
            </div>
        )
      }
    </div>
  );

  const MobileHeader = () => (
    <div className="md:hidden fixed top-0 left-0 right-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 z-40 animate-slideDown">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-2 rounded-lg">
            <MdMenuBook className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-cyan-600 to-cyan-700 bg-clip-text text-transparent">
            Test Easy Mate
          </span>
        </div>
        <div className="flex items-center space-x-2">
          {/* <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-110"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button> */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-110"
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
        <>
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 md:hidden animate-fadeIn" 
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed right-0 top-0 bottom-0 w-80 bg-white dark:bg-gray-800 shadow-2xl z-50 md:hidden animate-slideInRight">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-700 dark:to-gray-800">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-2 rounded-lg">
                  <MdMenuBook className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold  ">
                  Menu
                </span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 hover:rotate-90"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-4 overflow-y-auto h-[calc(100%-140px)]">
              {navItems.map((item, index) => (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg mb-2 ${
                    activeTab === item.id
                      ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
                  style={{
                    animation: `slideInFromRight 0.3s ease-out ${index * 0.05}s both`
                  }}
                >
                  <item.icon size={20} className="flex-shrink-0" />
                  <span className="font-medium flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
            <div className="p-4 border-t flex items-center  border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
   
                <div className="flex items-center space-x-3 "
                  onClick={() => {
                    router.push("/dashboard/profile");
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold shadow-md flex-shrink-0">
                    {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </div>
         
              </div>
              {/* separator */}
              <div className="border-l border-gray-300 dark:border-gray-600 h-6 mx-4" />
              <button
                onClick={handleLogout}
                className="flex items-center  gap-2 p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-all duration-200 hover:scale-105 w-full justify-center group" 
              >
                <LogOut size={20} className="group-hover:rotate-12 transition-transform" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${isDarkMode ? "dark" : ""}`}>
      <style jsx global>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-100%);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slideInFromRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
        
        .animate-slideInRight {
          animation: slideInRight 0.3s ease-out;
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
      
      <MobileHeader />
      <MobileMenuDrawer />
      
      <div className="flex h-screen pt-0 md:pt-0 pb-16 md:pb-0">
        <aside
          className={`hidden md:block fixed left-0 top-0 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out z-30 ${
            isSidebarOpen ? "w-72" : "w-20"
          }`}
        >
          <SidebarContent />
        </aside>

        <main
          className={`flex-1 transition-all duration-300 ease-in-out overflow-y-auto ${
            isSidebarOpen ? "md:ml-72" : "md:ml-20"
          }`}
        >
          <div className="pt-16 md:pt-0">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}