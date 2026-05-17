"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import * as faceapi from "face-api.js";
import { 
  Clock, 
  FileQuestion, 
  Trophy, 
  AlertCircle, 
  CheckCircle, 
  BookOpen, 
  Target,
  ChevronRight,
  Shield,
  Monitor,
  AlertTriangle,
  ArrowRight,
  Layers,
  Calendar,
  Award,
  Users,
  BarChart3,
  TrendingUp,
  Info,
  RefreshCw,
  History,
  Maximize2,
  Camera,
  Loader2,
  XCircle,
  UserCheck,
  Users as UsersIcon
} from "lucide-react";

// ============================================================
// Camera & Fullscreen Check Component (Modal Popup)
// Sequence: Camera Permission -> Face Detection -> Fullscreen
// Also re-checks fullscreen if user exits
// ============================================================
function AccessGuard({ onComplete }) {
  const [step, setStep] = useState("camera"); // camera -> face -> fullscreen
  const [fullscreenError, setFullscreenError] = useState("");
  const [cameraError, setCameraError] = useState("");
  const [faceError, setFaceError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [faceStatus, setFaceStatus] = useState("");
  const [faceDetected, setFaceDetected] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [fullscreenComplete, setFullscreenComplete] = useState(false);
  
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);

  // Load face-api models on mount
  useEffect(() => {
    const loadModels = async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri("https://justadudewhohacks.github.io/face-api.js/models");
        setModelsLoaded(true);
      } catch (err) {
        console.error("Failed to load face models:", err);
        setFaceError("Failed to load face detection models. Please refresh and try again.");
      }
    };
    loadModels();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Monitor fullscreen status after entering fullscreen mode
  useEffect(() => {
    if (step === "fullscreen" && fullscreenComplete) {
      // Check periodically if fullscreen is still active
      const fullscreenCheckInterval = setInterval(() => {
        const isFullscreen = !!document.fullscreenElement || !!document.webkitFullscreenElement;
        if (!isFullscreen) {
          // User exited fullscreen, show the popup again
          setFullscreenComplete(false);
          setFullscreenError("");
          setStep("fullscreen");
        }
      }, 1000);

      return () => clearInterval(fullscreenCheckInterval);
    }
  }, [step, fullscreenComplete]);

  // Request camera and start face detection
  const requestCamera = async () => {
    setIsLoading(true);
    setCameraError("");
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user"
        }, 
        audio: false 
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      
      setStep("face");
      setIsLoading(false);
      startFaceDetection();
    } catch (err) {
      console.error("Camera error:", err);
      if (err.name === "NotAllowedError") {
        setCameraError("Camera permission denied. Please allow camera access and click retry.");
      } else if (err.name === "NotFoundError") {
        setCameraError("No camera found on your device.");
      } else {
        setCameraError("Failed to access camera. Please check your permissions.");
      }
      setIsLoading(false);
    }
  };

  // Start periodic face detection
  const startFaceDetection = () => {
    if (!modelsLoaded) {
      setFaceError("Models still loading...");
      return;
    }
    
    let detectionCount = 0;
    const requiredDetections = 3;
    
    intervalRef.current = setInterval(async () => {
      if (!videoRef.current || videoRef.current.readyState !== 4) return;
      
      try {
        const detections = await faceapi.detectAllFaces(
          videoRef.current,
          new faceapi.TinyFaceDetectorOptions()
        );
        
        if (detections.length === 0) {
          setFaceError("No face detected. Please look directly at the camera.");
          setFaceStatus("");
          detectionCount = 0;
          setFaceDetected(false);
        } else if (detections.length > 1) {
          setFaceError("Multiple faces detected. Only one person should be visible.");
          setFaceStatus("");
          detectionCount = 0;
          setFaceDetected(false);
        } else {
          setFaceError("");
          detectionCount++;
          setFaceStatus(`Face detected (${detectionCount}/${requiredDetections})`);
          
          if (detectionCount >= requiredDetections && !faceDetected) {
            setFaceDetected(true);
            setFaceStatus("Face verified! Proceeding to fullscreen...");
            // Stop camera stream
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (streamRef.current) {
              streamRef.current.getTracks().forEach(track => track.stop());
            }
            // Move to fullscreen step
            setStep("fullscreen");
          }
        }
      } catch (err) {
        console.error("Face detection error:", err);
        setFaceError("Face detection failed. Please ensure good lighting.");
      }
    }, 800);
  };

  // Request fullscreen
  const requestFullscreen = async () => {
    setIsLoading(true);
    setFullscreenError("");
    
    try {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        await elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) {
        await elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) {
        await elem.msRequestFullscreen();
      }
      
      // Check if fullscreen is actually active
      setTimeout(() => {
        if (!document.fullscreenElement && !document.webkitFullscreenElement) {
          setFullscreenError("Fullscreen was not activated. Please click the button again and allow fullscreen.");
          setIsLoading(false);
        } else {
          setFullscreenComplete(true);
          // All done!
          onComplete();
        }
      }, 500);
    } catch (err) {
      setFullscreenError("Failed to enter fullscreen. Please click the button and allow fullscreen.");
      setIsLoading(false);
    }
  };

  // Retry camera
  const retryCamera = () => {
    setCameraError("");
    setFaceError("");
    requestCamera();
  };

  // Retry fullscreen
  const retryFullscreen = () => {
    setFullscreenError("");
    requestFullscreen();
  };

  // Render camera step
  if (step === "camera") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-in fade-in zoom-in duration-300">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
            <div className="flex items-center gap-3">
              <Camera className="w-6 h-6 text-white" />
              <h2 className="text-xl font-bold text-white">Camera Permission Required</h2>
            </div>
          </div>
          
          <div className="p-6">
            <p className="text-gray-600 mb-4">
              This test requires camera access to verify your identity and monitor for fairness. Please allow camera access to continue.
            </p>
            
            {cameraError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-600">{cameraError}</p>
              </div>
            )}
            
            <button
              onClick={requestCamera}
              disabled={isLoading || !modelsLoaded}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-70"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Camera className="w-5 h-5" />
              )}
              {isLoading ? "Accessing Camera..." : !modelsLoaded ? "Loading Models..." : "Allow Camera Access"}
            </button>
            
            {cameraError && (
              <button
                onClick={retryCamera}
                className="w-full mt-3 text-gray-500 text-sm py-2 hover:text-gray-700 transition"
              >
                Retry
              </button>
            )}
            
            <p className="text-xs text-gray-400 text-center mt-4">
              Your privacy is important. Camera feed is used only for test proctoring and is not recorded.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Render face detection step
  if (step === "face") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden animate-in fade-in zoom-in duration-300">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
            <div className="flex items-center gap-3">
              <UserCheck className="w-6 h-6 text-white" />
              <h2 className="text-xl font-bold text-white">Face Verification</h2>
            </div>
          </div>
          
          <div className="p-6">
            <p className="text-gray-600 mb-3">
              Please look directly at the camera. We need to verify your face is visible.
            </p>
            
            <div className="relative rounded-xl overflow-hidden bg-gray-900 mb-4">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-auto max-h-64 object-cover"
              />
              <div className="absolute inset-0 border-2 border-blue-500 rounded-xl pointer-events-none"></div>
            </div>
            
            {faceError && (
              <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-600">{faceError}</p>
              </div>
            )}
            
            {faceStatus && !faceError && (
              <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-green-500 flex-shrink-0" />
                <p className="text-sm text-green-600">{faceStatus}</p>
              </div>
            )}
            
            {!modelsLoaded && (
              <div className="flex items-center justify-center gap-2 text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Loading face detection models...</span>
              </div>
            )}
            
            <button
              onClick={retryCamera}
              className="w-full mt-2 text-gray-400 text-sm py-2 hover:text-gray-600 transition flex items-center justify-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              Retry Camera
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render fullscreen step
  if (step === "fullscreen") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-in fade-in zoom-in duration-300">
          <div className="bg-gradient-to-r from-orange-600 to-red-600 px-6 py-4">
            <div className="flex items-center gap-3">
              <Maximize2 className="w-6 h-6 text-white" />
              <h2 className="text-xl font-bold text-white">Fullscreen Mode Required</h2>
            </div>
          </div>
          
          <div className="p-6">
            <p className="text-gray-600 mb-4">
              Please enter fullscreen mode to continue with your test. Fullscreen must remain active during the entire test.
            </p>
            
            {fullscreenError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-600">{fullscreenError}</p>
              </div>
            )}
            
            <button
              onClick={requestFullscreen}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-70"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Maximize2 className="w-5 h-5" />
              )}
              {isLoading ? "Requesting..." : "Enter Fullscreen Mode"}
            </button>
            
            {fullscreenError && (
              <button
                onClick={retryFullscreen}
                className="w-full mt-3 text-gray-500 text-sm py-2 hover:text-gray-700 transition"
              >
                Try Again
              </button>
            )}
            
            <p className="text-xs text-gray-400 text-center mt-4">
              Press F11 or click the button above. If you exit fullscreen during the test, you will be prompted again.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// ============================================================
