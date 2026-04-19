import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";
import { encode as base64Encode } from "https://deno.land/std@0.224.0/encoding/base64.ts";

// ElevenLabs TTS — splits long text into chunks, uses request stitching
// for natural prosody between segments, returns concatenated MP3 as base64.

const VOICE_ID_DEFAULT = "JBFqnCBsd6RMkjVDRZzb"; // George — warm narrator
const MODEL_ID = "eleven_multilingual_v2";
const MAX_CHARS_PER_CHUNK = 2500;

function splitIntoChunks(text: string, maxChars: number): string[] {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= maxChars) return [clean];

  const chunks: string[] = [];
  // Split into sentences first
  const sentences = clean.match(/[^.!?]+[.!?]+|\S[^.!?]*$/g) || [clean];
  let buf = "";
  for (const s of sentences) {
    if ((buf + " " + s).trim().length > maxChars && buf) {
      chunks.push(buf.trim());
      buf = s;
    } else {
      buf = (buf + " " + s).trim();
    }
    // Hard split sentences that are too long
    while (buf.length > maxChars) {
      chunks.push(buf.slice(0, maxChars));
      buf = buf.slice(maxChars);
    }
  }
  if (buf.trim()) chunks.push(buf.trim());
  return chunks;
}

async function synthesizeChunk(
  apiKey: string,
  voiceId: string,
  text: string,
  previousText: string | null,
  nextText: string | null,
): Promise<Uint8Array> {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`;
  const body: Record<string, unknown> = {
    text,
    model_id: MODEL_ID,
    voice_settings: {
      stability: 0.55,
      similarity_boost: 0.75,
      style: 0.25,
      use_speaker_boost: true,
      speed: 1.0,
    },
  };
  if (previousText) body.previous_text = previousText.slice(-500);
  if (nextText) body.next_text = nextText.slice(0, 500);

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`ElevenLabs error ${res.status}: ${err}`);
  }
  return new Uint8Array(await res.arrayBuffer());
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("ELEVENLABS_API_KEY");
    if (!apiKey) throw new Error("ELEVENLABS_API_KEY not configured");

    const { text, voiceId } = await req.json();
    if (!text || typeof text !== "string") {
      return new Response(JSON.stringify({ error: "text is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Cap to avoid runaway requests; ~50k chars ≈ ~50 min audio
    const safeText = text.slice(0, 50_000);
    const chunks = splitIntoChunks(safeText, MAX_CHARS_PER_CHUNK);
    const voice = (voiceId as string) || VOICE_ID_DEFAULT;

    console.log(`TTS request: ${safeText.length} chars → ${chunks.length} chunks`);

    const audioParts: Uint8Array[] = [];
    for (let i = 0; i < chunks.length; i++) {
      const prev = i > 0 ? chunks[i - 1] : null;
      const next = i < chunks.length - 1 ? chunks[i + 1] : null;
      const part = await synthesizeChunk(apiKey, voice, chunks[i], prev, next);
      audioParts.push(part);
      console.log(`Chunk ${i + 1}/${chunks.length} done (${part.length} bytes)`);
    }

    // Concatenate MP3 frames (works for raw MP3 streams)
    const totalLen = audioParts.reduce((n, a) => n + a.length, 0);
    const merged = new Uint8Array(totalLen);
    let offset = 0;
    for (const a of audioParts) {
      merged.set(a, offset);
      offset += a.length;
    }

    const audioBase64 = base64Encode(merged);
    return new Response(
      JSON.stringify({ audioContent: audioBase64, chunks: chunks.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("TTS error:", err);
    const msg = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
