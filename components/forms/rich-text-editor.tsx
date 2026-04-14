"use client";

import { Editor } from "@tinymce/tinymce-react";
import { useRef, useState } from "react";

type RichTextEditorProps = {
  name: string;
  initialValue?: string;
  placeholder?: string;
  minHeight?: number;
};

export function RichTextEditor({
  name,
  initialValue = "",
  placeholder,
  minHeight = 280,
}: RichTextEditorProps) {
  const [value, setValue] = useState(initialValue);
  const editorRef = useRef<unknown>(null);

  async function uploadFile(file: File): Promise<{ location: string; mimeType: string; originalName: string }> {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/uploads", { method: "POST", body: form });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data?.error || "Upload failed");
    }
    return res.json();
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white">
      <input type="hidden" name={name} value={value} />
      <Editor
        tinymceScriptSrc="https://cdnjs.cloudflare.com/ajax/libs/tinymce/7.3.0/tinymce.min.js"
        licenseKey="gpl"
        onInit={(_evt, editor) => { editorRef.current = editor; }}
        initialValue={initialValue}
        onEditorChange={(content) => setValue(content)}
        init={{
          height: minHeight,
          menubar: false,
          branding: false,
          promotion: false,
          placeholder,
          plugins: [
            "advlist", "autolink", "lists", "link", "image", "charmap",
            "anchor", "searchreplace", "code", "fullscreen",
            "media", "table", "wordcount",
          ],
          toolbar:
            "undo redo | blocks | bold italic underline | " +
            "bullist numlist | link image attachpdf | " +
            "removeformat | code",
          content_style:
            "body { font-family: ui-sans-serif, system-ui, sans-serif; font-size: 14px; color:#0f172a; }",
          automatic_uploads: true,
          file_picker_types: "image",
          images_file_types: "png,jpg,jpeg,webp,gif",
          images_upload_handler: async (blobInfo) => {
            const file = new File([blobInfo.blob()], blobInfo.filename(), { type: blobInfo.blob().type });
            const result = await uploadFile(file);
            return result.location;
          },
          setup: (editor) => {
            editor.ui.registry.addButton("attachpdf", {
              text: "PDF",
              tooltip: "Attach PDF",
              onAction: () => {
                const input = document.createElement("input");
                input.type = "file";
                input.accept = "application/pdf";
                input.onchange = async () => {
                  const file = input.files?.[0];
                  if (!file) return;
                  try {
                    const result = await uploadFile(file);
                    editor.insertContent(
                      `<p><a href="${result.location}" target="_blank" rel="noopener">📎 ${result.originalName}</a></p>`,
                    );
                  } catch (err) {
                    editor.notificationManager.open({
                      text: err instanceof Error ? err.message : "Upload failed",
                      type: "error",
                    });
                  }
                };
                input.click();
              },
            });
          },
        }}
      />
    </div>
  );
}
