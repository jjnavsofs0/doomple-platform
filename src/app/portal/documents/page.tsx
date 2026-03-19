'use client';

import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/ui/page-header';
import { AlertCircle, Download, Upload, FileText, Calendar } from 'lucide-react';

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  uploadedBy: string;
  url: string;
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

const getFileIcon = (type: string) => {
  if (type.includes('pdf')) return '📄';
  if (type.includes('word') || type.includes('document')) return '📝';
  if (type.includes('sheet') || type.includes('excel')) return '📊';
  if (type.includes('presentation') || type.includes('powerpoint')) return '🎬';
  if (type.includes('image')) return '🖼️';
  return '📎';
};

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await fetch('/api/portal/documents');
        if (!response.ok) throw new Error('Failed to fetch documents');
        const result = await response.json();
        setDocuments(result.documents || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append('files', file);
      });

      const response = await fetch('/api/portal/documents/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const result = await response.json();
      setDocuments([...documents, ...result.documents]);
      setUploadSuccess(`${files.length} file(s) uploaded successfully`);
      setTimeout(() => setUploadSuccess(null), 3000);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PageHeader
        title="Documents"
        description="Manage project and invoice documents"
      />

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="text-red-600 mt-0.5" size={20} />
          <div>
            <h3 className="font-semibold text-red-900">Error</h3>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      {uploadSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="text-green-600 mt-0.5" size={20} />
          <div>
            <h3 className="font-semibold text-green-900">Success</h3>
            <p className="text-green-700 text-sm">{uploadSuccess}</p>
          </div>
        </div>
      )}

      {/* Upload Section */}
      <Card className="border-2 border-dashed border-blue-300 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-8">
            <Upload className="text-blue-600 mb-3" size={32} />
            <h3 className="font-semibold text-gray-900 mb-1">Upload Documents</h3>
            <p className="text-sm text-gray-600 mb-4 text-center">
              Drag and drop files here or click to browse
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {uploading ? 'Uploading...' : 'Choose Files'}
            </Button>
            <p className="text-xs text-gray-500 mt-3">
              Supported: PDF, Word, Excel, PowerPoint, Images (Max 10MB)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle>All Documents ({documents.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
            </div>
          ) : documents.length > 0 ? (
            <div className="space-y-2">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="text-3xl">{getFileIcon(doc.type)}</div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">{doc.name}</h4>
                      <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                        <span>{doc.type}</span>
                        <span>{formatFileSize(doc.size)}</span>
                        <div className="flex items-center gap-1">
                          <Calendar size={12} />
                          <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                        </div>
                        {doc.uploadedBy && (
                          <>
                            <span>•</span>
                            <span>by {doc.uploadedBy}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <a
                    href={doc.url}
                    download={doc.name}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-4"
                  >
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Download size={16} />
                      <span className="hidden sm:inline">Download</span>
                    </Button>
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="text-gray-300 mb-3" size={48} />
              <p className="text-gray-500 text-lg">No documents yet</p>
              <p className="text-gray-400 text-sm mt-1">Upload your first document above</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
