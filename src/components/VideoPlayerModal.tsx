import React, { useEffect, useRef, useState } from "react";
import { X, Play, Pause, Volume2, VolumeX, Maximize, Settings } from "lucide-react";
import { useStore } from "../lib/store";
import { motion, AnimatePresence } from "motion/react";
import Hls from "hls.js";
import { formatTime } from "../lib/utils";
import { getMovieDetails } from "../lib/api";

const TEST_STREAM = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";

export function VideoPlayerModal() {
  const { isVideoPlayerOpen, setVideoPlayerOpen, selectedMovieId, videoStreamUrl } = useStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [title, setTitle] = useState("Loading...");
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  useEffect(() => {
    if (!isPlaying) {
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    } else {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying]);

  useEffect(() => {
    if (selectedMovieId) {
      getMovieDetails(selectedMovieId).then(data => {
        if (data) setTitle(data.title || data.original_title);
      });
    }
  }, [selectedMovieId]);

  useEffect(() => {
    if (!isVideoPlayerOpen || !videoRef.current) return;

    const video = videoRef.current;
    let hls: Hls | null = null;
    const streamToLoad = videoStreamUrl || TEST_STREAM;

    if (Hls.isSupported()) {
      hls = new Hls();
      hls.loadSource(streamToLoad);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(console.error);
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamToLoad;
      video.addEventListener("loadedmetadata", () => {
        video.play().catch(console.error);
      });
    }

    return () => {
      if (hls) hls.destroy();
    };
  }, [isVideoPlayerOpen, videoStreamUrl]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => {
      setCurrentTime(video.currentTime);
      setProgress((video.currentTime / video.duration) * 100 || 0);
    };

    const updateDuration = () => setDuration(video.duration);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    video.addEventListener("timeupdate", updateTime);
    video.addEventListener("loadedmetadata", updateDuration);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);

    return () => {
      video.removeEventListener("timeupdate", updateTime);
      video.removeEventListener("loadedmetadata", updateDuration);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
    };
  }, [isVideoPlayerOpen]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (videoRef.current) {
      const time = (parseFloat(e.target.value) / 100) * duration;
      videoRef.current.currentTime = time;
    }
  };

  const toggleFullscreen = () => {
    if (playerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        playerRef.current.requestFullscreen();
      }
    }
  };

  if (!isVideoPlayerOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        ref={playerRef}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`fixed inset-0 z-[60] bg-white flex flex-col ${!showControls ? 'cursor-none' : ''}`}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => isPlaying && setShowControls(false)}
      >
        {/* Header */}
        <div className={`absolute top-0 inset-x-0 p-4 flex items-center justify-between bg-gradient-to-b from-white via-white/80 to-transparent z-10 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight drop-shadow-sm">{title}</h2>
          <button 
            onClick={() => setVideoPlayerOpen(false)}
            className="p-2 bg-slate-100/80 hover:bg-slate-200 backdrop-blur-md rounded-full text-slate-900 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Video Container */}
        <div className="flex-1 bg-slate-50 relative group flex items-center justify-center">
          <video 
            ref={videoRef}
            className="w-full h-full object-contain"
            playsInline
            onClick={togglePlay}
          />

          {/* Controls Footer Overlay */}
          <div className={`absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-white via-white/90 to-transparent transition-opacity duration-300 flex flex-col gap-4 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            
            {/* Seek Bar */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold text-slate-700 w-12 text-right">{formatTime(currentTime)}</span>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={progress || 0}
                onChange={handleSeek}
                className="flex-1 h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-indigo-600 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-indigo-600 [&::-webkit-slider-thumb]:rounded-full"
              />
              <span className="text-sm font-bold text-slate-700 w-12">{formatTime(duration)}</span>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <button onClick={togglePlay} className="text-slate-900 hover:text-indigo-600 transition-colors">
                  {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current" />}
                </button>
                <button onClick={toggleMute} className="text-slate-700 hover:text-indigo-600 transition-colors">
                  {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                </button>
              </div>

              <div className="flex items-center gap-6">
                <button className="text-slate-700 hover:text-indigo-600 transition-colors flex items-center gap-1 text-sm font-bold">
                  <Settings className="w-5 h-5" />
                  1080p
                </button>
                <button onClick={toggleFullscreen} className="text-slate-700 hover:text-indigo-600 transition-colors">
                  <Maximize className="w-6 h-6" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