// Main Test Details Component with Guard
// ============================================================
export default function TestDetails() {
  const { testId } = useParams();
  const router = useRouter();
  const [accessGranted, setAccessGranted] = useState(false);
  const [test, setTest] = useState(null);
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [attemptInfo, setAttemptInfo] = useState(null);
  const [showInstructions, setShowInstructions] = useState(true);
  const [expandedSections, setExpandedSections] = useState({});

  // Monitor fullscreen status after access is granted
  useEffect(() => {
    if (!accessGranted) return;

    const handleFullscreenChange = () => {
      const isFullscreen = !!document.fullscreenElement || !!document.webkitFullscreenElement;
      if (!isFullscreen && accessGranted) {
        // User exited fullscreen, show the guard again
        setAccessGranted(false);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
    };
  }, [accessGranted]);

  useEffect(() => {
    if (accessGranted) {
      fetchTest();
    }
  }, [accessGranted]);

  const fetchTest = async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/tests/${testId}/details`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      }
    );
    const data = await res.json();
    setTest(data.test);
    setAttemptInfo(data.attemptInfo);
  };

  const handleStart = async () => {
    if (!checked) return;
  
    setLoading(true);
    
    if (attemptInfo?.action === "resume") {
      if (test.hasSections) {
        router.push(
          `/user/sectional/${testId}/attempt/${attemptInfo.activeAttemptId}?agreed=${checked}`
        );
      } else {
        router.push(
          `/user/test/${testId}/attempt/${attemptInfo.activeAttemptId}?agreed=${checked}`
        );
      }
      setLoading(false);
      return;
    }
  
    try {
      const deviceRes = await fetch(`/api/device`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      });
  
      if (!deviceRes.ok) throw new Error("Failed to get device info");
      const deviceData = await deviceRes.json();
      
      const startRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/tests/${testId}/start`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ipAddress: deviceData.ip,
          deviceInfo: deviceData.deviceInfo
        })
      });
  
      const data = await startRes.json();
  
      if (startRes.ok) {
        if (test.hasSections) {
          router.push(
            `/user/sectional/${testId}/attempt/${data?.attemptId}?agreed=${checked}`
          );
        } else {
          router.push(
            `/user/test/${testId}/attempt/${data?.attemptId}?agreed=${checked}`
          );
        }
      } else {
        console.error("Failed to start test:", data);
      }
    } catch (error) {
      console.error("Error in handleStart:", error);
    } finally {
      setLoading(false);
    }
  };

  const getButtonText = () => {
    if (!attemptInfo) return "Start Test";
    if (attemptInfo.attemptCount >= attemptInfo.maxAttempts) return "No Attempts Left";
    switch (attemptInfo.action) {
      case "resume": return "Resume Test";
      case "reattempt": return "Re-attempt";
      default: return "Start Test";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  // Show access guard until permissions are granted
  if (!accessGranted) {
    return <AccessGuard onComplete={() => setAccessGranted(true)} />;
  }

  if (!test) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading test details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Fullscreen indicator */}
        <div className="fixed bottom-4 right-4 z-40">
          <div className="bg-green-600/90 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-md flex items-center gap-2 text-xs text-white">
            <Monitor className="w-3 h-3" />
            <span>Fullscreen Mode Active</span>
          </div>
        </div>

        {/* Test Header Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-white">{test.title}</h1>
                {test.description && (
                  <p className="text-blue-100 text-sm mt-1">{test.description}</p>
                )}
              </div>
              {test.hasSections && (
                <div className="bg-white/20 px-3 py-1 rounded-full flex items-center gap-1">
                  <Layers className="w-4 h-4 text-white" />
                  <span className="text-white text-sm font-medium">Sectional Test</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg"><Clock className="w-5 h-5 text-blue-600" /></div>
                <div><p className="text-xs text-gray-500">Total Duration</p><p className="text-lg font-semibold">{test.duration} min</p></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-lg"><FileQuestion className="w-5 h-5 text-green-600" /></div>
                <div><p className="text-xs text-gray-500">Total Questions</p><p className="text-lg font-semibold">{test.totalQuestions || 0}</p></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-2 rounded-lg"><Award className="w-5 h-5 text-purple-600" /></div>
                <div><p className="text-xs text-gray-500">Total Marks</p><p className="text-lg font-semibold">{test.totalMarks}</p></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-orange-100 p-2 rounded-lg"><Target className="w-5 h-5 text-orange-600" /></div>
                <div><p className="text-xs text-gray-500">Attempts Left</p><p className="text-lg font-semibold">{attemptInfo?.maxAttempts - attemptInfo?.attemptCount || test.maxAttempts}</p></div>
              </div>
            </div>

            {test.hasSections && test.sectionOverview?.length > 0 && (
              <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-100">
                <div className="flex items-center gap-2 mb-3">
                  <Layers className="w-5 h-5 text-purple-600" />
                  <h3 className="font-semibold text-gray-800">Test Sections</h3>
                  <span className="text-xs bg-purple-200 text-purple-700 px-2 py-0.5 rounded-full">{test.sectionsCount} Sections</span>
                </div>
                <div className="space-y-2">
                  {test.sectionOverview.map((section, idx) => (
                    <div key={idx} className="bg-white rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-purple-600">Section {idx + 1}</span>
                            <span className="text-sm font-medium text-gray-800">{section.title}</span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1"><Clock size={12} />{section.duration} min</span>
                            <span className="flex items-center gap-1"><FileQuestion size={12} />{section.questionsCount} questions</span>
                            <span className="flex items-center gap-1"><Award size={12} />{section.marksTotal} marks</span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-100">
              {test.subjects?.length > 0 && (
                <div className="flex items-start gap-2 flex-wrap">
                  <BookOpen className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div><p className="text-xs text-gray-500 mb-1">Subjects Covered</p>
                    <div className="flex flex-wrap gap-1">{test.subjects.map((subject, idx) => (
                      <span key={idx} className="text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-700">{typeof subject === 'object' ? subject.name : subject}</span>
                    ))}</div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-gray-400" /><span className="text-gray-600">Starts:</span><span className="font-medium">{formatDate(test.startTime)}</span></div>
                <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-gray-400" /><span className="text-gray-600">Ends:</span><span className="font-medium">{formatDate(test.endTime)}</span></div>
              </div>
            </div>

            {attemptInfo && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex flex-wrap gap-3 items-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full">
                    <span className="text-xs text-gray-600">Attempts Used:</span>
                    <span className="text-xs font-semibold">{attemptInfo.attemptCount} / {attemptInfo.maxAttempts}</span>
                  </div>
                  {attemptInfo.bestScore && (<div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 rounded-full"><TrendingUp className="w-3 h-3 text-green-600" /><span className="text-xs text-green-600">Best Score:</span><span className="text-xs font-semibold text-green-700">{attemptInfo.bestScore} / {test.totalMarks}</span></div>)}
                  {attemptInfo.averageScore && (<div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 rounded-full"><BarChart3 className="w-3 h-3 text-blue-600" /><span className="text-xs text-blue-600">Average:</span><span className="text-xs font-semibold text-blue-700">{attemptInfo.averageScore.toFixed(1)} / {test.totalMarks}</span></div>)}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 ${!showInstructions ? 'opacity-75' : ''}`}>
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-3">
              <div className="flex items-center gap-2"><AlertCircle className="w-5 h-5 text-white" /><h2 className="text-white font-semibold">Important Instructions</h2></div>
            </div>
            <div className="p-5">
              <div className="space-y-4">
                <div className="flex items-start gap-3"><div className="bg-blue-100 p-1 rounded-full mt-0.5"><Clock className="w-3 h-3 text-blue-600" /></div><div><p className="text-sm font-medium">Time Limit</p><p className="text-xs text-gray-500">You have {test.duration} minutes to complete this test.</p>{test.hasSections && test.sectionOverview && (<p className="text-xs text-gray-400 mt-1">• Each section has its own time limit<br />• Section timer runs independently</p>)}</div></div>
                <div className="flex items-start gap-3"><div className="bg-green-100 p-1 rounded-full mt-0.5"><FileQuestion className="w-3 h-3 text-green-600" /></div><div><p className="text-sm font-medium">Question Pattern</p><p className="text-xs text-gray-500">Total {test.totalQuestions || 0} questions with multiple choice answers.{test.hasSections && ` Questions are divided into ${test.sectionsCount} sections.`}</p></div></div>
                <div className="flex items-start gap-3"><div className="bg-purple-100 p-1 rounded-full mt-0.5"><Award className="w-3 h-3 text-purple-600" /></div><div><p className="text-sm font-medium">Marking Scheme</p><p className="text-xs text-gray-500">Total marks: {test.totalMarks}{test.negativeMarks > 0 ? <span className="text-red-600"> Negative marking: {test.negativeMarks} marks per wrong answer.</span> : <span className="text-green-600"> No negative marking.</span>}</p></div></div>
                <div className="flex items-start gap-3"><div className="bg-red-100 p-1 rounded-full mt-0.5"><AlertTriangle className="w-3 h-3 text-red-600" /></div><div><p className="text-sm font-medium">Important Notes</p><p className="text-xs text-gray-500">• Do not refresh the page during the test.<br />• Answers are auto-saved.<br />• Ensure stable internet connection.<br />• {test.allowResume ? "You can resume the test if interrupted." : "Test cannot be resumed once interrupted."}</p></div></div>
                {test.shuffleQuestions && (<div className="flex items-start gap-3"><div className="bg-indigo-100 p-1 rounded-full mt-0.5"><Info className="w-3 h-3 text-indigo-600" /></div><div><p className="text-sm font-medium">Additional Info</p><p className="text-xs text-gray-500">Questions will be shuffled for each attempt.</p></div></div>)}
              </div>
            </div>
          </div>

          <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 ${showInstructions ? '' : 'opacity-75'}`}>
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-5 py-3">
              <div className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-white" /><h2 className="text-white font-semibold">Ready to Begin?</h2></div>
            </div>
            <div className="p-5">
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-700 mb-2">Quick Summary</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs"><span className="text-gray-500">Test Duration:</span><span className="font-medium">{test.duration} minutes</span></div>
                    <div className="flex justify-between text-xs"><span className="text-gray-500">Total Questions:</span><span className="font-medium">{test.totalQuestions || 0}</span></div>
                    <div className="flex justify-between text-xs"><span className="text-gray-500">Maximum Marks:</span><span className="font-medium">{test.totalMarks}</span></div>
                    {test.hasSections && test.sectionsCount > 0 && (<div className="flex justify-between text-xs"><span className="text-gray-500">Number of Sections:</span><span className="font-medium text-purple-600">{test.sectionsCount}</span></div>)}
                    {attemptInfo && attemptInfo.attemptCount > 0 && (<><div className="flex justify-between text-xs"><span className="text-gray-500">Previous Attempts:</span><span className="font-medium text-orange-600">{attemptInfo.attemptCount}</span></div>{attemptInfo.bestScore && (<div className="flex justify-between text-xs"><span className="text-gray-500">Best Score:</span><span className="font-medium text-green-600">{attemptInfo.bestScore} / {test.totalMarks}</span></div>)}</>)}
                  </div>
                </div>

                <label className="flex items-start gap-3 cursor-pointer group">
                  <input type="checkbox" checked={checked} onChange={() => setChecked(!checked)} className="mt-0.5 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                  <div className="flex-1"><p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">I confirm that I have read and understood all instructions</p><p className="text-xs text-gray-500">I will not switch tabs or refresh the page during the test</p></div>
                </label>

                <button disabled={!checked || loading || (attemptInfo && attemptInfo.attemptCount >= attemptInfo.maxAttempts)} onClick={handleStart} className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-3 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg">
                  {loading ? (<><div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div><span>Processing...</span></>) : (<><span>{getButtonText()}</span><ArrowRight className="w-4 h-4" /></>)}
                </button>

                <div className="flex items-center justify-center gap-4 text-xs text-gray-400 pt-2">
                  <span className="flex items-center gap-1"><Monitor className="w-3 h-3" />Desktop recommended</span>
                  <span className="flex items-center gap-1"><Shield className="w-3 h-3" />Secure browser</span>
                  {test.allowResume && (<span className="flex items-center gap-1"><RefreshCw className="w-3 h-3" />Resumable</span>)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {attemptInfo && attemptInfo.completedAttempts?.length > 0 && (
          <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-600 to-gray-700 px-5 py-3"><div className="flex items-center gap-2"><History className="w-5 h-5 text-white" /><h2 className="text-white font-semibold">Previous Attempts</h2></div></div>
            <div className="p-5">
              <div className="space-y-3">{attemptInfo.completedAttempts.map((attempt, idx) => (
                <div key={attempt.attemptId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"><div><p className="text-sm font-medium">Attempt #{attemptInfo.completedAttempts.length - idx}</p><p className="text-xs text-gray-500">{formatDate(attempt.submittedAt)}</p></div><div className="text-right"><p className="text-sm font-semibold text-green-600">Score: {attempt.score}/{test.totalMarks}</p><p className="text-xs text-gray-500">Status: {attempt.status}</p></div><button onClick={() => router.push(`/user/test/${testId}/result?attemptId=${attempt.attemptId}`)} className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition">View Result</button></div>
              ))}</div>
            </div>
          </div>
        )}

        <div className="mt-6 text-center"><p className="text-xs text-gray-400">By starting this test, you agree to abide by the test rules and regulations</p></div>
      </div>
    </div>
  );
}