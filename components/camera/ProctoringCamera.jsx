"use client";

import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";

export default function ProctoringCamera({
    onViolation,
    onPauseTest,
}) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    const monitoringIntervalRef = useRef(null);

    const noFaceStartRef = useRef(null);
    const hasViolationTriggeredRef = useRef(false);

    const [warning, setWarning] = useState("");
    const [countdown, setCountdown] = useState(null);

    const [isModelLoaded, setIsModelLoaded] = useState(false);

    useEffect(() => {
        loadModels();

        return () => {
            if (monitoringIntervalRef.current) {
                clearInterval(monitoringIntervalRef.current);
            }

            if (videoRef.current?.srcObject) {
                const tracks =
                    videoRef.current.srcObject.getTracks();

                tracks.forEach((track) => track.stop());
            }
        };
    }, []);

    useEffect(() => {
        if (isModelLoaded) {
            startCamera();
        }
    }, [isModelLoaded]);

    const loadModels = async () => {
        try {
            await faceapi.nets.tinyFaceDetector.loadFromUri(
                "/models"
            );

            setIsModelLoaded(true);
        } catch (err) {
            console.error("Model load error:", err);
        }
    };

    const startCamera = async () => {
        try {
            const stream =
                await navigator.mediaDevices.getUserMedia({
                    video: {
                        width: 640,
                        height: 480,
                        facingMode: "user",
                    },
                    audio: false,
                });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;

                videoRef.current.onloadedmetadata = () => {
                    startMonitoring();
                };
            }
        } catch (err) {
            console.error("Camera error:", err);

            setWarning("Camera access denied");

            onViolation?.("Camera access denied");
            onPauseTest?.();
        }
    };

const triggerViolation = (message) => {
    if (hasViolationTriggeredRef.current) return;

    hasViolationTriggeredRef.current = true;

    setWarning(message);

    onViolation?.(message);

    onPauseTest?.();
};

    const clearCanvas = () => {
        const canvas = canvasRef.current;

        if (!canvas) return;

        const ctx = canvas.getContext("2d");

        ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    const drawFaceBox = (box) => {
        const canvas = canvasRef.current;

        if (!canvas) return;

        const ctx = canvas.getContext("2d");

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = "#22c55e";
        ctx.lineWidth = 3;

        ctx.strokeRect(
            box.x,
            box.y,
            box.width,
            box.height
        );
    };

    const resetNoFaceState = () => {
        noFaceStartRef.current = null;
        hasViolationTriggeredRef.current = false;
        setCountdown(null);

        setWarning("");
    };

    const startMonitoring = () => {
        monitoringIntervalRef.current = setInterval(
            async () => {
                if (
                    !videoRef.current ||
                    !canvasRef.current
                )
                    return;

                try {
                    const video = videoRef.current;

                    const canvas = canvasRef.current;

                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;

                    const detections =
                        await faceapi.detectAllFaces(
                            video,
                            new faceapi.TinyFaceDetectorOptions()
                        );

                    // --------------------
                    // NO FACE DETECTED
                    // --------------------
                    if (detections.length === 0) {
                        clearCanvas();

                        // start timer once
                        if (!noFaceStartRef.current) {
                            noFaceStartRef.current =
                                Date.now();
                        }

                        const elapsedSeconds = Math.floor(
                            (Date.now() -
                                noFaceStartRef.current) /
                                1000
                        );

                        const remaining =
                            10 - elapsedSeconds;

                        // update UI countdown
                        setCountdown(
                            remaining > 0 ? remaining : 0
                        );

                        // ONLY warning
                        if (remaining > 0) {
                            setWarning(
                                "Face not visible"
                            );

                            return;
                        }

                        // AFTER 10 SEC
                        triggerViolation(
                            "Face missing for too long"
                        );

                        return;
                    }

                    // reset no face state
                    resetNoFaceState();

                    // --------------------
                    // MULTIPLE FACES
                    // --------------------
                    if (detections.length > 1) {
                        clearCanvas();

                        triggerViolation(
                            "Multiple faces detected"
                        );

                        return;
                    }

                    const box = detections[0].box;

                    // DRAW FACE BOX
                    drawFaceBox(box);

                    // --------------------
                    // FACE TOO FAR
                    // --------------------
                    if (
                        box.width < 120 ||
                        box.height < 120
                    ) {
                        triggerViolation(
                            "Face too far from camera"
                        );

                        return;
                    }

                    // --------------------
                    // LOOKING AWAY
                    // --------------------
                    const centerX =
                        box.x + box.width / 2;

                    if (
                        centerX <
                            video.videoWidth * 0.25 ||
                        centerX >
                            video.videoWidth * 0.75
                    ) {
                        triggerViolation(
                            "Please look at the screen"
                        );

                        return;
                    }
                } catch (err) {
                    console.error(err);
                }
            },
            1000
        );
    };

    return (
        <div className="w-full">
            <div className="relative overflow-hidden rounded-xl border border-gray-300 dark:border-gray-700">

                {/* VIDEO */}
                <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-52 object-cover bg-black"
                />

                {/* FACE BOX CANVAS */}
                <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full"
                />

                {/* STATUS */}
                <div className="absolute top-2 left-2 z-20">
                    <div className="bg-black/70 text-white text-xs px-2 py-1 rounded">
                        Live Monitoring
                    </div>
                </div>

                {/* COUNTDOWN TIMER */}
                {countdown !== null && countdown > 0 && (
                    <div className="absolute top-2 right-2 z-20">
                        <div className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                            {countdown}s
                        </div>
                    </div>
                )}

                {/* WARNING */}
                {warning && (
                    <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center p-4 z-30">
                        <div className="bg-red-600 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-lg text-center">
                            <div>{warning}</div>

                            {countdown !== null &&
                                countdown > 0 && (
                                    <div className="mt-2 text-lg font-bold">
                                        {countdown}s
                                    </div>
                                )}
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
               {countdown?"🔴":"🟢"} AI Proctoring Enabled
            </div>
        </div>
    );
}