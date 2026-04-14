"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, FileText, Clock, CheckCircle, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";


export default function ResultsPage() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedTest, setSelectedTest] = useState(null);
  const [attemptPage, setAttemptPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const router = useRouter();

  const limit = 5;

  useEffect(() => {
    fetchResults();
  }, [currentPage]);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/user/results?page=${currentPage}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      
      if (data.success) {
        setResults(data.data);
        setTotalPages(data.totalPages);
        setTotal(data.total);
      }
    } catch (error) {
      console.error("Failed to fetch results:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewAttempts = (test) => {
    setSelectedTest(test);
    setAttemptPage(1);
    setDialogOpen(true);
  };

  const getPaginatedAttempts = () => {
    if (!selectedTest) return [];
    const start = (attemptPage - 1) * 5;
    const end = start + 5;
    return selectedTest.attempts.slice(start, end);
  };

  const getTotalAttemptPages = () => {
    if (!selectedTest) return 1;
    return Math.ceil(selectedTest.attempts.length / 5);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not submitted";
    return new Date(dateString).toLocaleString();
  };

  const getScoreColor = (score, total) => {
    const percentage = (score / total) * 100;
    if (percentage >= 70) return "text-green-600";
    if (percentage >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadge = (score, total) => {
    const percentage = (score / total) * 100;
    if (percentage >= 70) return "bg-green-600";
    if (percentage >= 40) return "bg-yellow-600";
    return "bg-red-600";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Loading results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Test Results
          </h1>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
            View all your test attempts and results
          </p>
        </div>

        {/* Results Grid */}
        <div className="space-y-3 md:space-y-4">
          {results.map((test, idx) => (
            <Card
              key={test.testId}
              className="relative overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
            >
              {/* Bubble Overlay */}
              <div className="absolute -top-8 -right-8 w-24 h-24 bg-blue-500/10 rounded-full"></div>
              <div className="absolute -bottom-8 -left-8 w-40 h-20 bg-purple-500/10 rounded-full"></div>
              <div className="absolute -top-8 -left-8 w-20 h-20 bg-green-500/10 rounded-full"></div>
              <div className="absolute top-2/3 left-1/4 w-20 h-20 bg-cyan-500/15 rounded-full"></div>
              
              <CardContent className="p-3 md:p-4 relative z-10">
                {/* Mobile Layout (Stacked) */}
                <div className="block md:hidden">

                  <div className="mb-3">
                    
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="text-base font-semibold text-gray-800 dark:text-white mb-1">
                          {test.title || `Test ${test.testId.slice(-6)}`}
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          {test.attempts.length}{" "}
                          {test.attempts.length === 1 ? "Attempt" : "Attempts"}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-500 space-y-1 mb-3">
                      <div>
                        <span className="font-medium">ID:</span>{" "}
                        <span className="font-mono">{test.testId.slice(-8)}</span>
                      </div>
                      <div>
                        <span className="font-medium">Attempts:</span>{" "}
                        <span className="font-semibold">{test.attempts.length}</span>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => handleViewAttempts(test)}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                    size="sm"
                  >
                    <FileText className="w-4 h-4" />
                    Select Attempt Result
                  </Button>
                </div>

                {/* Desktop Layout (Horizontal) */}
                <div className="hidden md:flex md:items-center md:justify-between">
                  {/* LEFT SIDE */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                    <Image src="/images/exan-done.jpg" alt="user" width={40} height={40} />
                      <span className="text-lg font-semibold text-gray-800 dark:text-white">
                        {test.title || `Test ${test.testId.slice(-6)}`}
                      </span>
                      <Badge variant="outline">
                        {test.attempts.length}{" "}
                        {test.attempts.length === 1 ? "Attempt" : "Attempts"}
                      </Badge>
                    </div>

                    <div className="text-sm text-gray-500 flex gap-6">
                      <span>
                        ID:{" "}
                        <span className="font-mono text-xs">
                          {test.testId.slice(-8)}
                        </span>
                      </span>
                      <span>
                        Attempts:{" "}
                        <span className="font-semibold">
                          {test.attempts.length}
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* RIGHT SIDE BUTTON */}
                  <Button
                    onClick={() => handleViewAttempts(test)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <FileText className="w-4 h-4" />
                    Select Attempt Result
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {results.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <FileText className="w-8 h-8 text-gray-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Results Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              You haven't taken any tests yet or no results are available.
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 md:mt-8 overflow-x-auto">
            <Pagination>
              <PaginationContent className="flex-wrap gap-1">
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) setCurrentPage(currentPage - 1);
                    }}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>

                {[...Array(totalPages)].map((_, i) => {
                  const pageNum = i + 1;
                  if (
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                  ) {
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(pageNum);
                          }}
                          isActive={currentPage === pageNum}
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  } else if (
                    pageNum === currentPage - 2 ||
                    pageNum === currentPage + 2
                  ) {
                    return <PaginationEllipsis key={pageNum} />;
                  }
                  return null;
                })}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                    }}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}

        {/* Dialog for Attempts */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] md:max-h-[80vh] overflow-y-auto p-4 md:p-6">
            <DialogHeader>
              <DialogTitle className="text-xl md:text-2xl">
                {selectedTest?.title || `Test ${selectedTest?.testId?.slice(-8)}`}
              </DialogTitle>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Total Attempts: {selectedTest?.attempts.length}
              </p>
            </DialogHeader>

            <div className="mt-4">
              <div className="space-y-3 overflow-y-auto max-h-[50vh] md:max-h-[40vh]">
                {getPaginatedAttempts().map((attempt, index) => {
                  const attemptNumber = (attemptPage - 1) * 5 + index + 1;

                  return (
                    <div
                      key={attempt.attemptId}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 gap-3"
                    >
                      {/* Left Side */}
                      <div className="flex-1">
                        <div className="flex items-center flex-wrap gap-2 mb-2">
                          <span className="text-sm font-semibold text-gray-800 dark:text-white">
                            Attempt #{attemptNumber}
                          </span>
                          <Badge className={`${getScoreBadge(attempt.score, attempt.totalMarks)} text-white px-2 py-1 text-xs rounded`}>
                            {attempt.score} / {attempt.totalMarks}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Clock className="w-3 h-3 flex-shrink-0" />
                          <span className="break-words">{formatDate(attempt.submittedAt)}</span>
                        </div>
                      </div>

                      {/* Right Side */}
                      <Button
                        className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto"
                        size="sm"
                        onClick={() => {
                          setDialogOpen(false);
                          router.push(
                            `/user/test/${selectedTest?.testId}/result?attemptId=${attempt.attemptId}`
                          );
                        }}
                      >
                        View Result
                      </Button>
                    </div>
                  );
                })}
              </div>

              {/* Attempt Pagination */}
              {getTotalAttemptPages() > 1 && (
                <div className="mt-6 overflow-x-auto">
                  <Pagination>
                    <PaginationContent className="flex-wrap gap-1">
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (attemptPage > 1) setAttemptPage(attemptPage - 1);
                          }}
                          className={attemptPage === 1 ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>

                      {[...Array(getTotalAttemptPages())].map((_, i) => (
                        <PaginationItem key={i + 1}>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setAttemptPage(i + 1);
                            }}
                            isActive={attemptPage === i + 1}
                          >
                            {i + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}

                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (attemptPage < getTotalAttemptPages()) setAttemptPage(attemptPage + 1);
                          }}
                          className={attemptPage === getTotalAttemptPages() ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}