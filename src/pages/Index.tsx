import { useState } from "react";
import { SourceInput } from "@/components/SourceInput";
import { AudioPlayer } from "@/components/AudioPlayer";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  extractFromFile,
  extractFromPdf,
  base64ToArrayBuffer,
} from "@/lib/extractors";
import { BookOpen, Loader2 } from "lucide-react";

const Index = () => {
  const { toast } = useToast();
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [extracting, setExtracting] = useState(false);

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
    } finally {
      setExtracting(false);
    }
  };

  const handleUrl = async (url: string) => {
    setExtracting(true);

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
    } finally {
      setExtracting(false);
    }
  };

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