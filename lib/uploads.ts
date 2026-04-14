import { randomBytes } from "crypto";
import { mkdir, readFile, writeFile, stat } from "fs/promises";
import { join } from "path";

export const UPLOAD_DIR = process.env.UPLOAD_DIR || join(process.cwd(), "uploads");
export const MAX_BYTES = 5 * 1024 * 1024;

export const ALLOWED_MIME = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "application/pdf",
]);

const EXT_BY_MIME: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "application/pdf": "pdf",
};

export type StoredFile = {
  id: string;
  mimeType: string;
  originalName: string;
  sizeBytes: number;
};

function generateId(mime: string) {
  const ext = EXT_BY_MIME[mime] || "bin";
  return `${randomBytes(16).toString("hex")}.${ext}`;
}

function safeId(id: string): string | null {
  if (!/^[a-f0-9]{32}\.(png|jpg|webp|gif|pdf)$/.test(id)) return null;
  return id;
}

export async function saveUpload(buffer: Buffer, mimeType: string, originalName: string): Promise<StoredFile> {
  if (!ALLOWED_MIME.has(mimeType)) throw new Error("Unsupported file type.");
  if (buffer.length > MAX_BYTES) throw new Error("File exceeds 5 MB limit.");
  await mkdir(UPLOAD_DIR, { recursive: true });

  const id = generateId(mimeType);
  const metaPath = join(UPLOAD_DIR, `${id}.json`);
  const filePath = join(UPLOAD_DIR, id);
  await writeFile(filePath, buffer);
  await writeFile(
    metaPath,
    JSON.stringify({ mimeType, originalName, sizeBytes: buffer.length }),
    "utf8",
  );
  return { id, mimeType, originalName, sizeBytes: buffer.length };
}

export async function readUpload(id: string): Promise<{ buffer: Buffer; mimeType: string; originalName: string } | null> {
  const clean = safeId(id);
  if (!clean) return null;
  const filePath = join(UPLOAD_DIR, clean);
  const metaPath = join(UPLOAD_DIR, `${clean}.json`);
  try {
    await stat(filePath);
    const [buffer, metaRaw] = await Promise.all([readFile(filePath), readFile(metaPath, "utf8")]);
    const meta = JSON.parse(metaRaw) as { mimeType: string; originalName: string };
    return { buffer, mimeType: meta.mimeType, originalName: meta.originalName };
  } catch {
    return null;
  }
}
