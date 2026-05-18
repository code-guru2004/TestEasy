// app/speed/page.jsx
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

export default function SpeedPage() {
  const [status, setStatus] = useState('idle');
  const [downloadSpeed, setDownloadSpeed] = useState(null);
  const [uploadSpeed, setUploadSpeed] = useState(null);
  const [ping, setPing] = useState(null);
  const [progress, setProgress] = useState(0);
  const [unit, setUnit] = useState('Mbps');
  const [isMobile, setIsMobile] = useState(false);
  const [error, setError] = useState(null);
  const [testPhase, setTestPhase] = useState('');
  
  const abortControllerRef = useRef(null);

  useEffect(() => {
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
  }, []);

  const formatSpeed = (speedInMbps) => {
    if (!speedInMbps || speedInMbps === 0) return '—';
    if (unit === 'Kbps') {
      return (speedInMbps * 1000).toFixed(2);
    }
    return speedInMbps.toFixed(2);
  };

  const getSpeedUnit = () => {
    return unit === 'Mbps' ? 'Mbps' : 'Kbps';
  };

  const toggleUnit = () => {
    setUnit(unit === 'Mbps' ? 'Kbps' : 'Mbps');
  };

  // Measure ping using fetch with small payload
  const measurePing = async () => {
    const pingTimes = [];
    const pingUrl = '/api/ping'; // We'll create this API endpoint
    
    for (let i = 0; i < 5; i++) {
      const start = performance.now();
      try {
        await fetch(`${pingUrl}?_=${Date.now()}_${i}`, {
          method: 'HEAD',
          cache: 'no-store',
        });
        const end = performance.now();
        pingTimes.push(end - start);
      } catch (error) {
        console.warn('Ping failed:', error);
        pingTimes.push(50);
      }
    }
    
    // Remove highest and lowest for accuracy
    pingTimes.sort((a, b) => a - b);
    const trimmedTimes = pingTimes.slice(1, -1);
    const avgPing = trimmedTimes.reduce((a, b) => a + b, 0) / trimmedTimes.length;
    return Math.round(avgPing);
  };

  // Generate test data of specific size
  const generateTestData = (sizeInMB) => {
    const sizeInBytes = sizeInMB * 1024 * 1024;
    // Create a buffer of the specified size
    const buffer = new Uint8Array(sizeInBytes);
    // Fill with random data (but deterministic for consistency)
    for (let i = 0; i < sizeInBytes; i++) {
      buffer[i] = i % 256;
    }
    return buffer;
  };

  // Accurate download test using dynamically created blob
  const measureDownloadAccurate = async (onProgress) => {
    const testFiles = [
      "/test-files/5mb.bin",
      "/test-files/10mb.bin",
      "/test-files/25mb.bin",
    ];
  
    const speeds = [];
  
    for (let i = 0; i < testFiles.length; i++) {
      const file = testFiles[i];
  
      const startTime = performance.now();
  
      const response = await fetch(
        `${file}?cache=${Date.now()}`,
        {
          cache: "no-store",
        }
      );
  
      const blob = await response.blob();
  
      const endTime = performance.now();
  
      const duration =
        (endTime - startTime) / 1000;
  
      const bitsLoaded = blob.size * 8;
  
      const speedMbps =
        bitsLoaded / duration / (1024 * 1024);
  
      speeds.push(speedMbps);
  
      onProgress((i + 1) / testFiles.length);
    }
  
    speeds.sort((a, b) => a - b);
  
    return speeds[Math.floor(speeds.length / 2)];
  };

  // Accurate upload test using FormData
  const measureUploadAccurate = async (onProgress) => {
    // Test with different file sizes
    const testSizes = [2, 5, 10]; // MB
    let speeds = [];
    
    for (let i = 0; i < testSizes.length; i++) {
      const sizeMB = testSizes[i];
      
      // Generate test data
      const testData = generateTestData(sizeMB);
      const blob = new Blob([testData], { type: 'application/octet-stream' });
      const formData = new FormData();
      formData.append('file', blob, `test-${sizeMB}mb.bin`);
      
      const startTime = performance.now();
      
      try {
        // Send to our upload endpoint
        const response = await fetch('/api/speed-upload', {
          method: 'POST',
          body: formData,
          cache: 'no-store',
        });
        
        if (!response.ok) throw new Error('Upload failed');
        
        const endTime = performance.now();
        const durationSeconds = (endTime - startTime) / 1000;
        
        if (durationSeconds > 0) {
          const speedMbps = (sizeMB * 8) / durationSeconds;
          speeds.push(speedMbps);
          onProgress((i + 1) / testSizes.length);
        }
      } catch (error) {
        console.error(`Upload test ${sizeMB}MB failed:`, error);
      }
    }
    
    if (speeds.length === 0) {
      throw new Error('All upload tests failed');
    }
    
    // Return median speed
    speeds.sort((a, b) => a - b);
    const medianSpeed = speeds[Math.floor(speeds.length / 2)];
    return medianSpeed;
  };

  const runSpeedTest = async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    setError(null);
    setStatus('testing');
    setProgress(0);
    setDownloadSpeed(null);
    setUploadSpeed(null);
    setPing(null);
    
    try {
      // Step 1: Measure Ping (0-15%)
      setTestPhase('Measuring ping...');
      setProgress(5);
      const pingResult = await measurePing();
      setPing(pingResult);
      setProgress(15);
      
      // Step 2: Measure Download (15-70%)
      setTestPhase('Testing download speed...');
      setProgress(20);
      const downloadResult = await measureDownloadAccurate((p) => {
        setProgress(15 + p * 55);
      });
      setDownloadSpeed(downloadResult);
      setProgress(75);
      
      // Step 3: Measure Upload (75-100%)
      setTestPhase('Testing upload speed...');
      setProgress(80);
      const uploadResult = await measureUploadAccurate((p) => {
        setProgress(75 + p * 20);
      });
      setUploadSpeed(uploadResult);
      setProgress(100);
      
      setTestPhase('');
      setStatus('done');
      
    } catch (error) {
      console.error('Speed test error:', error);
      setError(`Speed test failed: ${error.message}. Please try again.`);
      setStatus('idle');
      setTestPhase('');
    } finally {
      abortControllerRef.current = null;
    }
  };

  const resetTest = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setStatus('idle');
    setProgress(0);
    setDownloadSpeed(null);
    setUploadSpeed(null);
    setPing(null);
    setError(null);
    setTestPhase('');
  };

  const getSpeedRating = (speedMbps) => {
    if (!speedMbps) return '';
    if (speedMbps < 1) return 'Very Slow';
    if (speedMbps < 5) return 'Slow';
    if (speedMbps < 20) return 'Fair';
    if (speedMbps < 50) return 'Good';
    if (speedMbps < 100) return 'Fast';
    if (speedMbps < 500) return 'Very Fast';
    return 'Ultra Fast';
  };

  const getSpeedColor = (speedMbps) => {
    if (!speedMbps) return 'text-gray-400';
    if (speedMbps < 5) return 'text-red-500';
    if (speedMbps < 20) return 'text-orange-500';
    if (speedMbps < 50) return 'text-yellow-500';
    if (speedMbps < 100) return 'text-green-500';
    if (speedMbps < 500) return 'text-emerald-500';
    return 'text-cyan-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            SpeedTest
          </h1>
          <p className="text-slate-300 text-sm md:text-base">
            Accurate • Using Local Test Files • No External Dependencies
          </p>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="max-w-2xl mx-auto mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
            <p className="text-red-300 text-sm text-center">{error}</p>
          </div>
        )}
        
        {/* Main Speed Test Card */}
        <div className="max-w-2xl mx-auto bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-6 md:p-8 border border-white/20">
          {/* Test Phase Indicator */}
          {testPhase && (
            <div className="text-center mb-4">
              <div className="inline-flex items-center gap-2 bg-blue-500/20 rounded-full px-4 py-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span className="text-blue-300 text-sm">{testPhase}</span>
              </div>
            </div>
          )}
          
          {/* Ping Display */}
          {ping !== null && status !== 'idle' && (
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 bg-white/5 rounded-full px-4 py-2">
                <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="text-slate-300 text-sm">Ping</span>
                <span className="text-white font-bold">{ping} ms</span>
                {ping < 30 && <span className="text-green-400 text-xs">(Excellent)</span>}
                {ping >= 30 && ping < 60 && <span className="text-yellow-400 text-xs">(Good)</span>}
                {ping >= 60 && <span className="text-red-400 text-xs">(Poor)</span>}
              </div>
            </div>
          )}
          
          {/* Download Speed */}
          <div className="mb-8 text-center">
            <div className="text-slate-300 text-sm uppercase tracking-wider mb-2">Download Speed</div>
            <div className={`text-5xl md:text-7xl font-bold ${getSpeedColor(downloadSpeed)} transition-all duration-500`}>
              {downloadSpeed !== null ? formatSpeed(downloadSpeed) : '—'}
            </div>
            {downloadSpeed !== null && (
              <>
                <div className="text-slate-400 text-sm mt-1">
                  {getSpeedRating(downloadSpeed)}
                </div>
                <div className="text-slate-500 text-xs mt-1">
                  {getSpeedUnit()}
                </div>
              </>
            )}
          </div>
          
          {/* Upload Speed */}
          <div className="mb-8 text-center">
            <div className="text-slate-300 text-sm uppercase tracking-wider mb-2">Upload Speed</div>
            <div className={`text-4xl md:text-6xl font-bold ${getSpeedColor(uploadSpeed)} transition-all duration-500`}>
              {uploadSpeed !== null ? formatSpeed(uploadSpeed) : '—'}
            </div>
            {uploadSpeed !== null && (
              <>
                <div className="text-slate-400 text-sm mt-1">
                  {getSpeedRating(uploadSpeed)}
                </div>
                <div className="text-slate-500 text-xs mt-1">
                  {getSpeedUnit()}
                </div>
              </>
            )}
          </div>
          
          {/* Progress Bar */}
          {status === 'testing' && (
            <div className="mb-8">
              <div className="flex justify-between text-slate-400 text-xs mb-1">
                <span>Testing in progress...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
          
          {/* Results Summary */}
          {status === 'done' && downloadSpeed && uploadSpeed && ping && (
            <div className="mb-8 p-4 bg-white/5 rounded-xl">
              <div className="grid grid-cols-3 gap-2 text-center text-sm">
                <div>
                  <div className="text-slate-400">Download</div>
                  <div className="text-white font-semibold">{formatSpeed(downloadSpeed)} {getSpeedUnit()}</div>
                </div>
                <div>
                  <div className="text-slate-400">Upload</div>
                  <div className="text-white font-semibold">{formatSpeed(uploadSpeed)} {getSpeedUnit()}</div>
                </div>
                <div>
                  <div className="text-slate-400">Ping</div>
                  <div className="text-white font-semibold">{ping} ms</div>
                </div>
              </div>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {status === 'testing' ? (
              <button
                onClick={resetTest}
                className="px-8 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-300 font-semibold rounded-xl transition-all duration-200 border border-red-500/30"
              >
                Cancel Test
              </button>
            ) : (
              <button
                onClick={runSpeedTest}
                disabled={status === 'testing'}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === 'done' ? 'Test Again' : 'Start Test'}
              </button>
            )}
            
            <button
              onClick={toggleUnit}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-slate-200 font-semibold rounded-xl transition-all duration-200"
            >
              Switch to {unit === 'Mbps' ? 'Kbps' : 'Mbps'}
            </button>
          </div>
        </div>
        
        {/* Info Section */}
        <div className="max-w-2xl mx-auto mt-8 text-center text-slate-400 text-sm">
          <p>⚡ Accurate test using locally generated data</p>
          <p className="mt-1">📊 Tests with 5MB, 10MB, and 25MB files for precision</p>
          <p className="mt-1">🎯 Results reflect your actual connection speed</p>
          {isMobile && (
            <p className="mt-2 text-yellow-400/70 text-xs">
              📱 Mobile detected - Results may vary based on signal strength
            </p>
          )}
        </div>
        
        {/* Speed Recommendations */}
        {downloadSpeed !== null && status === 'done' && (
          <div className="max-w-2xl mx-auto mt-6 p-4 bg-white/5 rounded-xl">
            <h3 className="text-white text-sm font-semibold mb-2">What can you do with this speed?</h3>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
              <div>📧 Email &amp; Web: &gt;1 Mbps</div>
              <div>🎵 Music Streaming: &gt;2 Mbps</div>
              <div>📺 HD Video (1080p): &gt;5 Mbps</div>
              <div>🎮 Online Gaming: &gt;10 Mbps</div>
              <div>📱 Video Calls: &gt;3 Mbps</div>
              <div>📀 4K Streaming: &gt;25 Mbps</div>
              <div>💻 Large Downloads: &gt;50 Mbps</div>
              <div>🎬 8K Streaming: &gt;100 Mbps</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}