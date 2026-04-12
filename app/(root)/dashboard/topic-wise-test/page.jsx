"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import axios from "axios";
import {
  BookOpen,
  Loader2,
  Search,
  ChevronRight,
  Grid3x3,
  List,
  Filter
} from "lucide-react";

export default function SubjectsPage() {
  const router = useRouter();
  const { token } = useSelector((state) => state.auth);
  
  const [subjects, setSubjects] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // grid or list

  // Subject images mapping (you can add more or fetch from backend)
  const subjectImages = {
    "Mathematics": "/images/subjects/math.jpg",
    "Physics": "/images/subjects/physics.jpg",
    "Chemistry": "/images/subjects/chemistry.jpg",
    "Biology": "/images/subjects/biology.jpg",
    "Computer Science": "/images/subjects/cs.jpg",
    "English": "/images/subjects/english.jpg",
    "History": "/images/subjects/history.jpg",
    "Geography": "/images/subjects/geography.png",
    "Economics": "./images/subjects/economics.jpg",
    "Business Studies": "/images/subjects/business.jpg",
    "Accounting": "/images/subjects/accounting.jpg",
    "Psychology": "/images/subjects/psychology.jpg",
    "Sociology": "/images/subjects/sociology.jpg",
    "Political Science": "/images/subjects/political.jpg",
    "default": "/images/subjects/default.jpg"
  };

  // Fallback images with gradient backgrounds
  const getSubjectImage = (subjectName) => {
    return subjectImages[subjectName] || subjectImages.default;
  };

  // Get gradient color based on subject name (for fallback)
  const getGradientColor = (name) => {
    const colors = [
      "from-blue-500 to-blue-600",
      "from-purple-500 to-purple-600",
      "from-green-500 to-green-600",
      "from-orange-500 to-orange-600",
      "from-red-500 to-red-600",
      "from-pink-500 to-pink-600",
      "from-indigo-500 to-indigo-600",
      "from-teal-500 to-teal-600",
      "from-yellow-500 to-yellow-600",
      "from-cyan-500 to-cyan-600"
    ];
    const index = name.length % colors.length;
    return colors[index];
  };

  // Fetch subjects
  const fetchSubjects = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/subjects/all`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setSubjects(response.data.data || []);
      setFilteredSubjects(response.data.data || []);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  // Filter subjects based on search
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredSubjects(subjects);
    } else {
      const filtered = subjects.filter(subject =>
        subject.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSubjects(filtered);
    }
  }, [searchTerm, subjects]);

  const handleSubjectClick = (subjectId, subjectName) => {
    router.push(`/dashboard/topic-wise-test/${subjectId}/topics`);
  };

  // Compact Subject Card (Grid View)
  const SubjectGridCard = ({ subject, index }) => (
    <div
      onClick={() => handleSubjectClick(subject._id, subject.name)}
      className="group cursor-pointer transform transition-all duration-200 hover:-translate-y-1"
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition">
        {/* Image Section */}
        <div className="relative h-32 overflow-hidden bg-gradient-to-r ${getGradientColor(subject.name)}">
          <img
            src={subject.imageUrl}
            alt={subject.name}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.classList.add('flex', 'items-center', 'justify-center');
              e.target.parentElement.innerHTML = `
                <div class="flex flex-col items-center justify-center text-white">
                  <BookOpen class="w-8 h-8 mb-1" />
                  <span class="text-xs font-medium">${subject.name.charAt(0)}</span>
                </div>
              `;
            }}
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition" />
        </div>
        
        {/* Content */}
        <div className="p-3">
          <h3 className="font-semibold text-gray-800 dark:text-white text-sm line-clamp-1">
            {subject.name}
          </h3>
          {subject.description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
              {subject.description}
            </p>
          )}
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">
              View Tests
            </span>
            <ChevronRight size={14} className="text-gray-400 group-hover:text-purple-500 transition" />
          </div>
        </div>
      </div>
    </div>
  );

  // Compact Subject List Item (List View)
  const SubjectListItem = ({ subject }) => (
    <div
      onClick={() => handleSubjectClick(subject._id, subject.name)}
      className="group cursor-pointer bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-center gap-3">
        {/* Icon/Image */}
        <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${getGradientColor(subject.name)} flex items-center justify-center flex-shrink-0`}>
          <BookOpen className="w-5 h-5 text-white" />
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-800 dark:text-white text-sm">
            {subject.name}
          </h3>
          {subject.description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {subject.description}
            </p>
          )}
        </div>
        
        {/* Arrow */}
        <ChevronRight size={16} className="text-gray-400 group-hover:text-purple-500 transition transform group-hover:translate-x-0.5" />
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-purple-500 animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading subjects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                Subjects
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Choose a subject to attempt tests
              </p>
            </div>
            
            {/* View Toggle */}
            <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-md transition ${
                  viewMode === "grid"
                    ? "bg-white dark:bg-gray-700 text-purple-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                <Grid3x3 size={16} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-md transition ${
                  viewMode === "list"
                    ? "bg-white dark:bg-gray-700 text-purple-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search subjects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
            />
          </div>
        </div>

        {/* Subjects Count */}
        <div className="mb-3">
          <p className="text-xs text-gray-500">
            {filteredSubjects.length} subject{filteredSubjects.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* Subjects Grid/List */}
        {filteredSubjects.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
            <BookOpen className="w-10 h-10 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">No subjects found</p>
            {searchTerm && (
              <p className="text-xs text-gray-400 mt-1">Try a different search term</p>
            )}
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {filteredSubjects.map((subject, index) => (
              <SubjectGridCard key={subject._id} subject={subject} index={index} />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredSubjects.map((subject) => (
              <SubjectListItem key={subject._id} subject={subject} />
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}