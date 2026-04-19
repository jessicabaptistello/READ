import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";
import { encodeBase64 } from "https://deno.land/std@0.224.0/encoding/base64.ts";

// Lovable AI Gateway TTS — uses Google Gemini 2.5 Flash TTS.
// Splits long text into chunks, synthesizes each, and concatenates the PCM
// output into a single WAV file returned as base64.

const MODEL_ID = "google/gemini-2.5-flash-preview-tts";
const VOICE_DEFAULT = "Charon"; // warm, narrative voice
const MAX_CHARS_PER_CHUNK = 3000;
const SAMPLE_RATE = 24000;

function splitIntoChunks(text: string, maxChars: number): string[] {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= maxChars) return [clean];

  const chunks: string[] = [];
  const sentences = clean.match(/[^.!?]+[.!?]+|\S[^.!?]*$/g) || [clean];
  let buf = "";
  for (const s of sentences) {
    if ((buf + " " + s).trim().length > maxChars && buf) {
      chunks.push(buf.trim());
      buf = s;
    } else {
      buf = (buf + " " + s).trim();
    }
    while (buf.length > maxChars) {
      chunks.push(buf.slice(0, maxChars));
      buf = buf.slice(maxChars);
    }
  }
  if (buf.trim()) chunks.push(buf.trim());
  return chunks;
}

function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

// Build a WAV header for 16-bit mono PCM at the given sample rate.
function wavHeader(pcmLength: number, sampleRate: number): Uint8Array {
  const header = new ArrayBuffer(44);
  const view = new DataView(header);
  const writeStr = (off: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i));
  };
  writeStr(0, "RIFF");
  view.setUint32(4, 36 + pcmLength, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true); // PCM chunk size
  view.setUint16(20, 1, true);  // PCM format
  view.setUint16(22, 1, true);  // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // byte rate
  view.setUint16(32, 2, true);  // block align
  view.setUint16(34, 16, true); // bits per sample
  writeStr(36, "data");
  view.setUint32(40, pcmLength, true);
  return new Uint8Array(header);
}

async function synthesizeChunk(
  apiKey: string,
  text: string,
  voice: string,
): Promise<Uint8Array> {
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL_ID,
      modalities: ["audio"],
      audio: { voice, format: "pcm16" },
      messages: [
        { role: "user", content: text },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Lovable AI TTS error ${res.status}: ${err}`);
  }

  const data = await res.json();
  const audioB64 =
    data?.choices?.[0]?.message?.audio?.data ??
    data?.choices?.[0]?.audio?.data;
  if (!audioB64) {
    throw new Error(`No audio in response: ${JSON.stringify(data).slice(0, 500)}`);
  }
  return base64ToBytes(audioB64);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

    const { text, voice } = await req.json();
    if (!text || typeof text !== "string") {
      return new Response(JSON.stringify({ error: "text is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const safeText = text.slice(0, 50_000);
    const chunks = splitIntoChunks(safeText, MAX_CHARS_PER_CHUNK);
    const v = (voice as string) || VOICE_DEFAULT;

    console.log(`TTS request: ${safeText.length} chars → ${chunks.length} chunks`);

    const pcmParts: Uint8Array[] = [];
    for (let i = 0; i < chunks.length; i++) {
      try {
        const part = await synthesizeChunk(apiKey, chunks[i], v);
        pcmParts.push(part);
        console.log(`Chunk ${i + 1}/${chunks.length} done (${part.length} bytes)`);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        // Surface rate-limit / payment errors clearly
        if (msg.includes("429")) {
          return new Response(JSON.stringify({ error: "Limite de requisições atingido. Aguarde alguns instantes." }), {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (msg.includes("402")) {
          return new Response(JSON.stringify({ error: "Créditos esgotados na sua workspace Lovable. Adicione créditos em Settings → Workspace → Usage." }), {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        throw e;
      }
    }

    const totalLen = pcmParts.reduce((n, a) => n + a.length, 0);
    const pcm = new Uint8Array(totalLen);
    let offset = 0;
    for (const a of pcmParts) {
      pcm.set(a, offset);
      offset += a.length;
    }

    const header = wavHeader(pcm.length, SAMPLE_RATE);
    const wav = new Uint8Array(header.length + pcm.length);
    wav.set(header, 0);
    wav.set(pcm, header.length);

    const audioBase64 = encodeBase64(wav);
    return new Response(
      JSON.stringify({ audioContent: audioBase64, mimeType: "audio/wav", chunks: chunks.length }),
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
