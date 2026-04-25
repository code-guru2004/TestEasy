"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import axios from "axios";
import {
  ArrowLeft,
  FolderTree,
  Loader2,
  Search,
  ChevronRight,
  BookOpen,
  FileQuestion,
  Clock,
  Award,
  Grid3x3,
  List,
  AlertCircle
} from "lucide-react";

export default function TopicsPage() {
  const { subjectId } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { token } = useSelector((state) => state.auth);
  
  const subjectName = searchParams.get('name') || "Subject";
  
  const [topics, setTopics] = useState([]);
  const [filteredTopics, setFilteredTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [topicStats, setTopicStats] = useState({});

  // Fetch subject details and topics
  useEffect(() => {
    fetchSubjectAndTopics();
  }, [subjectId]);

  // Filter topics based on search
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredTopics(topics);
    } else {
      const filtered = topics.filter(topic =>
        topic.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredTopics(filtered);
    }
  }, [searchTerm, topics]);

  const fetchSubjectAndTopics = async () => {
    try {
      setLoading(true);
      
      // Fetch subject details
      const subjectRes = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/subjects/search`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      const foundSubject = subjectRes.data.data?.find(s => s._id === subjectId);
      setSubject(foundSubject);
      
      // Fetch topics for this subject
      const topicsRes = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/topics/subject/${subjectId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      const subjectTopics = topicsRes.data.data || [];
      setTopics(subjectTopics);
      setFilteredTopics(subjectTopics);
      
      // Fetch stats for each topic (number of questions)
      //await fetchTopicStats(subjectTopics);
      
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopicStats = async (topicsList) => {
    try {
      const stats = {};
      for (const topic of topicsList) {
        const questionsRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/subject/${subjectId}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        stats[topic._id] = {
          questionCount: questionsRes.data.total || 0
        };
      }
      setTopicStats(stats);
    } catch (error) {
      console.error("Error fetching topic stats:", error);
    }
  };

  const handleTopicClick = (topicId, topicName) => {
    router.push(`/dashboard/topic-wise-test/${subjectId}/topics/${topicId}?subjectName=${encodeURIComponent(subject.name)}&topicName=${encodeURIComponent(topicName)}`);
  };

  // Get gradient color based on topic name
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

  // Compact Topic Card (Grid View)
  const TopicGridCard = ({ topic }) => {
    const stats = topicStats[topic._id] || { questionCount: 0 };
    
    return (
      <div
        onClick={() => handleTopicClick(topic._id, topic.name)}
        className="group cursor-pointer transform transition-all duration-200 hover:-translate-y-1"
      >
        <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition">
          {/* Header with gradient */}
          <div className={`bg-gradient-to-r ${getGradientColor(topic.name)} p-3`}>
            <div className="flex items-center justify-between">
              <FolderTree className="w-6 h-6 text-white opacity-90" />
              <ChevronRight className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition" />
            </div>
          </div>
          
          {/* Content */}
          <div className="p-3">
            <h3 className="font-semibold text-gray-800 dark:text-white text-sm line-clamp-1">
              {topic.name}
            </h3>
            
            {/* <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <FileQuestion size={10} />
                {stats.questionCount} questions
              </span>
            </div> */}
            
            <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
              <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                View Tests →
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Compact Topic List Item (List View)
  const TopicListItem = ({ topic }) => {
    const stats = topicStats[topic._id] || { questionCount: 0 };
    
    return (
      <div
        onClick={() => handleTopicClick(topic._id, topic.name)}
        className="group cursor-pointer bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 hover:shadow-md transition-all duration-200"
      >
        <div className="flex items-center gap-3">
          {/* Icon */}
          <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${getGradientColor(topic.name)} flex items-center justify-center flex-shrink-0`}>
            <FolderTree className="w-5 h-5 text-white" />
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-800 dark:text-white text-sm">
              {topic.name}
            </h3>
            {/* <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <FileQuestion size={10} />
                {stats.questionCount} questions
              </span>
            </div> */}
          </div>
          
          {/* Arrow */}
          <ChevronRight size={16} className="text-gray-400 group-hover:text-purple-500 transition transform group-hover:translate-x-0.5" />
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-purple-500 animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading topics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-3 transition"
          >
            <ArrowLeft size={16} />
            Back to Subjects
          </button>
          
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                  {subject?.name || subjectName}
                </h1>
                {subject?.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
                    {subject.description}
                  </p>
                )}
              </div>
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
              placeholder="Search topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
            />
          </div>
        </div>

        {/* Topics Count */}
        <div className="mb-3">
          <p className="text-xs text-gray-500">
            {filteredTopics.length} topic{filteredTopics.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* Topics Grid/List */}
        {filteredTopics.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
            <AlertCircle className="w-10 h-10 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">No topics found</p>
            {searchTerm && (
              <p className="text-xs text-gray-400 mt-1">Try a different search term</p>
            )}
            {!searchTerm && topics.length === 0 && (
              <p className="text-xs text-gray-400 mt-1">No topics available for this subject yet</p>
            )}
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {filteredTopics.map((topic) => (
              <TopicGridCard key={topic._id} topic={topic} />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTopics.map((topic) => (
              <TopicListItem key={topic._id} topic={topic} />
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
      `}</style>
    </div>
  );
}