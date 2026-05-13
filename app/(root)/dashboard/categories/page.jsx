// app/categories/page.js
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
    FolderTree,
    Layers,
    BookOpen,
    TrendingUp,
    Tag,
    MapPin,
    ChevronLeft,
    ChevronRight,
    Search,
    Grid3x3,
    List,
    Loader,
    Award,
    Briefcase,
    Sparkles,
    ArrowRight,
    Star,
    Zap
} from "lucide-react";

export default function CategoriesPage() {
    const router = useRouter();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [viewMode, setViewMode] = useState("grid");
    const itemsPerPage = 9;

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`);
            setCategories(response.data.data);
        } catch (error) {
            console.error("Error fetching categories:", error);
        } finally {
            setLoading(false);
        }
    };

    const getIconComponent = (iconName) => {
        switch (iconName) {
            case 'FolderTree': return FolderTree;
            case 'Layers': return Layers;
            case 'BookOpen': return BookOpen;
            case 'TrendingUp': return TrendingUp;
            case 'Tag': return Tag;
            case 'MapPin': return MapPin;
            default: return FolderTree;
        }
    };

    const filteredCategories = categories.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentCategories = filteredCategories.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);

    const handleCategoryClick = (categoryId) => {
        router.push(`/dashboard/categories/${categoryId}`);
    };

    const GridView = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
            {currentCategories.map((category, index) => {
                const IconComponent = getIconComponent(category.icon);
                return (
                    <div
                        key={category._id}
                        onClick={() => handleCategoryClick(category._id)}
                        style={{ animationDelay: `${index * 0.05}s` }}
                        className="group cursor-pointer bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden border border-gray-200 dark:border-gray-700 animate-fade-in-up"
                    >
                        <div
                            className="relative h-32 overflow-hidden"
                            style={{ backgroundColor: category.colorCode }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                            {category.imageUrl && (
                                <img
                                    src={category.imageUrl}
                                    alt={category.name}
                                    className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:scale-110 transition-transform duration-500"
                                />
                            )}
                            <div className="absolute bottom-4 left-4 transform group-hover:scale-110 transition-transform duration-300">
                                <IconComponent className="text-white drop-shadow-lg" size={40} />
                            </div>
                            <div className="absolute top-4 right-4">
                                <span className="bg-white/20 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full font-medium shadow-lg">
                                    {category.totalSubjects || 0} Subjects
                                </span>
                            </div>
                        </div>

                        <div className="p-5">
                            <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300">
                                {category.name}
                            </h3>

                            {category.description && (
                                <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-4">
                                    {category.description}
                                </p>
                            )}

                            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center space-x-1">
                                        <BookOpen size={14} className="text-gray-400" />
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            {category.totalSubjects || 0} Subjects
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <Award size={14} className="text-gray-400" />
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            Topics
                                        </span>
                                    </div>
                                </div>
                                <div className="text-indigo-600 dark:text-indigo-400 text-sm font-medium group-hover:translate-x-2 transition-transform duration-300 flex items-center gap-1">
                                    Explore <ArrowRight size={14} />
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );

    const ListView = () => (
        <div className="space-y-4 animate-fade-in-up">
            {currentCategories.map((category, index) => {
                const IconComponent = getIconComponent(category.icon);
                return (
                    <div
                        key={category._id}
                        onClick={() => handleCategoryClick(category._id)}
                        style={{ animationDelay: `${index * 0.05}s` }}
                        className="group cursor-pointer bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 p-5 border border-gray-200 dark:border-gray-700 animate-fade-in-up"
                    >
                        <div className="flex items-start space-x-4">
                            <div
                                className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 transform group-hover:scale-110 transition-transform duration-300"
                                style={{ backgroundColor: category.colorCode }}
                            >
                                <IconComponent className="text-white" size={32} />
                            </div>

                            <div className="flex-1">
                                <div className="flex items-start justify-between flex-wrap gap-2">
                                    <div>
                                        <h3 className="font-bold text-xl text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                            {category.name}
                                        </h3>
                                        <div className="flex items-center space-x-3 mt-1">
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                Order: {category.order}
                                            </span>
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                                                {category.totalSubjects || 0} Subjects
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-indigo-600 dark:text-indigo-400 font-medium group-hover:translate-x-2 transition-transform duration-300 flex items-center space-x-1">
                                        <span>View Details</span>
                                        <ArrowRight size={16} />
                                    </div>
                                </div>

                                {category.description && (
                                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-2 line-clamp-2">
                                        {category.description}
                                    </p>
                                )}

                                {category.subjects && category.subjects.length > 0 && (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {category.subjects.slice(0, 3).map((subject) => (
                                            <span
                                                key={subject._id}
                                                className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
                                            >
                                                {subject.name}
                                            </span>
                                        ))}
                                        {category.subjects.length > 3 && (
                                            <span className="text-xs px-2 py-1 text-gray-500">
                                                +{category.subjects.length - 3} more
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mx-auto"></div>
                        <Loader className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-indigo-600" size={24} />
                    </div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">Loading amazing categories...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            {/* Hero Section - Redesigned */}
            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-blob"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-400 rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
                </div>

                {/* Floating Particles */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[...Array(20)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute animate-float"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 5}s`,
                                animationDuration: `${3 + Math.random() * 4}s`
                            }}
                        >
                            <Sparkles size={12 + Math.random() * 10} className="text-white/30" />
                        </div>
                    ))}
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
                    <div className="text-center md:text-left md:flex md:items-center md:justify-between">
                        <div className="space-y-6 flex-1 animate-fade-in-up">
                            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 text-white/90 text-sm font-medium">
                                <Zap size={16} className="text-yellow-300" />
                                <span>Discover Your Learning Path</span>
                            </div>

                            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
                                Explore
                                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-300">
                                    Categories
                                </span>
                            </h1>

                            <p className="text-lg md:text-xl text-indigo-100 max-w-2xl leading-relaxed">
                                Discover comprehensive study materials organized by categories.
                                Choose your path and start your learning journey today with expertly curated content.
                            </p>

                        </div>

                        {/* Hero Illustration */}
                        <div className="hidden lg:block flex-1 animate-fade-in-right">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full filter blur-3xl opacity-30 animate-pulse"></div>
                                <div className="relative bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
                                    <div className="grid grid-cols-2 gap-4">
                                        {categories.slice(0, 4).map((category, i) => {
                                            const IconComponent = getIconComponent(category.icon);
                                            return (
                                                <div key={i} className="bg-white/10 rounded-xl p-4 text-center hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                                                    <IconComponent className="mx-auto text-white mb-2" size={32} />
                                                    <p className="text-white text-sm font-medium">{category.name}</p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Wave Divider */}
                <div className="absolute -bottom-20 left-0 right-0">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full">
                        <path fill="currentColor" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,154.7C960,171,1056,181,1152,165.3C1248,149,1344,107,1392,85.3L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" className="text-gray-50 dark:text-gray-900 fill-current"></path>
                    </svg>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
                {/* Search and Filter Bar */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-xl p-5 mb-8 sticky top-4 z-20 border border-gray-200/50 dark:border-gray-700/50 animate-fade-in-up">
                    <div className="flex flex-wrap gap-4 items-center justify-between">
                        <div className="flex-1 min-w-[200px]">
                            <div className="relative group">
                                <Search size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search categories, topics, or subjects..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-300"
                                />
                            </div>
                        </div>

                        <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
                            <button
                                onClick={() => setViewMode("grid")}
                                className={`p-2 rounded-lg transition-all duration-300 ${viewMode === "grid"
                                    ? "bg-white dark:bg-gray-600 text-indigo-600 shadow-md"
                                    : "text-gray-600 dark:text-gray-400 hover:text-indigo-600"
                                    }`}
                                title="Grid View"
                            >
                                <Grid3x3 size={18} />
                            </button>
                            <button
                                onClick={() => setViewMode("list")}
                                className={`p-2 rounded-lg transition-all duration-300 ${viewMode === "list"
                                    ? "bg-white dark:bg-gray-600 text-indigo-600 shadow-md"
                                    : "text-gray-600 dark:text-gray-400 hover:text-indigo-600"
                                    }`}
                                title="List View"
                            >
                                <List size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Results Count */}
                <div
                    id="results-count"
                    className="mb-6 animate-fade-in-up scroll-mt-32"
                >
                    <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                        <Sparkles size={16} className="text-indigo-500" />
                        Found <span className="font-semibold text-gray-900 dark:text-white">{filteredCategories.length}</span> categories
                    </p>
                </div>

                {/* Categories Display */}
                {filteredCategories.length === 0 ? (
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-xl p-16 text-center border border-gray-200/50 dark:border-gray-700/50 animate-fade-in-up">
                        <FolderTree size={80} className="mx-auto text-gray-400 mb-4" />
                        <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                            No Categories Found
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            {searchTerm ? "No categories match your search criteria" : "Categories will appear here once added"}
                        </p>
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm("")}
                                className="mt-6 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                            >
                                Clear Search
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        {viewMode === "grid" ? <GridView /> : <ListView />}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-12 flex justify-center animate-fade-in-up">
                                <nav className="flex items-center space-x-2">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="px-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300"
                                    >
                                        <ChevronLeft size={18} />
                                    </button>

                                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                        let pageNum;
                                        if (totalPages <= 5) {
                                            pageNum = i + 1;
                                        } else if (currentPage <= 3) {
                                            pageNum = i + 1;
                                        } else if (currentPage >= totalPages - 2) {
                                            pageNum = totalPages - 4 + i;
                                        } else {
                                            pageNum = currentPage - 2 + i;
                                        }

                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => setCurrentPage(pageNum)}
                                                className={`px-4 py-2 rounded-xl transition-all duration-300 ${currentPage === pageNum
                                                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md"
                                                    : "border-2 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                                                    }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}

                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="px-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300"
                                    >
                                        <ChevronRight size={18} />
                                    </button>
                                </nav>
                            </div>
                        )}

                        {/* Results Info */}
                        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400 animate-fade-in-up">
                            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredCategories.length)} of {filteredCategories.length} categories
                        </div>
                    </>
                )}
            </div>

            <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
          opacity: 0;
        }
        
        .animate-fade-in-right {
          animation: fadeInRight 0.6s ease-out forwards;
          opacity: 0;
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
        </div>
    );
}