import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Play, Pause, RotateCcw, RotateCw, Gauge } from "lucide-react";

interface AudioPlayerProps {
  text: string;
  title?: string;
}

const SPEEDS = [0.75, 1, 1.25, 1.5, 1.75, 2];
const MAX_CHARS_PER_CHUNK = 1200;

function splitIntoChunks(text: string, maxChars = MAX_CHARS_PER_CHUNK): string[] {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return [];

  const sentences = clean.match(/[^.!?]+[.!?]+|\S[^.!?]*$/g) || [clean];
  const chunks: string[] = [];
  let buffer = "";

  for (const sentence of sentences) {
    const next = `${buffer} ${sentence}`.trim();

    if (next.length <= maxChars) {
      buffer = next;
      continue;
    }

    if (buffer) chunks.push(buffer.trim());

    if (sentence.length <= maxChars) {
      buffer = sentence.trim();
    } else {
      let rest = sentence.trim();
      while (rest.length > maxChars) {
        chunks.push(rest.slice(0, maxChars).trim());
        rest = rest.slice(maxChars).trim();
      }
      buffer = rest;
    }
  }

  if (buffer.trim()) chunks.push(buffer.trim());
  return chunks;
}

export function AudioPlayer({ text, title }: AudioPlayerProps) {
  const synthRef = useRef<SpeechSynthesis | null>(null);

  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceURI, setVoiceURI] = useState("");
  const [chunkIndex, setChunkIndex] = useState(0);

  const chunks = useMemo(() => splitIntoChunks(text), [text]);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    synthRef.current = window.speechSynthesis;

    const loadVoices = () => {
      const available = window.speechSynthesis.getVoices();
      setVoices(available);

      if (!voiceURI && available.length > 0) {
        const preferred =
          available.find((v) => v.lang?.toLowerCase().startsWith("pt")) ||
          available.find((v) => v.lang?.toLowerCase().startsWith("en")) ||
          available[0];

        if (preferred) setVoiceURI(preferred.voiceURI);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.cancel();
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [voiceURI]);

  useEffect(() => {
    stop();
    setChunkIndex(0);
  }, [text]);

  const selectedVoice = voices.find((v) => v.voiceURI === voiceURI) || null;

  const speakChunk = (index: number) => {
    const synth = synthRef.current;
    if (!synth || !chunks[index]) return;

    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(chunks[index]);
    utterance.lang = selectedVoice?.lang || "pt-PT";
    utterance.rate = speed;

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onstart = () => {
      setPlaying(true);
      setPaused(false);
    };

    utterance.onend = () => {
      const nextIndex = index + 1;

      if (nextIndex < chunks.length) {
        setChunkIndex(nextIndex);
        speakChunk(nextIndex);
      } else {
        setPlaying(false);
        setPaused(false);
      }
    };

    utterance.onerror = () => {
      setPlaying(false);
      setPaused(false);
    };

    synth.speak(utterance);
  };

  const play = () => {
    const synth = synthRef.current;
    if (!synth || chunks.length === 0) return;

    if (paused) {
      synth.resume();
      setPlaying(true);
      setPaused(false);
      return;
    }

    speakChunk(chunkIndex);
  };

  const pause = () => {
    const synth = synthRef.current;
    if (!synth || !playing) return;

    synth.pause();
    setPlaying(false);
    setPaused(true);
  };

  const stop = () => {
    const synth = synthRef.current;
    if (!synth) return;

    synth.cancel();
    setPlaying(false);
    setPaused(false);
  };

  const goToChunk = (nextIndex: number) => {
    if (nextIndex < 0 || nextIndex >= chunks.length) return;

    setChunkIndex(nextIndex);
    stop();
  };

  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm">
      {title ? <h3 className="mb-3 text-lg font-semibold">{title}</h3> : null}

      <div className="mb-4 text-sm text-muted-foreground">
        Trecho {chunks.length === 0 ? 0 : chunkIndex + 1} de {chunks.length}
      </div>

      <Slider
        value={[chunkIndex]}
        min={0}
        max={Math.max(chunks.length - 1, 0)}
        step={1}
        onValueChange={(value) => goToChunk(value[0])}
        className="mb-4"
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => goToChunk(chunkIndex - 1)}
          disabled={chunkIndex <= 0}
        >
          <RotateCcw className="h-4 w-4" />
        </Button>

        {playing ? (
          <Button onClick={pause}>
            <Pause className="mr-2 h-4 w-4" />
            Pausar
          </Button>
        ) : (
          <Button onClick={play} disabled={chunks.length === 0}>
            <Play className="mr-2 h-4 w-4" />
            {paused ? "Retomar" : "Ler"}
          </Button>
        )}

        <Button
          variant="outline"
          size="icon"
          onClick={() => goToChunk(chunkIndex + 1)}
          disabled={chunkIndex >= chunks.length - 1}
        >
          <RotateCw className="h-4 w-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Gauge className="mr-2 h-4 w-4" />
              {speed}×
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {SPEEDS.map((value) => (
              <DropdownMenuItem key={value} onClick={() => setSpeed(value)}>
                {value}×
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Voz</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="max-h-80 overflow-auto">
            {voices.length > 0 ? (
              voices.map((voice) => (
                <DropdownMenuItem
                  key={voice.voiceURI}
                  onClick={() => setVoiceURI(voice.voiceURI)}
                >
                  {voice.name} ({voice.lang})
                </DropdownMenuItem>
              ))
            ) : (
              <DropdownMenuItem disabled>Nenhuma voz encontrada</DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" onClick={stop}>
          Parar
        </Button>
      </div>

      <div className="rounded-xl bg-muted p-3 text-sm leading-6">
        {chunks[chunkIndex] || "Nenhum texto carregado."}
      </div>
    </div>
  );
}
