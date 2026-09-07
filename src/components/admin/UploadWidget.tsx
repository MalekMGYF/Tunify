"use client";

import { useCallback, useRef, useState } from "react";
import { UploadCloud, CheckCircle2, XCircle, FileArchive } from "lucide-react";

type UploadState = "idle" | "uploading" | "processing" | "done" | "error";

function formatBytes(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  return mb >= 1024 ? `${(mb / 1024).toFixed(2)} GB` : `${mb.toFixed(1)} MB`;
}

export default function UploadWidget({
  releaseId,
  onUploaded,
}: {
  releaseId: string;
  onUploaded: (file: { fileName: string; fileSize: number }) => void;
}) {
  const [state, setState] = useState<UploadState>("idle");
  const [progress, setProgress] = useState(0);
  const [fileInfo, setFileInfo] = useState<{ name: string; size: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = useCallback(
    (file: File) => {
      setFileInfo({ name: file.name, size: file.size });
      setError(null);
      setState("uploading");
      setProgress(0);

      const formData = new FormData();
      formData.append("file", file);

      const xhr = new XMLHttpRequest();
      xhr.open("POST", `/api/releases/${releaseId}/upload`);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          setProgress(Math.round((e.loaded / e.total) * 100));
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          setState("processing");
          // Brief processing state — the server has already stored and
          // verified the file by the time the response comes back.
          setTimeout(() => {
            setState("done");
            onUploaded({ fileName: file.name, fileSize: file.size });
          }, 300);
        } else {
          let message = "Upload failed";
          try {
            message = JSON.parse(xhr.responseText).error || message;
          } catch {
            // ignore parse errors, use default message
          }
          setError(message);
          setState("error");
        }
      };

      xhr.onerror = () => {
        setError("Network error during upload");
        setState("error");
      };

      xhr.send(formData);
    },
    [releaseId, onUploaded]
  );

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) upload(file);
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center transition-colors ${
          dragOver ? "border-violet-light bg-violet/5" : "border-white/15 hover:border-white/30"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".exe,.dmg,.appimage,.zip"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) upload(file);
          }}
        />
        <UploadCloud className="h-8 w-8 text-mist-400" />
        <p className="mt-3 text-sm text-mist-300">Drag and drop the Tunify application file, or click to browse</p>
        <p className="mt-1 text-xs text-mist-400">.exe, .dmg, .AppImage, or .zip</p>
      </div>

      {fileInfo && (
        <div className="mt-4 rounded-xl border border-white/8 bg-ink-900/60 p-4">
          <div className="flex items-center gap-3">
            <FileArchive className="h-5 w-5 shrink-0 text-mist-400" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-mist-100">{fileInfo.name}</p>
              <p className="text-xs text-mist-400">{formatBytes(fileInfo.size)}</p>
            </div>
            {state === "done" && <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />}
            {state === "error" && <XCircle className="h-5 w-5 shrink-0 text-red-400" />}
          </div>

          {(state === "uploading" || state === "processing") && (
            <div className="mt-3">
              <div className="h-1.5 w-full rounded-full bg-white/10">
                <div
                  className="h-1.5 rounded-full bg-tunify-gradient transition-all"
                  style={{ width: `${state === "processing" ? 100 : progress}%` }}
                />
              </div>
              <p className="mt-1.5 text-xs text-mist-400">
                {state === "uploading" ? `Uploading... ${progress}%` : "Processing..."}
              </p>
            </div>
          )}

          {state === "done" && <p className="mt-2 text-xs text-emerald-400">Upload complete</p>}
          {state === "error" && <p className="mt-2 text-xs text-red-400">{error}</p>}
        </div>
      )}
    </div>
  );
}
