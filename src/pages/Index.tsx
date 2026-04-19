import { useState } from "react";
import { SourceInput } from "@/components/SourceInput";
import { AudioPlayer } from "@/components/AudioPlayer";
<<<<<<< HEAD
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  extractFromFile,
  extractFromPdf,
  base64ToArrayBuffer,
} from "@/lib/extractors";
import { BookOpen, Loader2 } from "lucide-react";
=======
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { extractFromFile, extractFromPdf, base64ToArrayBuffer } from "@/lib/extractors";
import { BookOpen, Headphones, Loader2, Sparkles } from "lucide-react";
>>>>>>> 3e835ac51714300863db02616f2bd7252c610dd7

const Index = () => {
  const { toast } = useToast();
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [extracting, setExtracting] = useState(false);
<<<<<<< HEAD

  const handleFile = async (file: File) => {
    setExtracting(true);

    try {
      const extracted = await extractFromFile(file);

      if (!extracted) {
        throw new Error("Não foi possível extrair texto");
      }

      setText(extracted);
      setTitle(file.name);

      toast({
        title: "Texto extraído",
        description: `${extracted.length.toLocaleString()} caracteres`,
      });
    } catch (error) {
      toast({
        title: "Erro ao ler arquivo",
        description: error instanceof Error ? error.message : "Falha",
        variant: "destructive",
      });
=======
  const [synthesizing, setSynthesizing] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setExtracting(true);
    setAudioUrl(null);
    try {
      const extracted = await extractFromFile(file);
      if (!extracted) throw new Error("Não foi possível extrair texto");
      setText(extracted);
      setTitle(file.name);
      toast({ title: "Texto extraído", description: `${extracted.length.toLocaleString()} caracteres` });
    } catch (e) {
      toast({ title: "Erro ao ler arquivo", description: e instanceof Error ? e.message : "Falha", variant: "destructive" });
>>>>>>> 3e835ac51714300863db02616f2bd7252c610dd7
    } finally {
      setExtracting(false);
    }
  };

  const handleUrl = async (url: string) => {
    setExtracting(true);
<<<<<<< HEAD

    try {
      const { data, error } = await supabase.functions.invoke("fetch-pdf", {
        body: { url },
      });

      if (error) {
        throw error;
      }

      const buf = base64ToArrayBuffer(data.data);
      const extracted = await extractFromPdf(buf);

      setText(extracted);
      setTitle(url.split("/").pop() || url);

      toast({
        title: "PDF carregado",
        description: `${extracted.length.toLocaleString()} caracteres`,
      });
    } catch (error) {
      toast({
        title: "Erro ao buscar URL",
        description: error instanceof Error ? error.message : "Falha",
        variant: "destructive",
      });
=======
    setAudioUrl(null);
    try {
      const { data, error } = await supabase.functions.invoke("fetch-pdf", { body: { url } });
      if (error) throw error;
      const buf = base64ToArrayBuffer(data.data);
      const extracted = await extractFromPdf(buf);
      setText(extracted);
      setTitle(url.split("/").pop() || url);
      toast({ title: "PDF carregado", description: `${extracted.length.toLocaleString()} caracteres` });
    } catch (e) {
      toast({ title: "Erro ao buscar URL", description: e instanceof Error ? e.message : "Falha", variant: "destructive" });
>>>>>>> 3e835ac51714300863db02616f2bd7252c610dd7
    } finally {
      setExtracting(false);
    }
  };

<<<<<<< HEAD
  const handleText = (value: string) => {
    setText(value);
    setTitle("Texto colado");

    toast({
      title: "Texto pronto",
      description: `${value.length.toLocaleString()} caracteres`,
    });
  };

  return (
    <main className="min-h-screen bg-background">
      <section className="container mx-auto max-w-5xl px-4 py-10">
        <div className="mb-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm text-muted-foreground">
            <BookOpen className="h-4 w-4" />
            Leitura gratuita no navegador
          </div>

          <h1 className="text-4xl font-bold tracking-tight">Audiobook</h1>

          <p className="mt-3 text-lg text-muted-foreground">
            Transforme PDFs, livros e qualquer texto em leitura em voz alta.
          </p>
        </div>

        <SourceInput
          onFileSelect={handleFile}
          onUrlSubmit={handleUrl}
          onTextSubmit={handleText}
          loading={extracting}
        />

        {extracting ? (
          <div className="mt-6 flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Processando conteúdo...
          </div>
        ) : null}

        {text ? (
          <div className="mt-8 space-y-6">
            <div className="rounded-2xl border bg-card p-4 shadow-sm">
              <div className="mb-2 text-sm text-muted-foreground">
                {title} · {text.length.toLocaleString()} caracteres
              </div>

              <div className="text-sm leading-6 text-muted-foreground">
                {text.slice(0, 3000)}
                {text.length > 3000 ? (
                  <span>… (+{(text.length - 3000).toLocaleString()} chars)</span>
                ) : null}
              </div>
            </div>

            <AudioPlayer text={text} title={title} />
          </div>
        ) : null}
      </section>
    </main>
  );
};

export default Index;
=======
  const handleText = (t: string) => {
    setText(t);
    setTitle("Texto colado");
    setAudioUrl(null);
    toast({ title: "Texto pronto", description: `${t.length.toLocaleString()} caracteres` });
  };

  const handleSynthesize = async () => {
    if (!text.trim()) return;
    setSynthesizing(true);
    setAudioUrl(null);
    try {
      const { data, error } = await supabase.functions.invoke("tts", { body: { text } });
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      setAudioUrl(`data:${data.mimeType || "audio/wav"};base64,${data.audioContent}`);
      toast({ title: "Áudio pronto", description: `${data.chunks} trecho(s) gerado(s)` });
    } catch (e) {
      toast({ title: "Erro na geração de áudio", description: e instanceof Error ? e.message : "Falha", variant: "destructive" });
    } finally {
      setSynthesizing(false);
    }
  };

  const charCount = text.length;
  const tooLong = charCount > 50_000;

  return (
    <div className="min-h-screen bg-gradient-paper">
      <header className="container max-w-4xl pt-16 pb-10 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground shadow-paper">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Powered by Lovable AI
        </div>
        <h1 className="font-serif-display text-5xl font-semibold tracking-tight md:text-6xl">
          Audiobook<span className="text-primary">.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
          Transforme PDFs, livros e qualquer texto em narração natural — em segundos.
        </p>
      </header>

      <main className="container max-w-4xl space-y-6 pb-24">
        <SourceInput
          onFile={handleFile}
          onUrl={handleUrl}
          onText={handleText}
          loading={extracting}
        />

        {text && (
          <div className="rounded-2xl border bg-card p-6 shadow-paper animate-fade-in">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm">
                <BookOpen className="h-4 w-4 text-primary" />
                <span className="font-medium">{title}</span>
                <span className="text-muted-foreground">· {charCount.toLocaleString()} chars</span>
              </div>
              <Button
                onClick={handleSynthesize}
                disabled={synthesizing || !text.trim()}
                className="bg-gradient-warm shadow-glow"
              >
                {synthesizing ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Gerando áudio…</>
                ) : (
                  <><Headphones className="mr-2 h-4 w-4" /> Gerar narração</>
                )}
              </Button>
            </div>
            {tooLong && (
              <p className="mb-3 rounded-lg bg-secondary px-3 py-2 text-xs text-muted-foreground">
                ⚠️ Texto longo — apenas os primeiros 50.000 caracteres (~50 min de áudio) serão narrados por chamada.
              </p>
            )}
            <div className="reading-text max-h-72 overflow-y-auto rounded-xl bg-secondary/40 p-5 text-[15px] text-foreground/90">
              {text.slice(0, 3000)}
              {text.length > 3000 && <span className="text-muted-foreground">… (+{(text.length - 3000).toLocaleString()} chars)</span>}
            </div>
          </div>
        )}

        {audioUrl && <AudioPlayer src={audioUrl} title={title} />}
      </main>
    </div>
  );
};

export default Index;
>>>>>>> 3e835ac51714300863db02616f2bd7252c610dd7
