import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Link as LinkIcon, Type, Loader2 } from "lucide-react";

interface SourceInputProps {
<<<<<<< HEAD
  onFileSelect: (file: File) => void;
  onUrlSubmit: (url: string) => void;
  onTextSubmit: (text: string) => void;
  loading: boolean;
}

export function SourceInput({
  onFileSelect,
  onUrlSubmit,
  onTextSubmit,
  loading,
}: SourceInputProps) {
  const fileRef = useRef<HTMLInputElement | null>(null);
=======
  onFile: (file: File) => void;
  onUrl: (url: string) => void;
  onText: (text: string) => void;
  loading: boolean;
}

export function SourceInput({ onFile, onUrl, onText, loading }: SourceInputProps) {
  const fileRef = useRef<HTMLInputElement>(null);
>>>>>>> 3e835ac51714300863db02616f2bd7252c610dd7
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");

  return (
<<<<<<< HEAD
    <div className="rounded-2xl border bg-card p-4 shadow-sm">
      <Tabs defaultValue="file" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="file">Arquivo</TabsTrigger>
          <TabsTrigger value="url">URL</TabsTrigger>
          <TabsTrigger value="text">Texto</TabsTrigger>
        </TabsList>

        <TabsContent value="file" className="mt-4">
=======
    <div className="rounded-2xl border bg-card p-6 shadow-paper">
      <Tabs defaultValue="file">
        <TabsList className="mb-5 grid w-full grid-cols-3">
          <TabsTrigger value="file"><Upload className="mr-2 h-4 w-4" />Arquivo</TabsTrigger>
          <TabsTrigger value="url"><LinkIcon className="mr-2 h-4 w-4" />URL</TabsTrigger>
          <TabsTrigger value="text"><Type className="mr-2 h-4 w-4" />Texto</TabsTrigger>
        </TabsList>

        <TabsContent value="file">
>>>>>>> 3e835ac51714300863db02616f2bd7252c610dd7
          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
<<<<<<< HEAD
              const file = e.dataTransfer.files?.[0];
              if (file) onFileSelect(file);
=======
              const f = e.dataTransfer.files?.[0];
              if (f) onFile(f);
>>>>>>> 3e835ac51714300863db02616f2bd7252c610dd7
            }}
            className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border px-6 py-12 transition-colors hover:border-primary hover:bg-secondary/40"
          >
            {loading ? (
<<<<<<< HEAD
              <Loader2 className="h-8 w-8 animate-spin" />
            ) : (
              <>
                <Upload className="mb-3 h-8 w-8" />
                <p className="mb-1 text-lg font-medium">Arraste ou clique</p>
                <p className="text-sm text-muted-foreground">PDF · DOCX · EPUB · TXT</p>
              </>
            )}
          </div>

          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.docx,.epub,.txt,.md,text/plain,application/pdf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onFileSelect(file);
              e.target.value = "";
            }}
          />
        </TabsContent>

        <TabsContent value="url" className="mt-4 space-y-3">
          <Input
            placeholder="Cole aqui a URL de um PDF"
=======
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            ) : (
              <>
                <Upload className="mb-3 h-10 w-10 text-primary" />
                <p className="font-serif-display text-lg">Arraste ou clique</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  PDF · DOCX · EPUB · TXT
                </p>
              </>
            )}
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.docx,.epub,.txt,.md,application/pdf,text/plain"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onFile(f);
                e.target.value = "";
              }}
            />
          </div>
        </TabsContent>

        <TabsContent value="url" className="space-y-3">
          <Input
            placeholder="https://exemplo.com/livro.pdf"
>>>>>>> 3e835ac51714300863db02616f2bd7252c610dd7
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={loading}
          />
          <Button
<<<<<<< HEAD
            onClick={() => onUrlSubmit(url)}
            disabled={loading || !url.trim()}
            className="w-full bg-gradient-warm"
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <LinkIcon className="mr-2 h-4 w-4" />
            )}
=======
            onClick={() => onUrl(url)}
            disabled={loading || !url.trim()}
            className="w-full bg-gradient-warm"
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LinkIcon className="mr-2 h-4 w-4" />}
>>>>>>> 3e835ac51714300863db02616f2bd7252c610dd7
            Carregar PDF da URL
          </Button>
        </TabsContent>

<<<<<<< HEAD
        <TabsContent value="text" className="mt-4 space-y-3">
          <Textarea
            placeholder="Cole aqui o texto que quer ouvir"
=======
        <TabsContent value="text" className="space-y-3">
          <Textarea
            placeholder="Cole aqui o texto que deseja ouvir…"
>>>>>>> 3e835ac51714300863db02616f2bd7252c610dd7
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={8}
            disabled={loading}
            className="reading-text resize-none"
          />
          <Button
<<<<<<< HEAD
            onClick={() => onTextSubmit(text)}
            disabled={loading || !text.trim()}
            className="w-full bg-gradient-warm"
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Type className="mr-2 h-4 w-4" />
            )}
=======
            onClick={() => onText(text)}
            disabled={loading || !text.trim()}
            className="w-full bg-gradient-warm"
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Type className="mr-2 h-4 w-4" />}
>>>>>>> 3e835ac51714300863db02616f2bd7252c610dd7
            Usar este texto
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> 3e835ac51714300863db02616f2bd7252c610dd7
