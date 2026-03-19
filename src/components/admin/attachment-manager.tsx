"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { Upload, Download, Trash2, FileText } from "lucide-react";

type Attachment = {
  id: string;
  name: string;
  url: string;
  mimeType?: string | null;
  size?: number | null;
  createdAt: string;
  uploadedBy?: string | null;
};

function formatFileSize(bytes?: number | null) {
  if (!bytes) return "Unknown size";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AttachmentManager(props: {
  entityType: string;
  entityId: string;
  emptyMessage?: string;
}) {
  const { toast } = useToast();
  const [files, setFiles] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `/api/files?entityType=${props.entityType}&entityId=${props.entityId}`,
        { cache: "no-store" }
      );
      if (!response.ok) throw new Error("Failed to fetch files");
      const result = await response.json();
      setFiles(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch files");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [props.entityId, props.entityType]);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles?.length) return;

    try {
      setUploading(true);
      setError(null);
      const formData = new FormData();
      formData.append("entityType", props.entityType);
      formData.append("entityId", props.entityId);
      Array.from(selectedFiles).forEach((file) => {
        formData.append("files", file);
      });

      const response = await fetch("/api/files", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.error || "Failed to upload files");
      }

      await fetchFiles();
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      toast({
        type: "success",
        title: "Files uploaded",
        description: `${selectedFiles.length} file(s) uploaded successfully.`,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to upload files";
      setError(message);
      toast({
        type: "error",
        title: "Could not upload files",
        description: message,
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (fileId: string) => {
    try {
      const response = await fetch(`/api/files/${fileId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.error || "Failed to delete file");
      }

      setFiles((current) => current.filter((file) => file.id !== fileId));
      toast({
        type: "success",
        title: "File deleted",
        description: "The file was removed successfully.",
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete file";
      setError(message);
      toast({
        type: "error",
        title: "Could not delete file",
        description: message,
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold">Files</h3>
          <p className="text-sm text-muted-foreground">
            Upload PDFs, documents, spreadsheets, or images.
          </p>
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleUpload}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.webp"
          />
          <Button
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <Upload className="mr-2 h-4 w-4" />
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : files.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
          {props.emptyMessage || "No files uploaded yet."}
        </div>
      ) : (
        <div className="space-y-2">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between gap-4 rounded-lg border px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <p className="truncate font-medium">{file.name}</p>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {file.mimeType || "Unknown type"} • {formatFileSize(file.size)} •{" "}
                  {new Date(file.createdAt).toLocaleString("en-IN")}
                  {file.uploadedBy ? ` • by ${file.uploadedBy}` : ""}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <a href={file.url} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Open
                  </Button>
                </a>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(file.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
