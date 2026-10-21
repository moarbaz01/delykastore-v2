"use client";
import { useEffect, useRef, useState } from "react";
import { Maximize, Minimize, Pause, Play, Volume2, VolumeX } from "lucide-react";

const formatTime = (s: number) => {
  if (!Number.isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  return `${m}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
};

const VideoPlayer = ({
  src,
  autoPlay = false,
  loop = true,
  className = "",
}: {
  src: string;
  autoPlay?: boolean;
  loop?: boolean;
  className?: string;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>();
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(autoPlay); // autoplay requires muted
  const [volume, setVolume] = useState(1);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const onChange = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  useEffect(() => () => clearTimeout(hideTimer.current), []);

  // Metadata may already be loaded before React attached its handlers (SSR +
  // autoplay), so read the current state once on mount
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.readyState >= 1 && Number.isFinite(v.duration)) {
      setDuration(v.duration);
    }
    setCurrent(v.currentTime);
    setPlaying(!v.paused);
  }, [src]);

  const revealControls = () => {
    setShowControls(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) setShowControls(false);
    }, 2500);
  };

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
    if (!v.muted && v.volume === 0) {
      v.volume = 1;
      setVolume(1);
    }
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current;
    if (!v) return;
    const value = Number(e.target.value);
    v.volume = value;
    v.muted = value === 0;
    setVolume(value);
    setMuted(value === 0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Number(e.target.value);
    setCurrent(v.currentTime);
  };

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else containerRef.current?.requestFullscreen?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement) return;
    if (e.key === " " || e.key === "k") {
      e.preventDefault();
      togglePlay();
    } else if (e.key === "m") toggleMute();
    else if (e.key === "f") toggleFullscreen();
  };

  const progress = duration ? (current / duration) * 100 : 0;
  const rangeStyle = (pct: number) => ({
    background: `linear-gradient(to right, #FF7597 ${pct}%, rgba(255,255,255,0.35) ${pct}%)`,
  });

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseMove={revealControls}
      onMouseLeave={() => playing && setShowControls(false)}
      onTouchStart={revealControls}
      className={`relative group overflow-hidden rounded-lg bg-black outline-none focus-visible:ring-2 focus-visible:ring-primary ${className}`}
    >
      <video
        ref={videoRef}
        src={src}
        autoPlay={autoPlay}
        muted={autoPlay}
        loop={loop}
        playsInline
        onClick={togglePlay}
        onPlay={() => {
          setPlaying(true);
          setStarted(true);
          revealControls();
        }}
        onPause={() => {
          setPlaying(false);
          setShowControls(true);
        }}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onDurationChange={(e) => {
          if (Number.isFinite(e.currentTarget.duration)) {
            setDuration(e.currentTarget.duration);
          }
        }}
        onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
        className="w-full h-full max-h-[80vh] object-contain cursor-pointer"
      />

      {/* Big centre play button while paused */}
      {!playing && (
        <button
          type="button"
          onClick={togglePlay}
          aria-label="Play video"
          className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center shadow-xl shadow-primary/40 transition-transform hover:scale-110 hover:bg-primary-dark"
        >
          <Play className="w-7 h-7 ml-1" fill="currentColor" />
        </button>
      )}

      {/* Control bar */}
      <div
        className={`absolute inset-x-0 bottom-0 px-3 pt-8 pb-2 bg-gradient-to-t from-black/70 to-transparent transition-opacity duration-300 ${
          started && showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={current}
          onChange={handleSeek}
          aria-label="Seek"
          style={rangeStyle(progress)}
          className="vp-range w-full mb-2"
        />
        <div className="flex items-center gap-3 text-white">
          <button
            type="button"
            onClick={togglePlay}
            aria-label={playing ? "Pause" : "Play"}
            className="hover:text-primary-light transition-colors"
          >
            {playing ? (
              <Pause className="w-5 h-5" fill="currentColor" />
            ) : (
              <Play className="w-5 h-5" fill="currentColor" />
            )}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleMute}
              aria-label={muted ? "Unmute" : "Mute"}
              className="hover:text-primary-light transition-colors"
            >
              {muted || volume === 0 ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={muted ? 0 : volume}
              onChange={handleVolume}
              aria-label="Volume"
              style={rangeStyle((muted ? 0 : volume) * 100)}
              className="vp-range w-16 hidden sm:block"
            />
          </div>

          <span className="text-xs tabular-nums">
            {formatTime(current)} / {formatTime(duration)}
          </span>

          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label={fullscreen ? "Exit fullscreen" : "Fullscreen"}
            className="ml-auto hover:text-primary-light transition-colors"
          >
            {fullscreen ? (
              <Minimize className="w-5 h-5" />
            ) : (
              <Maximize className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      <style jsx>{`
        .vp-range {
          -webkit-appearance: none;
          appearance: none;
          height: 4px;
          border-radius: 9999px;
          cursor: pointer;
          outline: none;
        }
        .vp-range::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #fff;
          border: 2px solid #ff7597;
        }
        .vp-range::-moz-range-thumb {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #fff;
          border: 2px solid #ff7597;
        }
      `}</style>
    </div>
  );
};

export default VideoPlayer;
