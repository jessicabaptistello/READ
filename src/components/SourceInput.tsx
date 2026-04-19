import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Link as LinkIcon, Type, Loader2 } from "lucide-react";

interface SourceInputProps {
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
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");

  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm">
      <Tabs defaultValue="file" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="file">Arquivo</TabsTrigger>
          <TabsTrigger value="url">URL</TabsTrigger>
          <TabsTrigger value="text">Texto</TabsTrigger>
        </TabsList>

        <TabsContent value="file" className="mt-4">
          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files?.[0];
              if (file) onFileSelect(file);
            }}
            className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border px-6 py-12 transition-colors hover:border-primary hover:bg-secondary/40"
          >
            {loading ? (
              <Loader2 className="h-8 w-8 animate-spin" />
            ) : (
              <>
                <Upload className="mb-3 h-8 w-8" />
                <p className="mb-1 text-lg font-medium">Arraste ou clique</p>
                <p className="text-sm text-muted-foreground">
                  PDF · DOCX · EPUB · TXT
                </p>
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
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={loading}
          />
          <Button
            onClick={() => onUrlSubmit(url)}
            disabled={loading || !url.trim()}
            className="w-full bg-gradient-warm"
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <LinkIcon className="mr-2 h-4 w-4" />
            )}
            Carregar PDF da URL
          </Button>
        </TabsContent>

        <TabsContent value="text" className="mt-4 space-y-3">
          <Textarea
            placeholder="Cole aqui o texto que quer ouvir"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={8}
            disabled={loading}
            className="reading-text resize-none"
          />
          <Button
            onClick={() => onTextSubmit(text)}
            disabled={loading || !text.trim()}
            className="w-full bg-gradient-warm"
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Type className="mr-2 h-4 w-4" />
            )}
            Usar este texto
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}
