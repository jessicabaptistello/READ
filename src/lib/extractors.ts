// Text extractors for various file formats — all client-side.
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import mammoth from "mammoth";
import ePub from "epubjs";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export async function extractFromPdf(data: ArrayBuffer): Promise<string> {
  const pdf = await pdfjsLib.getDocument({ data }).promise;
  const parts: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = content.items
      .map((it: any) => ("str" in it ? it.str : ""))
      .join(" ");
    parts.push(text);
  }
  return parts.join("\n\n").replace(/\s+\n/g, "\n").trim();
}

export async function extractFromDocx(data: ArrayBuffer): Promise<string> {
  const result = await mammoth.extractRawText({ arrayBuffer: data });
  return result.value.trim();
}

export async function extractFromEpub(data: ArrayBuffer): Promise<string> {
  const book = ePub(data);
  await book.ready;
  const spine: any = book.spine;
  const items: any[] = spine.items || [];
  const parts: string[] = [];
  for (const item of items) {
    try {
      const doc = await item.load(book.load.bind(book));
      const text = (doc as Document).body?.innerText || (doc as Document).body?.textContent || "";
      parts.push(text);
      item.unload();
    } catch (e) {
      console.warn("epub item failed", e);
    }
  }
  return parts.join("\n\n").trim();
}

export async function extractFromTxt(data: ArrayBuffer): Promise<string> {
  return new TextDecoder("utf-8").decode(data).trim();
}

export async function extractFromFile(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  const name = file.name.toLowerCase();
  if (name.endsWith(".pdf") || file.type === "application/pdf") return extractFromPdf(buf);
  if (name.endsWith(".docx")) return extractFromDocx(buf);
  if (name.endsWith(".epub")) return extractFromEpub(buf);
  if (name.endsWith(".txt") || name.endsWith(".md") || file.type.startsWith("text/")) return extractFromTxt(buf);
  // Fallback: try as text
  return extractFromTxt(buf);
}

export function base64ToArrayBuffer(b64: string): ArrayBuffer {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes.buffer;
}
