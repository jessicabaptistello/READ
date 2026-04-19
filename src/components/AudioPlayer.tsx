import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, RotateCcw, RotateCw, Gauge } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AudioPlayerProps {
  src: string;
  title?: string;
}

const SPEEDS = [0.75, 1, 1.25, 1.5, 1.75, 2];

export function AudioPlayer({ src, title }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.playbackRate = speed;
  }, [speed, src]);

  useEffect(() => {
    setPlaying(false);
    setCurrent(0);
  }, [src]);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) a.pause();
    else a.play();
  };

  const seek = (delta: number) => {
    const a = audioRef.current;
    if (!a) return;
    a.currentTime = Math.max(0, Math.min(a.duration, a.currentTime + delta));
  };

  const fmt = (s: number) => {
    if (!isFinite(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="rounded-2xl border bg-card p-5 shadow-paper animate-fade-in">
      {title && (
        <p className="mb-3 truncate text-sm text-muted-foreground">{title}</p>
      )}
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
      />
      <Slider
        value={[current]}
        max={duration || 1}
        step={0.1}
        onValueChange={([v]) => {
          if (audioRef.current) audioRef.current.currentTime = v;
        }}
        className="mb-3"
      />
      <div className="mb-4 flex justify-between text-xs tabular-nums text-muted-foreground">
        <span>{fmt(current)}</span>
        <span>{fmt(duration)}</span>
      </div>
      <div className="flex items-center justify-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => seek(-15)}>
          <RotateCcw className="h-5 w-5" />
        </Button>
        <Button
          size="icon"
          onClick={toggle}
          className="h-14 w-14 rounded-full bg-gradient-warm shadow-glow hover:opacity-90"
        >
          {playing ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 translate-x-0.5" />}
        </Button>
        <Button variant="ghost" size="icon" onClick={() => seek(15)}>
          <RotateCw className="h-5 w-5" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="ml-2 gap-1 tabular-nums">
              <Gauge className="h-4 w-4" /> {speed}×
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {SPEEDS.map((s) => (
              <DropdownMenuItem key={s} onClick={() => setSpeed(s)}>
                {s}×
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
