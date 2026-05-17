"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as faceapi from "face-api.js";
import { TriangleAlert, Camera, Loader2, Eye, EyeOff, UserCheck, Users, Smartphone, PauseCircle, RefreshCw } from "lucide-react";

// Types of violations
const VIOLATION_TYPES = {
  NO_FACE: "no_face",
  MULTIPLE_FACES: "multiple_faces",
  OBJECT_DETECTED: "object_detected",
};

// Warning messages
const violationMessages = {
  [VIOLATION_TYPES.NO_FACE]: "No face detected! Please look at the camera.",
  [VIOLATION_TYPES.MULTIPLE_FACES]: "Multiple faces detected! Only you should be visible.",
  [VIOLATION_TYPES.OBJECT_DETECTED]: "Mobile phone detected! Please remove any electronic devices.",
};

export default function FaceCameraMonitor({ onViolation, onClear, testActive = true }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const detectionIntervalRef = useRef(null);
  const faceDetectionTimeoutRef = useRef(null);
  
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [currentViolation, setCurrentViolation] = useState(null);
  const [warningCount, setWarningCount] = useState(0);
  const [faceDetected, setFaceDetected] = useState(false);
  const [faceCount, setFaceCount] = useState(0);
  const [showPreview, setShowPreview] = useState(true);
  const [isInitializing, setIsInitializing] = useState(false);
  const [detectionConfidence, setDetectionConfidence] = useState(0);
  const [retryCount, setRetryCount] = useState(0);

  // Load face-api models
  useEffect(() => {
    const loadModels = async () => {
      try {
        // Try multiple model sources for reliability
        const modelUrls = [
          "/models",
          "https://justadudewhohacks.github.io/face-api.js/models",
          "https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/models"
        ];
        
        for (const url of modelUrls) {
          try {
            await faceapi.nets.tinyFaceDetector.loadFromUri(url);
            console.log(`Face detection models loaded from ${url}`);
            setModelsLoaded(true);
            break;
          } catch (err) {
            console.warn(`Failed to load from ${url}:`, err);
          }
        }
        
        if (!modelsLoaded) {
          // Try one more time with local path
          await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
          setModelsLoaded(true);
        }
      } catch (err) {
        console.error("Failed to load face models:", err);
        setCameraError("Failed to load face detection models. Please refresh the page.");
      }
    };
    
    loadModels();
    
    return () => {
      stopDetection();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Start camera when models are loaded and test is active
  useEffect(() => {
    if (modelsLoaded && testActive && !cameraReady && !cameraError && !isInitializing) {
      startCamera();
    }
    
    return () => {
      stopDetection();
    };
  }, [modelsLoaded, testActive, cameraReady, cameraError, isInitializing]);

  // Start camera with better error handling
  const startCamera = async () => {
    setIsInitializing(true);
    setCameraError(null);
    
    try {
      // First check if camera is available
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasCamera = devices.some(device => device.kind === "videoinput");
      
      if (!hasCamera) {
        setCameraError("No camera found on your device.");
        setIsInitializing(false);
        return;
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640, min: 320 },
          height: { ideal: 480, min: 240 },
          facingMode: "user"
        },
        audio: false
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play()
            .then(() => {
              console.log("Video playing successfully");
              setCameraReady(true);
              setIsInitializing(false);
              startDetection();
            })
            .catch((err) => {
              console.error("Video play error:", err);
              setCameraError("Failed to start video stream.");
              setIsInitializing(false);
            });
        };
      }
    } catch (err) {
      console.error("Camera error:", err);
      if (err.name === "NotAllowedError") {
        setCameraError("Camera access denied. Please allow camera access to continue the test.");
      } else if (err.name === "NotFoundError") {
        setCameraError("No camera found on your device.");
      } else if (err.name === "NotReadableError") {
        setCameraError("Camera is in use by another application.");
      } else {
        setCameraError("Failed to access camera. Please check your camera settings.");
      }
      setIsInitializing(false);
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraReady(false);
    setFaceDetected(false);
    setFaceCount(0);
  };

  // Start detection
  const startDetection = () => {
    if (!modelsLoaded || !cameraReady) return;
    
    // Clear any existing interval
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
    }
    
    // Run detection every 500ms
    detectionIntervalRef.current = setInterval(() => {
      if (videoRef.current && videoRef.current.readyState === 4 && videoRef.current.videoWidth > 0) {
        detectFaces();
      }
    }, 500);
  };

  // Stop detection
  const stopDetection = () => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    if (faceDetectionTimeoutRef.current) {
      clearTimeout(faceDetectionTimeoutRef.current);
    }
  };

  // Draw detection results on canvas
  const drawDetections = (detections) => {
    if (!canvasRef.current || !videoRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Match canvas size to video display size
    const displayWidth = video.clientWidth;
    const displayHeight = video.clientHeight;
    
    canvas.width = displayWidth;
    canvas.height = displayHeight;
    
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Calculate scale factors
    const scaleX = displayWidth / video.videoWidth;
    const scaleY = displayHeight / video.videoHeight;
    
    // Draw bounding boxes for each face
    detections.forEach(detection => {
      const box = detection.box;
      const x = box.x * scaleX;
      const y = box.y * scaleY;
      const width = box.width * scaleX;
      const height = box.height * scaleY;
      
      ctx.strokeStyle = "#00ff00";
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);
      
      // Add label
      ctx.fillStyle = "#00ff00";
      ctx.font = "12px Arial";
      ctx.fillText("Face Detected", x, y - 5);
    });
  };

  // Main face detection function
  const detectFaces = async () => {
    if (!videoRef.current || !modelsLoaded || !cameraReady) return;
    
    try {
      // Get video dimensions
      const videoWidth = videoRef.current.videoWidth;
      const videoHeight = videoRef.current.videoHeight;
      
      if (videoWidth === 0 || videoHeight === 0) {
        return;
      }
      
      // Detect faces with TinyFaceDetector
      const detections = await faceapi.detectAllFaces(
        videoRef.current,
        new faceapi.TinyFaceDetectorOptions({
          inputSize: 320,
          scoreThreshold: 0.5
        })
      );
      
      const faces = detections || [];
      const currentFaceCount = faces.length;
      setFaceCount(currentFaceCount);
      
      // Calculate detection confidence (rough estimate)
      const confidence = faces.length > 0 ? Math.min(faces[0].score || 0.5, 1) : 0;
      setDetectionConfidence(confidence);
      
      // Draw bounding boxes
      drawDetections(faces);
      
      let violation = null;
      
      // Check for multiple faces
      if (currentFaceCount > 1) {
        violation = VIOLATION_TYPES.MULTIPLE_FACES;
        setFaceDetected(true);
      } 
      // Check for no face
      else if (currentFaceCount === 0) {
        violation = VIOLATION_TYPES.NO_FACE;
        setFaceDetected(false);
      } 
      // Single face detected
      else {
        setFaceDetected(true);
        // Here you can add object detection if needed
      }
      
      // Handle violation
      if (violation) {
        if (currentViolation !== violation) {
          setCurrentViolation(violation);
          setWarningCount(prev => prev + 1);
          
          // Call parent callback
          if (onViolation) {
            onViolation(violation, violationMessages[violation]);
          }
        }
      } else {
        if (currentViolation !== null) {
          setCurrentViolation(null);
          if (onClear) {
            onClear();
          }
        }
      }
      
    } catch (err) {
      console.error("Face detection error:", err);
    }
  };

  // Retry camera
  const retryCamera = () => {
    setRetryCount(prev => prev + 1);
    setCameraError(null);
    setCameraReady(false);
    setFaceDetected(false);
    setFaceCount(0);
    setCurrentViolation(null);
    stopCamera();
    stopDetection();
    
    // Small delay before restarting
    setTimeout(() => {
      startCamera();
    }, 500);
  };

  // Toggle video preview
  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  // Get violation icon
  const getViolationIcon = () => {
    if (currentViolation === VIOLATION_TYPES.MULTIPLE_FACES) {
      return <Users className="w-5 h-5 text-red-500" />;
    }
    if (currentViolation === VIOLATION_TYPES.NO_FACE) {
      return <EyeOff className="w-5 h-5 text-red-500" />;
    }
    if (currentViolation === VIOLATION_TYPES.OBJECT_DETECTED) {
      return <Smartphone className="w-5 h-5 text-red-500" />;
    }
    if (faceDetected && faceCount === 1) {
      return <UserCheck className="w-5 h-5 text-green-500" />;
    }
    return <Camera className="w-5 h-5 text-gray-500" />;
  };

  // Get status text
  const getStatusText = () => {
    if (cameraError) return "Camera Error";
    if (isInitializing) return "Starting camera...";
    if (!cameraReady) return "Waiting for camera...";
    if (!modelsLoaded) return "Loading models...";
    if (currentViolation === VIOLATION_TYPES.NO_FACE) return "No Face Detected";
    if (currentViolation === VIOLATION_TYPES.MULTIPLE_FACES) return "Multiple Faces Detected";
    if (faceDetected && faceCount === 1) return `Face Detected (${Math.round(detectionConfidence * 100)}%)`;
    if (faceCount === 0) return "Scanning for face...";
    return "Monitoring...";
  };

  // Get status color
  const getStatusColor = () => {
    if (cameraError) return "text-red-500";
    if (currentViolation) return "text-red-500";
    if (faceDetected) return "text-green-500";
    if (cameraReady) return "text-yellow-500";
    return "text-gray-500";
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-white" />
            <h3 className="text-sm font-semibold text-white">Proctoring Active</h3>
          </div>
          <button
            onClick={togglePreview}
            className="text-white/80 hover:text-white transition"
          >
            {showPreview ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>
        </div>
      </div>
      
      {/* Camera Preview */}
      {showPreview && (
        <div className="relative bg-gray-900 min-h-[180px]">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-auto min-h-[180px] object-cover"
            style={{ transform: 'scaleX(-1)' }}
          />
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
            style={{ transform: 'scaleX(-1)', objectFit: 'cover' }}
          />
          
          {/* Camera Error Overlay */}
          {cameraError && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-4">
              <TriangleAlert className="w-8 h-8 text-red-500 mb-2" />
              <p className="text-white text-xs text-center mb-3">{cameraError}</p>
              <button
                onClick={retryCamera}
                className="px-3 py-1 bg-purple-600 text-white text-xs rounded-lg hover:bg-purple-700 transition flex items-center gap-1"
              >
                <RefreshCw size={12} />
                Retry Camera
              </button>
            </div>
          )}
          
          {/* Loading Overlay */}
          {(isInitializing || !modelsLoaded) && !cameraError && (
            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
              <Loader2 className="w-6 h-6 text-white animate-spin mb-2" />
              <p className="text-white text-xs">
                {!modelsLoaded ? "Loading models..." : "Starting camera..."}
              </p>
            </div>
          )}
          
          {/* No Face Overlay (subtle) */}
          {cameraReady && modelsLoaded && !cameraError && !faceDetected && faceCount === 0 && (
            <div className="absolute inset-0 bg-yellow-500/10 flex items-center justify-center pointer-events-none">
              <div className="bg-black/50 rounded-full p-2">
                <EyeOff className="w-8 h-8 text-yellow-500" />
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Status Section */}
      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getViolationIcon()}
            <span className={`text-xs font-medium ${getStatusColor()}`}>
              {getStatusText()}
            </span>
          </div>
          
          {!cameraError && cameraReady && modelsLoaded && (
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${cameraReady ? "bg-green-500 animate-pulse" : "bg-gray-400"}`} />
              <span className="text-xs text-gray-400">
                {cameraReady ? "Live" : "Stopped"}
              </span>
            </div>
          )}
        </div>
        
        {/* Warning Badge */}
        {currentViolation && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-2">
            <div className="flex items-start gap-2">
              <TriangleAlert className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                  {violationMessages[currentViolation]}
                </p>
                <p className="text-xs text-red-400 dark:text-red-500 mt-1">
                  Warning #{warningCount}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Stats */}
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 pt-1 border-t border-gray-100 dark:border-gray-700">
          <span>Status: {faceDetected ? "Face OK" : "No Face"}</span>
          <span>Faces: {faceCount}</span>
          <span>Warnings: {warningCount}</span>
        </div>
        
        {/* Retry button for manual refresh */}
        {cameraReady && modelsLoaded && !cameraError && (
          <button
            onClick={retryCamera}
            className="w-full mt-1 text-xs text-gray-400 hover:text-gray-600 transition flex items-center justify-center gap-1 py-1"
          >
            <RefreshCw size={10} />
            Refresh Camera
          </button>
        )}
      </div>
    </div>
  );
}